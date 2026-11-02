import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { apiFetch } from "../utils/api";

export const Bookings = () => {
    const { store, dispatch } = useGlobalReducer();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Reserva que queremos cancelar
    const [bookingToCancel, setBookingToCancel] = useState(null);

    // Estado mientras se cancela la reserva
    const [cancelling, setCancelling] = useState(false);


    // --------------------------------------------------
    // FORMATEAR FECHA DEL EVENTO
    // --------------------------------------------------

    const formatEventDate = (date) => {
        if (!date) {
            return "Fecha no disponible";
        }

        return new Date(`${date}T00:00:00`).toLocaleDateString(
            "es-ES",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }
        );
    };


    // --------------------------------------------------
    // FORMATEAR FECHA DE RESERVA
    // --------------------------------------------------

    const formatBookingDate = (date) => {
        if (!date) {
            return "Fecha no disponible";
        }

        return new Date(date).toLocaleDateString(
            "es-ES",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }
        );
    };


    // --------------------------------------------------
    // LEER RESPUESTAS DEL BACKEND
    // --------------------------------------------------

    const readResponse = async (response) => {
        const contentType =
            response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            return await response.json();
        }

        throw new Error(
            `El servidor devolvió una respuesta inesperada (${response.status}).`
        );
    };


    // --------------------------------------------------
    // CARGAR RESERVAS
    // --------------------------------------------------

    const loadBookings = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await apiFetch("/api/bookings", {
                method: "GET",
            });

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "No se pudieron cargar las reservas"
                );
            }

            dispatch({
                type: "set_bookings",
                payload: data,
            });

        } catch (error) {

            if (error.message === "SESSION_EXPIRED") {
                return;
            }

            setError(
                error.message ||
                "No se pudieron cargar las reservas"
            );

        } finally {
            setLoading(false);
        }
    };


    // --------------------------------------------------
    // CARGAR AL ENTRAR EN LA PÁGINA
    // --------------------------------------------------

    useEffect(() => {
        if (store.token) {
            loadBookings();
        }
    }, [store.token]);


    // --------------------------------------------------
    // CANCELAR RESERVA
    // --------------------------------------------------

    const cancelBooking = async () => {

        if (!bookingToCancel) {
            return;
        }

        setCancelling(true);
        setError("");

        try {

            const response = await apiFetch(
                `/api/bookings/${bookingToCancel.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "No se pudo cancelar la reserva"
                );
            }

            // Actualizamos la reserva en el estado global
            dispatch({
                type: "update_booking",
                payload: data.booking,
            });

            // Cerramos el modal
            setBookingToCancel(null);

        } catch (error) {

            if (error.message === "SESSION_EXPIRED") {
                return;
            }

            setError(
                error.message ||
                "No se pudo cancelar la reserva"
            );

        } finally {
            setCancelling(false);
        }
    };


    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="container py-5">

                <div className="text-center py-5">

                    <div
                        className="spinner-border text-primary mb-3"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Cargando...
                        </span>
                    </div>

                    <h5>
                        Cargando tus reservas...
                    </h5>

                </div>

            </div>
        );
    }


    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

    return (
        <div className="container py-5">

            {/* CABECERA */}

            <div className="mb-4">

                <h1 className="fw-bold">
                    Mis reservas
                </h1>

                <p className="text-muted">
                    Consulta y gestiona tus reservas en Pluxis.
                </p>

                <p className="small text-muted">
                    {store.bookings.length}{" "}
                    {store.bookings.length === 1
                        ? "reserva"
                        : "reservas"}
                </p>

            </div>


            {/* ERROR */}

            {error && (
                <div
                    className="alert alert-danger d-flex align-items-center"
                    role="alert"
                >
                    <span className="me-2">
                        ⚠️
                    </span>

                    {error}
                </div>
            )}


            {/* SIN RESERVAS */}

            {store.bookings.length === 0 ? (

                <div className="text-center py-5">

                    <div
                        className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle bg-light"
                        style={{
                            width: "80px",
                            height: "80px",
                            fontSize: "34px",
                        }}
                    >
                        🎟️
                    </div>

                    <h3 className="fw-bold">
                        No tienes reservas todavía
                    </h3>

                    <p className="text-muted mb-4">
                        Explora los eventos disponibles y
                        reserva tu plaza.
                    </p>

                    <Link
                        to="/events"
                        className="btn btn-primary px-4"
                    >
                        Explorar eventos
                    </Link>

                </div>

            ) : (

                /* RESERVAS */

                <div className="row g-4">

                    {store.bookings.map((booking) => {

                        const event = booking.event;

                        return (

                            <div
                                className="col-md-6 col-lg-4"
                                key={booking.id}
                            >

                                <div className="card h-100 shadow-sm border-0 overflow-hidden">

                                    {/* IMAGEN */}

                                    {event?.image && (
                                        <img
                                            src={event.image}
                                            className="card-img-top"
                                            alt={event.title}
                                            style={{
                                                height: "220px",
                                                objectFit: "cover",
                                            }}
                                        />
                                    )}


                                    {/* CONTENIDO */}

                                    <div className="card-body d-flex flex-column">

                                        {/* TÍTULO */}

                                        <h4 className="card-title fw-bold mb-3">
                                            {event
                                                ? event.title
                                                : `Evento #${booking.event_id}`}
                                        </h4>


                                        {/* INFORMACIÓN DEL EVENTO */}

                                        {event && (
                                            <>

                                                <p className="text-muted small mb-3">
                                                    {event.description}
                                                </p>


                                                <div className="small">

                                                    <p className="mb-2">
                                                        <strong>
                                                            Fecha:
                                                        </strong>{" "}
                                                        {formatEventDate(
                                                            event.date
                                                        )}
                                                    </p>


                                                    <p className="mb-2">
                                                        <strong>
                                                            Hora:
                                                        </strong>{" "}
                                                        {event.time?.slice(
                                                            0,
                                                            5
                                                        )}
                                                    </p>


                                                    <p className="mb-2">
                                                        <strong>
                                                            Lugar:
                                                        </strong>{" "}
                                                        {event.location}
                                                    </p>


                                                    <p className="mb-3">
                                                        <strong>
                                                            Precio:
                                                        </strong>{" "}
                                                        {event.price} €
                                                    </p>

                                                </div>

                                            </>
                                        )}


                                        <hr />


                                        {/* INFORMACIÓN DE LA RESERVA */}

                                        <div className="small">

                                            <p className="mb-2 d-flex justify-content-between">
                                                <strong>
                                                    Entradas:
                                                </strong>

                                                <span>
                                                    {booking.quantity}
                                                </span>
                                            </p>


                                            <p className="mb-2 d-flex justify-content-between">
                                                <strong>
                                                    Fecha de reserva:
                                                </strong>

                                                <span>
                                                    {formatBookingDate(
                                                        booking.booking_date
                                                    )}
                                                </span>
                                            </p>


                                            <p className="mb-3 d-flex justify-content-between align-items-center">

                                                <strong>
                                                    Estado:
                                                </strong>

                                                {booking.status ===
                                                "confirmed" ? (

                                                    <span className="badge bg-success">
                                                        Confirmada
                                                    </span>

                                                ) : (

                                                    <span className="badge bg-secondary">
                                                        Cancelada
                                                    </span>

                                                )}

                                            </p>

                                        </div>


                                        {/* BOTONES */}

                                        <div className="d-flex gap-2 mt-auto">

                                            <Link
                                                to={`/events/${booking.event_id}`}
                                                className="btn btn-outline-primary flex-grow-1"
                                            >
                                                Ver evento
                                            </Link>


                                            {booking.status ===
                                                "confirmed" && (

                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger flex-grow-1"
                                                    onClick={() =>
                                                        setBookingToCancel(
                                                            booking
                                                        )
                                                    }
                                                >
                                                    Cancelar
                                                </button>

                                            )}

                                        </div>

                                    </div>

                                </div>

                            </div>

                        );
                    })}

                </div>

            )}


            {/* ==================================================
                MODAL DE CONFIRMACIÓN
            ================================================== */}

            {bookingToCancel && (
                <>

                    {/* FONDO OSCURO */}

                    <div
                        className="modal-backdrop fade show"
                        style={{
                            backgroundColor:
                                "rgba(0, 0, 0, 0.65)",
                            zIndex: 1040,
                        }}
                        onClick={() =>
                            !cancelling &&
                            setBookingToCancel(null)
                        }
                    ></div>


                    {/* MODAL */}

                    <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        role="dialog"
                        aria-modal="true"
                        style={{
                            zIndex: 1050,
                        }}
                    >

                        <div
                            className="modal-dialog modal-dialog-centered"
                            role="document"
                        >

                            <div
                                className="modal-content border-0 shadow-lg"
                                style={{
                                    borderRadius: "18px",
                                }}
                                onClick={(event) =>
                                    event.stopPropagation()
                                }
                            >

                                {/* CUERPO */}

                                <div className="modal-body text-center p-4 p-md-5">

                                    {/* ICONO */}

                                    <div
                                        className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                                        style={{
                                            width: "72px",
                                            height: "72px",
                                            backgroundColor:
                                                "#fff3cd",
                                            fontSize: "32px",
                                        }}
                                    >
                                        ⚠️
                                    </div>


                                    {/* TÍTULO */}

                                    <h4 className="fw-bold mb-3">
                                        Cancelar reserva
                                    </h4>


                                    {/* MENSAJE */}

                                    <p className="text-muted mb-2">
                                        ¿Estás seguro de que quieres
                                        cancelar esta reserva?
                                    </p>


                                    {/* EVENTO */}

                                    <div
                                        className="fw-bold mb-3"
                                        style={{
                                            fontSize: "17px",
                                        }}
                                    >
                                        {bookingToCancel.event?.title ||
                                            `Evento #${bookingToCancel.event_id}`}
                                    </div>


                                    {/* AVISO */}

                                    <div
                                        className="small text-muted mb-4 px-2"
                                    >
                                        Esta acción cambiará el estado
                                        de tu reserva a{" "}
                                        <strong>
                                            cancelada
                                        </strong>
                                        .
                                    </div>


                                    {/* BOTONES */}

                                    <div className="d-flex justify-content-center gap-2">

                                        <button
                                            type="button"
                                            className="btn btn-light border px-4 py-2"
                                            onClick={() =>
                                                setBookingToCancel(null)
                                            }
                                            disabled={cancelling}
                                        >
                                            Volver
                                        </button>


                                        <button
                                            type="button"
                                            className="btn btn-danger px-4 py-2"
                                            onClick={cancelBooking}
                                            disabled={cancelling}
                                        >

                                            {cancelling ? (

                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                        aria-hidden="true"
                                                    ></span>

                                                    Cancelando...
                                                </>

                                            ) : (

                                                <>
                                                    Cancelar reserva
                                                </>

                                            )}

                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </>
            )}

        </div>
    );
};