import React from "react";

export default function CustomSpinner({ color = "white", sm }) {
    return (
        <div
            className={`spinner-border text-${color}`}
            style={{ borderWidth: "2px", ...(sm && { width: "20px", height: "20px" }) }}
            role="status"
        />
    );
}
