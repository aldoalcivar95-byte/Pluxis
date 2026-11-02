import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Register = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!name || !email || !password || !confirmPassword) {
            setError("Todos los campos son obligatorios");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim(),
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message || "No se pudo crear la cuenta"
                );
                return;
            }

            setSuccess(
                "Cuenta creada correctamente. Redirigiendo al login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {
            console.error(error);

            setError(
                "No se pudo conectar con el servidor"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">

                    <div className="card shadow-sm p-4">

                        <h1 className="text-center mb-4">
                            Crear cuenta
                        </h1>

                        <form onSubmit={handleSubmit}>

                            {/* NAME */}
                            <div className="mb-3">
                                <label
                                    htmlFor="name"
                                    className="form-label"
                                >
                                    Nombre
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    className="form-control"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    placeholder="Tu nombre"
                                />
                            </div>

                            {/* EMAIL */}
                            <div className="mb-3">
                                <label
                                    htmlFor="email"
                                    className="form-label"
                                >
                                    Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    className="form-control"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="tu@email.com"
                                />
                            </div>

                            {/* PASSWORD */}
                            <div className="mb-3">
                                <label
                                    htmlFor="password"
                                    className="form-label"
                                >
                                    Contraseña
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    className="form-control"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="********"
                                />
                            </div>

                            {/* CONFIRM PASSWORD */}
                            <div className="mb-3">
                                <label
                                    htmlFor="confirmPassword"
                                    className="form-label"
                                >
                                    Confirmar contraseña
                                </label>

                                <input
                                    id="confirmPassword"
                                    type="password"
                                    className="form-control"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="********"
                                />
                            </div>

                            {/* ERROR */}
                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            {/* SUCCESS */}
                            {success && (
                                <div className="alert alert-success">
                                    {success}
                                </div>
                            )}

                            {/* BUTTON */}
                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                                disabled={loading}
                            >
                                {loading
                                    ? "Creando cuenta..."
                                    : "Crear cuenta"}
                            </button>

                        </form>

                        <div className="text-center mt-3">
                            ¿Ya tienes una cuenta?{" "}
                            <Link to="/login">
                                Inicia sesión
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};