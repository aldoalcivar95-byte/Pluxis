const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");
    const isFormData = options.body instanceof FormData;

    const headers = {
        ...(!isFormData
            ? { "Content-Type": "application/json" }
            : {}),
        ...(options.headers || {}),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${backendUrl}${endpoint}`, {
        ...options,
        headers,
    });
    if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login?expired=true";

        throw new Error("SESSION_EXPIRED");
    }

    return response;
};
