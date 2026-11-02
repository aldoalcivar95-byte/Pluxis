import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    const [event, setEvent] = useState(null);
    const [availableSeats, setAvailableSeats] = useState(0);
    const [quantity, setQuantity] = useState(1);

    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const loadEvent = async () => {
            try {
                setLoading(true);
                setError("");

                if (!backendUrl) {
                    throw new Error(
                        "VITE_BACKEND_URL no está configurada"
                    );
                }

                const response = await fetch(
                    `${backendUrl}/api/events/${id}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "No se pudo cargar el evento"
                    );
                }

                setEvent(data.event);
                setAvailableSeats(data.available_seats);

                // If there are no seats, quantity cannot be booked.
                if (data.available_seats === 0) {
                    setQuantity(0);
                } else {
                    setQuantity(1);
                }

            } catch (error) {
                console.error(error);

                setError(
                    error.message ||
                    "No se pudo cargar el evento"
                );
            } finally {
                setLoading(false);
            }
        };

        loadEvent();
    }, [id, backendUrl]);

    const formatDate = (date) => {
        if (!date) return "";

        const dateObject = new Date(`${date}T00:00:00`);

        return dateObject.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    };

    const formatTime = (time) => {
        if (!time) return "";

        return time.substring(0, 5);
    };

    const handleDecrease = () => {
        setQuantity((current) =>
            Math.max(1, current - 1)
        );
    };

    const handleIncrease = () => {
        setQuantity((current) =>
            Math.min(availableSeats, current + 1)
        );
    };

    const handleBooking = async () => {
        setError("");
        setMessage("");

        if (!store.token) {
            navigate("/login");
            return;
        }

        if (!event) {
            return;
        }

        if (availableSeats <= 0) {
            setError(
                "Este evento está agotado."
            );
            return;
        }

        if (quantity <= 0) {
            setError(
                "Debes seleccionar al menos una entrada."
            );
            return;
        }

        if (quantity > availableSeats) {
            setError(
                `Solo quedan ${availableSeats} plazas disponibles.`
            );
            return;
        }

        try {
            setBookingLoading(true);

            const response = await fetch(
                `${backendUrl}/api/bookings`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${store.token}`
                    },
                    body: JSON.stringify({
                        event_id: event.id,
                        quantity: quantity
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "No se pudo realizar la reserva"
                );
            }

            dispatch({
                type: "add_booking",
                payload: data.booking
            });

            setAvailableSeats(data.available_seats);

            if (data.available_seats === 0) {
                setQuantity(0);
            } else {
                setQuantity(1);
            }

            setMessage(
                data.available_seats === 0
                    ? "Reserva realizada correctamente. El evento está ahora agotado."
                    : `Reserva realizada correctamente. Te quedan ${data.available_seats} plazas disponibles.`
            );

        } catch (error) {
            console.error(error);

            setError(
                error.message ||
                "No se pudo realizar la reserva"
            );
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div
                    className="spinner-border"
                    role="status"
                >
                    <span className="visually-hidden">
                        Cargando...
                    </span>
                </div>

                <p className="mt-3">
                    Cargando evento...
                </p>
            </div>
        );
    }

    if (error && !event) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">
                    {error}
                </div>

                <Link
                    to="/events"
                    className="btn btn-primary"
                >
                    Volver a eventos
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-5">

            <Link
                to="/events"
                className="btn btn-outline-secondary mb-4"
            >
                ← Volver a eventos
            </Link>

            <div className="row g-5">

                {/* IMAGE */}
                <div className="col-lg-6">

                    {event.image ? (
                        <img
                            src={event.image}
                            alt={event.title}
                            className="img-fluid rounded shadow-sm w-100"
                            style={{
                                maxHeight: "500px",
                                objectFit: "cover"
                            }}
                        />
                    ) : (
                        <div
                            className="bg-light rounded d-flex justify-content-center align-items-center"
                            style={{
                                height: "400px"
                            }}
                        >
                            Sin imagen
                        </div>
                    )}

                </div>

                {/* EVENT INFORMATION */}
                <div className="col-lg-6">

                    <h1 className="display-5 fw-bold mb-3">
                        {event.title}
                    </h1>

                    <p className="lead text-muted">
                        {event.description}
                    </p>

                    <hr />

                    <div className="mb-3">
                        <strong>Fecha:</strong>{" "}
                        {formatDate(event.date)}
                    </div>

                    <div className="mb-3">
                        <strong>Hora:</strong>{" "}
                        {formatTime(event.time)}
                    </div>

                    <div className="mb-3">
                        <strong>Ubicación:</strong>{" "}
                        {event.location}
                    </div>

                    <div className="mb-3">
                        <strong>Precio:</strong>{" "}
                        {event.price === 0
                            ? "Gratis"
                            : `${event.price} €`}
                    </div>

                    <div className="mb-2">
                        <strong>Aforo:</strong>{" "}
                        {event.capacity} personas
                    </div>

                    <div className="mb-4">
                        <strong>Plazas disponibles:</strong>{" "}
                        {availableSeats}
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    {/* SUCCESS */}
                    {message && (
                        <div className="alert alert-success">
                            {message}
                        </div>
                    )}

                    {/* BOOKING */}
                    {!store.token ? (

                        <div className="alert alert-info">
                            <p className="mb-3">
                                Inicia sesión para reservar entradas.
                            </p>

                            <Link
                                to="/login"
                                className="btn btn-primary"
                            >
                                Iniciar sesión
                            </Link>
                        </div>

                    ) : availableSeats === 0 ? (

                        <div className="alert alert-warning">
                            <h2 className="h4">
                                Evento agotado
                            </h2>

                            <p className="mb-0">
                                No quedan plazas disponibles para este evento.
                            </p>
                        </div>

                    ) : (

                        <div className="card shadow-sm">

                            <div className="card-body">

                                <h2 className="h4 mb-3">
                                    Reservar entradas
                                </h2>

                                <div className="d-flex align-items-center gap-3 mb-4">

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={handleDecrease}
                                        disabled={quantity <= 1}
                                    >
                                        −
                                    </button>

                                    <span
                                        className="fs-4 fw-bold"
                                        style={{
                                            minWidth: "30px",
                                            textAlign: "center"
                                        }}
                                    >
                                        {quantity}
                                    </span>

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={handleIncrease}
                                        disabled={
                                            quantity >= availableSeats
                                        }
                                    >
                                        +
                                    </button>

                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary btn-lg w-100"
                                    onClick={handleBooking}
                                    disabled={bookingLoading}
                                >
                                    {bookingLoading
                                        ? "Procesando..."
                                        : "Reservar entradas"}
                                </button>

                            </div>

                        </div>

                    )}

                </div>
            </div>
        </div>
    );
};