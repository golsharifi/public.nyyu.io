// gatsby-browser.js
import "./src/utilities/forceCurrencyLoader";
import "./src/styles/fonts.css";
import "./src/styles/sass/app.scss";
import "jquery/dist/jquery.min.js";
import "bootstrap/dist/js/bootstrap.min.js";
import "react-tabs/style/react-tabs.css";
import "rc-slider/assets/index.css";

// Configure dayjs BEFORE any components load
import "./src/utilities/dayjs-config";

export { wrapRootElement } from "./src/providers/wrap-with-provider";

// Enhanced client entry with OAuth and mobile support
export const onClientEntry = () => {
    // ENHANCED GOOGLE MAPS PROTECTION
    if (typeof window !== "undefined") {
        console.log("🛡️ Setting up Google Maps protection...");

        // Immediately check the API key
        const apiKey = process.env.GATSBY_GOOGLE_MAPS_API_KEY;
        console.log("🔑 Environment check:", {
            hasApiKey: !!apiKey,
            keyPreview: apiKey ? `${apiKey.substring(0, 10)}***` : "undefined",
            environment: process.env.NODE_ENV,
        });

        // Override document.createElement to prevent bad scripts
        const originalCreateElement = document.createElement;
        document.createElement = function (tagName) {
            const element = originalCreateElement.call(this, tagName);

            if (tagName.toLowerCase() === "script") {
                const originalSetAttribute = element.setAttribute;
                element.setAttribute = function (name, value) {
                    if (
                        name === "src" &&
                        value &&
                        value.includes("maps.googleapis.com")
                    ) {
                        // Check if the URL contains an undefined or empty key
                        if (
                            value.includes("key=undefined") ||
                            (value.includes("key=") &&
                                !value.includes("key=" + apiKey))
                        ) {
                            console.warn(
                                "🚫 BLOCKED: Google Maps script with invalid key:",
                                value,
                            );
                            return; // Don't set the src, blocking the script
                        } else {
                            console.log(
                                "✅ ALLOWED: Valid Google Maps script:",
                                value.substring(0, 100) + "...",
                            );
                        }
                    }
                    return originalSetAttribute.call(this, name, value);
                };
            }

            return element;
        };

        // Prevent any immediate Google Maps loads
        if (window.google) {
            console.log("🧹 Pre-cleaning existing Google Maps objects");
            delete window.google;
        }
    }

    // Initialize Google Analytics with consent mode
    if (typeof window !== "undefined" && window.gtag) {
        window.gtag("consent", "default", {
            analytics_storage: "denied",
            ad_storage: "denied",
            ad_user_data: "denied",
            ad_personalization: "denied",
            wait_for_update: 500,
        });
    }

    // Enhanced OAuth mobile detection and utilities
    if (typeof window !== "undefined") {
        // Mobile OAuth detection
        window.isMobileOAuth = () => {
            const userAgent = window.navigator.userAgent.toLowerCase();
            const isFlutter = userAgent.includes("flutter");
            const isReactNative = window.ReactNativeWebView !== undefined;
            const isInAppWebView = window.flutter_inappwebview !== undefined;
            return isFlutter || isReactNative || isInAppWebView;
        };

        // OAuth state management for mobile
        window.oauthState = {
            inProgress: false,
            provider: null,
            startTime: null,
        };

        // Mobile OAuth callback handler
        window.handleOAuthCallback = (result) => {
            console.log("📱 Mobile OAuth callback received:", result);

            if (result.success) {
                // Store token and redirect
                if (result.token) {
                    localStorage.setItem("ACCESS_TOKEN", result.token);
                }

                // Trigger auth state update
                if (window.forceAuthUpdate) {
                    window.forceAuthUpdate();
                }

                // Navigate to appropriate page
                const targetUrl = result.redirectUrl || "/app/select-figure/";
                window.location.href = targetUrl;
            } else {
                // Handle OAuth error
                console.error("❌ Mobile OAuth failed:", result.error);
                const errorUrl = `/app/signin/?error=${encodeURIComponent(result.error || "OAuth failed")}`;
                window.location.href = errorUrl;
            }
        };

        // Enhanced error handling for OAuth
        window.oauthErrorHandler = (error, provider) => {
            console.error(`🚨 OAuth Error for ${provider}:`, error);

            // Track error in analytics
            if (window.gtag) {
                window.gtag("event", "oauth_error", {
                    provider: provider,
                    error_type: error.type || "unknown",
                    error_message: error.message || "Unknown error",
                });
            }

            // Show user-friendly error message
            const errorMessage = getOAuthErrorMessage(error);
            alert(`Authentication failed: ${errorMessage}`);
        };

        // OAuth retry mechanism
        window.retryOAuth = (provider, maxRetries = 3) => {
            const currentRetries = parseInt(
                sessionStorage.getItem(`oauth_retries_${provider}`) || "0",
            );

            if (currentRetries < maxRetries) {
                sessionStorage.setItem(
                    `oauth_retries_${provider}`,
                    (currentRetries + 1).toString(),
                );
                console.log(
                    `🔄 Retrying OAuth for ${provider} (attempt ${currentRetries + 1}/${maxRetries})`,
                );
                return true;
            } else {
                console.log(`❌ Max OAuth retries reached for ${provider}`);
                sessionStorage.removeItem(`oauth_retries_${provider}`);
                return false;
            }
        };

        // Clear OAuth retry counters on successful auth
        window.clearOAuthRetries = () => {
            Object.keys(sessionStorage).forEach((key) => {
                if (key.startsWith("oauth_retries_")) {
                    sessionStorage.removeItem(key);
                }
            });
        };
    }
};

// Initialize Google Analytics with consent mode
if (typeof window !== "undefined" && window.gtag) {
    window.gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        wait_for_update: 500,
    });
}

// Enhanced OAuth mobile detection and utilities
if (typeof window !== "undefined") {
    // Mobile OAuth detection
    window.isMobileOAuth = () => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isFlutter = userAgent.includes("flutter");
        const isReactNative = window.ReactNativeWebView !== undefined;
        const isInAppWebView = window.flutter_inappwebview !== undefined;
        return isFlutter || isReactNative || isInAppWebView;
    };

    // OAuth state management for mobile
    window.oauthState = {
        inProgress: false,
        provider: null,
        startTime: null,
    };

    // Mobile OAuth callback handler
    window.handleOAuthCallback = (result) => {
        console.log("📱 Mobile OAuth callback received:", result);

        if (result.success) {
            // Store token and redirect
            if (result.token) {
                localStorage.setItem("ACCESS_TOKEN", result.token);
            }

            // Trigger auth state update
            if (window.forceAuthUpdate) {
                window.forceAuthUpdate();
            }

            // Navigate to appropriate page
            const targetUrl = result.redirectUrl || "/app/select-figure/";
            window.location.href = targetUrl;
        } else {
            // Handle OAuth error
            console.error("❌ Mobile OAuth failed:", result.error);
            const errorUrl = `/app/signin/?error=${encodeURIComponent(result.error || "OAuth failed")}`;
            window.location.href = errorUrl;
        }
    };

    // Enhanced error handling for OAuth
    window.oauthErrorHandler = (error, provider) => {
        console.error(`🚨 OAuth Error for ${provider}:`, error);

        // Track error in analytics
        if (window.gtag) {
            window.gtag("event", "oauth_error", {
                provider: provider,
                error_type: error.type || "unknown",
                error_message: error.message || "Unknown error",
            });
        }

        // Show user-friendly error message
        const errorMessage = getOAuthErrorMessage(error);
        alert(`Authentication failed: ${errorMessage}`);
    };

    // OAuth retry mechanism
    window.retryOAuth = (provider, maxRetries = 3) => {
        const currentRetries = parseInt(
            sessionStorage.getItem(`oauth_retries_${provider}`) || "0",
        );

        if (currentRetries < maxRetries) {
            sessionStorage.setItem(
                `oauth_retries_${provider}`,
                (currentRetries + 1).toString(),
            );
            console.log(
                `🔄 Retrying OAuth for ${provider} (attempt ${currentRetries + 1}/${maxRetries})`,
            );
            return true;
        } else {
            console.log(`❌ Max OAuth retries reached for ${provider}`);
            sessionStorage.removeItem(`oauth_retries_${provider}`);
            return false;
        }
    };

    // Clear OAuth retry counters on successful auth
    window.clearOAuthRetries = () => {
        Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith("oauth_retries_")) {
                sessionStorage.removeItem(key);
            }
        });
    };
}

// Enhanced route update handler with OAuth support
export const onRouteUpdate = ({ location, prevLocation }) => {
    // Clear OAuth retry counters when navigating away from auth pages
    if (location.pathname !== prevLocation?.pathname) {
        if (
            typeof window !== "undefined" &&
            !location.pathname.includes("/oauth2/") &&
            !location.pathname.includes("/signin")
        ) {
            window.clearOAuthRetries?.();
        }
    }

    // Handle OAuth callback detection
    if (location.pathname.includes("/oauth2/redirect/")) {
        console.log("🔐 OAuth callback detected:", location.pathname);

        // Track OAuth callback in analytics
        if (typeof window !== "undefined" && window.gtag) {
            window.gtag("event", "oauth_callback", {
                path: location.pathname,
                referrer: document.referrer,
            });
        }
    }

    // Handle OAuth errors in URL parameters
    if (location.search.includes("error=")) {
        const urlParams = new URLSearchParams(location.search);
        const error = urlParams.get("error");
        const provider = urlParams.get("provider");

        if (error && typeof window !== "undefined") {
            console.error("🚨 OAuth error in URL:", { error, provider });

            // Track error in analytics
            if (window.gtag) {
                window.gtag("event", "oauth_url_error", {
                    provider: provider || "unknown",
                    error_type: error,
                });
            }
        }
    }
};

// Enhanced error handler for OAuth and general errors (CLIENT-SIDE ONLY)
// Note: onError is NOT a valid Gatsby Browser API, so we'll handle errors via window.onerror
if (typeof window !== "undefined") {
    const originalOnError = window.onerror;

    window.onerror = function (message, source, lineno, colno, error) {
        console.error("🚨 Runtime error:", error);

        // Track errors in analytics (production only)
        if (window.gtag && process.env.NODE_ENV === "production") {
            window.gtag("event", "exception", {
                description: error?.toString() || message,
                fatal: false,
            });
        }

        // OAuth-specific error handling
        if (message.includes("oauth") || message.includes("OAuth")) {
            console.error("🔐 OAuth-related error detected");

            // Clear potentially corrupted OAuth state
            sessionStorage.removeItem("oauth_state");
            localStorage.removeItem("oauth_temp_token");

            // Redirect to sign-in if not already there
            if (!window.location.pathname.includes("/signin")) {
                window.location.href = "/app/signin/?error=oauth_error";
            }
        }

        // Call original error handler if it exists
        if (originalOnError) {
            return originalOnError(message, source, lineno, colno, error);
        }
        return false;
    };
}

// Helper function to get user-friendly OAuth error messages
const getOAuthErrorMessage = (error) => {
    const errorMessages = {
        provider_mismatch:
            "This email is registered with a different provider. Please use the correct provider to login.",
        access_denied: "You denied access to your account. Please try again.",
        invalid_request: "The request was invalid. Please try again.",
        unauthorized_client:
            "The application is not authorized. Please contact support.",
        unsupported_response_type:
            "The response type is not supported. Please contact support.",
        invalid_scope:
            "The requested scope is invalid. Please contact support.",
        server_error:
            "The authorization server encountered an error. Please try again.",
        temporarily_unavailable:
            "The authorization server is temporarily unavailable. Please try again later.",
        network_error:
            "Network error occurred. Please check your connection and try again.",
        timeout: "The request timed out. Please try again.",
        unknown_error: "An unknown error occurred. Please try again.",
    };

    const errorType = error.type || error.error || "unknown_error";
    return errorMessages[errorType] || errorMessages["unknown_error"];
};

// Service Worker registration for OAuth improvements
export const onServiceWorkerUpdateReady = () => {
    const answer = window.confirm(
        "This application has been updated. Reload to display the latest version?",
    );
    if (answer === true) {
        window.location.reload();
    }
};

// Pre-route change handler for OAuth state cleanup
export const onPreRouteUpdate = ({ location, prevLocation }) => {
    // Clean up OAuth state when leaving OAuth pages
    if (
        prevLocation?.pathname.includes("/oauth2/") &&
        !location.pathname.includes("/oauth2/")
    ) {
        if (typeof window !== "undefined") {
            // Clean up temporary OAuth data
            sessionStorage.removeItem("oauth_state");
            sessionStorage.removeItem("oauth_provider");
            sessionStorage.removeItem("oauth_start_time");
        }
    }
};
