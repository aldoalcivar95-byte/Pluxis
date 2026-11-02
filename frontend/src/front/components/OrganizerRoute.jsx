import { Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const OrganizerRoute = ({ children }) => {
    const { store } = useGlobalReducer();

    if (!store.token) {
        return <Navigate to="/login" replace />;
    }

    if (store.user?.role !== "organizer") {
        return <Navigate to="/" replace />;
    }

    return children;
};