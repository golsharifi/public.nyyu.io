import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "../store/reducers";

const NODE_CLIENT_ENV = process.env.NODE_ENV || "development";

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: true,
            serializableCheck: {
                ignoredActions: ["persist/PERSIST"],
            },
        }),
    devTools: NODE_CLIENT_ENV !== "production",
    preloadedState: undefined,
});

export default store;
