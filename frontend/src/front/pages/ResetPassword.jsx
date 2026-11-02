import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!token) {
            setError("El enlace de recuperación no es válido o ha caducado.");
            return;
        }

        if (!password || !confirmPassword) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/reset-password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, password })
                }
            );

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "No se pudo restablecer la contraseña.");
            }

            setSuccess("Tu contraseña se ha actualizado correctamente. Redirigiendo al inicio de sesión...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            setError(error.message || "No se pudo conectar con el servidor.");
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
                                <div style={{ fontSize: "3rem" }}>🔐</div>
                                <h1 className="mt-2 mb-2">Nueva contraseña</h1>
                                <p className="text-muted mb-0">Introduce tu nueva contraseña para recuperar el acceso a tu cuenta.</p>
                            </div>
                            {error && <div className="alert alert-danger">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Nueva contraseña</label>
                                    <input
                                        id="password"
                                        type="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        placeholder="Mínimo 6 caracteres"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña</label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        className="form-control"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        placeholder="Repite tu contraseña"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                    {loading ? "Actualizando contraseña..." : "Cambiar contraseña"}
                                </button>
                            </form>
                            <div className="text-center mt-4">
                                <Link to="/login">← Volver al inicio de sesión</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
