// src/utilities/auth.js
import { jwtDecode } from "jwt-decode";
import { removeCookie, NDB_Paypal_TrxType, NDB_Privilege } from "./cookies";

let inMemoryAuthTokenDefault = {
    authToken: null,
    authExpiration: null,
};

let inMemoryAuthToken = inMemoryAuthTokenDefault;

// Local Storage Keys
export const LOGGED_OUT_KEY = `LOGGED_OUT_TIME`;
export const ACCESS_TOKEN = `ACCESS_TOKEN`;
export const USER_DATA = `USER_DATA`;
export const OAUTH_STATE_KEY = `OAUTH_STATE`;
export const OAUTH_PROVIDER_KEY = `OAUTH_PROVIDER`;

// Helper
export const isBrowser = typeof window !== `undefined`;

// Enhanced token validation with better error handling
export const isTokenExpired = (authToken) => {
    if (!authToken || typeof authToken !== "string") return true;

    try {
        const decoded = jwtDecode(authToken);

        // Check if token has required fields
        if (!decoded.exp) {
            console.warn("🚨 Token missing expiration field");
            return true;
        }

        // Add buffer time (5 minutes) to handle clock skew
        const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
        const isExpired = Date.now() >= decoded.exp * 1000 - bufferTime;

        if (isExpired) {
            console.log("⏰ Token expired");
        }

        return isExpired;
    } catch (error) {
        console.error("🚨 Error decoding token:", error);
        return true;
    }
};

// Enhanced logout detection
export const isLoggedOut = () => {
    if (!isBrowser) return false;

    try {
        const loggedOutTime = getLoggedOutTime();
        const isManuallyLoggedOut =
            loggedOutTime && Date.now() >= loggedOutTime;

        // Also check for OAuth errors that might indicate forced logout
        const oauthError = sessionStorage.getItem("oauth_error");
        const hasOAuthError =
            oauthError === "unauthorized" || oauthError === "token_revoked";

        return isManuallyLoggedOut || hasOAuthError;
    } catch (error) {
        console.error("🚨 Error checking logout status:", error);
        return false;
    }
};

// Enhanced logout with OAuth cleanup
export const logout = (callback) => {
    console.log("🚪 Logging out user");

    try {
        // Clear in-memory token
        inMemoryAuthToken = inMemoryAuthTokenDefault;

        if (isBrowser) {
            // Clear localStorage
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(USER_DATA);

            // Clear OAuth-related data
            sessionStorage.removeItem(OAUTH_STATE_KEY);
            sessionStorage.removeItem(OAUTH_PROVIDER_KEY);
            sessionStorage.removeItem("oauth_error");
            sessionStorage.removeItem("oauth_temp_token");

            // Clear OAuth retry counters
            Object.keys(sessionStorage).forEach((key) => {
                if (key.startsWith("oauth_retries_")) {
                    sessionStorage.removeItem(key);
                }
            });
        }

        // Remove payment-related cookies
        removeCookie(NDB_Paypal_TrxType);
        removeCookie(NDB_Privilege);

        // Set logged out timestamp
        setLoggedOutTime();

        // Trigger auth state update events
        if (isBrowser) {
            window.dispatchEvent(new CustomEvent("authTokenUpdated"));
            window.dispatchEvent(new CustomEvent("userLoggedOut"));

            // Force update if available
            if (window.forceAuthUpdate) {
                window.forceAuthUpdate();
            }
        }

        console.log("✅ Logout completed successfully");
    } catch (error) {
        console.error("🚨 Error during logout:", error);
    }

    if (callback) {
        callback();
    }
};

// Enhanced token setter with OAuth support
export const setAuthToken = (authToken, source = "direct") => {
    if (!isBrowser || !authToken) return;

    try {
        const decoded = jwtDecode(authToken);
        console.log("🎫 Setting auth token from source:", source);

        // Validate token structure
        if (!decoded.exp || !decoded.sub) {
            throw new Error("Invalid token structure");
        }

        // Store token
        localStorage.setItem(ACCESS_TOKEN, authToken);
        inMemoryAuthToken = {
            authToken,
            authExpiration: decoded.exp,
        };

        // Clear any logged out time and OAuth errors
        localStorage.removeItem(LOGGED_OUT_KEY);
        sessionStorage.removeItem("oauth_error");

        // Clear OAuth retry counters on successful auth
        if (window.clearOAuthRetries) {
            window.clearOAuthRetries();
        }

        // Trigger multiple events to ensure auth state updates
        console.log("🎫 Triggering auth state update events");

        // Use setTimeout to ensure events fire after token is set
        setTimeout(() => {
            // 1. Storage event
            window.dispatchEvent(
                new StorageEvent("storage", {
                    key: ACCESS_TOKEN,
                    newValue: authToken,
                    oldValue: null,
                    storageArea: localStorage,
                }),
            );

            // 2. Custom auth events
            window.dispatchEvent(
                new CustomEvent("authTokenUpdated", {
                    detail: {
                        token: authToken,
                        source: source,
                        expiration: new Date(decoded.exp * 1000),
                    },
                }),
            );

            window.dispatchEvent(
                new CustomEvent("userLoggedIn", {
                    detail: {
                        userId: decoded.sub,
                        email: decoded.email,
                        source: source,
                    },
                }),
            );

            // 3. Force update (aggressive approach)
            if (window.forceAuthUpdate) {
                console.log("🎫 Calling force auth update");
                window.forceAuthUpdate();
            }
        }, 10);

        console.log("🎫 Auth token set successfully");
        console.log("🎫 Token expiration:", new Date(decoded.exp * 1000));

        return true;
    } catch (error) {
        console.error("🚨 Error setting auth token:", error);

        // Remove invalid token
        if (isBrowser) {
            localStorage.removeItem(ACCESS_TOKEN);
            sessionStorage.setItem("oauth_error", "invalid_token");
        }

        return false;
    }
};

// Enhanced logged out time setter
export const setLoggedOutTime = () => {
    if (!isBrowser) return;
    try {
        localStorage.setItem(LOGGED_OUT_KEY, JSON.stringify(Date.now()));
    } catch (error) {
        console.error("🚨 Error setting logged out time:", error);
    }
};

// Enhanced token checker with automatic cleanup
const checkInMemoryAuthToken = () => {
    if (!isBrowser) return;

    if (inMemoryAuthToken === inMemoryAuthTokenDefault) {
        const authToken = localStorage.getItem(ACCESS_TOKEN);
        if (!authToken) return;

        try {
            const decoded = jwtDecode(authToken);

            // Validate token before storing in memory
            if (!decoded.exp || isTokenExpired(authToken)) {
                console.log("🧹 Removing expired token from storage");
                localStorage.removeItem(ACCESS_TOKEN);
                return;
            }

            inMemoryAuthToken = {
                authToken,
                authExpiration: decoded.exp,
            };
        } catch (error) {
            console.error("🚨 Error decoding stored token:", error);
            // Remove invalid token
            localStorage.removeItem(ACCESS_TOKEN);
        }
    }
};

// Enhanced getters with better error handling
export const getEmailfromTempToken = (tempToken) => {
    try {
        const decoded = jwtDecode(tempToken);
        return decoded.sub || decoded.email;
    } catch (error) {
        console.error("🚨 Error decoding temp token:", error);
        return null;
    }
};

export const getInMemoryAuthToken = () => {
    if (!isBrowser) return null;
    checkInMemoryAuthToken();
    return inMemoryAuthToken.authToken;
};

export const getAuthTokenExpiration = () => {
    if (!isBrowser) return null;
    checkInMemoryAuthToken();
    return inMemoryAuthToken.authExpiration;
};

export const getLoggedOutTime = () => {
    if (!isBrowser) return null;
    try {
        return JSON.parse(localStorage.getItem(LOGGED_OUT_KEY));
    } catch (error) {
        console.error("🚨 Error parsing logged out time:", error);
        return null;
    }
};

// OAuth-specific utilities
export const setOAuthState = (state, provider) => {
    if (!isBrowser) return;
    try {
        sessionStorage.setItem(OAUTH_STATE_KEY, state);
        sessionStorage.setItem(OAUTH_PROVIDER_KEY, provider);
        sessionStorage.setItem("oauth_start_time", Date.now().toString());
    } catch (error) {
        console.error("🚨 Error setting OAuth state:", error);
    }
};

export const getOAuthState = () => {
    if (!isBrowser) return null;
    try {
        return sessionStorage.getItem(OAUTH_STATE_KEY);
    } catch (error) {
        console.error("🚨 Error getting OAuth state:", error);
        return null;
    }
};

export const clearOAuthState = () => {
    if (!isBrowser) return;
    try {
        sessionStorage.removeItem(OAUTH_STATE_KEY);
        sessionStorage.removeItem(OAUTH_PROVIDER_KEY);
        sessionStorage.removeItem("oauth_start_time");
        sessionStorage.removeItem("oauth_error");
    } catch (error) {
        console.error("🚨 Error clearing OAuth state:", error);
    }
};

export const setOAuthError = (error, provider) => {
    if (!isBrowser) return;
    try {
        sessionStorage.setItem("oauth_error", error);
        if (provider) {
            sessionStorage.setItem(OAUTH_PROVIDER_KEY, provider);
        }
        console.error(`🔐 OAuth error for ${provider}:`, error);
    } catch (storageError) {
        console.error("🚨 Error storing OAuth error:", storageError);
    }
};

export const getOAuthError = () => {
    if (!isBrowser) return null;
    try {
        return sessionStorage.getItem("oauth_error");
    } catch (error) {
        console.error("🚨 Error getting OAuth error:", error);
        return null;
    }
};

// Enhanced debug helper function
export const debugAuthState = () => {
    if (!isBrowser) {
        console.log("🌐 Not in browser environment");
        return;
    }

    console.log("🔍 === AUTH STATE DEBUG ===");
    console.log("🌐 Browser:", isBrowser);
    console.log("📍 Current URL:", window.location.href);
    console.log("📍 Pathname:", window.location.pathname);
    console.log(
        "🎫 localStorage ACCESS_TOKEN:",
        localStorage.getItem("ACCESS_TOKEN") ? "Present" : "Missing",
    );
    console.log(
        "🚪 localStorage LOGGED_OUT_TIME:",
        localStorage.getItem("LOGGED_OUT_TIME"),
    );
    console.log("🍪 All cookies:", document.cookie);

    // OAuth state debugging
    console.log("🔐 OAuth State:", getOAuthState());
    console.log(
        "🔐 OAuth Provider:",
        sessionStorage.getItem(OAUTH_PROVIDER_KEY),
    );
    console.log("🔐 OAuth Error:", getOAuthError());
    console.log(
        "🔐 OAuth Start Time:",
        sessionStorage.getItem("oauth_start_time"),
    );

    // Additional auth state debugging
    try {
        const token = getInMemoryAuthToken();
        console.log("🎫 In-memory token:", token ? "Present" : "Missing");
        if (token) {
            console.log("⏰ Token expired:", isTokenExpired(token));
            const decoded = jwtDecode(token);
            console.log("👤 Token user:", decoded.sub || decoded.email);
            console.log("⏰ Token expires:", new Date(decoded.exp * 1000));
        }
        console.log("🚪 Is logged out:", isLoggedOut());
    } catch (error) {
        console.log("❌ Could not check auth utilities:", error.message);
    }

    console.log("🔍 === END DEBUG ===");
};

// Initialize debug function globally
if (isBrowser) {
    window.debugAuthState = debugAuthState;
    console.log("🔧 Debug function available: window.debugAuthState()");

    // Also add OAuth debugging
    window.debugOAuthState = () => {
        console.log("🔐 === OAUTH DEBUG ===");
        console.log("🔐 OAuth State:", getOAuthState());
        console.log(
            "🔐 OAuth Provider:",
            sessionStorage.getItem(OAUTH_PROVIDER_KEY),
        );
        console.log("🔐 OAuth Error:", getOAuthError());
        console.log(
            "🔐 OAuth Start Time:",
            sessionStorage.getItem("oauth_start_time"),
        );
        console.log(
            "🔐 OAuth Retry Counters:",
            Object.keys(sessionStorage)
                .filter((key) => key.startsWith("oauth_retries_"))
                .map((key) => ({ [key]: sessionStorage.getItem(key) })),
        );
        console.log("🔐 === END OAUTH DEBUG ===");
    };
}
