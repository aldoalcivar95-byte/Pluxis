import { useState } from "react";
import { Link } from "react-router-dom";

export const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [resetToken, setResetToken] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");
        setResetToken("");

        if (!email.trim()) {
            setError("Introduce tu email");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/forgot-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.trim()
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                    "No se pudo procesar la solicitud"
                );
                return;
            }

            setSuccess(
                data.message ||
                "Si existe una cuenta asociada a ese email, recibirás instrucciones para restablecer tu contraseña."
            );

            // -------------------------------------------------
            // DESARROLLO
            // Mostramos el token únicamente porque todavía
            // no tenemos configurado el envío real de emails.
            // -------------------------------------------------

            if (data.development_reset_token) {
                setResetToken(
                    data.development_reset_token
                );
            }

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

                    <div className="card shadow-sm">

                        <div className="card-body p-4">

                            <div className="text-center mb-4">

                                <div
                                    style={{
                                        fontSize: "3rem"
                                    }}
                                >
                                    🔐
                                </div>

                                <h1 className="mt-2 mb-2">
                                    Recuperar contraseña
                                </h1>

                                <p className="text-muted mb-0">
                                    Introduce el email asociado
                                    a tu cuenta y te enviaremos
                                    las instrucciones para
                                    restablecer tu contraseña.
                                </p>

                            </div>

                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success">
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>

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
                                        onChange={(event) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
                                        placeholder="tu@email.com"
                                        required
                                        disabled={loading}
                                    />

                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Enviando..."
                                        : "Enviar instrucciones"}
                                </button>

                            </form>

                            {/* ---------------------------------
                                DESARROLLO
                                --------------------------------- */}

                            {resetToken && (
                                <div className="alert alert-warning mt-4">

                                    <strong>
                                        Modo desarrollo
                                    </strong>

                                    <p className="mb-2 mt-2">
                                        Todavía no tenemos
                                        configurado el envío
                                        real de emails.
                                    </p>

                                    <small className="d-block mb-2">
                                        Token de recuperación:
                                    </small>

                                    <div
                                        className="bg-light border rounded p-2"
                                        style={{
                                            wordBreak: "break-all",
                                            fontSize: "0.85rem"
                                        }}
                                    >
                                        {resetToken}
                                    </div>

                                </div>
                            )}

                            <div className="text-center mt-4">

                                <Link to="/login">
                                    ← Volver al inicio de sesión
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};