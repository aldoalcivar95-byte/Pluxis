// =========================================================
// INITIAL STORE
// =========================================================

export const initialStore = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    return {
        token: token || null,
        user: user ? JSON.parse(user) : null,

        events: [],
        categories: [],
        bookings: [],

        loading: false,
        error: null,
        message: null
    };
};


// =========================================================
// STORE REDUCER
// =========================================================

export default function storeReducer(store, action = {}) {

    switch (action.type) {

        // -------------------------------------------------
        // COMPATIBILITY WITH TEMPLATE
        // -------------------------------------------------

        case "set_hello":
            return {
                ...store,
                message: action.payload
            };


        // -------------------------------------------------
        // AUTH
        // -------------------------------------------------

        case "login":
            localStorage.setItem(
                "token",
                action.payload.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(action.payload.user)
            );

            return {
                ...store,
                token: action.payload.token,
                user: action.payload.user,
                error: null,
                message: "Login successful"
            };


        case "logout":
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            return {
                ...store,
                token: null,
                user: null,
                bookings: [],
                error: null,
                message: null
            };


        // -------------------------------------------------
        // USER
        // -------------------------------------------------

        case "set_user":
            return {
                ...store,
                user: action.payload
            };


        // -------------------------------------------------
        // EVENTS
        // -------------------------------------------------

        case "set_events":
            return {
                ...store,
                events: action.payload,
                loading: false,
                error: null
            };


        case "add_event":
            return {
                ...store,
                events: [
                    ...store.events,
                    action.payload
                ]
            };


        case "update_event":
            return {
                ...store,
                events: store.events.map(
                    event =>
                        event.id === action.payload.id
                            ? action.payload
                            : event
                )
            };


        case "remove_event":
            return {
                ...store,
                events: store.events.filter(
                    event => event.id !== action.payload
                )
            };


        // -------------------------------------------------
        // CATEGORIES
        // -------------------------------------------------

        case "set_categories":
            return {
                ...store,
                categories: action.payload,
                loading: false,
                error: null
            };


        // -------------------------------------------------
        // BOOKINGS
        // -------------------------------------------------

        case "set_bookings":
            return {
                ...store,
                bookings: action.payload,
                loading: false,
                error: null
            };


        case "add_booking":
            return {
                ...store,
                bookings: [
                    ...store.bookings,
                    action.payload
                ]
            };


        case "update_booking":
            return {
                ...store,
                bookings: store.bookings.map(
                    booking =>
                        booking.id === action.payload.id
                            ? action.payload
                            : booking
                )
            };


        case "remove_booking":
            return {
                ...store,
                bookings: store.bookings.filter(
                    booking => booking.id !== action.payload
                )
            };


        // -------------------------------------------------
        // UI
        // -------------------------------------------------

        case "set_loading":
            return {
                ...store,
                loading: action.payload
            };


        case "set_error":
            return {
                ...store,
                error: action.payload,
                loading: false
            };


        case "set_message":
            return {
                ...store,
                message: action.payload
            };


        // -------------------------------------------------
        // DEFAULT
        // -------------------------------------------------

        default:
            throw Error(`Unknown action: ${action.type}`);
    }
}