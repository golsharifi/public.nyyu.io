import React from "react";

const GoogleMapsWrapper = ({ children, apiKey, ...props }) => {
    // Only render Google Maps if we have a valid API key
    if (
        !apiKey ||
        apiKey === "undefined" ||
        apiKey === "your-google-maps-api-key-here"
    ) {
        return (
            <div
                className="google-maps-placeholder"
                style={{
                    width: "100%",
                    height: "300px",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    color: "#666",
                }}
            >
                <div className="text-center">
                    <p>📍 Map functionality temporarily unavailable</p>
                    <small>Google Maps API key not configured</small>
                </div>
            </div>
        );
    }

    // Render the actual Google Maps component
    return React.Children.map(children, (child) =>
        React.cloneElement(child, { ...props, apiKey }),
    );
};

export default GoogleMapsWrapper;
