import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

const EMPTY_FORM = {
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    latitude: "",
    longitude: "",
    price: "",
    capacity: "",
    image: "",
    category_id: "",
};

export const EventForm = ({ categories, event, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const isEditing = Boolean(event);

    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title || "",
                description: event.description || "",
                date: event.date || "",
                time: event.time ? event.time.slice(0, 5) : "",
                location: event.location || "",
                latitude: event.latitude ?? "",
                longitude: event.longitude ?? "",
                price: event.price ?? "",
                capacity: event.capacity ?? "",
                image: event.image || "",
                category_id: event.category_id ?? "",
            });
        } else {
            setFormData({ ...EMPTY_FORM });
        }

        setError("");
    }, [event]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            setError("Selecciona una imagen JPG, PNG o WEBP.");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("La imagen no puede superar los 5 MB.");
            e.target.value = "";
            return;
        }

        setError("");
        setUploadingImage(true);

        try {
            const uploadData = new FormData();
            uploadData.append("image", file);

            const response = await apiFetch("/api/upload-image", {
                method: "POST",
                body: uploadData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "No se pudo subir la imagen.");
            }

            if (!data.image_url) {
                throw new Error("Cloudinary no devolvió la URL de la imagen.");
            }

            setFormData((previous) => ({
                ...previous,
                image: data.image_url,
            }));
        } catch (error) {
            if (error.message === "SESSION_EXPIRED") return;
            setError(error.message || "No se pudo subir la imagen.");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const hasLat = String(formData.latitude).trim() !== "";
        const hasLon = String(formData.longitude).trim() !== "";

        if (hasLat !== hasLon) {
            setError(
                "Introduce tanto la latitud como la longitud, o deja ambos campos vacíos."
            );
            return;
        }

        let latitude = null;
        let longitude = null;

        if (hasLat && hasLon) {
            latitude = Number(formData.latitude);
            longitude = Number(formData.longitude);

            if (
                !Number.isFinite(latitude) ||
                latitude < -90 ||
                latitude > 90
            ) {
                setError("La latitud debe ser un número entre -90 y 90.");
                return;
            }

            if (
                !Number.isFinite(longitude) ||
                longitude < -180 ||
                longitude > 180
            ) {
                setError("La longitud debe ser un número entre -180 y 180.");
                return;
            }
        }

        setLoading(true);

        try {
            const endpoint = isEditing
                ? `/api/events/${event.id}`
                : "/api/events";

            const method = isEditing ? "PUT" : "POST";

            const response = await apiFetch(endpoint, {
                method,
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    date: formData.date,
                    time: formData.time,
                    location: formData.location,
                    latitude,
                    longitude,
                    price: Number(formData.price),
                    capacity: Number(formData.capacity),
                    image: formData.image,
                    category_id: Number(formData.category_id),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    (isEditing
                        ? "No se pudo actualizar el evento"
                        : "No se pudo crear el evento")
                );
            }

            onSuccess(data.event);
        } catch (error) {
            if (error.message === "SESSION_EXPIRED") {
                return;
            }

            setError(
                error.message ||
                (isEditing
                    ? "No se pudo actualizar el evento"
                    : "No se pudo crear el evento")
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card shadow-sm mb-5">
            <div className="card-body p-4">
                <div className="mb-4">
                    <h2 className="mb-1">
                        {isEditing ? "Editar evento" : "Crear nuevo evento"}
                    </h2>

                    <p className="text-muted mb-0">
                        {isEditing
                            ? "Modifica los datos de tu evento."
                            : "Completa los datos de tu evento."}
                    </p>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="title" className="form-label">
                            Título
                        </label>

                        <input
                            type="text"
                            id="title"
                            name="title"
                            className="form-control"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Ej. Festival de Música de Toledo"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="description" className="form-label">
                            Descripción
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            className="form-control"
                            rows="4"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe el evento..."
                            required
                        />
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="date" className="form-label">
                                Fecha
                            </label>

                            <input
                                type="date"
                                id="date"
                                name="date"
                                className="form-control"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="time" className="form-label">
                                Hora
                            </label>

                            <input
                                type="time"
                                id="time"
                                name="time"
                                className="form-control"
                                value={formData.time}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="location" className="form-label">
                            Ubicación o dirección
                        </label>

                        <input
                            type="text"
                            id="location"
                            name="location"
                            className="form-control"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Ej. Plaza de Zocodover, Toledo, España"
                            required
                        />

                        <div className="form-text">
                            Introduce la dirección más concreta posible para
                            facilitar la geolocalización automática.
                        </div>
                    </div>

                    <div className="border rounded p-3 mb-4">
                        <h5 className="mb-2">Coordenadas GPS (opcional)</h5>

                        <p className="text-muted small mb-3">
                            Introduce las coordenadas del punto exacto desde
                            Google Maps. Si las dejas vacías, se podrá
                            geolocalizar la ubicación escrita arriba.
                        </p>

                        <div className="row">
                            <div className="col-md-6 mb-3 mb-md-0">
                                <label
                                    htmlFor="latitude"
                                    className="form-label"
                                >
                                    Latitud
                                </label>

                                <input
                                    type="number"
                                    id="latitude"
                                    name="latitude"
                                    className="form-control"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    min="-90"
                                    max="90"
                                    step="any"
                                    placeholder="Ej. 39.8628"
                                />
                            </div>

                            <div className="col-md-6">
                                <label
                                    htmlFor="longitude"
                                    className="form-label"
                                >
                                    Longitud
                                </label>

                                <input
                                    type="number"
                                    id="longitude"
                                    name="longitude"
                                    className="form-control"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    min="-180"
                                    max="180"
                                    step="any"
                                    placeholder="Ej. -4.0273"
                                />
                            </div>
                        </div>

                        <div className="form-text mt-2">
                            En Google Maps, haz clic derecho sobre el lugar
                            y copia las coordenadas. El primer número es la
                            latitud y el segundo la longitud.
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="price" className="form-label">
                                Precio (€)
                            </label>

                            <input
                                type="number"
                                id="price"
                                name="price"
                                className="form-control"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                placeholder="0"
                                required
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="capacity" className="form-label">
                                Capacidad
                            </label>

                            <input
                                type="number"
                                id="capacity"
                                name="capacity"
                                className="form-control"
                                value={formData.capacity}
                                onChange={handleChange}
                                min="1"
                                placeholder="100"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="category_id" className="form-label">
                            Categoría
                        </label>

                        <select
                            id="category_id"
                            name="category_id"
                            className="form-select"
                            value={formData.category_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                Selecciona una categoría
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="imageFile" className="form-label">
                            Imagen del evento
                        </label>

                        <input
                            type="file"
                            id="imageFile"
                            name="imageFile"
                            className="form-control"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageUpload}
                            disabled={uploadingImage || loading}
                        />

                        <div className="form-text">
                            Formatos JPG, PNG o WEBP. Tamaño máximo: 5 MB.
                        </div>

                        {uploadingImage && (
                            <div className="mt-2 text-primary" role="status">
                                Subiendo imagen a Cloudinary...
                            </div>
                        )}

                        {formData.image && (
                            <div className="mt-3">
                                <img
                                    src={formData.image}
                                    alt="Vista previa del evento"
                                    style={{
                                        display: "block",
                                        width: "100%",
                                        maxWidth: "320px",
                                        maxHeight: "220px",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                    }}
                                />
                                <div className="small text-success mt-2">
                                    Imagen preparada para guardar.
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger mt-2"
                                    onClick={() =>
                                        setFormData((previous) => ({
                                            ...previous,
                                            image: "",
                                        }))
                                    }
                                    disabled={uploadingImage || loading}
                                >
                                    Quitar imagen
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="d-flex gap-2">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || uploadingImage}
                        >
                            {loading
                                ? isEditing
                                    ? "Guardando cambios..."
                                    : "Creando evento..."
                                : isEditing
                                    ? "Guardar cambios"
                                    : "Crear evento"}
                        </button>

                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={onCancel}
                            disabled={loading || uploadingImage}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};