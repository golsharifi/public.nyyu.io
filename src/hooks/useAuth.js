import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import {
    getInMemoryAuthToken,
    isLoggedOut,
    isTokenExpired,
    LOGGED_OUT_KEY,
    logout,
} from "../utilities/auth";
import { ROUTES } from "../utilities/routes";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => (
    <AuthContext.Provider value={useProvideAuth()}>
        {children}
    </AuthContext.Provider>
);

export const useAuth = () => useContext(AuthContext);

const syncLoginStatus = (event) => {
    console.log("🔄 Storage event:", event.key, event.newValue);
    if (event.key === LOGGED_OUT_KEY && isLoggedOut()) {
        console.log("🚪 Detected logout in another tab");
        logout(() => {
            if (typeof window !== "undefined") {
                window.location.href = ROUTES.signIn;
            }
        });
    }
};

// Global auth state that can be updated from anywhere
let globalAuthState = {
    isAuthenticated: false,
    lastCheck: 0,
    forceUpdate: 0,
    initialized: false,
};

// Global function to force auth update
if (typeof window !== "undefined") {
    window.forceAuthUpdate = () => {
        console.log("🔄 FORCING AUTH UPDATE");
        globalAuthState.forceUpdate += 1;
        // Trigger custom event
        window.dispatchEvent(new CustomEvent("forceAuthUpdate"));
    };
}

const useProvideAuth = () => {
    // Local state that triggers re-renders
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        lastCheck: Date.now(),
        forceCounter: 0,
        initialized: false,
    });

    // Function to check current auth status
    const checkAuthStatus = useCallback(() => {
        console.log("🔐 Checking auth status...");
        const token = getInMemoryAuthToken();
        const expired = token ? isTokenExpired(token) : true;
        const loggedOut = isLoggedOut();
        const isAuthenticated = !!(token && !expired && !loggedOut);

        console.log("🔐 Auth check (detailed):");
        console.log(
            "🎫 Raw token:",
            token ? token.substring(0, 20) + "..." : "null",
        );
        console.log("🎫 Token present:", !!token);
        console.log("⏰ Token expired:", expired);
        console.log("🚪 Logged out:", loggedOut);
        console.log("✅ Final auth result:", isAuthenticated);

        // Update global state
        globalAuthState.isAuthenticated = isAuthenticated;
        globalAuthState.lastCheck = Date.now();
        globalAuthState.initialized = true;

        return isAuthenticated;
    }, []);

    // The main isLoggedIn function that returns actual boolean
    const isLoggedIn = useCallback(() => {
        const currentAuth = checkAuthStatus();

        // Update local state if changed
        setAuthState((prev) => {
            if (prev.isAuthenticated !== currentAuth || !prev.initialized) {
                console.log(
                    "🔄 Auth state changed:",
                    prev.isAuthenticated,
                    "->",
                    currentAuth,
                );
                return {
                    isAuthenticated: currentAuth,
                    lastCheck: Date.now(),
                    forceCounter: prev.forceCounter + 1,
                    initialized: true,
                };
            }
            return prev;
        });

        return currentAuth;
    }, [checkAuthStatus]);

    // Initialize auth immediately
    useEffect(() => {
        console.log("🔄 useAuth mounted - initial auth check");
        const initialAuth = checkAuthStatus();
        setAuthState({
            isAuthenticated: initialAuth,
            lastCheck: Date.now(),
            forceCounter: 0,
            initialized: true,
        });
    }, [checkAuthStatus]);

    // Listen for auth token updates
    useEffect(() => {
        const handleAuthUpdate = () => {
            console.log("🔄 Auth update event received - rechecking");
            setTimeout(() => {
                const newAuth = checkAuthStatus();
                setAuthState((prev) => ({
                    isAuthenticated: newAuth,
                    lastCheck: Date.now(),
                    forceCounter: prev.forceCounter + 1,
                    initialized: true,
                }));
            }, 50);
        };

        const handleForceUpdate = () => {
            console.log("🔄 Force auth update event received");
            setTimeout(() => {
                const newAuth = checkAuthStatus();
                setAuthState((prev) => ({
                    isAuthenticated: newAuth,
                    lastCheck: Date.now(),
                    forceCounter: prev.forceCounter + 1,
                    initialized: true,
                }));
            }, 50);
        };

        const handleStorageChange = (event) => {
            console.log("💾 Storage changed:", event.key);
            if (event.key === "ACCESS_TOKEN") {
                console.log("🎫 Access token changed in storage");
                handleAuthUpdate();
            }
        };

        // Add all event listeners
        console.log("🔄 Setting up auth event listeners");
        if (typeof window !== "undefined") {
            window.addEventListener("storage", handleStorageChange);
            window.addEventListener("authTokenUpdated", handleAuthUpdate);
            window.addEventListener("forceAuthUpdate", handleForceUpdate);
            window.addEventListener("storage", syncLoginStatus);

            return () => {
                console.log("🔄 Cleaning up auth event listeners");
                window.removeEventListener("storage", handleStorageChange);
                window.removeEventListener(
                    "authTokenUpdated",
                    handleAuthUpdate,
                );
                window.removeEventListener(
                    "forceAuthUpdate",
                    handleForceUpdate,
                );
                window.removeEventListener("storage", syncLoginStatus);
            };
        }
    }, [checkAuthStatus]);

    return {
        isLoggedIn,
        checkAuthStatus,
        authState,
        initialized: authState.initialized,
    };
};
