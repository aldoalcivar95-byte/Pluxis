"""Completa las coordenadas que faltan en eventos existentes de Pluxis.

Ejecutar desde la raíz del proyecto:
    pipenv run python src/backfill_event_coordinates.py

No crea ni elimina eventos y no modifica reservas ni otros campos.
"""

from app import app
from api.models import db, Event
from api.routes import geocode_location

def main():
    with app.app_context():
        events = Event.query.filter(
            (Event.latitude.is_(None)) | (Event.longitude.is_(None))
        ).order_by(Event.id.asc()).all()

        if not events:
            print("Todos los eventos ya tienen coordenadas.")
            return

        print(f"Eventos pendientes de geolocalizar: {len(events)}")
        updated = 0
        failed = []

        for event in events:
            try:
                coordinates = geocode_location(event.location or "")
            except RuntimeError as error:
                print(f"Error de configuración de Geoapify: {error}")
                print("No se ha modificado la base de datos.")
                return

            if not coordinates:
                failed.append((event.id, event.location))
                print(f"NO ENCONTRADO | ID {event.id} | {event.location}")
                continue

            event.latitude = coordinates["latitude"]
            event.longitude = coordinates["longitude"]
            updated += 1
            print(
                f"OK | ID {event.id} | {event.location} | "
                f"lat={event.latitude}, lon={event.longitude}"
            )

        try:
            db.session.commit()
        except Exception as error:
            db.session.rollback()
            print(f"Error al guardar los cambios; se ha hecho rollback: {error}")
            raise

        print("\nResumen:")
        print(f"Coordenadas actualizadas: {updated}")
        print(f"Ubicaciones no encontradas: {len(failed)}")
        if failed:
            print("Revisa manualmente las ubicaciones siguientes:")
            for event_id, location in failed:
                print(f"- ID {event_id}: {location}")

if __name__ == "__main__":
    main()
