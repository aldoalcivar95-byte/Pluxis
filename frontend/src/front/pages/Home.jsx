import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const Home = () => {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [nearbyLoading, setNearbyLoading] = useState(false);
    const [locationMessage, setLocationMessage] = useState("");
    const [manualLocation, setManualLocation] = useState("");
    const [radiusKm, setRadiusKm] = useState("25");
    const [nearbyMode, setNearbyMode] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const loadData = async () => {
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

                setEvents(eventsData);
                setCategories(categoriesData);

            } catch (error) {
                console.error(error);

                setError(
                    error.message ||
                    "No se pudieron cargar los datos de Pluxis"
                );

            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [backendUrl]);

    const searchNearbyEvents = async ({ lat, lon, location } = {}, radius = radiusKm) => {
        try {
            setNearbyLoading(true);
            setError("");
            setLocationMessage("Buscando eventos cercanos...");

            const params = new URLSearchParams({ radius_km: String(radius) });
            if (location) {
                params.set("location", location);
            } else {
                params.set("lat", String(lat));
                params.set("lon", String(lon));
            }

            const response = await fetch(`${backendUrl}/api/events/nearby?${params.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "No se pudieron buscar eventos cercanos");
            }

            setEvents(Array.isArray(data) ? data : (data.events || []));
            setNearbyMode(true);
            const total = Array.isArray(data) ? data.length : (data.events || []).length;
            setLocationMessage(
                total > 0
                    ? `Se han encontrado ${total} evento${total === 1 ? "" : "s"} en un radio de ${radius} km.`
                    : `No hay eventos con ubicación registrada en un radio de ${radius} km.`
            );
        } catch (err) {
            console.error(err);
            setError(err.message || "Error al buscar eventos cercanos");
            setLocationMessage("");
        } finally {
            setNearbyLoading(false);
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setError("Tu navegador no permite obtener la ubicación.");
            return;
        }

        setLocationMessage("Solicitando permiso de ubicación...");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                searchNearbyEvents({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
            },
            (geoError) => {
                const messages = {
                    1: "Has denegado el permiso de ubicación. Puedes buscar por localidad.",
                    2: "No se ha podido determinar tu ubicación.",
                    3: "La solicitud de ubicación ha agotado el tiempo de espera."
                };
                setLocationMessage(messages[geoError.code] || "No se pudo obtener tu ubicación.");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    };

    const handleManualLocationSearch = () => {
        const place = manualLocation.trim();
        if (!place) {
            setError("Escribe una localidad para buscar eventos cercanos.");
            return;
        }
        searchNearbyEvents({ location: place });
    };

    const handleRadiusChange = (event) => {
        const newRadius = event.target.value;
        setRadiusKm(newRadius);
        if (nearbyMode && manualLocation.trim()) {
            searchNearbyEvents({ location: manualLocation.trim() }, newRadius);
        }
    };

    const handleShowAllEvents = async () => {
        try {
            setLoading(true);
            setError("");
            setLocationMessage("");
            const response = await fetch(`${backendUrl}/api/events`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "No se pudieron cargar los eventos");
            }
            setEvents(data);
            setNearbyMode(false);
        } catch (err) {
            setError(err.message || "No se pudieron cargar los eventos");
        } finally {
            setLoading(false);
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(
            (category) => category.id === categoryId
        );

        return category
            ? category.name
            : "Sin categoría";
    };

    const formatDate = (date) => {
        const dateObject = new Date(
            `${date}T00:00:00`
        );

        return dateObject.toLocaleDateString(
            "es-ES",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );
    };

    const formatTime = (time) => {
        if (!time) return "";

        return time.substring(0, 5);
    };

    return (
        <>

            {}

            <style>{`

                

                .pluxis-home {
                    background: #ffffff;
                    overflow: hidden;
                }


                .pluxis-hero {
                    position: relative;
                    min-height: 540px;
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                    isolation: isolate;
                }


                

                .pluxis-hero-container {
                    position: relative;
                    width: min(1180px, 100%);
                    margin: 0 auto;
                    padding: 65px 24px 75px;
                    z-index: 5;
                }


                

                .pluxis-hero-content {
                    position: relative;
                    width: 50%;
                    z-index: 6;
                }


                .pluxis-hero-badge {
                    display: inline-block;
                    background: #0d6efd;
                    color: white;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.3px;
                    padding: 8px 14px;
                    border-radius: 6px;
                    margin-bottom: 25px;
                    box-shadow: 0 5px 15px rgba(13, 110, 253, 0.15);
                }


                .pluxis-hero-title {
                    margin: 0;
                    font-size: clamp(48px, 5vw, 72px);
                    line-height: 0.98;
                    font-weight: 800;
                    letter-spacing: -2.5px;
                    color: #20242a;
                    max-width: 600px;
                }


                .pluxis-hero-title-highlight {
                    color: #0d6efd;
                }


                .pluxis-hero-description {
                    margin-top: 30px;
                    margin-bottom: 0;
                    max-width: 570px;
                    color: #667085;
                    font-size: 18px;
                    line-height: 1.65;
                }


                .pluxis-hero-description-secondary {
                    margin-top: 22px;
                    max-width: 550px;
                    color: #52606d;
                    font-size: 15px;
                    line-height: 1.7;
                }


                

                .pluxis-hero-buttons {
                    display: flex;
                    gap: 14px;
                    margin-top: 28px;
                    flex-wrap: wrap;
                }


                .pluxis-hero-button-primary {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;

                    min-height: 50px;
                    padding: 0 24px;

                    background: #0d6efd;
                    color: #ffffff;

                    border: 1px solid #0d6efd;
                    border-radius: 7px;

                    font-size: 16px;
                    font-weight: 600;

                    text-decoration: none;

                    transition:
                        transform 0.2s ease,
                        box-shadow 0.2s ease,
                        background 0.2s ease;
                }


                .pluxis-hero-button-primary:hover {
                    color: #ffffff;
                    background: #0b5ed7;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(13, 110, 253, 0.25);
                }


                .pluxis-hero-button-secondary {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;

                    min-height: 50px;
                    padding: 0 24px;

                    background: rgba(255, 255, 255, 0.9);
                    color: #20242a;

                    border: 1px solid #20242a;
                    border-radius: 7px;

                    font-size: 16px;
                    font-weight: 500;

                    text-decoration: none;

                    transition:
                        transform 0.2s ease,
                        background 0.2s ease;
                }


                .pluxis-hero-button-secondary:hover {
                    color: #20242a;
                    background: #ffffff;
                    transform: translateY(-2px);
                }


                

                .pluxis-hero-image-wrapper {
                    position: absolute;

                    top: 0;
                    right: -3%;

                    width: 72%;
                    height: 100%;

                    z-index: 1;

                    overflow: hidden;

                    pointer-events: none;

                    
                    -webkit-mask-image:
                        radial-gradient(
                            ellipse 72% 82% at 58% 50%,
                            #000 42%,
                            rgba(0, 0, 0, 0.95) 56%,
                            rgba(0, 0, 0, 0.65) 72%,
                            rgba(0, 0, 0, 0.2) 88%,
                            transparent 100%
                        );

                    mask-image:
                        radial-gradient(
                            ellipse 72% 82% at 58% 50%,
                            #000 42%,
                            rgba(0, 0, 0, 0.95) 56%,
                            rgba(0, 0, 0, 0.65) 72%,
                            rgba(0, 0, 0, 0.2) 88%,
                            transparent 100%
                        );
                }


                .pluxis-hero-image {
                    width: 100%;
                    height: 100%;

                    display: block;

                    object-fit: cover;
                    object-position: center;

                    transform: scale(1.08);
                }


                

                .pluxis-hero-image-fade {
                    position: absolute;

                    inset: 0;

                    z-index: 2;

                    pointer-events: none;

                    background:

                        
                        linear-gradient(
                            90deg,
                            #ffffff 0%,
                            #ffffff 17%,
                            rgba(255,255,255,0.98) 24%,
                            rgba(255,255,255,0.88) 31%,
                            rgba(255,255,255,0.55) 39%,
                            rgba(255,255,255,0) 53%
                        ),

                        
                        linear-gradient(
                            180deg,
                            rgba(255,255,255,0.92) 0%,
                            rgba(255,255,255,0.25) 15%,
                            rgba(255,255,255,0) 28%,
                            rgba(255,255,255,0) 75%,
                            rgba(255,255,255,0.75) 100%
                        );
                }


                

                .pluxis-about {
                    position: relative;
                    padding: 85px 24px 90px;
                    background: #f8f9fa;
                    text-align: center;
                }


                .pluxis-about-label {
                    color: #0d6efd;
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    margin-bottom: 14px;
                }


                .pluxis-about-title {
                    margin: 0 auto;
                    max-width: 720px;
                    font-size: clamp(30px, 4vw, 42px);
                    line-height: 1.2;
                    font-weight: 750;
                    color: #20242a;
                }


                .pluxis-about-title span {
                    color: #0d6efd;
                }


                .pluxis-about-text {
                    max-width: 720px;
                    margin: 22px auto 0;
                    color: #667085;
                    font-size: 16px;
                    line-height: 1.75;
                }


                

                .pluxis-categories {
                    padding: 75px 24px;
                    background: #ffffff;
                }


                .pluxis-section-container {
                    width: min(1180px, 100%);
                    margin: 0 auto;
                }


                .pluxis-section-title {
                    font-size: 30px;
                    font-weight: 750;
                    color: #20242a;
                    margin-bottom: 28px;
                }


                .pluxis-category-card {
                    height: 100%;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    background: #ffffff;
                    transition:
                        transform 0.2s ease,
                        box-shadow 0.2s ease;
                }


                .pluxis-category-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
                }


                

                .pluxis-events {
                    padding: 75px 24px 100px;
                    background: #f8f9fa;
                }


                .pluxis-event-card {
                    height: 100%;
                    overflow: hidden;

                    border: 0;
                    border-radius: 14px;

                    background: #ffffff;

                    box-shadow:
                        0 5px 18px rgba(0,0,0,0.06);

                    transition:
                        transform 0.2s ease,
                        box-shadow 0.2s ease;
                }


                .pluxis-event-card:hover {
                    transform: translateY(-5px);

                    box-shadow:
                        0 14px 30px rgba(0,0,0,0.10);
                }


                .pluxis-event-image {
                    width: 100%;
                    height: 220px;

                    object-fit: cover;

                    display: block;
                }


                .pluxis-event-placeholder {
                    height: 220px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    background: #eef0f2;
                    color: #6c757d;
                }


                

                @media (max-width: 991px) {

                    .pluxis-hero {
                        min-height: auto;
                    }


                    .pluxis-hero-container {
                        padding-top: 55px;
                        padding-bottom: 55px;
                    }


                    .pluxis-hero-content {
                        width: 58%;
                    }


                    .pluxis-hero-title {
                        font-size: 52px;
                    }


                    .pluxis-hero-image-wrapper {
                        width: 68%;
                        right: -10%;
                    }
                }


                @media (max-width: 767px) {

                    .pluxis-hero {
                        min-height: auto;
                    }


                    .pluxis-hero-container {
                        padding-top: 45px;
                        padding-bottom: 45px;
                    }


                    .pluxis-hero-content {
                        width: 100%;
                    }


                    .pluxis-hero-title {
                        font-size: 44px;
                        letter-spacing: -1.5px;
                    }


                    .pluxis-hero-description {
                        font-size: 16px;
                        max-width: 100%;
                    }


                    .pluxis-hero-description-secondary {
                        font-size: 14px;
                    }


                    

                    .pluxis-hero-image-wrapper {
                        position: absolute;

                        width: 100%;
                        height: 100%;

                        right: 0;
                        top: 0;

                        opacity: 0.28;

                        -webkit-mask-image:
                            linear-gradient(
                                180deg,
                                transparent 0%,
                                #000 30%,
                                #000 70%,
                                transparent 100%
                            );

                        mask-image:
                            linear-gradient(
                                180deg,
                                transparent 0%,
                                #000 30%,
                                #000 70%,
                                transparent 100%
                            );
                    }


                    .pluxis-hero-image-fade {
                        background:
                            linear-gradient(
                                180deg,
                                #ffffff 0%,
                                rgba(255,255,255,0.85) 20%,
                                rgba(255,255,255,0.3) 50%,
                                #ffffff 100%
                            );
                    }


                    .pluxis-hero-buttons {
                        position: relative;
                        z-index: 10;
                    }


                    .pluxis-about {
                        padding-top: 65px;
                        padding-bottom: 65px;
                    }


                    .pluxis-categories,
                    .pluxis-events {
                        padding-left: 18px;
                        padding-right: 18px;
                    }
                }

            `}</style>


            <div className="pluxis-home">

                {}

                <section className="pluxis-hero">

                    {}

                    <div className="pluxis-hero-image-wrapper">

                        <img
                            src="/images/events/imagen_home.png"
                            alt="Personas disfrutando de un concierto"
                            className="pluxis-hero-image"
                        />

                        <div className="pluxis-hero-image-fade"></div>

                    </div>


                    {}

                    <div className="pluxis-hero-container">

                        <div className="pluxis-hero-content">

                            <span className="pluxis-hero-badge">
                                DESCUBRE · RESERVA · VIVE
                            </span>


                            <h1 className="pluxis-hero-title">

                                Vive experiencias
                                <br />

                                que{" "}

                                <span className="pluxis-hero-title-highlight">
                                    merecen ser
                                </span>

                                <br />

                                <span className="pluxis-hero-title-highlight">
                                    recordadas.
                                </span>

                            </h1>


                            <p className="pluxis-hero-description">

                                Pluxis es una plataforma para descubrir,
                                explorar y reservar eventos en un solo lugar.
                                Conciertos, festivales, gastronomía,
                                deporte y mucho más.

                            </p>


                            <p className="pluxis-hero-description-secondary">

                                Encuentra tu próximo plan, descubre nuevas
                                experiencias y reserva tus entradas de forma
                                rápida, sencilla y segura.

                            </p>


                            <div className="pluxis-hero-buttons">

                                <Link
                                    to="/events"
                                    className="pluxis-hero-button-primary"
                                >
                                    Explorar eventos
                                </Link>


                                <a
                                    href="#sobre-pluxis"
                                    className="pluxis-hero-button-secondary"
                                >
                                    Conoce Pluxis
                                </a>

                            </div>

                        </div>

                    </div>

                </section>


                {}

                <section
                    id="sobre-pluxis"
                    className="pluxis-about"
                >

                    <div className="pluxis-section-container">

                        <div className="pluxis-about-label">
                            SOBRE PLUXIS
                        </div>


                        <h2 className="pluxis-about-title">

                            Todo lo que buscas para{" "}

                            <span>
                                vivir más.
                            </span>

                        </h2>


                        <p className="pluxis-about-text">

                            Pluxis nace con una idea sencilla: hacer que
                            descubrir y reservar experiencias sea rápido,
                            cómodo y accesible. Reunimos diferentes tipos
                            de eventos en una misma plataforma para que
                            encuentres fácilmente aquello que quieres vivir.

                        </p>

                    </div>

                </section>


                {}

                <section className="pluxis-categories">

                    <div className="pluxis-section-container">

                        <h2 className="pluxis-section-title">
                            Explora por categorías
                        </h2>


                        {loading ? (

                            <p>
                                Cargando categorías...
                            </p>

                        ) : categories.length === 0 ? (

                            <p className="text-muted">
                                No hay categorías disponibles.
                            </p>

                        ) : (

                            <div className="row g-3">

                                {categories.map((category) => (

                                    <div
                                        key={category.id}
                                        className="col-6 col-md-4 col-lg-2"
                                    >

                                        <Link
                                            to={`/events?category=${encodeURIComponent(category.id)}`}
                                            className="text-decoration-none text-reset d-block h-100"
                                        >
                                            <div className="pluxis-category-card text-center">

                                                <div className="card-body">

                                                    <h5 className="card-title mb-0">
                                                        {category.name}
                                                    </h5>

                                                </div>

                                            </div>
                                        </Link>

                                    </div>

                                ))}

                            </div>

                        )}

                    </div>

                </section>


                {}

                <section className="pluxis-events">

                    <div className="pluxis-section-container">

                        <div className="d-flex justify-content-between align-items-center mb-4">

                            <h2 className="pluxis-section-title mb-0">
                                Próximos eventos
                            </h2>

                        </div>

                        {}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body">
                                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleGetLocation}
                                        disabled={nearbyLoading}
                                    >
                                        {nearbyLoading ? "Buscando..." : "Usar mi ubicación"}
                                    </button>
                                    <label htmlFor="event-radius" className="mb-0">Radio de búsqueda:</label>
                                    <select
                                        id="event-radius"
                                        className="form-select"
                                        style={{ width: "auto" }}
                                        value={radiusKm}
                                        onChange={handleRadiusChange}
                                    >
                                        <option value="5">5 km</option>
                                        <option value="10">10 km</option>
                                        <option value="25">25 km</option>
                                        <option value="50">50 km</option>
                                        <option value="100">100 km</option>
                                    </select>
                                </div>
                                <div className="d-flex flex-wrap gap-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        style={{ maxWidth: "320px" }}
                                        placeholder="Introduce una localidad (ej. Toledo)"
                                        value={manualLocation}
                                        onChange={(event) => setManualLocation(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") handleManualLocationSearch();
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary"
                                        onClick={handleManualLocationSearch}
                                        disabled={nearbyLoading}
                                    >
                                        Buscar localidad
                                    </button>
                                    {nearbyMode && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={handleShowAllEvents}
                                        >
                                            Mostrar todos
                                        </button>
                                    )}
                                </div>
                                {locationMessage && (
                                    <p className="text-muted small mt-3 mb-0" role="status">{locationMessage}</p>
                                )}
                            </div>
                        </div>

                        {loading && (

                            <div className="text-center py-5">

                                <div
                                    className="spinner-border text-primary"
                                    role="status"
                                >

                                    <span className="visually-hidden">
                                        Cargando...
                                    </span>

                                </div>


                                <p className="mt-3">
                                    Cargando eventos...
                                </p>

                            </div>

                        )}


                        {error && (

                            <div className="alert alert-danger">
                                {error}
                            </div>

                        )}


                        {!loading &&
                            !error &&
                            events.length === 0 && (

                                <div className="alert alert-info">

                                    Todavía no hay eventos disponibles.

                                </div>

                            )}


                        {!loading &&
                            !error &&
                            events.length > 0 && (

                                <div className="row g-4">

                                    {events.map((event) => (

                                        <div
                                            key={event.id}
                                            className="col-md-6 col-lg-4"
                                        >

                                            <div className="pluxis-event-card">

                                                {}

                                                {event.image ? (

                                                    <img
                                                        src={event.image}
                                                        className="pluxis-event-image"
                                                        alt={event.title}
                                                    />

                                                ) : (

                                                    <div className="pluxis-event-placeholder">

                                                        <span>
                                                            Sin imagen
                                                        </span>

                                                    </div>

                                                )}


                                                <div className="card-body d-flex flex-column">

                                                    {}

                                                    <span className="badge bg-primary align-self-start mb-2">

                                                        {getCategoryName(
                                                            event.category_id
                                                        )}

                                                    </span>


                                                    {}

                                                    <h3 className="card-title">

                                                        {event.title}

                                                    </h3>


                                                    {}

                                                    <p className="card-text text-muted">

                                                        {event.description}

                                                    </p>


                                                    {}

                                                    <div className="mt-auto">

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

                                                            {formatTime(
                                                                event.time
                                                            )}

                                                        </p>


                                                        <p className="mb-1">

                                                            <strong>
                                                                Lugar:
                                                            </strong>{" "}

                                                            {event.location}

                                                        </p>

                                                        {event.distance_km !== undefined && (
                                                            <p className="mb-1">
                                                                <strong>Distancia:</strong>{" "}
                                                                {event.distance_km} km
                                                            </p>
                                                        )}

                                                        <p className="mb-3">

                                                            <strong>
                                                                Precio:
                                                            </strong>{" "}

                                                            {event.price === 0
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

                            )}

                    </div>

                </section>

            </div>

        </>
    );
}; 