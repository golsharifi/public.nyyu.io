// src/components/auth/OAuthButton.jsx
import React, { useState, useEffect } from "react";
import {
    handleMobileOAuth,
    isOAuthConfigured,
} from "../../utilities/staticData";
import { setOAuthState, setOAuthError } from "../../utilities/auth";
import CustomSpinner from "../common/custom-spinner";

const OAuthButton = ({
    provider,
    icon,
    text,
    className = "",
    disabled = false,
    onError = null,
    onStart = null,
    onSuccess = null,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isConfigured, setIsConfigured] = useState(false);

    useEffect(() => {
        // Check if OAuth is properly configured for this provider
        setIsConfigured(isOAuthConfigured(provider));

        // Detect mobile environment
        const userAgent = window.navigator?.userAgent?.toLowerCase() || "";
        setIsMobile(
            /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(
                userAgent,
            ) ||
                window.flutter_inappwebview !== undefined ||
                window.ReactNativeWebView !== undefined,
        );
    }, [provider]);

    // Generate secure state parameter
    const generateState = () => {
        if (window.crypto && window.crypto.getRandomValues) {
            const array = new Uint32Array(1);
            window.crypto.getRandomValues(array);
            return array[0].toString(36);
        }
        return Math.random().toString(36).substring(2, 15);
    };

    // Handle OAuth button click
    const handleOAuthClick = async (e) => {
        e.preventDefault();

        if (disabled || isLoading || !isConfigured) {
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Generate and store OAuth state for security
            const state = generateState();
            setOAuthState(state, provider);

            // Call onStart callback if provided
            if (onStart) {
                onStart(provider);
            }

            console.log(`🔐 Starting ${provider} OAuth flow`);

            // Handle mobile OAuth
            if (isMobile) {
                await handleMobileOAuthFlow(provider, state);
            } else {
                await handleWebOAuthFlow(provider, state);
            }
        } catch (error) {
            console.error(`🚨 ${provider} OAuth error:`, error);

            const errorMessage = getErrorMessage(error);
            setError(errorMessage);
            setOAuthError(error.message || errorMessage, provider);

            if (onError) {
                onError(error, provider);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle mobile OAuth flow
    const handleMobileOAuthFlow = async (provider, state) => {
        try {
            // Use mobile OAuth handler
            handleMobileOAuth(provider);

            // Set up timeout for mobile OAuth
            const timeout = setTimeout(() => {
                setIsLoading(false);
                setError("OAuth request timed out. Please try again.");
            }, 30000); // 30 second timeout

            // Clear timeout if page unloads (user completes OAuth)
            const handleUnload = () => clearTimeout(timeout);
            window.addEventListener("beforeunload", handleUnload);

            return () => {
                clearTimeout(timeout);
                window.removeEventListener("beforeunload", handleUnload);
            };
        } catch (error) {
            throw new Error(`Mobile OAuth failed: ${error.message}`);
        }
    };

    // Handle web OAuth flow
    const handleWebOAuthFlow = async (provider, state) => {
        try {
            const { getOAuthUrl } = await import("../../utilities/staticData");
            const oauthUrl = getOAuthUrl(provider, false);

            if (!oauthUrl) {
                throw new Error(`OAuth URL not configured for ${provider}`);
            }

            // Add state parameter to URL
            const url = new URL(oauthUrl);
            url.searchParams.set("state", state);

            console.log(`🔐 Redirecting to ${provider} OAuth:`, url.toString());

            // Redirect to OAuth provider
            window.location.href = url.toString();
        } catch (error) {
            throw new Error(`Web OAuth failed: ${error.message}`);
        }
    };

    // Get user-friendly error message
    const getErrorMessage = (error) => {
        const errorMessages = {
            network_error:
                "Network connection failed. Please check your internet and try again.",
            oauth_not_configured: `${provider} OAuth is not properly configured. Please contact support.`,
            oauth_cancelled:
                "OAuth was cancelled. Please try again if you want to sign in.",
            oauth_timeout: "OAuth request timed out. Please try again.",
            invalid_state: "Security validation failed. Please try again.",
            access_denied:
                "Access was denied. Please grant permission to continue.",
        };

        const errorType = error.type || error.code || "unknown_error";
        return (
            errorMessages[errorType] ||
            `${provider} sign-in failed. Please try again.`
        );
    };

    // Don't render if not configured (in production)
    if (!isConfigured && process.env.NODE_ENV === "production") {
        return null;
    }

    return (
        <button
            onClick={handleOAuthClick}
            disabled={disabled || isLoading || !isConfigured}
            className={`oauth-button oauth-button--${provider} ${className} ${
                isLoading ? "oauth-button--loading" : ""
            } ${!isConfigured ? "oauth-button--not-configured" : ""}`}
            type="button"
            aria-label={`Sign in with ${provider}`}
        >
            <div className="oauth-button__content">
                {isLoading ? (
                    <div className="oauth-button__loading">
                        <CustomSpinner size="small" />
                        <span>Connecting...</span>
                    </div>
                ) : (
                    <>
                        <div className="oauth-button__icon">
                            <img
                                src={icon}
                                alt={`${provider} icon`}
                                width="20"
                                height="20"
                            />
                        </div>
                        <span className="oauth-button__text">
                            {text || `Continue with ${provider}`}
                        </span>
                        {isMobile && (
                            <span className="oauth-button__mobile-indicator">
                                📱
                            </span>
                        )}
                    </>
                )}
            </div>

            {error && (
                <div className="oauth-button__error">
                    <small>{error}</small>
                </div>
            )}

            {!isConfigured && process.env.NODE_ENV === "development" && (
                <div className="oauth-button__dev-warning">
                    <small>⚠️ {provider} OAuth not configured</small>
                </div>
            )}
        </button>
    );
};

// Enhanced OAuth buttons container
export const OAuthButtonsContainer = ({
    providers = ["google", "linkedin", "amazon"],
    title = "Or continue with:",
    className = "",
    onError = null,
    onStart = null,
    onSuccess = null,
}) => {
    const [socialLinks, setSocialLinks] = useState([]);

    useEffect(() => {
        // Dynamically import social links to avoid SSR issues
        import("../../utilities/staticData").then(({ social_links }) => {
            const filteredLinks = social_links.filter((link) =>
                providers.includes(link.provider),
            );
            setSocialLinks(filteredLinks);
        });
    }, [providers]);

    if (socialLinks.length === 0) {
        return null;
    }

    return (
        <div className={`oauth-buttons-container ${className}`}>
            {title && (
                <div className="oauth-buttons-container__title">
                    <span>{title}</span>
                </div>
            )}

            <div className="oauth-buttons-container__buttons">
                {socialLinks.map((link) => (
                    <OAuthButton
                        key={link.provider}
                        provider={link.provider}
                        icon={link.icon}
                        text={`Continue with ${link.name}`}
                        onError={onError}
                        onStart={onStart}
                        onSuccess={onSuccess}
                    />
                ))}
            </div>
        </div>
    );
};

export default OAuthButton;
