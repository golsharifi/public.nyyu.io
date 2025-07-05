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

// Enhanced error handler for OAuth and general errors
export const onError = ({ error }) => {
    console.error("🚨 Gatsby runtime error:", error);

    // Track errors in analytics (production only)
    if (
        typeof window !== "undefined" &&
        window.gtag &&
        process.env.NODE_ENV === "production"
    ) {
        window.gtag("event", "exception", {
            description: error.toString(),
            fatal: false,
        });
    }

    // OAuth-specific error handling
    if (error.message.includes("oauth") || error.message.includes("OAuth")) {
        console.error("🔐 OAuth-related error detected");

        // Attempt to recover from OAuth errors
        if (typeof window !== "undefined") {
            // Clear potentially corrupted OAuth state
            sessionStorage.removeItem("oauth_state");
            localStorage.removeItem("oauth_temp_token");

            // Redirect to sign-in if not already there
            if (!window.location.pathname.includes("/signin")) {
                window.location.href = "/app/signin/?error=oauth_error";
            }
        }
    }
};

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
