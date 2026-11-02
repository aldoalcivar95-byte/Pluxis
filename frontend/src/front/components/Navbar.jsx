import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const token = store.token || localStorage.getItem("token");
    const user = store.user || JSON.parse(localStorage.getItem("user") || "null");

    const handleLogout = () => {
        dispatch({
            type: "logout",
        });

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
            <div className="container">

                {/* ==================================================
                    LOGO
                ================================================== */}

                <Link
                    to="/"
                    className="navbar-brand fw-bold fs-4"
                >
                    PLUXIS
                </Link>


                {/* ==================================================
                    BOTÓN MOBILE
                ================================================== */}

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarPluxis"
                    aria-controls="navbarPluxis"
                    aria-expanded="false"
                    aria-label="Mostrar navegación"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>


                {/* ==================================================
                    NAVEGACIÓN
                ================================================== */}

                <div
                    className="collapse navbar-collapse"
                    id="navbarPluxis"
                >

                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">

                        {/* Inicio */}

                        <li className="nav-item">
                            <Link
                                to="/"
                                className="nav-link"
                            >
                                Inicio
                            </Link>
                        </li>


                        {/* Eventos */}

                        <li className="nav-item">
                            <Link
                                to="/events"
                                className="nav-link"
                            >
                                Eventos
                            </Link>
                        </li>


                        {/* Mis reservas */}

                        {token && (
                            <li className="nav-item">
                                <Link
                                    to="/bookings"
                                    className="nav-link"
                                >
                                    Mis reservas
                                </Link>
                            </li>
                        )}


                        {/* Panel organizador */}

                        {token && user?.role === "organizer" && (
                            <li className="nav-item">
                                <Link
                                    to="/organizer"
                                    className="nav-link"
                                >
                                    Panel organizador
                                </Link>
                            </li>
                        )}


                        {/* Política de privacidad */}

                        <li className="nav-item">
                            <Link
                                to="/privacy-policy"
                                className="nav-link"
                            >
                                Política de privacidad
                            </Link>
                        </li>

                    </ul>


                    {/* ==================================================
                        ZONA USUARIO
                    ================================================== */}

                    <div className="d-flex align-items-center gap-3">

                        {token && user ? (
                            <>
                                <span className="text-light small">
                                    Hola,{" "}
                                    <strong>
                                        {user.name}
                                    </strong>
                                </span>

                                <button
                                    type="button"
                                    className="btn btn-outline-light btn-sm"
                                    onClick={handleLogout}
                                >
                                    Cerrar sesión
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="btn btn-outline-light btn-sm"
                                >
                                    Iniciar sesión
                                </Link>

                                <Link
                                    to="/register"
                                    className="btn btn-primary btn-sm"
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}

                    </div>

                </div>
            </div>
        </nav>
    );
};