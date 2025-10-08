import React from "react";
import { useConnect } from "wagmi";
import { wallets } from "../../utilities/staticData";

/**
 * Debug component to help identify connector IDs and mappings
 * Remove this component once the wallet icons are working properly
 */
const ConnectorDebugger = () => {
    const { connectors } = useConnect();

    if (process.env.NODE_ENV !== "development") {
        return null; // Only show in development
    }

    return (
        <div
            style={{
                position: "fixed",
                top: "10px",
                right: "10px",
                background: "rgba(0,0,0,0.8)",
                color: "white",
                padding: "10px",
                borderRadius: "8px",
                fontSize: "12px",
                maxWidth: "300px",
                zIndex: 9999,
            }}
        >
            <h4>Connector Debug Info</h4>
            {connectors.map((connector, idx) => (
                <div
                    key={idx}
                    style={{
                        marginBottom: "10px",
                        border: "1px solid #333",
                        padding: "5px",
                    }}
                >
                    <div>
                        <strong>Name:</strong> {connector.name}
                    </div>
                    <div>
                        <strong>ID:</strong> {connector.id}
                    </div>
                    <div>
                        <strong>Type:</strong> {connector.type}
                    </div>
                    <div>
                        <strong>Has Icon:</strong>{" "}
                        {wallets[connector.id]?.icon ? "✅" : "❌"}
                    </div>
                    <div>
                        <strong>Icon Source:</strong>{" "}
                        {wallets[connector.id]?.icon
                            ? "wallets[connector.id]"
                            : wallets[connector.name]?.icon
                              ? "wallets[connector.name]"
                              : wallets[connector.name?.toLowerCase()]?.icon
                                ? "wallets[connector.name.toLowerCase()]"
                                : "No icon found"}
                    </div>
                </div>
            ))}

            <h5>Available Wallet Keys:</h5>
            <div>{Object.keys(wallets).join(", ")}</div>
        </div>
    );
};

export default ConnectorDebugger;
