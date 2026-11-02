import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export const Events = () => {
    const routeLocation = useLocation();
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [location, setLocation] = useState("");
    const [radius, setRadius] = useState("25");
    const [nearbyMode, setNearbyMode] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(
        () => new URLSearchParams(routeLocation.search).get("category") || "all"
    );

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const categoryFromUrl = new URLSearchParams(routeLocation.search).get("category");
        setSelectedCategory(categoryFromUrl || "all");
    }, [routeLocation.search]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                setError("");

                if (!backendUrl) {
                    throw new Error(
                        "VITE_BACKEND_URL no está configurada"
                    );
                }

                const [eventsResponse, categoriesResponse] =
                    await Promise.all([
                        fetch(`${backendUrl}/api/events`),
                        fetch(`${backendUrl}/api/categories`)
                    ]);

                const eventsData = await eventsResponse.json();
                const categoriesData =
                    await categoriesResponse.json();

                if (!eventsResponse.ok) {
                    throw new Error(
                        eventsData.message ||
                        "No se pudieron cargar los eventos"
                    );
                }

                if (!categoriesResponse.ok) {
                    throw new Error(
                        categoriesData.message ||
                        "No se pudieron cargar las categorías"
                    );
                }

                setEvents(
                    Array.isArray(eventsData)
                        ? eventsData
                        : eventsData.events || []
                );

                setCategories(
                    Array.isArray(categoriesData)
                        ? categoriesData
                        : categoriesData.categories || []
                );
            } catch (error) {
                console.error(error);
                setError(
                    error.message ||
                    "No se pudieron cargar los eventos"
                );
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [backendUrl]);

    const searchNearbyEvents = async (e) => {
        e.preventDefault();

        const searchLocation = location.trim();

        if (!searchLocation) {
            setError("Introduce una ciudad o ubicación.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams({
                location: searchLocation,
                radius_km: radius
            });

            const response = await fetch(
                `${backendUrl}/api/events/nearby?${params.toString()}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "No se pudieron buscar eventos cercanos"
                );
            }

            setEvents(
                Array.isArray(data) ? data : data.events || []
            );

            setNearbyMode(true);
        } catch (error) {
            console.error(error);
            setError(
                error.message ||
                "Error al buscar eventos cercanos."
            );
        } finally {
            setLoading(false);
        }
    };

    const searchByCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError("Tu navegador no permite obtener la ubicación.");
            return;
        }

        setLocationLoading(true);
        setError("");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    setLoading(true);

                    const params = new URLSearchParams({
                        lat: String(position.coords.latitude),
                        lon: String(position.coords.longitude),
                        radius_km: radius
                    });

                    const response = await fetch(
                        `${backendUrl}/api/events/nearby?${params.toString()}`
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data.message ||
                            data.error ||
                            "No se pudieron buscar eventos cercanos."
                        );
                    }

                    setEvents(
                        Array.isArray(data) ? data : data.events || []
                    );
                    setLocation("Tu ubicación actual");
                    setNearbyMode(true);
                } catch (error) {
                    console.error(error);
                    setError(
                        error.message ||
                        "Error al buscar eventos desde tu ubicación."
                    );
                } finally {
                    setLoading(false);
                    setLocationLoading(false);
                }
            },
            (geoError) => {
                const messages = {
                    1: "Has denegado el permiso de ubicación. Puedes habilitarlo en los ajustes del navegador.",
                    2: "No se ha podido determinar tu ubicación.",
                    3: "La solicitud de ubicación ha tardado demasiado."
                };

                setError(
                    messages[geoError.code] ||
                    "No se ha podido obtener tu ubicación."
                );
                setLocationLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000
            }
        );
    };

    const showAllEvents = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${backendUrl}/api/events`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "No se pudieron cargar los eventos"
                );
            }

            setEvents(
                Array.isArray(data) ? data : data.events || []
            );

            setNearbyMode(false);
            setLocation("");
        } catch (error) {
            console.error(error);
            setError(
                error.message ||
                "No se pudieron cargar los eventos"
            );
        } finally {
            setLoading(false);
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(
            (category) => category.id === categoryId
        );

        return category ? category.name : "Sin categoría";
    };

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

    const filteredEvents = selectedCategory === "all"
        ? events
        : events.filter((event) =>
            String(event.category_id) === String(selectedCategory)
        );

    return (
        <div className="pluxis-events-page">
            <style>{`
                .pluxis-events-page {
                    min-height: calc(100vh - 60px);
                    background-image: linear-gradient(rgba(7, 17, 48, 0.58), rgba(7, 17, 48, 0.72)), url("/events-background.png");
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    background-attachment: fixed;
                }
                .pluxis-events-page > .container {
                    min-height: calc(100vh - 60px);
                }
                .pluxis-events-page .pluxis-events-heading {
                    color: #ffffff;
                    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
                }
                .pluxis-events-page .pluxis-events-subtitle {
                    color: rgba(255, 255, 255, 0.92) !important;
                    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.45);
                }
                .pluxis-events-page .events-search-panel {
                    background: rgba(255, 255, 255, 0.96);
                    border: 1px solid rgba(255, 255, 255, 0.7);
                    border-radius: 16px;
                    backdrop-filter: blur(10px);
                }
                .pluxis-events-page .pluxis-event-card {
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.75);
                    border-radius: 16px;
                    background: rgba(255, 255, 255, 0.98);
                    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
                }
                @media (max-width: 767px) {
                    .pluxis-events-page {
                        background-attachment: scroll;
                    }
                }
            `}</style>
            <div className="container py-5">
            
            <div className="text-center mb-5">
                <h1 className="display-5 fw-bold pluxis-events-heading">
                    {nearbyMode
                        ? "Eventos cercanos"
                        : "Todos los eventos"}
                </h1>

                <p className="lead pluxis-events-subtitle">
                    Descubre eventos y experiencias en Pluxis.
                </p>
            </div>

            <div className="card shadow-sm mb-5 events-search-panel">
                <div className="card-body p-4">
                    <h2 className="h5 mb-3">
                        Buscar eventos por ubicación
                    </h2>

                    <div className="mb-3">
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={searchByCurrentLocation}
                            disabled={loading || locationLoading}
                        >
                            {locationLoading ? "Obteniendo ubicación..." : "Usar mi ubicación"}
                        </button>
                    </div>

                    <form
                        onSubmit={searchNearbyEvents}
                        className="row g-3 align-items-end"
                    >
                        <div className="col-md-6">
                            <label
                                htmlFor="event-location"
                                className="form-label"
                            >
                                Ciudad o ubicación
                            </label>

                            <input
                                id="event-location"
                                type="text"
                                className="form-control"
                                placeholder="Ej.: Toledo, Madrid..."
                                value={location}
                                onChange={(e) =>
                                    setLocation(e.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="col-md-3">
                            <label
                                htmlFor="event-radius"
                                className="form-label"
                            >
                                Radio de búsqueda
                            </label>

                            <select
                                id="event-radius"
                                className="form-select"
                                value={radius}
                                onChange={(e) =>
                                    setRadius(e.target.value)
                                }
                            >
                                <option value="5">5 km</option>
                                <option value="10">10 km</option>
                                <option value="25">25 km</option>
                                <option value="50">50 km</option>
                                <option value="100">100 km</option>
                            </select>
                        </div>

                        <div className="col-md-3">
                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                                disabled={loading}
                            >
                                Buscar cercanos
                            </button>
                        </div>
                    </form>

                    <div className="row mt-3">
                        <div className="col-md-6 col-lg-4">
                            <label htmlFor="event-category" className="form-label">
                                Categoría
                            </label>
                            <select
                                id="event-category"
                                className="form-select"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="all">Todas las categorías</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {nearbyMode && (
                        <div className="mt-3">
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={showAllEvents}
                                disabled={loading}
                            >
                                Ver todos los eventos
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {loading && (
                <div className="text-center py-5">
                    <div
                        className="spinner-border"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Cargando...
                        </span>
                    </div>

                    <p className="mt-3">
                        {nearbyMode
                            ? "Buscando eventos cercanos..."
                            : "Cargando eventos..."}
                    </p>
                </div>
            )}

            {!loading && error && (
                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {!loading && !error && filteredEvents.length === 0 && (
                <div className="alert alert-info">
                    {events.length === 0
                        ? nearbyMode
                            ? `No se han encontrado eventos en un radio de ${radius} km de ${location}. Prueba con una ubicación diferente o amplía el radio.`
                            : "No hay eventos disponibles."
                        : "No hay eventos disponibles en esta categoría."}
                </div>
            )}

            {!loading && !error && filteredEvents.length > 0 && (
                <>
                    {nearbyMode && (
                        <p className="text-muted mb-4">
                            Se han encontrado {filteredEvents.length}{" "}
                            {filteredEvents.length === 1
                                ? "evento"
                                : "eventos"}{" "}
                            en un radio de {radius} km de {location}.
                        </p>
                    )}

                    <div className="row g-4">
                        {filteredEvents.map((event) => (
                            <div
                                key={event.id}
                                className="col-md-6 col-lg-4"
                            >
                                <div className="card h-100 shadow-sm pluxis-event-card">
                                    
                                    {event.image ? (
                                        <img
                                            src={event.image}
                                            className="card-img-top"
                                            alt={event.title}
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
                                        <span className="badge bg-secondary align-self-start mb-2">
                                            {getCategoryName(
                                                event.category_id
                                            )}
                                        </span>

                                        <h2 className="h4 card-title">
                                            {event.title}
                                        </h2>

                                        <p className="card-text text-muted">
                                            {event.description}
                                        </p>

                                        <div className="mt-auto">
                                            {nearbyMode &&
                                                Number.isFinite(
                                                    Number(event.distance_km)
                                                ) && (
                                                    <p className="mb-2">
                                                        <strong>
                                                            Distancia:
                                                        </strong>{" "}
                                                        {Number(
                                                            event.distance_km
                                                        ).toLocaleString(
                                                            "es-ES",
                                                            {
                                                                maximumFractionDigits: 2
                                                            }
                                                        )}{" "}
                                                        km
                                                    </p>
                                                )}

                                            <p className="mb-1">
                                                <strong>Fecha:</strong>{" "}
                                                {formatDate(event.date)}
                                            </p>

                                            <p className="mb-1">
                                                <strong>Hora:</strong>{" "}
                                                {formatTime(event.time)}
                                            </p>

                                            <p className="mb-1">
                                                <strong>Lugar:</strong>{" "}
                                                {event.location}
                                            </p>

                                            <p className="mb-3">
                                                <strong>Precio:</strong>{" "}
                                                {Number(event.price) === 0
                                                    ? "Gratis"
                                                    : `${event.price} €`}
                                            </p>

                                            <Link
                                                to={`/events/${event.id}`}
                                                className="btn btn-primary w-100"
                                            >
                                                Ver evento
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            </div>
        </div>
    );
};
