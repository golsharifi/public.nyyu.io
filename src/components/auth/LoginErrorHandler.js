import React, { useState } from "react";

const LoginErrorHandler = ({ children }) => {
    const [showDebugMode, setShowDebugMode] = useState(false);

    if (showDebugMode) {
        return (
            <div style={{ padding: "20px", backgroundColor: "#f5f5f5" }}>
                <h3>🔧 Debug Mode - API Connection Issue</h3>
                <p>
                    <strong>Problem:</strong> Cannot connect to GraphQL API
                </p>
                <p>
                    <strong>Endpoint:</strong> {process.env.GATSBY_API_BASE_URL}
                    /graphql
                </p>

                <div style={{ margin: "20px 0" }}>
                    <h4>Quick Tests:</h4>
                    <button
                        onClick={() => {
                            fetch(
                                `${process.env.GATSBY_API_BASE_URL}/graphql`,
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        query: "{ __typename }",
                                    }),
                                },
                            )
                                .then((res) => alert(`Status: ${res.status}`))
                                .catch((err) => alert(`Error: ${err.message}`));
                        }}
                        style={{ margin: "5px", padding: "10px" }}
                    >
                        Test /graphql
                    </button>

                    <button
                        onClick={() => {
                            fetch(
                                `${process.env.GATSBY_API_BASE_URL}/api/graphql`,
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        query: "{ __typename }",
                                    }),
                                },
                            )
                                .then((res) => alert(`Status: ${res.status}`))
                                .catch((err) => alert(`Error: ${err.message}`));
                        }}
                        style={{ margin: "5px", padding: "10px" }}
                    >
                        Test /api/graphql
                    </button>
                </div>

                <button
                    onClick={() => setShowDebugMode(false)}
                    style={{
                        padding: "10px",
                        backgroundColor: "#007bff",
                        color: "white",
                    }}
                >
                    Back to Normal Login
                </button>
            </div>
        );
    }

    return (
        <div>
            {children}
            <div style={{ marginTop: "20px", textAlign: "center" }}>
                <small
                    style={{ cursor: "pointer", color: "#666" }}
                    onClick={() => setShowDebugMode(true)}
                >
                    Having trouble? Click here for debug mode
                </small>
            </div>
        </div>
    );
};

export default LoginErrorHandler;
