"""
This module takes care of defining the API routes.
"""

from datetime import (
    date as date_type,
    time as time_type,
    datetime,
    timedelta
)

import os
import json
import secrets
import bcrypt
import math
import smtplib
import ssl
from email.message import EmailMessage
import cloudinary
import cloudinary.uploader

from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

from flask import Blueprint, jsonify, request

from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required
)

from api.models import (
    db,
    User,
    Event,
    Category,
    Booking
)

api = Blueprint("api", __name__)

def send_password_reset_email(recipient, reset_link):
    smtp_host = os.getenv("MAIL_SERVER")
    smtp_port = int(os.getenv("MAIL_PORT", "587"))
    smtp_username = os.getenv("MAIL_USERNAME")
    smtp_password = os.getenv("MAIL_PASSWORD")
    sender = os.getenv("MAIL_DEFAULT_SENDER") or smtp_username
    use_ssl = os.getenv("MAIL_USE_SSL", "false").lower() == "true"
    use_tls = os.getenv("MAIL_USE_TLS", "true").lower() == "true"

    if not all([smtp_host, smtp_username, smtp_password, sender]):
        raise RuntimeError("Email SMTP configuration is incomplete")

    message = EmailMessage()
    message["Subject"] = "Recuperación de contraseña - Pluxis"
    message["From"] = sender
    message["To"] = recipient
    message.set_content(
        "Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de Pluxis.\n\n"
        f"Para crear una nueva contraseña, abre este enlace: {reset_link}\n\n"
        "El enlace caduca en 30 minutos. Si no has solicitado este cambio, puedes ignorar este correo."
    )
    message.add_alternative(
        "<html><body>"
        "<h2>Recuperación de contraseña</h2>"
        "<p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de Pluxis.</p>"
        f'<p><a href="{reset_link}">Crear una nueva contraseña</a></p>'
        "<p>El enlace caduca en 30 minutos. Si no has solicitado este cambio, puedes ignorar este correo.</p>"
        "</body></html>",
        subtype="html"
    )

    if use_ssl:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context, timeout=20) as server:
            server.login(smtp_username, smtp_password)
            server.send_message(message)
    else:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
            server.ehlo()
            if use_tls:
                server.starttls(context=ssl.create_default_context())
                server.ehlo()
            server.login(smtp_username, smtp_password)
            server.send_message(message)

def geocode_location(location):
    """
    Convierte una ubicación escrita por el organizador
    en coordenadas geográficas mediante Geoapify.

    Devuelve:

        {
            "latitude": float,
            "longitude": float
        }

    o None si no se puede geocodificar.
    """

    api_key = os.getenv("GEOAPIFY_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GEOAPIFY_API_KEY is not configured"
        )

    location = location.strip()

    if not location:
        return None

    params = urlencode({
        "text": location,
        "apiKey": api_key,
        "limit": 1,
        "lang": "es",
        "filter": "countrycode:es"
    })

    url = (
        "https://api.geoapify.com/v1/geocode/search?"
        + params
    )

    try:

        geo_request = Request(
            url,
            headers={
                "User-Agent": "Pluxis/1.0"
            }
        )

        with urlopen(
            geo_request,
            timeout=10
        ) as response:

            data = json.loads(
                response.read().decode("utf-8")
            )

    except HTTPError as error:

        print(
            f"Geoapify HTTP error: {error.code}"
        )

        return None

    except URLError as error:

        print(
            f"Geoapify connection error: {error.reason}"
        )

        return None

    except Exception as error:

        print(
            f"Geoapify unexpected error: {error}"
        )

        return None

    features = data.get(
        "features",
        []
    )

    if not features:
        return None

    coordinates = (
        features[0]
        .get("geometry", {})
        .get("coordinates")
    )

    if not coordinates or len(coordinates) < 2:
        return None

    
    

    longitude = coordinates[0]
    latitude = coordinates[1]

    return {
        "latitude": float(latitude),
        "longitude": float(longitude)
    }

@api.route("/hello", methods=["GET", "POST"])
def handle_hello():

    return jsonify({
        "message": "Hello! I'm a message that came from the backend."
    }), 200

@api.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({
            "message": "Name, email and password are required"
        }), 400

    name = name.strip()
    email = email.strip().lower()

    if not name or not email:
        return jsonify({
            "message": "Name and email cannot be empty"
        }), 400

    existing_user = User.query.filter_by(
        email=email
    ).first()

    if existing_user:
        return jsonify({
            "message": "Email already registered"
        }), 409

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    new_user = User(
        name=name,
        email=email,
        password=hashed_password,
        role="user",
        is_active=True
    )

    try:

        db.session.add(new_user)
        db.session.commit()

    except Exception:

        db.session.rollback()

        return jsonify({
            "message": "Could not create user"
        }), 500

    return jsonify({
        "message": "User registered successfully",
        "user": new_user.serialize()
    }), 201

@api.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "message": "Email and password are required"
        }), 400

    email = email.strip().lower()

    user = User.query.filter_by(
        email=email
    ).first()

    if not user:
        return jsonify({
            "message": "Invalid email or password"
        }), 401

    password_is_correct = bcrypt.checkpw(
        password.encode("utf-8"),
        user.password.encode("utf-8")
    )

    if not password_is_correct:
        return jsonify({
            "message": "Invalid email or password"
        }), 401

    if not user.is_active:
        return jsonify({
            "message": "User account is inactive"
        }), 403

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": user.role
        }
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": user.serialize()
    }), 200

@api.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = data.get("email")

    if not isinstance(email, str) or not email.strip():
        return jsonify({"message": "Email is required"}), 400

    email = email.strip().lower()
    generic_message = (
        "Si existe una cuenta asociada a ese email, "
        "recibirás instrucciones para restablecer tu contraseña."
    )

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": generic_message}), 200

    reset_token = secrets.token_urlsafe(32)
    user.reset_token = reset_token
    user.reset_token_expires = datetime.utcnow() + timedelta(minutes=30)

    try:
        db.session.commit()
        frontend_url = os.getenv("FRONTEND_URL")
        if not frontend_url:
            raise RuntimeError("FRONTEND_URL is not configured")
        reset_link = (
            f"{frontend_url.rstrip('/')}/reset-password?token={reset_token}"
        )
        send_password_reset_email(user.email, reset_link)
    except Exception as error:
        print(f"Password reset email error: {error}")
        user.reset_token = None
        user.reset_token_expires = None
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
        return jsonify({"message": "No se pudo enviar el correo de recuperación. Inténtalo más tarde."}), 500

    return jsonify({"message": generic_message}), 200

@api.route("/reset-password", methods=["POST"])
def reset_password():

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    token = data.get("token")
    password = data.get("password")

    if not token:
        return jsonify({
            "message": "Reset token is required"
        }), 400

    if not password:
        return jsonify({
            "message": "Password is required"
        }), 400

    if len(password) < 6:
        return jsonify({
            "message": (
                "Password must be at least 6 characters long"
            )
        }), 400

    
    
    

    user = User.query.filter_by(
        reset_token=token
    ).first()

    if not user:
        return jsonify({
            "message": "Invalid or expired reset token"
        }), 400

    
    
    

    if not user.reset_token_expires:
        return jsonify({
            "message": "Invalid or expired reset token"
        }), 400

    if datetime.utcnow() > user.reset_token_expires:

        user.reset_token = None
        user.reset_token_expires = None

        try:

            db.session.commit()

        except Exception:

            db.session.rollback()

        return jsonify({
            "message": "Invalid or expired reset token"
        }), 400

    
    
    

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    user.password = hashed_password

    
    
    

    user.reset_token = None
    user.reset_token_expires = None

    try:

        db.session.commit()

    except Exception:

        db.session.rollback()

        return jsonify({
            "message": "Could not reset password"
        }), 500

    return jsonify({
        "message": "Password reset successfully"
    }), 200

@api.route("/profile", methods=["GET"])
@jwt_required()
def profile():

    user_id = get_jwt_identity()

    user = db.session.get(
        User,
        int(user_id)
    )

    if not user:
        return jsonify({
            "message": "User not found"
        }), 404

    return jsonify({
        "user": user.serialize()
    }), 200

@api.route("/categories", methods=["GET"])
def get_categories():

    categories = Category.query.order_by(
        Category.name.asc()
    ).all()

    return jsonify([
        category.serialize()
        for category in categories
    ]), 200

@api.route("/events", methods=["GET"])
def get_events():

    events = Event.query.order_by(
        Event.date.asc(),
        Event.time.asc()
    ).all()

    return jsonify([
        event.serialize()
        for event in events
    ]), 200

@api.route("/organizer/events", methods=["GET"])
@jwt_required()
def get_organizer_events():

    user_id = int(
        get_jwt_identity()
    )

    user = db.session.get(
        User,
        user_id
    )

    if not user:
        return jsonify({
            "message": "User not found"
        }), 404

    if user.role != "organizer":
        return jsonify({
            "message": "Organizer access required"
        }), 403

    events = (
        Event.query
        .filter_by(organizer_id=user_id)
        .order_by(
            Event.date.asc(),
            Event.time.asc()
        )
        .all()
    )

    result = []

    for event in events:

        confirmed_bookings = Booking.query.filter_by(
            event_id=event.id,
            status="confirmed"
        ).all()

        reserved_seats = sum(
            booking.quantity
            for booking in confirmed_bookings
        )

        available_seats = max(
            event.capacity - reserved_seats,
            0
        )

        event_data = event.serialize()

        event_data["reserved_seats"] = reserved_seats
        event_data["available_seats"] = available_seats
        event_data["booking_count"] = len(
            confirmed_bookings
        )

        result.append(event_data)

    return jsonify(result), 200

@api.route(
    "/organizer/events/<int:event_id>/bookings",
    methods=["GET"]
)
@jwt_required()
def get_organizer_event_bookings(event_id):

    user_id = int(
        get_jwt_identity()
    )

    user = db.session.get(
        User,
        user_id
    )

    if not user:
        return jsonify({
            "message": "User not found"
        }), 404

    if user.role != "organizer":
        return jsonify({
            "message": "Organizer access required"
        }), 403

    event = db.session.get(
        Event,
        event_id
    )

    if not event:
        return jsonify({
            "message": "Event not found"
        }), 404

    if event.organizer_id != user_id:
        return jsonify({
            "message": "You do not own this event"
        }), 403

    bookings = (
        Booking.query
        .filter_by(event_id=event_id)
        .order_by(
            Booking.booking_date.desc()
        )
        .all()
    )

    result = []

    for booking in bookings:

        booking_data = booking.serialize()

        booking_user = db.session.get(
            User,
            booking.user_id
        )

        if booking_user:

            booking_data["user"] = {
                "id": booking_user.id,
                "name": booking_user.name,
                "email": booking_user.email
            }

        else:

            booking_data["user"] = None

        result.append(booking_data)

    return jsonify(result), 200

@api.route("/upload-image", methods=["POST"])
@jwt_required()
def upload_event_image():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    if not user:
        return jsonify({"message": "Usuario no encontrado"}), 404

    if user.role != "organizer":
        return jsonify({"message": "Solo los organizadores pueden subir imágenes"}), 403

    image_file = request.files.get("image")

    if not image_file or not image_file.filename:
        return jsonify({"message": "Selecciona una imagen"}), 400

    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    if image_file.mimetype not in allowed_types:
        return jsonify({"message": "Formatos permitidos: JPG, PNG y WEBP"}), 400

    image_file.seek(0, 2)
    file_size = image_file.tell()
    image_file.seek(0)

    if file_size > 5 * 1024 * 1024:
        return jsonify({"message": "La imagen no puede superar los 5 MB"}), 400

    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")

    if not all([cloud_name, api_key, api_secret]):
        return jsonify({"message": "Cloudinary no está configurado en el servidor"}), 500

    try:
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True
        )
        result = cloudinary.uploader.upload(
            image_file,
            folder="pluxis/events",
            resource_type="image"
        )
        return jsonify({
            "message": "Imagen subida correctamente",
            "image_url": result["secure_url"],
            "public_id": result["public_id"]
        }), 200
    except Exception as error:
        print(f"Cloudinary upload error: {error}")
        return jsonify({"message": "No se pudo subir la imagen"}), 500

@api.route("/events", methods=["POST"])
@jwt_required()
def create_event():

    user_id = int(
        get_jwt_identity()
    )

    user = db.session.get(
        User,
        user_id
    )

    if not user:
        return jsonify({
            "message": "User not found"
        }), 404

    if user.role != "organizer":
        return jsonify({
            "message": "Only organizers can create events"
        }), 403

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    title = data.get("title")
    description = data.get("description")
    event_date = data.get("date")
    event_time = data.get("time")
    location = data.get("location")
    price = data.get("price")
    capacity = data.get("capacity")
    image = data.get("image")
    category_id = data.get("category_id")

    if not title:
        return jsonify({
            "message": "Title is required"
        }), 400

    if not description:
        return jsonify({
            "message": "Description is required"
        }), 400

    if not event_date:
        return jsonify({
            "message": "Date is required"
        }), 400

    if not event_time:
        return jsonify({
            "message": "Time is required"
        }), 400

    if not location:
        return jsonify({
            "message": "Location is required"
        }), 400

    if price is None:
        return jsonify({
            "message": "Price is required"
        }), 400

    if capacity is None:
        return jsonify({
            "message": "Capacity is required"
        }), 400

    if category_id is None:
        return jsonify({
            "message": "Category is required"
        }), 400

    
    
    

    location = location.strip()

    if not location:
        return jsonify({
            "message": "Location cannot be empty"
        }), 400

    
    
    

    latitude_value = data.get("latitude")
    longitude_value = data.get("longitude")

    has_latitude = latitude_value is not None and str(latitude_value).strip() != ""
    has_longitude = longitude_value is not None and str(longitude_value).strip() != ""

    if has_latitude != has_longitude:
        return jsonify({
            "message": "Debes indicar latitud y longitud, o dejar ambas vacías"
        }), 400

    if has_latitude and has_longitude:
        try:
            latitude = float(latitude_value)
            longitude = float(longitude_value)
        except (TypeError, ValueError):
            return jsonify({
                "message": "Las coordenadas deben ser números"
            }), 400

        if not math.isfinite(latitude) or not -90 <= latitude <= 90:
            return jsonify({
                "message": "La latitud debe estar entre -90 y 90"
            }), 400

        if not math.isfinite(longitude) or not -180 <= longitude <= 180:
            return jsonify({
                "message": "La longitud debe estar entre -180 y 180"
            }), 400
    else:
        try:
            coordinates = geocode_location(location)
        except RuntimeError as error:
            print(error)
            return jsonify({
                "message": "Geolocation service is not configured"
            }), 500

        if not coordinates:
            return jsonify({
                "message": (
                    "Could not determine the coordinates "
                    "for the provided location"
                )
            }), 400

        latitude = coordinates["latitude"]
        longitude = coordinates["longitude"]

    
    
    

    try:

        parsed_date = date_type.fromisoformat(
            event_date
        )

    except (ValueError, TypeError):

        return jsonify({
            "message": "Invalid date format. Use YYYY-MM-DD"
        }), 400

    
    
    

    try:

        parsed_time = time_type.fromisoformat(
            event_time
        )

    except (ValueError, TypeError):

        return jsonify({
            "message": "Invalid time format. Use HH:MM"
        }), 400

    
    
    

    try:

        price = float(price)

    except (ValueError, TypeError):

        return jsonify({
            "message": "Price must be a number"
        }), 400

    if price < 0:
        return jsonify({
            "message": "Price cannot be negative"
        }), 400

    
    
    

    try:

        capacity = int(capacity)

    except (ValueError, TypeError):

        return jsonify({
            "message": "Capacity must be an integer"
        }), 400

    if capacity <= 0:
        return jsonify({
            "message": "Capacity must be greater than 0"
        }), 400

    
    
    

    try:

        category_id = int(category_id)

    except (ValueError, TypeError):

        return jsonify({
            "message": "Category ID must be an integer"
        }), 400

    category = db.session.get(
        Category,
        category_id
    )

    if not category:
        return jsonify({
            "message": "Category not found"
        }), 404

    
    
    

    new_event = Event(
        title=title.strip(),
        description=description.strip(),
        date=parsed_date,
        time=parsed_time,
        location=location,
        latitude=latitude,
        longitude=longitude,
        price=price,
        capacity=capacity,
        image=image,
        organizer_id=user_id,
        category_id=category_id
    )

    try:

        db.session.add(new_event)
        db.session.commit()

    except Exception:

        db.session.rollback()

        return jsonify({
            "message": "Could not create event"
        }), 500

    return jsonify({
        "message": "Event created successfully",
        "event": new_event.serialize()
    }), 201

@api.route("/events/nearby", methods=["GET"])
def get_nearby_events():
    """Busca eventos dentro de un radio y devuelve su distancia en km.

    Se puede llamar con lat y lon, o con location (que se geocodifica
    mediante Geoapify). Ejemplos:
      /api/events/nearby?location=Toledo&radius_km=25
      /api/events/nearby?lat=39.856&lon=-4.024&radius_km=25
    """
    location = request.args.get("location", type=str)
    lat_value = request.args.get("lat", type=str)
    lon_value = request.args.get("lon", type=str)
    radius_value = request.args.get("radius_km", default="25", type=str)

    try:
        radius_km = float(radius_value)
    except (TypeError, ValueError):
        return jsonify({"message": "radius_km debe ser un número"}), 400

    if not math.isfinite(radius_km) or radius_km <= 0 or radius_km > 500:
        return jsonify({"message": "radius_km debe ser mayor que 0 y como máximo 500"}), 400

    if location and location.strip():
        try:
            coordinates = geocode_location(location.strip())
        except RuntimeError:
            return jsonify({"message": "El servicio de geolocalización no está configurado"}), 500

        if not coordinates:
            return jsonify({"message": "No se pudo localizar esa ubicación"}), 400

        center_lat = coordinates["latitude"]
        center_lon = coordinates["longitude"]
    else:
        if lat_value is None or lon_value is None:
            return jsonify({
                "message": "Indica location o proporciona lat y lon"
            }), 400
        try:
            center_lat = float(lat_value)
            center_lon = float(lon_value)
        except (TypeError, ValueError):
            return jsonify({"message": "lat y lon deben ser números"}), 400

        if not math.isfinite(center_lat) or not -90 <= center_lat <= 90:
            return jsonify({"message": "lat debe estar entre -90 y 90"}), 400
        if not math.isfinite(center_lon) or not -180 <= center_lon <= 180:
            return jsonify({"message": "lon debe estar entre -180 y 180"}), 400

    
    def distance_km(lat1, lon1, lat2, lon2):
        earth_radius_km = 6371.0088
        lat1, lon1, lat2, lon2 = map(
            math.radians, (lat1, lon1, lat2, lon2)
        )
        delta_lat = lat2 - lat1
        delta_lon = lon2 - lon1
        a = (
            math.sin(delta_lat / 2) ** 2
            + math.cos(lat1) * math.cos(lat2)
            * math.sin(delta_lon / 2) ** 2
        )
        a = min(1.0, max(0.0, a))
        return 2 * earth_radius_km * math.asin(math.sqrt(a))

    events = Event.query.filter(
        Event.latitude.isnot(None),
        Event.longitude.isnot(None)
    ).all()

    nearby = []
    for event in events:
        distance = distance_km(
            center_lat,
            center_lon,
            float(event.latitude),
            float(event.longitude)
        )
        if distance <= radius_km:
            event_data = event.serialize()
            event_data["distance_km"] = round(distance, 2)
            nearby.append(event_data)

    nearby.sort(key=lambda item: item["distance_km"])
    return jsonify({
        "center": {
            "latitude": center_lat,
            "longitude": center_lon
        },
        "radius_km": radius_km,
        "count": len(nearby),
        "events": nearby
    }), 200

@api.route("/events/<int:event_id>", methods=["GET"])
def get_event(event_id):

    event = db.session.get(
        Event,
        event_id
    )

    if not event:
        return jsonify({
            "message": "Event not found"
        }), 404

    confirmed_bookings = Booking.query.filter_by(
        event_id=event.id,
        status="confirmed"
    ).all()

    reserved_seats = sum(
        booking.quantity
        for booking in confirmed_bookings
    )

    available_seats = event.capacity - reserved_seats

    if available_seats < 0:
        available_seats = 0

    return jsonify({
        "event": event.serialize(),
        "available_seats": available_seats
    }), 200

@api.route("/events/<int:event_id>", methods=["PUT"])
@jwt_required()
def update_event(event_id):

    user_id = int(
        get_jwt_identity()
    )

    user = db.session.get(
        User,
        user_id
    )

    if not user:
        return jsonify({
            "message": "User not found"
        }), 404

    if user.role != "organizer":
        return jsonify({
            "message": "Only organizers can update events"
        }), 403

    event = db.session.get(
        Event,
        event_id
    )

    if not event:
        return jsonify({
            "message": "Event not found"
        }), 404

    if event.organizer_id != user_id:
        return jsonify({
            "message": "You can only update your own events"
        }), 403

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    title = data.get("title")
    description = data.get("description")
    event_date = data.get("date")
    event_time = data.get("time")
    location = data.get("location")
    price = data.get("price")
    capacity = data.get("capacity")
    image = data.get("image")
    category_id = data.get("category_id")

    if not title:
        return jsonify({
            "message": "Title is required"
        }), 400

    if not description:
        return jsonify({
            "message": "Description is required"
        }), 400

    if not event_date:
        return jsonify({
            "message": "Date is required"
        }), 400

    if not event_time:
        return jsonify({
            "message": "Time is required"
        }), 400

    if not location:
        return jsonify({
            "message": "Location is required"
        }), 400

    if price is None:
        return jsonify({
            "message": "Price is required"
        }), 400

    if capacity is None:
        return jsonify({
            "message": "Capacity is required"
        }), 400

    if category_id is None:
        return jsonify({
            "message": "Category is required"
        }), 400

    
    
    

    location = location.strip()

    if not location:
        return jsonify({
            "message": "Location cannot be empty"
        }), 400

    
    
    

    latitude_value = data.get("latitude")
    longitude_value = data.get("longitude")

    has_latitude = latitude_value is not None and str(latitude_value).strip() != ""
    has_longitude = longitude_value is not None and str(longitude_value).strip() != ""

    if has_latitude != has_longitude:
        return jsonify({
            "message": "Debes indicar latitud y longitud, o dejar ambas vacías"
        }), 400

    if has_latitude and has_longitude:
        try:
            latitude = float(latitude_value)
            longitude = float(longitude_value)
        except (TypeError, ValueError):
            return jsonify({
                "message": "Las coordenadas deben ser números"
            }), 400

        if not math.isfinite(latitude) or not -90 <= latitude <= 90:
            return jsonify({
                "message": "La latitud debe estar entre -90 y 90"
            }), 400

        if not math.isfinite(longitude) or not -180 <= longitude <= 180:
            return jsonify({
                "message": "La longitud debe estar entre -180 y 180"
            }), 400
    else:
        try:
            coordinates = geocode_location(location)
        except RuntimeError as error:
            print(error)
            return jsonify({
                "message": "Geolocation service is not configured"
            }), 500

        if not coordinates:
            return jsonify({
                "message": (
                    "Could not determine the coordinates "
                    "for the provided location"
                )
            }), 400

        latitude = coordinates["latitude"]
        longitude = coordinates["longitude"]

    
    
    

    try:

        parsed_date = date_type.fromisoformat(
            event_date
        )

    except (ValueError, TypeError):

        return jsonify({
            "message": "Invalid date format. Use YYYY-MM-DD"
        }), 400

    
    
    

    try:

        parsed_time = time_type.fromisoformat(
            event_time
        )

    except (ValueError, TypeError):

        return jsonify({
            "message": "Invalid time format. Use HH:MM"
        }), 400

    
    
    

    try:

        price = float(price)

    except (ValueError, TypeError):

        return jsonify({
            "message": "Price must be a number"
        }), 400

    if price < 0:
        return jsonify({
            "message": "Price cannot be negative"
        }), 400

    
    
    

    try:

        capacity = int(capacity)

    except (ValueError, TypeError):

        return jsonify({
            "message": "Capacity must be an integer"
        }), 400

    if capacity <= 0:
        return jsonify({
            "message": "Capacity must be greater than 0"
        }), 400

    
    
    

    confirmed_bookings = Booking.query.filter_by(
        event_id=event.id,
        status="confirmed"
    ).all()

    reserved_seats = sum(
        booking.quantity
        for booking in confirmed_bookings
    )

    if capacity < reserved_seats:

        return jsonify({
            "message": (
                f"Capacity cannot be lower than the "
                f"{reserved_seats} seats already reserved"
            ),
            "reserved_seats": reserved_seats
        }), 400

    
    
    

    try:

        category_id = int(category_id)

    except (ValueError, TypeError):

        return jsonify({
            "message": "Category ID must be an integer"
        }), 400

    category = db.session.get(
        Category,
        category_id
    )

    if not category:
        return jsonify({
            "message": "Category not found"
        }), 404

    
    
    

    event.title = title.strip()
    event.description = description.strip()
    event.date = parsed_date
    event.time = parsed_time
    event.location = location
    event.latitude = latitude
    event.longitude = longitude
    event.price = price
    event.capacity = capacity
    event.image = image
    event.category_id = category_id

    try:

        db.session.commit()

    except Exception:

        db.session.rollback()

        return jsonify({
            "message": "Could not update event"
        }), 500

    return jsonify({
        "message": "Event updated successfully",
        "event": event.serialize()
    }), 200

@api.route("/events/<int:event_id>", methods=["DELETE"])
@jwt_required()
def delete_event(event_id):

    user_id = int(
        get_jwt_identity()
    )

    user = db.session.get(
        User,
        user_id
    )

    if not user:
        return jsonify({
            "message": "User not found"
        }), 404

    if user.role != "organizer":
        return jsonify({
            "message": "Only organizers can delete events"
        }), 403

    event = db.session.get(
        Event,
        event_id
    )

    if not event:
        return jsonify({
            "message": "Event not found"
        }), 404

    if event.organizer_id != user_id:
        return jsonify({
            "message": "You can only delete your own events"
        }), 403

    
    
    

    bookings_count = Booking.query.filter_by(
        event_id=event.id
    ).count()

    if bookings_count > 0:

        return jsonify({
            "message": (
                "This event cannot be deleted because "
                "it has existing bookings"
            ),
            "bookings_count": bookings_count
        }), 400

    
    
    

    try:

        db.session.delete(event)
        db.session.commit()

    except Exception:

        db.session.rollback()

        return jsonify({
            "message": "Could not delete event"
        }), 500

    return jsonify({
        "message": "Event deleted successfully"
    }), 200

@api.route("/bookings", methods=["POST"])
@jwt_required()
def create_booking():

    user_id = int(
        get_jwt_identity()
    )

    user = db.session.get(
        User,
        user_id
    )

    if not user:
        return jsonify({
            "message": "User not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    event_id = data.get("event_id")
    quantity = data.get("quantity")

    if event_id is None:
        return jsonify({
            "message": "Event ID is required"
        }), 400

    if quantity is None:
        return jsonify({
            "message": "Quantity is required"
        }), 400

    
    
    

    try:

        event_id = int(event_id)

    except (ValueError, TypeError):

        return jsonify({
            "message": "Event ID must be an integer"
        }), 400

    
    
    

    try:

        quantity = int(quantity)

    except (ValueError, TypeError):

        return jsonify({
            "message": "Quantity must be an integer"
        }), 400

    if quantity <= 0:
        return jsonify({
            "message": "Quantity must be greater than 0"
        }), 400

    
    
    

    event = db.session.get(
        Event,
        event_id
    )

    if not event:
        return jsonify({
            "message": "Event not found"
        }), 404

    
    
    

    confirmed_bookings = Booking.query.filter_by(
        event_id=event.id,
        status="confirmed"
    ).all()

    reserved_seats = sum(
        booking.quantity
        for booking in confirmed_bookings
    )

    available_seats = event.capacity - reserved_seats

    if quantity > available_seats:

        return jsonify({
            "message": "Not enough available seats",
            "available_seats": max(
                available_seats,
                0
            )
        }), 400

    
    
    

    new_booking = Booking(
        quantity=quantity,
        status="confirmed",
        user_id=user_id,
        event_id=event_id
    )

    try:

        db.session.add(new_booking)
        db.session.commit()

    except Exception:

        db.session.rollback()

        return jsonify({
            "message": "Could not create booking"
        }), 500

    available_seats -= quantity

    return jsonify({
        "message": "Booking created successfully",
        "booking": new_booking.serialize(),
        "available_seats": max(
            available_seats,
            0
        )
    }), 201

@api.route("/bookings", methods=["GET"])
@jwt_required()
def get_my_bookings():

    user_id = int(
        get_jwt_identity()
    )

    bookings = (
        Booking.query
        .filter_by(user_id=user_id)
        .order_by(
            Booking.booking_date.desc()
        )
        .all()
    )

    result = []

    for booking in bookings:

        booking_data = booking.serialize()

        event = db.session.get(
            Event,
            booking.event_id
        )

        if event:

            booking_data["event"] = (
                event.serialize()
            )

        else:

            booking_data["event"] = None

        result.append(booking_data)

    return jsonify(result), 200

@api.route(
    "/bookings/<int:booking_id>",
    methods=["GET"]
)
@jwt_required()
def get_booking(booking_id):

    user_id = int(
        get_jwt_identity()
    )

    booking = db.session.get(
        Booking,
        booking_id
    )

    if not booking:
        return jsonify({
            "message": "Booking not found"
        }), 404

    if booking.user_id != user_id:
        return jsonify({
            "message": "You can only access your own bookings"
        }), 403

    booking_data = booking.serialize()

    event = db.session.get(
        Event,
        booking.event_id
    )

    if event:

        booking_data["event"] = (
            event.serialize()
        )

    else:

        booking_data["event"] = None

    return jsonify({
        "booking": booking_data
    }), 200

@api.route(
    "/bookings/<int:booking_id>",
    methods=["DELETE"]
)
@jwt_required()
def cancel_booking(booking_id):

    user_id = int(
        get_jwt_identity()
    )

    booking = db.session.get(
        Booking,
        booking_id
    )

    if not booking:
        return jsonify({
            "message": "Booking not found"
        }), 404

    if booking.user_id != user_id:
        return jsonify({
            "message": "You can only cancel your own bookings"
        }), 403

    if booking.status == "cancelled":

        return jsonify({
            "message": "Booking is already cancelled"
        }), 400

    booking.status = "cancelled"

    try:

        db.session.commit()

    except Exception:

        db.session.rollback()

        return jsonify({
            "message": "Could not cancel booking"
        }), 500

    booking_data = booking.serialize()

    event = db.session.get(
        Event,
        booking.event_id
    )

    if event:

        booking_data["event"] = (
            event.serialize()
        )

    else:

        booking_data["event"] = None

    return jsonify({
        "message": "Booking cancelled successfully",
        "booking": booking_data
    }), 200