// src/components/auth/MobileOAuthHandler.jsx
import React, { useEffect, useState } from "react";
import { handleMobileOAuth } from "../../utilities/staticData";
import CustomSpinner from "../common/custom-spinner";

const MobileOAuthHandler = ({ children }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [isFlutter, setIsFlutter] = useState(false);
    const [isReactNative, setIsReactNative] = useState(false);

    useEffect(() => {
        // Detect mobile environment
        const detectMobileEnvironment = () => {
            if (typeof window === "undefined") return;

            const userAgent = window.navigator.userAgent.toLowerCase();
            const isMobileDevice =
                /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(
                    userAgent,
                );
            const isFlutterApp =
                userAgent.includes("flutter") ||
                window.flutter_inappwebview !== undefined;
            const isRNApp = window.ReactNativeWebView !== undefined;

            setIsMobile(isMobileDevice);
            setIsFlutter(isFlutterApp);
            setIsReactNative(isRNApp);

            console.log("📱 Mobile Environment Detection:", {
                isMobile: isMobileDevice,
                isFlutter: isFlutterApp,
                isReactNative: isRNApp,
                userAgent: userAgent,
            });
        };

        detectMobileEnvironment();

        // Set up mobile OAuth event listeners
        const handleFlutterMessage = (event) => {
            console.log("📱 Flutter message received:", event);

            if (event.detail && event.detail.type === "oauth_request") {
                const { provider, action } = event.detail;

                if (action === "start") {
                    handleMobileOAuth(provider);
                }
            }
        };

        const handleReactNativeMessage = (event) => {
            console.log("📱 React Native message received:", event);

            try {
                const data = JSON.parse(event.data);
                if (data.type === "oauth_request") {
                    handleMobileOAuth(data.provider);
                }
            } catch (error) {
                console.error("🚨 Error parsing React Native message:", error);
            }
        };

        // Add event listeners for mobile apps
        if (isFlutter) {
            window.addEventListener(
                "flutter_oauth_request",
                handleFlutterMessage,
            );
        }

        if (isReactNative) {
            window.addEventListener("message", handleReactNativeMessage);
        }

        return () => {
            if (isFlutter) {
                window.removeEventListener(
                    "flutter_oauth_request",
                    handleFlutterMessage,
                );
            }
            if (isReactNative) {
                window.removeEventListener("message", handleReactNativeMessage);
            }
        };
    }, [isFlutter, isReactNative]);

    // Enhanced mobile OAuth interface
    useEffect(() => {
        if (typeof window === "undefined") return;

        // Enhanced Flutter integration
        if (isFlutter) {
            window.oauthInterface = {
                // Start OAuth flow from Flutter
                startOAuth: (provider) => {
                    console.log(
                        `📱 Starting OAuth for ${provider} from Flutter`,
                    );
                    handleMobileOAuth(provider);
                },

                // Handle OAuth callback from Flutter
                handleCallback: (result) => {
                    console.log("📱 OAuth callback from Flutter:", result);

                    if (result.success && result.token) {
                        // Store token and trigger auth update
                        localStorage.setItem("ACCESS_TOKEN", result.token);

                        if (window.forceAuthUpdate) {
                            window.forceAuthUpdate();
                        }

                        // Notify Flutter of success
                        if (window.flutter_inappwebview) {
                            window.flutter_inappwebview.callHandler(
                                "oauth_complete",
                                {
                                    success: true,
                                    redirectUrl:
                                        result.redirectUrl ||
                                        "/app/select-figure/",
                                },
                            );
                        }
                    } else {
                        // Handle error
                        if (window.flutter_inappwebview) {
                            window.flutter_inappwebview.callHandler(
                                "oauth_complete",
                                {
                                    success: false,
                                    error: result.error || "OAuth failed",
                                },
                            );
                        }
                    }
                },

                // Get current auth status
                getAuthStatus: () => {
                    const token = localStorage.getItem("ACCESS_TOKEN");
                    const isAuthenticated = !!(token && !isTokenExpired(token));

                    return {
                        isAuthenticated,
                        token: isAuthenticated ? token : null,
                    };
                },
            };
        }

        // Enhanced React Native integration
        if (isReactNative) {
            window.oauthInterface = {
                // Start OAuth flow from React Native
                startOAuth: (provider) => {
                    console.log(
                        `📱 Starting OAuth for ${provider} from React Native`,
                    );
                    handleMobileOAuth(provider);
                },

                // Handle OAuth callback from React Native
                handleCallback: (result) => {
                    console.log("📱 OAuth callback from React Native:", result);

                    if (result.success && result.token) {
                        // Store token and trigger auth update
                        localStorage.setItem("ACCESS_TOKEN", result.token);

                        if (window.forceAuthUpdate) {
                            window.forceAuthUpdate();
                        }

                        // Notify React Native of success
                        window.ReactNativeWebView.postMessage(
                            JSON.stringify({
                                type: "oauth_complete",
                                success: true,
                                redirectUrl:
                                    result.redirectUrl || "/app/select-figure/",
                            }),
                        );
                    } else {
                        // Handle error
                        window.ReactNativeWebView.postMessage(
                            JSON.stringify({
                                type: "oauth_complete",
                                success: false,
                                error: result.error || "OAuth failed",
                            }),
                        );
                    }
                },

                // Get current auth status
                getAuthStatus: () => {
                    const token = localStorage.getItem("ACCESS_TOKEN");
                    const isAuthenticated = !!(token && !isTokenExpired(token));

                    return {
                        isAuthenticated,
                        token: isAuthenticated ? token : null,
                    };
                },
            };
        }

        // Global mobile OAuth utilities
        window.mobileOAuth = {
            isSupported: isMobile || isFlutter || isReactNative,
            environment: {
                isMobile,
                isFlutter,
                isReactNative,
            },

            // Universal OAuth starter
            start: (provider) => {
                if (isFlutter || isReactNative) {
                    return window.oauthInterface?.startOAuth(provider);
                } else {
                    return handleMobileOAuth(provider);
                }
            },

            // Universal callback handler
            handleCallback: (result) => {
                if (isFlutter || isReactNative) {
                    return window.oauthInterface?.handleCallback(result);
                } else {
                    // Handle web callback
                    console.log("📱 Web OAuth callback:", result);
                    if (result.success && result.token) {
                        localStorage.setItem("ACCESS_TOKEN", result.token);
                        window.location.href =
                            result.redirectUrl || "/app/select-figure/";
                    } else {
                        window.location.href = `/app/signin/?error=${encodeURIComponent(result.error || "OAuth failed")}`;
                    }
                }
            },
        };

        console.log(
            "📱 Mobile OAuth interface initialized:",
            window.mobileOAuth,
        );
    }, [isMobile, isFlutter, isReactNative]);

    // Mobile OAuth status indicator (for debugging)
    const MobileOAuthDebug = () => {
        if (process.env.NODE_ENV !== "development") return null;

        return (
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    background: "rgba(0,0,0,0.8)",
                    color: "white",
                    padding: "8px",
                    fontSize: "12px",
                    zIndex: 9999,
                    display: "none", // Hidden by default, can be shown for debugging
                }}
            >
                📱 Mobile: {isMobile ? "✅" : "❌"} | Flutter:{" "}
                {isFlutter ? "✅" : "❌"} | RN: {isReactNative ? "✅" : "❌"}
            </div>
        );
    };

    return (
        <>
            {children}
            <MobileOAuthDebug />
        </>
    );
};

export default MobileOAuthHandler;
