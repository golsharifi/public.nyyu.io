// src/pages/oauth2/[...].js
import React, { Suspense, lazy, useEffect, useState } from "react";
import { Router, navigate } from "@reach/router";
import Loading from "../../components/common/Loading";
import ErrorBoundary from "../../components/common/ErrorBoundary";

// Lazy load the redirect component
const Redirect = lazy(() => import("../../components/oauth2/redirect"));

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
    <div className="min-h-screen bg-dark d-flex align-items-center justify-content-center">
        <div className="text-center p-4">
            <h2 className="text-danger mb-3">OAuth Error</h2>
            <p className="text-light mb-4">
                Something went wrong during authentication.
            </p>
            <div className="d-flex gap-3 justify-content-center">
                <button
                    className="btn btn-outline-light"
                    onClick={resetErrorBoundary}
                >
                    Try Again
                </button>
                <button
                    className="btn btn-light"
                    onClick={() => navigate("/app/signin/")}
                >
                    Back to Sign In
                </button>
            </div>
            {process.env.NODE_ENV === "development" && error && (
                <details className="mt-4 text-start">
                    <summary className="text-warning cursor-pointer">
                        Error Details (Development)
                    </summary>
                    <pre className="text-danger mt-2 p-2 bg-dark border border-danger rounded">
                        {error?.message || "Unknown error occurred"}
                        {error?.stack && "\n" + error.stack}
                    </pre>
                </details>
            )}
        </div>
    </div>
);

// Loading fallback with better styling
const LoadingFallback = () => (
    <div className="min-h-screen bg-dark d-flex align-items-center justify-content-center">
        <div className="text-center">
            <Loading />
            <div className="text-light mt-3">Loading OAuth handler...</div>
        </div>
    </div>
);

// Enhanced OAuth App component
const OAuthApp = () => {
    const [isSSR, setIsSSR] = useState(true);

    // Handle client-side hydration and environment validation
    useEffect(() => {
        setIsSSR(false);

        // Validate environment variables
        const requiredEnvVars = ["GATSBY_SITE_URL", "GATSBY_API_BASE_URL"];

        const missingVars = requiredEnvVars.filter(
            (varName) => !process.env[varName],
        );

        if (missingVars.length > 0) {
            console.error(
                "❌ Missing required environment variables:",
                missingVars.join(", "),
            );
            console.error(
                "Please check your .env.development or .env.production file",
            );
        }
    }, []);

    // SSR guard
    if (isSSR) {
        return <LoadingFallback />;
    }

    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(error, errorInfo) => {
                console.error(
                    "🚨 OAuth Error Boundary caught error:",
                    error,
                    errorInfo,
                );
            }}
        >
            <Suspense fallback={<LoadingFallback />}>
                <Router basepath="/oauth2">
                    <Redirect path="redirect/:type/:dataType/:data" />
                    <Redirect path="redirect/:type/:dataType" />
                    <Redirect path="redirect/:type" />
                    {/* Fallback route for malformed URLs */}
                    <OAuthErrorPage default />
                </Router>
            </Suspense>
        </ErrorBoundary>
    );
};

// Fallback component for malformed OAuth URLs
const OAuthErrorPage = () => {
    useEffect(() => {
        console.warn("🚨 OAuth URL malformed or missing parameters");
    }, []);

    return (
        <div className="min-h-screen bg-dark d-flex align-items-center justify-content-center">
            <div className="text-center p-4">
                <h2 className="text-warning mb-3">Invalid OAuth URL</h2>
                <p className="text-light mb-4">
                    The OAuth callback URL is missing required parameters.
                </p>
                <button
                    className="btn btn-light"
                    onClick={() => navigate("/app/signin/")}
                >
                    Back to Sign In
                </button>
            </div>
        </div>
    );
};

export default OAuthApp;
