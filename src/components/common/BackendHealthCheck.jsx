import React, { useState, useEffect } from "react";
import styled from "styled-components";

const HealthCheckContainer = styled.div`
    position: fixed;
    top: 10px;
    right: 10px;
    background: ${(props) =>
        props.$status === "online" ? "#4caf50" : "#f44336"};
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 9999;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: scale(1.05);
    }
`;

const DetailModal = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    max-width: 500px;
    width: 90%;
    color: #333;
    max-height: 80vh;
    overflow-y: auto;
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9999;
`;

const BackendHealthCheck = () => {
    const [status, setStatus] = useState("checking");
    const [details, setDetails] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [lastCheck, setLastCheck] = useState(null);

    const checkBackendHealth = async () => {
        const apiUrl =
            process.env.GATSBY_API_BASE_URL || "http://localhost:8080";
        const graphqlEndpoint = `${apiUrl}/graphql`;
        const startTime = Date.now();

        try {
            // Try to reach the GraphQL endpoint with a simple health query
            const response = await fetch(graphqlEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    query: "{ __typename }",
                }),
                // Add timeout
                signal: AbortSignal.timeout
                    ? AbortSignal.timeout(10000)
                    : undefined,
            });

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            if (response.ok) {
                // Try to parse the response
                let responseData = null;
                try {
                    responseData = await response.json();
                } catch (e) {
                    // Response might not be JSON, but if we got here, server is responding
                }

                setStatus("online");
                setDetails({
                    status: "Connected ✅",
                    endpoint: graphqlEndpoint,
                    responseTime: `${responseTime}ms`,
                    lastCheck: new Date().toLocaleTimeString(),
                    httpStatus: response.status,
                    responseData: responseData
                        ? JSON.stringify(responseData, null, 2)
                        : "Non-JSON response",
                });
            } else {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`,
                );
            }
        } catch (error) {
            console.error("Backend health check failed:", error);
            setStatus("offline");
            setDetails({
                status: "Disconnected ❌",
                endpoint: graphqlEndpoint,
                error: error.message || "Unknown error",
                lastCheck: new Date().toLocaleTimeString(),
                troubleshooting: [
                    "1. Check if Spring Boot backend is running",
                    `2. Verify backend is accessible at: ${apiUrl}`,
                    "3. Check CORS configuration in Spring Boot",
                    "4. Verify GATSBY_API_BASE_URL in .env file",
                    "5. Check if port 8080 is not blocked by firewall",
                    "6. Try accessing the health endpoint directly in browser",
                ],
            });
        }

        setLastCheck(new Date());
    };

    useEffect(() => {
        // Only run in development and in browser
        if (
            process.env.NODE_ENV !== "development" ||
            typeof window === "undefined"
        ) {
            return;
        }

        // Initial check after a short delay
        const initialTimeout = setTimeout(() => {
            checkBackendHealth();
        }, 2000);

        // Check every 30 seconds
        const interval = setInterval(checkBackendHealth, 30000);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, []);

    // Don't render in production or during SSR
    if (
        process.env.NODE_ENV !== "development" ||
        typeof window === "undefined"
    ) {
        return null;
    }

    return (
        <>
            <HealthCheckContainer
                $status={status}
                onClick={() => setShowModal(true)}
                title="Click for backend connection details"
            >
                Backend:{" "}
                {status === "online"
                    ? "🟢 Online"
                    : status === "checking"
                      ? "🟡 Checking"
                      : "🔴 Offline"}
            </HealthCheckContainer>

            {showModal && (
                <>
                    <Overlay onClick={() => setShowModal(false)} />
                    <DetailModal>
                        <h3>🔍 Backend Health Check</h3>
                        <div
                            style={{
                                marginBottom: "15px",
                                fontFamily: "monospace",
                                fontSize: "14px",
                            }}
                        >
                            <div>
                                <strong>Status:</strong> {details.status}
                            </div>
                            <div>
                                <strong>Endpoint:</strong> {details.endpoint}
                            </div>
                            <div>
                                <strong>Last Check:</strong> {details.lastCheck}
                            </div>
                            {details.responseTime && (
                                <div>
                                    <strong>Response Time:</strong>{" "}
                                    {details.responseTime}
                                </div>
                            )}
                            {details.httpStatus && (
                                <div>
                                    <strong>HTTP Status:</strong>{" "}
                                    {details.httpStatus}
                                </div>
                            )}
                        </div>

                        {details.error && (
                            <div
                                style={{
                                    marginBottom: "15px",
                                    color: "#f44336",
                                    padding: "10px",
                                    background: "#ffebee",
                                    borderRadius: "4px",
                                }}
                            >
                                <strong>Error:</strong> {details.error}
                            </div>
                        )}

                        {details.responseData && status === "online" && (
                            <div style={{ marginBottom: "15px" }}>
                                <strong>Response:</strong>
                                <pre
                                    style={{
                                        background: "#f5f5f5",
                                        padding: "10px",
                                        borderRadius: "4px",
                                        fontSize: "12px",
                                        overflow: "auto",
                                        maxHeight: "100px",
                                    }}
                                >
                                    {details.responseData}
                                </pre>
                            </div>
                        )}

                        {details.troubleshooting && (
                            <div style={{ marginBottom: "15px" }}>
                                <strong>Troubleshooting Steps:</strong>
                                <ol
                                    style={{
                                        margin: "5px 0",
                                        paddingLeft: "20px",
                                    }}
                                >
                                    {details.troubleshooting.map(
                                        (step, index) => (
                                            <li
                                                key={index}
                                                style={{
                                                    margin: "5px 0",
                                                    fontSize: "14px",
                                                }}
                                            >
                                                {step}
                                            </li>
                                        ),
                                    )}
                                </ol>
                            </div>
                        )}

                        <div style={{ textAlign: "center" }}>
                            <button
                                onClick={() => {
                                    setStatus("checking");
                                    checkBackendHealth();
                                }}
                                style={{
                                    background: "#2196f3",
                                    color: "white",
                                    border: "none",
                                    padding: "8px 16px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    marginRight: "10px",
                                }}
                            >
                                🔄 Refresh
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    background: "#666",
                                    color: "white",
                                    border: "none",
                                    padding: "8px 16px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </DetailModal>
                </>
            )}
        </>
    );
};

export default BackendHealthCheck;
