// src/components/common/ErrorBoundary.jsx
import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details with better error handling
        console.error("🚨 ErrorBoundary caught an error:", error, errorInfo);

        this.setState({
            error: error || { message: "Unknown error occurred", stack: "" },
            errorInfo,
        });

        // Call onError prop if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Report to error tracking service in production
        if (process.env.NODE_ENV === "production" && window.gtag) {
            window.gtag("event", "exception", {
                description: (error && error.toString()) || "Unknown error",
                fatal: false,
            });
        }
    }

    resetErrorBoundary = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });

        // Call onReset prop if provided
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback component if provided
            if (this.props.FallbackComponent) {
                return (
                    <this.props.FallbackComponent
                        error={this.state.error}
                        errorInfo={this.state.errorInfo}
                        resetErrorBoundary={this.resetErrorBoundary}
                    />
                );
            }

            // Default fallback UI
            return (
                <div className="min-h-screen bg-dark d-flex align-items-center justify-content-center">
                    <div className="text-center p-4">
                        <h2 className="text-danger mb-3">
                            Something went wrong
                        </h2>
                        <p className="text-light mb-4">
                            An unexpected error occurred. Please try refreshing
                            the page.
                        </p>
                        <div className="d-flex gap-3 justify-content-center">
                            <button
                                className="btn btn-outline-light"
                                onClick={this.resetErrorBoundary}
                            >
                                Try Again
                            </button>
                            <button
                                className="btn btn-light"
                                onClick={() => window.location.reload()}
                            >
                                Refresh Page
                            </button>
                        </div>
                        {process.env.NODE_ENV === "development" &&
                            this.state.error && (
                                <details className="mt-4 text-start">
                                    <summary className="text-warning cursor-pointer">
                                        Error Details (Development)
                                    </summary>
                                    <pre className="text-danger mt-2 p-2 bg-dark border border-danger rounded small">
                                        {this.state.error?.message ||
                                            "Unknown error occurred"}
                                        {this.state.errorInfo?.componentStack &&
                                            "\n" +
                                                this.state.errorInfo
                                                    .componentStack}
                                    </pre>
                                </details>
                            )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
