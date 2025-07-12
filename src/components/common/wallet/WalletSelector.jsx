import React, { useState, useCallback, useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { ReactTooltip } from "../../../utilities/tooltip";
import { BsQuestionCircle } from "@react-icons/all-files/bs/BsQuestionCircle";
import { BiWallet } from "@react-icons/all-files/bi/BiWallet";
import { handleWalletError } from "../../../utilities/walletErrorHandler";

import {
    wallets,
    NDB_WALLET_TOOLTIP_CONTENT,
    EXTERNAL_WALLET_TOOLTIP_CONTENT,
} from "../../../utilities/staticData";
import { NyyuWallet, NyyuWalletSelected } from "../../../utilities/imgImport";

const shortFormatAddr = (addr) => {
    return addr.substring(0, 6) + "..." + addr.substring(addr.length - 4);
};

// Helper function to get wallet icon with fallback logic
const getWalletIcon = (connector) => {
    // Try multiple mapping strategies
    const possibleKeys = [
        connector.id,
        connector.name,
        connector.name?.toLowerCase(),
        connector.name?.replace(/\s+/g, ""),
        connector.name?.toLowerCase()?.replace(/\s+/g, ""),
    ];

    for (const key of possibleKeys) {
        if (wallets[key]?.icon) {
            return wallets[key].icon;
        }
    }

    // Default fallback based on known connector types
    if (connector.name?.toLowerCase().includes("metamask")) {
        return wallets.metaMask?.icon || wallets.MetaMask?.icon;
    }
    if (connector.name?.toLowerCase().includes("coinbase")) {
        return wallets.coinbaseWallet?.icon || wallets.coinbase?.icon;
    }
    if (connector.name?.toLowerCase().includes("walletconnect")) {
        return wallets.walletConnect?.icon;
    }

    return null;
};

// Helper function to get wallet properties with fallback logic
const getWalletProperty = (connector, property) => {
    const possibleKeys = [
        connector.id,
        connector.name,
        connector.name?.toLowerCase(),
        connector.name?.replace(/\s+/g, ""),
        connector.name?.toLowerCase()?.replace(/\s+/g, ""),
    ];

    for (const key of possibleKeys) {
        if (wallets[key]?.[property]) {
            return wallets[key][property];
        }
    }

    // Default fallback based on known connector types
    if (connector.name?.toLowerCase().includes("metamask")) {
        return wallets.metaMask?.[property] || wallets.MetaMask?.[property];
    }
    if (connector.name?.toLowerCase().includes("coinbase")) {
        return (
            wallets.coinbaseWallet?.[property] || wallets.coinbase?.[property]
        );
    }
    if (connector.name?.toLowerCase().includes("walletconnect")) {
        return wallets.walletConnect?.[property];
    }

    return null;
};

const WalletSelector = ({ selectedWallet, walletChanged }) => {
    // wagmi connectors
    const { connect, connectors, isPending, error } = useConnect();
    const { data: accountInfo, isConnected } = useAccount();
    const [connectingId, setConnectingId] = useState(null);
    const [userFriendlyError, setUserFriendlyError] = useState(null);

    // Update parent component when connection status changes
    useEffect(() => {
        walletChanged({
            selectedWallet,
            address: isConnected ? accountInfo?.address : null,
        });
    }, [isConnected, accountInfo?.address, selectedWallet, walletChanged]);

    // Handle external wallet connection
    const handleConnect = useCallback(
        async (connector) => {
            if (isPending || connectingId) return;

            try {
                setConnectingId(connector.id);
                setUserFriendlyError(null); // Clear previous errors
                console.log("Connecting to:", connector.name, connector.id);

                await connect({ connector });
            } catch (err) {
                console.error("Connection failed:", err);
                const friendlyError = handleWalletError(err, connector);
                setUserFriendlyError(friendlyError);
            } finally {
                setConnectingId(null);
            }
        },
        [connect, isPending, connectingId],
    );

    // Handle errors from the useConnect hook
    useEffect(() => {
        if (error) {
            const friendlyError = handleWalletError(error);
            setUserFriendlyError(friendlyError);
        }
    }, [error]);

    // Handle wallet type selection
    const onChangeWallet = useCallback(
        (wallet) => {
            walletChanged({
                selectedWallet: wallet,
                address: isConnected ? accountInfo?.address : null,
            });
        },
        [walletChanged, isConnected, accountInfo?.address],
    );

    return (
        <div className="mb-3 wallet_content">
            {selectedWallet === "external" ? (
                <>
                    <div className="row pt-2">
                        {connectors?.map((connector, idx) => {
                            const isCurrentConnector =
                                accountInfo &&
                                accountInfo?.connector?.id === connector.id;
                            const isConnecting = connectingId === connector.id;
                            const isReady =
                                connector.type !== "unknown" &&
                                typeof connector.connect === "function";

                            if (isCurrentConnector) {
                                return (
                                    <div
                                        className="col-lg-6 mb-10px"
                                        key={`${connector.id}-${idx}`}
                                    >
                                        <div className="presale-connected external_wallet">
                                            <img
                                                src={getWalletIcon(connector)}
                                                alt="wallet icon"
                                                className="wallet-icon"
                                            />
                                            <p className="txt-green">
                                                {shortFormatAddr(
                                                    accountInfo.address,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    className="col-lg-6"
                                    key={`${connector.id}-${idx}`}
                                    role="button"
                                    tabIndex={isReady ? 0 : -1}
                                    onClick={() =>
                                        isReady &&
                                        !isConnecting &&
                                        handleConnect(connector)
                                    }
                                    onKeyDown={(e) => {
                                        if (
                                            (e.key === "Enter" ||
                                                e.key === " ") &&
                                            isReady &&
                                            !isConnecting
                                        ) {
                                            e.preventDefault();
                                            handleConnect(connector);
                                        }
                                    }}
                                    style={{
                                        cursor: isReady
                                            ? "pointer"
                                            : "not-allowed",
                                    }}
                                >
                                    <div
                                        className={`wallet-item external_wallet ${!isReady ? "inactive" : ""} ${isConnecting ? "connecting" : ""}`}
                                    >
                                        <img
                                            src={getWalletIcon(connector)}
                                            alt="wallet icon"
                                            className="wallet-icon"
                                        />
                                        <p>
                                            {isConnecting
                                                ? "Connecting..."
                                                : isReady
                                                  ? getWalletProperty(
                                                        connector,
                                                        "short",
                                                    ) || connector.name
                                                  : "Not supported"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {(userFriendlyError || error) && (
                        <div className="wallet-error">
                            {userFriendlyError ||
                                error?.message ||
                                "Failed to connect"}
                        </div>
                    )}
                    {isPending && (
                        <div className="py-2" style={{ color: "#17a2b8" }}>
                            Connecting to wallet...
                        </div>
                    )}
                </>
            ) : (
                <div className="row">
                    <div className="col-lg-6 mt-2">
                        <button
                            className={`destination_wallet ${selectedWallet === "internal" ? "active" : ""}`}
                            onClick={() => onChangeWallet("internal")}
                        >
                            <img
                                src={
                                    selectedWallet === "internal"
                                        ? NyyuWalletSelected
                                        : NyyuWallet
                                }
                                alt="Nyyu Wallet"
                            />
                            <span>Nyyu Wallet</span>
                            <ReactTooltip
                                id="ndb-wallet-tooltip"
                                multiline={true}
                                place="top"
                                content={NDB_WALLET_TOOLTIP_CONTENT}
                            />
                            <BsQuestionCircle
                                data-tooltip-id="ndb-wallet-tooltip"
                                className="question_mark"
                                size={16}
                            />
                        </button>
                    </div>
                    <div className="col-lg-6 mt-2">
                        <button
                            className={`destination_wallet ${selectedWallet === "external" ? "active" : ""}`}
                            onClick={() => onChangeWallet("external")}
                        >
                            <BiWallet size={40} />
                            <span>External Wallet</span>
                            <ReactTooltip
                                id="external-wallet-tooltip"
                                multiline={true}
                                place="top"
                                content={EXTERNAL_WALLET_TOOLTIP_CONTENT}
                            />
                            <BsQuestionCircle
                                data-tooltip-id="external-wallet-tooltip"
                                className="question_mark"
                                size={16}
                            />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletSelector;
