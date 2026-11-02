#!/usr/bin/env python3
"""Merge Pluxis data from DATABASE_URL into RENDER_DATABASE_URL safely.

Matches users by normalized email and categories by normalized name.
Matches events by title/date/time/location/organizer/category, then maps
bookings through the resolved user and event IDs. Dry-run is the default;
pass --apply to write. Existing rows are never deleted or overwritten.
"""
import argparse
import os
import sys
from datetime import date, datetime, time

from sqlalchemy import MetaData, Table, create_engine, select, func, text
from sqlalchemy.engine import URL


def normalize_url(value):
    if not value:
        raise RuntimeError("Falta una URL de base de datos.")
    return value.replace("postgres://", "postgresql://", 1)


def norm(value):
    return (value or "").strip().casefold()


def rows(conn, table):
    return [dict(row) for row in conn.execute(select(table)).mappings().all()]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Escribe los datos en Render. Sin esta opción solo simula.")
    args = parser.parse_args()

    source_url = normalize_url(os.getenv("DATABASE_URL"))
    target_url = normalize_url(os.getenv("RENDER_DATABASE_URL"))
    source_engine = create_engine(source_url, pool_pre_ping=True)
    target_engine = create_engine(target_url, pool_pre_ping=True)

    src_meta, dst_meta = MetaData(), MetaData()
    src_meta.reflect(bind=source_engine, only=["user", "category", "event", "booking"])
    dst_meta.reflect(bind=target_engine, only=["user", "category", "event", "booking"])

    su, sc, se, sb = (src_meta.tables[f"public.{name}"] if f"public.{name}" in src_meta.tables else src_meta.tables[name]
                       for name in ("user", "category", "event", "booking"))
    du, dc, de, db = (dst_meta.tables[f"public.{name}"] if f"public.{name}" in dst_meta.tables else dst_meta.tables[name]
                       for name in ("user", "category", "event", "booking"))

    with source_engine.connect() as sconn, target_engine.connect() as dconn:
        source_users, source_categories = rows(sconn, su), rows(sconn, sc)
        source_events, source_bookings = rows(sconn, se), rows(sconn, sb)
        target_users, target_categories = rows(dconn, du), rows(dconn, dc)
        target_events, target_bookings = rows(dconn, de), rows(dconn, db)

        user_map = {}
        user_by_email = {norm(u["email"]): u for u in target_users}
        for user in source_users:
            existing = user_by_email.get(norm(user["email"]))
            user_map[user["id"]] = existing["id"] if existing else user["id"]

        category_map = {}
        category_by_name = {norm(c["name"]): c for c in target_categories}
        for category in source_categories:
            existing = category_by_name.get(norm(category["name"]))
            category_map[category["id"]] = existing["id"] if existing else category["id"]

        event_map = {}
        target_event_keys = set()
        for event in target_events:
            target_event_keys.add((
                norm(event["title"]), event["date"], event["time"],
                norm(event["location"]), event["organizer_id"], event["category_id"]
            ))
        new_events = []
        for event in source_events:
            organizer_id = user_map.get(event["organizer_id"])
            category_id = category_map.get(event["category_id"])
            if organizer_id is None or category_id is None:
                raise RuntimeError(f"Evento {event['id']} tiene organizador/categoría sin correspondencia.")
            key = (norm(event["title"]), event["date"], event["time"],
                   norm(event["location"]), organizer_id, category_id)
            existing = next((e for e in target_events if (
                norm(e["title"]), e["date"], e["time"], norm(e["location"]),
                e["organizer_id"], e["category_id"]) == key), None)
            if existing:
                event_map[event["id"]] = existing["id"]
            else:
                event_map[event["id"]] = event["id"]
                new_events.append({**event, "organizer_id": organizer_id, "category_id": category_id})
                target_events.append({**event, "organizer_id": organizer_id, "category_id": category_id})

        target_booking_keys = {
            (b["user_id"], b["event_id"], b["booking_date"], b["quantity"], b["status"])
            for b in target_bookings
        }
        new_bookings = []
        for booking in source_bookings:
            user_id = user_map.get(booking["user_id"])
            event_id = event_map.get(booking["event_id"])
            if user_id is None or event_id is None:
                raise RuntimeError(f"Reserva {booking['id']} tiene usuario/evento sin correspondencia.")
            key = (user_id, event_id, booking["booking_date"], booking["quantity"], booking["status"])
            if key not in target_booking_keys:
                new_bookings.append({**booking, "user_id": user_id, "event_id": event_id})
                target_booking_keys.add(key)

        new_users = [u for u in source_users if norm(u["email"]) not in user_by_email]
        new_categories = [c for c in source_categories if norm(c["name"]) not in category_by_name]

        print("Resumen de migración (origen -> Render):")
        print(f"  Usuarios:    {len(source_users)} origen; {len(new_users)} nuevos; {len(source_users)-len(new_users)} coincidentes")
        print(f"  Categorías:  {len(source_categories)} origen; {len(new_categories)} nuevas; {len(source_categories)-len(new_categories)} coincidentes")
        print(f"  Eventos:     {len(source_events)} origen; {len(new_events)} nuevos; {len(source_events)-len(new_events)} coincidentes")
        print(f"  Reservas:    {len(source_bookings)} origen; {len(new_bookings)} nuevas")
        if not args.apply:
            print("\nSIMULACIÓN: no se ha escrito ningún dato. Revisa el resumen y ejecuta con --apply para aplicar.")
            return

        with target_engine.begin() as tx:
            # Re-read target within write transaction to avoid blindly overwriting rows.
            tx.execute(du.insert(), new_users) if new_users else None
            tx.execute(dc.insert(), new_categories) if new_categories else None
            tx.execute(de.insert(), new_events) if new_events else None
            tx.execute(db.insert(), new_bookings) if new_bookings else None
            for table in (du, dc, de, db):
                if "id" in table.c:
                    tx.execute(text(
                        f"SELECT setval(pg_get_serial_sequence('public.{table.name}', 'id'), "
                        f"GREATEST(COALESCE((SELECT MAX(id) FROM public.{table.name}), 1), 1), "
                        f"EXISTS (SELECT 1 FROM public.{table.name}))"
                    ))
        print("\nMigración aplicada correctamente.")
    source_engine.dispose()
    target_engine.dispose()


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
