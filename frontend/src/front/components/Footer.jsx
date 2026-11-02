import { Link } from "react-router-dom";

export const Footer = () => {
    return (
        <footer className="bg-dark text-light mt-auto">
            <div className="container py-3">
                <div className="row g-3 align-items-start">
                    <div className="col-md-6">
                        <h5 className="fw-bold mb-1">
                            PLUXIS
                        </h5>
                        <p className="text-light opacity-75 mb-0 small">
                            Descubre eventos. Vive experiencias.
                        </p>
                    </div>

                    <div className="col-md-6">
                        <h6 className="fw-semibold mb-2">
                            Enlaces
                        </h6>
                        <div className="d-flex flex-wrap gap-3">
                            <Link to="/" className="text-decoration-none text-light opacity-75 small">
                                Inicio
                            </Link>
                            <Link to="/events" className="text-decoration-none text-light opacity-75 small">
                                Eventos
                            </Link>
                            <Link to="/bookings" className="text-decoration-none text-light opacity-75 small">
                                Mis reservas
                            </Link>
                            <Link to="/privacy-policy" className="text-decoration-none text-light opacity-75 small">
                                Política de privacidad
                            </Link>
                        </div>
                    </div>
                </div>

                <hr className="border-secondary my-2" />

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-1">
                    <p className="mb-0 text-light opacity-75 small">
                        © 2026 Pluxis. Todos los derechos reservados.
                    </p>
                    <p className="mb-0 text-light opacity-50 small">
                        Plataforma de descubrimiento y reserva de eventos
                    </p>
                </div>
            </div>
        </footer>
    );
};
