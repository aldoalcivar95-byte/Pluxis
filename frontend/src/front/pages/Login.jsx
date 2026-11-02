import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
    useSearchParams
} from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Login = () => {
    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [expiredMessage, setExpiredMessage] = useState("");

    useEffect(() => {
        if (searchParams.get("expired") === "true") {
            setExpiredMessage(
                "Tu sesión ha expirado. Inicia sesión de nuevo."
            );
        }
    }, [searchParams]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const response = await fetch(`${backendUrl}/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "No se pudo iniciar sesión"
                );
            }

            dispatch({
                type: "login",
                payload: {
                    token: data.access_token,
                    user: data.user,
                },
            });

            navigate("/");

        } catch (error) {
            setError(
                error.message || "Error al iniciar sesión"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">

                    <div className="card shadow-sm">
                        <div className="card-body p-4">

                            <h1 className="text-center mb-4">
                                Iniciar sesión
                            </h1>

                            {expiredMessage && (
                                <div className="alert alert-warning">
                                    {expiredMessage}
                                </div>
                            )}

                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>

                                {/* EMAIL */}
                                <div className="mb-3">

                                    <label
                                        htmlFor="email"
                                        className="form-label"
                                    >
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        id="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
                                        placeholder="tu@email.com"
                                        required
                                    />

                                </div>

                                {/* PASSWORD */}
                                <div className="mb-2">

                                    <label
                                        htmlFor="password"
                                        className="form-label"
                                    >
                                        Contraseña
                                    </label>

                                    <input
                                        type="password"
                                        id="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Tu contraseña"
                                        required
                                    />

                                </div>

                                {/* FORGOT PASSWORD */}
                                <div className="text-end mb-4">

                                    <Link
                                        to="/forgot-password"
                                        className="text-decoration-none"
                                    >
                                        ¿Has olvidado tu contraseña?
                                    </Link>

                                </div>

                                {/* LOGIN BUTTON */}
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Iniciando sesión..."
                                        : "Iniciar sesión"}
                                </button>

                            </form>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};