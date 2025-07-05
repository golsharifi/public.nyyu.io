// File: src/utilities/walletErrorHandler.js

/**
 * Converts technical wallet error messages into user-friendly messages
 * @param {Error|string} error - The error object or message
 * @param {string} walletName - Name of the wallet being connected
 * @returns {string} User-friendly error message
 */
export const formatWalletError = (error, walletName = "wallet") => {
    const errorMessage =
        typeof error === "string" ? error : error?.message || "Unknown error";
    const lowerError = errorMessage.toLowerCase();

    // User rejection errors
    if (
        lowerError.includes("user rejected") ||
        lowerError.includes("user denied") ||
        lowerError.includes("user cancelled") ||
        lowerError.includes("rejected by user") ||
        lowerError.includes("user abort")
    ) {
        return `Connection cancelled. Please try again if you want to connect your ${walletName}.`;
    }

    // Wallet not installed errors
    if (
        lowerError.includes("not installed") ||
        lowerError.includes("not detected") ||
        lowerError.includes("not found") ||
        lowerError.includes("wallet_requestpermissions")
    ) {
        return `${walletName} is not installed. Please install the ${walletName} extension and try again.`;
    }

    // Network/connection errors
    if (
        lowerError.includes("network") ||
        lowerError.includes("connection") ||
        lowerError.includes("timeout") ||
        lowerError.includes("failed to fetch")
    ) {
        return `Network connection issue. Please check your internet connection and try again.`;
    }

    // Already processing errors
    if (
        lowerError.includes("already processing") ||
        lowerError.includes("request already pending")
    ) {
        return `A connection request is already in progress. Please wait or refresh the page.`;
    }

    // Chain/network errors
    if (
        lowerError.includes("chain") ||
        lowerError.includes("unsupported network")
    ) {
        return `Network not supported. Please switch to a supported network in your wallet.`;
    }

    // Generic wallet errors
    if (
        lowerError.includes("wallet error") ||
        lowerError.includes("internal error")
    ) {
        return `Wallet error occurred. Please try refreshing the page or restarting your wallet.`;
    }

    // WalletConnect specific errors
    if (
        lowerError.includes("walletconnect") ||
        lowerError.includes("qr code")
    ) {
        return `WalletConnect connection failed. Please scan the QR code with your mobile wallet or try again.`;
    }

    // Permission errors
    if (
        lowerError.includes("permission") ||
        lowerError.includes("unauthorized")
    ) {
        return `Permission denied. Please enable wallet permissions and try again.`;
    }

    // Rate limiting
    if (
        lowerError.includes("rate limit") ||
        lowerError.includes("too many requests")
    ) {
        return `Too many connection attempts. Please wait a moment and try again.`;
    }

    // Remove technical details (version numbers, stack traces, etc.)
    let cleanMessage = errorMessage
        // Remove version information
        .replace(/Version:\s*[\w@.\-]+/gi, "")
        // Remove "Details:" prefix
        .replace(/Details:\s*/gi, "")
        // Remove technical error codes
        .replace(/Error:\s*/gi, "")
        // Remove duplicate "User rejected the request" parts
        .replace(
            /User rejected the request\.\s*User rejected the request\./gi,
            "User rejected the request.",
        )
        // Remove viem/wagmi references
        .replace(/viem@[\d.]+/gi, "")
        .replace(/wagmi@[\d.]+/gi, "")
        // Remove extra whitespace and periods
        .replace(/\s+/g, " ")
        .replace(/\.+/g, ".")
        .trim();

    // If after cleaning it's still a user rejection, use our friendly message
    if (cleanMessage.toLowerCase().includes("user rejected")) {
        return `Connection cancelled. Please try again if you want to connect your ${walletName}.`;
    }

    // If the cleaned message is too short or still technical, provide a generic message
    if (
        cleanMessage.length < 10 ||
        cleanMessage.includes("@") ||
        cleanMessage.includes("0x") ||
        cleanMessage.match(/[A-Z]{2,}[_][A-Z]{2,}/)
    ) {
        return `Failed to connect to ${walletName}. Please try again or check if your wallet is working properly.`;
    }

    // Return the cleaned message with first letter capitalized
    return cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);
};

/**
 * Gets a user-friendly wallet name from connector
 * @param {Object} connector - Wagmi connector object
 * @returns {string} User-friendly wallet name
 */
export const getWalletDisplayName = (connector) => {
    if (!connector) return "wallet";

    const name = connector.name || connector.id;

    // Map technical names to user-friendly names
    const nameMap = {
        metaMask: "MetaMask",
        metamask: "MetaMask",
        coinbaseWallet: "Coinbase Wallet",
        coinbase: "Coinbase Wallet",
        walletConnect: "WalletConnect",
        walletconnect: "WalletConnect",
        trustWallet: "Trust Wallet",
        trust: "Trust Wallet",
    };

    return nameMap[name] || name;
};

/**
 * Complete error handler for wallet connections
 * @param {Error|string} error - The error
 * @param {Object} connector - Wagmi connector object
 * @returns {string} User-friendly error message
 */
export const handleWalletError = (error, connector) => {
    const walletName = getWalletDisplayName(connector);
    return formatWalletError(error, walletName);
};
