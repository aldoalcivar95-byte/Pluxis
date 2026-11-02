#!/usr/bin/env python3
"""Importa datos de DATABASE_URL a RENDER_DATABASE_URL sin sobrescribir filas.

Por defecto solo simula. Para aplicar: pipenv run python scripts/migrate_production_data.py --apply
Usuarios: email normalizado. Categorías: nombre normalizado.
Eventos: título, fecha, hora, ubicación, organizador y categoría.
Reservas: usuario, evento, fecha, cantidad y estado.
"""
import argparse
import os
import sys

from sqlalchemy import MetaData, Table, create_engine, select, text


TABLES = ("user", "category", "event", "booking")


def db_url(name):
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Falta la variable {name}.")
    return value.replace("postgres://", "postgresql://", 1)


def norm(value):
    return str(value or "").strip().casefold()


def load(conn, table):
    return [dict(row) for row in conn.execute(select(table)).mappings()]


def event_key(row, organizer_id, category_id):
    return (
        norm(row["title"]), row["date"], row["time"], norm(row["location"]),
        organizer_id, category_id,
    )


def booking_key(row, user_id, event_id):
    return (user_id, event_id, row["booking_date"], row["quantity"], row["status"])


def insert_without_id(conn, table, row):
    payload = {key: value for key, value in row.items() if key != "id"}
    return conn.execute(table.insert().values(**payload).returning(table.c.id)).scalar_one()


def migrate(apply):
    source_engine = create_engine(db_url("DATABASE_URL"), pool_pre_ping=True)
    target_engine = create_engine(db_url("RENDER_DATABASE_URL"), pool_pre_ping=True)
    try:
        sm, tm = MetaData(), MetaData()
        sm.reflect(bind=source_engine, only=list(TABLES))
        tm.reflect(bind=target_engine, only=list(TABLES))
        source = {name: sm.tables.get(f"public.{name}", sm.tables.get(name)) for name in TABLES}
        target = {name: tm.tables.get(f"public.{name}", tm.tables.get(name)) for name in TABLES}
        if any(table is None for table in (*source.values(), *target.values())):
            raise RuntimeError("No se encontraron todas las tablas requeridas en ambas bases.")

        with source_engine.connect() as sc:
            src = {name: load(sc, source[name]) for name in TABLES}

        # All writes are one transaction. Dry-run uses the same matching rules,
        # but does not reserve IDs or change either database.
        with target_engine.begin() as tx:
            dst = {name: load(tx, target[name]) for name in TABLES}
            user_by_email = {norm(row["email"]): row for row in dst["user"]}
            category_by_name = {norm(row["name"]): row for row in dst["category"]}

            user_map = {}
            new_users = []
            for row in src["user"]:
                match = user_by_email.get(norm(row["email"]))
                if match:
                    user_map[row["id"]] = match["id"]
                else:
                    new_users.append(row)

            category_map = {}
            new_categories = []
            for row in src["category"]:
                match = category_by_name.get(norm(row["name"]))
                if match:
                    category_map[row["id"]] = match["id"]
                else:
                    new_categories.append(row)

            # For preview, provisional IDs are used only to calculate counts.
            next_user = max([r["id"] for r in dst["user"]] or [0]) + 1
            for row in new_users:
                user_map[row["id"]] = next_user
                next_user += 1
            next_category = max([r["id"] for r in dst["category"]] or [0]) + 1
            for row in new_categories:
                category_map[row["id"]] = next_category
                next_category += 1

            event_index = {
                event_key(row, row["organizer_id"], row["category_id"]): row
                for row in dst["event"]
            }
            event_map = {}
            new_events = []
            next_event = max([r["id"] for r in dst["event"]] or [0]) + 1
            for row in src["event"]:
                org = user_map.get(row["organizer_id"])
                cat = category_map.get(row["category_id"])
                if org is None or cat is None:
                    raise RuntimeError(f"Evento local {row['id']}: no se pudo mapear organizador/categoría.")
                key = event_key(row, org, cat)
                match = event_index.get(key)
                if match:
                    event_map[row["id"]] = match["id"]
                else:
                    event_map[row["id"]] = next_event
                    next_event += 1
                    new_events.append((row, org, cat))
                    event_index[key] = {"id": event_map[row["id"]]}

            booking_index = {
                booking_key(row, row["user_id"], row["event_id"])
                for row in dst["booking"]
            }
            new_bookings = []
            for row in src["booking"]:
                user_id = user_map.get(row["user_id"])
                event_id = event_map.get(row["event_id"])
                if user_id is None or event_id is None:
                    raise RuntimeError(f"Reserva local {row['id']}: no se pudo mapear usuario/evento.")
                key = booking_key(row, user_id, event_id)
                if key not in booking_index:
                    new_bookings.append((row, user_id, event_id))
                    booking_index.add(key)

            print("SIMULACIÓN DE MIGRACIÓN" if not apply else "APLICANDO MIGRACIÓN")
            print(f"Usuarios:   {len(src['user'])} origen; {len(new_users)} nuevos; {len(src['user'])-len(new_users)} ya existentes")
            print(f"Categorías: {len(src['category'])} origen; {len(new_categories)} nuevas; {len(src['category'])-len(new_categories)} ya existentes")
            print(f"Eventos:    {len(src['event'])} origen; {len(new_events)} nuevos; {len(src['event'])-len(new_events)} ya existentes")
            print(f"Reservas:   {len(src['booking'])} origen; {len(new_bookings)} nuevas")
            if not apply:
                print("No se ha modificado ninguna fila. Añade --apply para ejecutar la migración.")
                tx.rollback()
                return

            # Insert parent rows first and use database-generated IDs, never source IDs.
            for row in new_users:
                user_map[row["id"]] = insert_without_id(tx, target["user"], row)
            for row in new_categories:
                category_map[row["id"]] = insert_without_id(tx, target["category"], row)

            # Rebuild event matches with real mapped IDs, then insert missing events.
            actual_event_index = {
                event_key(row, row["organizer_id"], row["category_id"]): row["id"]
                for row in load(tx, target["event"])
            }
            for row, _, _ in new_events:
                org, cat = user_map[row["organizer_id"]], category_map[row["category_id"]]
                key = event_key(row, org, cat)
                if key in actual_event_index:
                    event_map[row["id"]] = actual_event_index[key]
                else:
                    payload = dict(row)
                    payload["organizer_id"], payload["category_id"] = org, cat
                    event_map[row["id"]] = insert_without_id(tx, target["event"], payload)
                    actual_event_index[key] = event_map[row["id"]]

            actual_booking_index = {
                booking_key(row, row["user_id"], row["event_id"])
                for row in load(tx, target["booking"])
            }
            for row, _, _ in new_bookings:
                user_id, event_id = user_map[row["user_id"]], event_map[row["event_id"]]
                key = booking_key(row, user_id, event_id)
                if key not in actual_booking_index:
                    payload = dict(row)
                    payload["user_id"], payload["event_id"] = user_id, event_id
                    insert_without_id(tx, target["booking"], payload)
                    actual_booking_index.add(key)

            for name in TABLES:
                tx.execute(text(
                    f"SELECT setval(pg_get_serial_sequence('public.{name}', 'id'), "
                    f"GREATEST(COALESCE((SELECT MAX(id) FROM public.{name}), 1), 1), "
                    f"EXISTS (SELECT 1 FROM public.{name}))"
                ))
        print("Migración completada y confirmada.")
    finally:
        source_engine.dispose()
        target_engine.dispose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Escribe los registros en Render.")
    args = parser.parse_args()
    try:
        migrate(args.apply)
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
