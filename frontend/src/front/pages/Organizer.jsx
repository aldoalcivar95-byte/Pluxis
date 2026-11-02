import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { apiFetch } from "../utils/api";
import { EventForm } from "../components/EventForm";

export const Organizer = () => {
    const { store } = useGlobalReducer();

    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    // ==========================================
    // MODAL DE ELIMINAR EVENTO
    // ==========================================

    const [eventToDelete, setEventToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // ==========================================
    // MODAL DE ERROR AL ELIMINAR
    // ==========================================

    const [deleteError, setDeleteError] = useState("");
    const [showDeleteError, setShowDeleteError] = useState(false);

    // ==========================================
    // RESERVAS
    // ==========================================

    const [expandedEvent, setExpandedEvent] = useState(null);
    const [bookings, setBookings] = useState({});
    const [loadingBookings, setLoadingBookings] = useState(false);


    // ==========================================
    // CARGAR DATOS DEL ORGANIZADOR
    // ==========================================

    const loadOrganizerData = async () => {
        setLoading(true);
        setError("");

        try {
            const [
                eventsResponse,
                categoriesResponse
            ] = await Promise.all([
                apiFetch("/api/organizer/events", {
                    method: "GET"
                }),

                apiFetch("/api/categories", {
                    method: "GET"
                })
            ]);

            const eventsData = await eventsResponse.json();
            const categoriesData =
                await categoriesResponse.json();

            if (!eventsResponse.ok) {
                throw new Error(
                    eventsData.message ||
                    "No se pudieron cargar tus eventos"
                );
            }

            if (!categoriesResponse.ok) {
                throw new Error(
                    categoriesData.message ||
                    "No se pudieron cargar las categorías"
                );
            }

            setEvents(eventsData);
            setCategories(categoriesData);

        } catch (error) {

            if (error.message === "SESSION_EXPIRED") {
                return;
            }

            setError(
                error.message ||
                "No se pudieron cargar los datos"
            );

        } finally {
            setLoading(false);
        }
    };


    // ==========================================
    // CARGAR AL ENTRAR
    // ==========================================

    useEffect(() => {
        if (store.token) {
            loadOrganizerData();
        }
    }, [store.token]);


    // ==========================================
    // OBTENER NOMBRE DE CATEGORÍA
    // ==========================================

    const getCategoryName = (categoryId) => {

        const category = categories.find(
            category =>
                Number(category.id) ===
                Number(categoryId)
        );

        return category
            ? category.name
            : "Sin categoría";
    };


    // ==========================================
    // FORMATEAR FECHA EVENTO
    // ==========================================

    const formatDate = (date) => {

        if (!date) {
            return "Fecha no disponible";
        }

        return new Date(
            `${date}T00:00:00`
        ).toLocaleDateString(
            "es-ES",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    };


    // ==========================================
    // FORMATEAR FECHA RESERVA
    // ==========================================

    const formatBookingDate = (date) => {

        if (!date) {
            return "Fecha no disponible";
        }

        return new Date(date).toLocaleDateString(
            "es-ES",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    };


    // ==========================================
    // MOSTRAR / OCULTAR RESERVAS
    // ==========================================

    const handleShowBookings = async (eventId) => {

        if (expandedEvent === eventId) {
            setExpandedEvent(null);
            return;
        }

        setExpandedEvent(eventId);
        setLoadingBookings(true);
        setError("");

        try {

            const response = await apiFetch(
                `/api/organizer/events/${eventId}/bookings`,
                {
                    method: "GET"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "No se pudieron cargar las reservas"
                );
            }

            setBookings(prev => ({
                ...prev,
                [eventId]: data
            }));

        } catch (error) {

            if (error.message === "SESSION_EXPIRED") {
                return;
            }

            setError(
                error.message ||
                "No se pudieron cargar las reservas"
            );

        } finally {
            setLoadingBookings(false);
        }
    };


    // ==========================================
    // EVENTO CREADO
    // ==========================================

    const handleEventCreated = () => {

        setShowForm(false);
        setEditingEvent(null);

        loadOrganizerData();
    };


    // ==========================================
    // EDITAR EVENTO
    // ==========================================

    const handleEditEvent = (event) => {

        setEditingEvent(event);
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    // ==========================================
    // EVENTO ACTUALIZADO
    // ==========================================

    const handleEventUpdated = () => {

        setShowForm(false);
        setEditingEvent(null);

        loadOrganizerData();
    };


    // ==========================================
    // CANCELAR FORMULARIO
    // ==========================================

    const handleCancelForm = () => {

        setShowForm(false);
        setEditingEvent(null);
    };


    // ==========================================
    // ABRIR MODAL DE ELIMINACIÓN
    // ==========================================

    const handleRequestDelete = (event) => {

        setDeleteError("");
        setShowDeleteError(false);

        setEventToDelete(event);
    };


    // ==========================================
    // ELIMINAR EVENTO
    // ==========================================

    const handleDeleteEvent = async () => {

        if (!eventToDelete || deleting) {
            return;
        }

        setDeleting(true);
        setError("");

        try {

            const response = await apiFetch(
                `/api/events/${eventToDelete.id}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            // ======================================
            // ERROR DEL BACKEND
            // ======================================

            if (!response.ok) {

                if (
                    response.status === 400 &&
                    data.bookings_count > 0
                ) {

                    setDeleteError(
                        `Este evento tiene ${data.bookings_count} reservas asociadas. No puede eliminarse porque debemos conservar su historial.`
                    );

                } else {

                    setDeleteError(
                        data.message ||
                        "No se pudo eliminar el evento."
                    );
                }

                setEventToDelete(null);
                setShowDeleteError(true);

                return;
            }


            // ======================================
            // ELIMINACIÓN CORRECTA
            // ======================================

            setEventToDelete(null);

            await loadOrganizerData();

        } catch (error) {

            if (error.message === "SESSION_EXPIRED") {
                return;
            }

            setDeleteError(
                error.message ||
                "No se pudo eliminar el evento."
            );

            setEventToDelete(null);
            setShowDeleteError(true);

        } finally {

            setDeleting(false);
        }
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className="container py-5">

                <h1>
                    Panel del organizador
                </h1>

                <p className="text-muted">
                    Cargando tus eventos...
                </p>

            </div>
        );
    }


    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="container py-5">


            {/* ======================================
                CABECERA
            ====================================== */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h1 className="mb-1">
                        Panel del organizador
                    </h1>

                    <p className="text-muted mb-0">
                        Gestiona tus eventos y consulta sus reservas.
                    </p>

                </div>


                {!showForm && (

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                            setEditingEvent(null);
                            setShowForm(true);
                        }}
                    >
                        + Crear evento
                    </button>

                )}

            </div>


            {/* ======================================
                FORMULARIO
            ====================================== */}

            {showForm && (

                <EventForm
                    categories={categories}
                    event={editingEvent}
                    onSuccess={
                        editingEvent
                            ? handleEventUpdated
                            : handleEventCreated
                    }
                    onCancel={handleCancelForm}
                />

            )}


            {/* ======================================
                ERROR GENERAL
            ====================================== */}

            {error && (

                <div className="alert alert-danger">
                    {error}
                </div>

            )}


            {/* ======================================
                SIN EVENTOS
            ====================================== */}

            {events.length === 0 ? (

                <div className="card shadow-sm border-0">

                    <div className="card-body text-center py-5">

                        <h3>
                            Todavía no tienes eventos
                        </h3>

                        <p className="text-muted mb-4">
                            Cuando crees un evento,
                            aparecerá aquí.
                        </p>


                        {!showForm && (

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    setEditingEvent(null);
                                    setShowForm(true);
                                }}
                            >
                                + Crear mi primer evento
                            </button>

                        )}

                    </div>

                </div>

            ) : (

                <>


                    {/* ==================================
                        CONTADOR
                    ================================== */}

                    <div className="mb-3">

                        <strong>
                            {events.length}
                        </strong>{" "}

                        {events.length === 1
                            ? "evento publicado"
                            : "eventos publicados"}

                    </div>


                    {/* ==================================
                        EVENTOS
                    ================================== */}

                    <div className="row g-4">

                        {events.map(event => (

                            <div
                                className="col-md-6 col-xl-4"
                                key={event.id}
                            >

                                <div className="card h-100 shadow-sm overflow-hidden">


                                    {/* IMAGEN */}

                                    {event.image ? (

                                        <img
                                            src={event.image}
                                            alt={event.title}
                                            className="card-img-top"
                                            style={{
                                                height: "220px",
                                                objectFit: "cover"
                                            }}
                                        />

                                    ) : (

                                        <div
                                            className="d-flex align-items-center justify-content-center bg-light"
                                            style={{
                                                height: "220px"
                                            }}
                                        >

                                            <span className="text-muted">
                                                Sin imagen
                                            </span>

                                        </div>

                                    )}


                                    <div className="card-body d-flex flex-column">


                                        {/* CATEGORÍA */}

                                        <span className="badge bg-secondary align-self-start mb-2">

                                            {getCategoryName(
                                                event.category_id
                                            )}

                                        </span>


                                        {/* TÍTULO */}

                                        <h4 className="card-title">
                                            {event.title}
                                        </h4>


                                        {/* DESCRIPCIÓN */}

                                        <p className="text-muted">
                                            {event.description}
                                        </p>


                                        {/* DATOS DEL EVENTO */}

                                        <div className="mb-3">

                                            <p className="mb-1">

                                                <strong>
                                                    Fecha:
                                                </strong>{" "}

                                                {formatDate(
                                                    event.date
                                                )}

                                            </p>


                                            <p className="mb-1">

                                                <strong>
                                                    Hora:
                                                </strong>{" "}

                                                {event.time?.slice(
                                                    0,
                                                    5
                                                )}

                                            </p>


                                            <p className="mb-1">

                                                <strong>
                                                    Lugar:
                                                </strong>{" "}

                                                {event.location}

                                            </p>


                                            <p className="mb-1">

                                                <strong>
                                                    Precio:
                                                </strong>{" "}

                                                {event.price} €

                                            </p>

                                        </div>


                                        {/* ==================================
                                            RESUMEN DE RESERVAS
                                        ================================== */}

                                        <div className="border rounded p-3 mb-3 bg-light">

                                            <h6 className="mb-3">
                                                Resumen de reservas
                                            </h6>


                                            <div className="d-flex justify-content-between mb-2">

                                                <span>
                                                    Capacidad
                                                </span>

                                                <strong>
                                                    {event.capacity}
                                                </strong>

                                            </div>


                                            <div className="d-flex justify-content-between mb-2">

                                                <span>
                                                    Entradas vendidas
                                                </span>

                                                <strong>
                                                    {event.reserved_seats}
                                                </strong>

                                            </div>


                                            <div className="d-flex justify-content-between mb-2">

                                                <span>
                                                    Reservas
                                                </span>

                                                <strong>
                                                    {event.booking_count}
                                                </strong>

                                            </div>


                                            <div className="d-flex justify-content-between">

                                                <span>
                                                    Plazas disponibles
                                                </span>

                                                <strong
                                                    className={
                                                        event.available_seats === 0
                                                            ? "text-danger"
                                                            : "text-success"
                                                    }
                                                >
                                                    {event.available_seats}
                                                </strong>

                                            </div>

                                        </div>


                                        {/* ==================================
                                            BOTONES
                                        ================================== */}

                                        <div className="mt-auto d-grid gap-2">


                                            <Link
                                                to={`/events/${event.id}`}
                                                className="btn btn-outline-primary"
                                            >
                                                Ver evento
                                            </Link>


                                            <button
                                                type="button"
                                                className="btn btn-outline-info"
                                                onClick={() =>
                                                    handleShowBookings(
                                                        event.id
                                                    )
                                                }
                                            >

                                                {expandedEvent === event.id
                                                    ? "Ocultar reservas"
                                                    : "Ver reservas"}

                                            </button>


                                            <button
                                                type="button"
                                                className="btn btn-outline-warning"
                                                onClick={() =>
                                                    handleEditEvent(
                                                        event
                                                    )
                                                }
                                            >
                                                Editar evento
                                            </button>


                                            <button
                                                type="button"
                                                className="btn btn-outline-danger"
                                                onClick={() =>
                                                    handleRequestDelete(
                                                        event
                                                    )
                                                }
                                            >
                                                Eliminar evento
                                            </button>

                                        </div>


                                        {/* ==================================
                                            DETALLE DE RESERVAS
                                        ================================== */}

                                        {expandedEvent === event.id && (

                                            <div className="mt-3 border rounded p-3 bg-white">


                                                <div className="d-flex justify-content-between align-items-center mb-3">

                                                    <h5 className="mb-0">
                                                        Reservas
                                                    </h5>


                                                    {bookings[event.id] && (

                                                        <span className="badge bg-secondary">

                                                            {bookings[event.id].length}

                                                            {bookings[event.id].length === 1
                                                                ? " reserva"
                                                                : " reservas"}

                                                        </span>

                                                    )}

                                                </div>


                                                {/* CARGANDO */}

                                                {loadingBookings ? (

                                                    <div className="text-center py-3">

                                                        <div
                                                            className="spinner-border spinner-border-sm text-primary"
                                                            role="status"
                                                        />

                                                        <span className="ms-2 text-muted">
                                                            Cargando reservas...
                                                        </span>

                                                    </div>


                                                ) : !bookings[event.id] ||
                                                  bookings[event.id].length === 0 ? (


                                                    /* SIN RESERVAS */

                                                    <div className="text-center py-3">

                                                        <p className="text-muted mb-0">
                                                            Este evento todavía no tiene reservas.
                                                        </p>

                                                    </div>


                                                ) : (


                                                    /* TABLA */

                                                    <div className="table-responsive">

                                                        <table className="table table-sm table-hover align-middle mb-0">

                                                            <thead className="table-light">

                                                                <tr>

                                                                    <th>
                                                                        Usuario
                                                                    </th>

                                                                    <th>
                                                                        Email
                                                                    </th>

                                                                    <th className="text-center">
                                                                        Entradas
                                                                    </th>

                                                                    <th>
                                                                        Fecha
                                                                    </th>

                                                                    <th className="text-center">
                                                                        Estado
                                                                    </th>

                                                                </tr>

                                                            </thead>


                                                            <tbody>

                                                                {bookings[event.id].map(
                                                                    booking => (

                                                                        <tr key={booking.id}>

                                                                            <td>

                                                                                <strong>
                                                                                    {booking.user?.name ||
                                                                                        "Usuario"}
                                                                                </strong>

                                                                            </td>


                                                                            <td>

                                                                                <span className="small text-muted">
                                                                                    {booking.user?.email ||
                                                                                        "Email no disponible"}
                                                                                </span>

                                                                            </td>


                                                                            <td className="text-center">

                                                                                <strong>
                                                                                    {booking.quantity}
                                                                                </strong>

                                                                            </td>


                                                                            <td>

                                                                                <span className="small">

                                                                                    {formatBookingDate(
                                                                                        booking.booking_date
                                                                                    )}

                                                                                </span>

                                                                            </td>


                                                                            <td className="text-center">

                                                                                <span
                                                                                    className={
                                                                                        booking.status === "confirmed"
                                                                                            ? "badge bg-success"
                                                                                            : "badge bg-secondary"
                                                                                    }
                                                                                >

                                                                                    {booking.status === "confirmed"
                                                                                        ? "Confirmada"
                                                                                        : booking.status}

                                                                                </span>

                                                                            </td>

                                                                        </tr>

                                                                    )
                                                                )}

                                                            </tbody>

                                                        </table>

                                                    </div>

                                                )}

                                            </div>

                                        )}

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                </>

            )}


            {/* ==================================================
                MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
            ================================================== */}

            {eventToDelete && (

                <>

                    {/* FONDO OSCURO */}

                    <div
                        className="modal-backdrop fade show"
                        style={{
                            backgroundColor:
                                "rgba(0, 0, 0, 0.65)",
                            zIndex: 1040
                        }}
                    ></div>


                    {/* MODAL */}

                    <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-event-title"
                        style={{
                            zIndex: 1050
                        }}
                    >

                        <div className="modal-dialog modal-dialog-centered">

                            <div
                                className="modal-content border-0 shadow-lg"
                                style={{
                                    borderRadius: "20px"
                                }}
                            >

                                <div className="modal-body text-center p-4 p-md-5">


                                    {/* ICONO */}

                                    <div
                                        className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                                        style={{
                                            width: "76px",
                                            height: "76px",
                                            backgroundColor:
                                                "#fff1f2",
                                            fontSize: "34px"
                                        }}
                                    >
                                        🗑️
                                    </div>


                                    {/* TÍTULO */}

                                    <h3
                                        id="delete-event-title"
                                        className="fw-bold fs-4 mb-3"
                                    >
                                        ¿Eliminar este evento?
                                    </h3>


                                    {/* MENSAJE */}

                                    <p className="text-muted mb-2">
                                        Estás a punto de eliminar:
                                    </p>


                                    {/* NOMBRE EVENTO */}

                                    <p className="fw-bold fs-5 mb-3">

                                        {eventToDelete.title}

                                    </p>


                                    {/* ADVERTENCIA */}

                                    <p className="small text-muted mb-4">

                                        Esta acción no se puede
                                        deshacer. Si existen
                                        reservas asociadas,
                                        Pluxis protegerá su
                                        historial.

                                    </p>


                                    {/* BOTONES */}

                                    <div className="d-flex flex-column flex-sm-row gap-2">


                                        {/* CONSERVAR */}

                                        <button
                                            type="button"
                                            className="btn btn-light border py-2 flex-fill"
                                            onClick={() =>
                                                setEventToDelete(null)
                                            }
                                            disabled={deleting}
                                        >
                                            Conservar evento
                                        </button>


                                        {/* ELIMINAR */}

                                        <button
                                            type="button"
                                            className="btn btn-danger py-2 flex-fill"
                                            onClick={
                                                handleDeleteEvent
                                            }
                                            disabled={deleting}
                                        >

                                            {deleting ? (

                                                <>

                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                        aria-hidden="true"
                                                    ></span>

                                                    Eliminando...

                                                </>

                                            ) : (

                                                "Eliminar evento"

                                            )}

                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </>

            )}


            {/* ==================================================
                MODAL DE ERROR AL ELIMINAR
            ================================================== */}

            {showDeleteError && (

                <>

                    {/* FONDO OSCURO */}

                    <div
                        className="modal-backdrop fade show"
                        style={{
                            backgroundColor:
                                "rgba(0, 0, 0, 0.65)",
                            zIndex: 1040
                        }}
                        onClick={() =>
                            setShowDeleteError(false)
                        }
                    ></div>


                    {/* MODAL */}

                    <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-error-title"
                        style={{
                            zIndex: 1050
                        }}
                    >

                        <div className="modal-dialog modal-dialog-centered">

                            <div
                                className="modal-content border-0 shadow-lg"
                                style={{
                                    borderRadius: "20px"
                                }}
                                onClick={(event) =>
                                    event.stopPropagation()
                                }
                            >

                                <div className="modal-body text-center p-4 p-md-5">


                                    {/* ICONO */}

                                    <div
                                        className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                                        style={{
                                            width: "76px",
                                            height: "76px",
                                            backgroundColor:
                                                "#fff3cd",
                                            fontSize: "34px"
                                        }}
                                    >
                                        ⚠️
                                    </div>


                                    {/* TÍTULO */}

                                    <h3
                                        id="delete-error-title"
                                        className="fw-bold fs-4 mb-3"
                                    >
                                        No se puede eliminar el evento
                                    </h3>


                                    {/* ERROR */}

                                    <p className="text-muted mb-3">

                                        {deleteError}

                                    </p>


                                    {/* EXPLICACIÓN */}

                                    <p className="small text-muted mb-4 px-3">

                                        Este evento tiene reservas
                                        asociadas. Para proteger
                                        el historial de reservas,
                                        Pluxis no permite
                                        eliminarlo.

                                    </p>


                                    {/* BOTÓN */}

                                    <button
                                        type="button"
                                        className="btn btn-primary px-4 py-2"
                                        onClick={() =>
                                            setShowDeleteError(false)
                                        }
                                    >
                                        Entendido
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                </>

            )}

        </div>
    );
};