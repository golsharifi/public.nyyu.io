import React from "react";
import { navigate } from "gatsby";
import { wallets } from "../../utilities/staticData";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { isMobile } from "react-device-detect";

const TRUST_URL = `https://link.trustwallet.com/open_url?coin_id=60&url=${process.env.GATSBY_SITE_URL}`;

// Simple function to get wallet icon with fallback
const getWalletIcon = (connector) => {
    return (
        wallets[connector.id]?.icon ||
        wallets[connector.name]?.icon ||
        wallets.metaMask?.icon
    ); // fallback
};

export default function ConnectWalletTab() {
    const { address, isConnected, connector } = useAccount();
    const { connect, connectors, error } = useConnect();
    const { disconnect } = useDisconnect();

    // Debug logging
    React.useEffect(() => {
        console.log("🔍 Wallet State Debug:", {
            address,
            isConnected,
            connector: connector?.name,
            connectorId: connector?.id,
        });
    }, [address, isConnected, connector]);

    return (
        <div className="row">
            {isConnected && address && connector ? (
                <div className="mb-10px">
                    <div className="connected">
                        <img src={getWalletIcon(connector)} alt="wallet icon" />
                        <p>{address}</p>
                    </div>
                    <button className="btn-primary" onClick={disconnect}>
                        Disconnect
                    </button>
                </div>
            ) : (
                <>
                    {connectors.map((x, idx) => (
                        <div
                            className="col-sm-6"
                            key={idx}
                            onClick={() => connect({ connector: x })}
                            onKeyDown={() => connect({ connector: x })}
                            role="presentation"
                        >
                            <div className="wallet-item">
                                <img src={getWalletIcon(x)} alt="wallet icon" />
                                <p>
                                    {wallets[x.id]?.desc || `Connect ${x.name}`}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div
                        className="col-sm-6"
                        onClick={() => {
                            isMobile && navigate(TRUST_URL);
                        }}
                        onKeyDown={() => {
                            isMobile && navigate(TRUST_URL);
                        }}
                        role="presentation"
                    >
                        <div
                            className={`wallet-item  ${!isMobile && "inactive"}`}
                        >
                            <img
                                src={wallets.trustWallet.icon}
                                alt="wallet icon"
                            />
                            <p>
                                {isMobile
                                    ? wallets.trustWallet.desc
                                    : wallets.trustWallet.warn}
                            </p>
                        </div>
                    </div>
                </>
            )}
            {error && (
                <div className="py-2" style={{ color: "#e8503a" }}>
                    {error?.message ?? "Failed to connect"}
                </div>
            )}
        </div>
    );
}
