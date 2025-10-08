import React from "react";

const GoogleMapsDebug = () => {
    if (process.env.NODE_ENV !== "development") {
        return null;
    }

    // Direct access to environment variables
    const directApiKey = process.env.GATSBY_GOOGLE_MAPS_API_KEY;

    // Imported values
    let importedApiKey = "";
    let isConfigured = false;

    try {
        const {
            GOOGLE_MAPS_API_KEY,
            isGoogleMapsConfigured,
        } = require("../../utilities/staticData");
        importedApiKey = GOOGLE_MAPS_API_KEY;
        isConfigured = isGoogleMapsConfigured();
    } catch (error) {
        console.error("Error importing staticData:", error);
    }

    return (
        <div
            style={{
                position: "fixed",
                top: "10px",
                right: "10px",
                background: "black",
                color: "white",
                padding: "10px",
                fontSize: "12px",
                zIndex: 9999,
                borderRadius: "4px",
                maxWidth: "300px",
            }}
        >
            <div>
                <strong>Google Maps Debug:</strong>
            </div>
            <div>
                Direct Env:{" "}
                {directApiKey
                    ? `${directApiKey.substring(0, 10)}...`
                    : "undefined"}
            </div>
            <div>
                Imported:{" "}
                {importedApiKey
                    ? `${importedApiKey.substring(0, 10)}...`
                    : "undefined"}
            </div>
            <div>Is Configured: {isConfigured ? "Yes" : "No"}</div>
            <div>Node Env: {process.env.NODE_ENV}</div>
        </div>
    );
};

export default GoogleMapsDebug;
