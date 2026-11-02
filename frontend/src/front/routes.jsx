import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Events } from "./pages/Events";
import { EventDetail } from "./pages/EventDetail";
import { Bookings } from "./pages/Bookings";
import { Organizer } from "./pages/Organizer";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";


// ============================================================
// RUTA PRIVADA
// ============================================================

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/login";
        return null;
    }

    return children;
};


// ============================================================
// RUTA PARA ORGANIZADORES
// ============================================================

const OrganizerRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token) {
        window.location.href = "/login";
        return null;
    }

    if (!user || user.role !== "organizer") {
        window.location.href = "/";
        return null;
    }

    return children;
};


// ============================================================
// ROUTER PRINCIPAL
// ============================================================

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <h1>Not found!</h1>,

        children: [

            // ------------------------------------------------
            // PÚBLICAS
            // ------------------------------------------------

            {
                index: true,
                element: <Home />,
            },

            {
                path: "login",
                element: <Login />,
            },

            {
                path: "register",
                element: <Register />,
            },

            {
                path: "forgot-password",
                element: <ForgotPassword />,
            },

            {
                path: "reset-password",
                element: <ResetPassword />,
            },

            {
                path: "events",
                element: <Events />,
            },

            {
                path: "events/:id",
                element: <EventDetail />,
            },

            {
                path: "privacy-policy",
                element: <PrivacyPolicy />,
            },


            // ------------------------------------------------
            // PRIVADAS
            // ------------------------------------------------

            {
                path: "bookings",
                element: (
                    <PrivateRoute>
                        <Bookings />
                    </PrivateRoute>
                ),
            },


            // ------------------------------------------------
            // ORGANIZADOR
            // ------------------------------------------------

            {
                path: "organizer",
                element: (
                    <OrganizerRoute>
                        <Organizer />
                    </OrganizerRoute>
                ),
            },
        ],
    },
]);