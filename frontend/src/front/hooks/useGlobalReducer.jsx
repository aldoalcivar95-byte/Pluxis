import { useContext, useReducer, createContext } from "react";
import storeReducer, { initialStore } from "../store";

// Create global context
const StoreContext = createContext();

// Global state provider
export function StoreProvider({ children }) {
    const [store, dispatch] = useReducer(
        storeReducer,
        initialStore()
    );

    return (
        <StoreContext.Provider value={{ store, dispatch }}>
            {children}
        </StoreContext.Provider>
    );
}

// Hook to access global state
export default function useGlobalReducer() {
    const { dispatch, store } = useContext(StoreContext);

    return {
        dispatch,
        store
    };
}