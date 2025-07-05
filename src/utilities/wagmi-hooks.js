import {
    useChainId,
    useChains,
    useAccount,
    useConnect,
    useDisconnect,
    useSendTransaction,
    useWriteContract,
    useReadContract,
    useBalance,
    useBlockNumber,
    useTransaction,
    useWaitForTransactionReceipt,
    useSwitchChain,
    useConnectors,
} from "wagmi";

// Legacy useNetwork hook compatibility
export const useNetwork = () => {
    const chainId = useChainId();
    const chains = useChains();
    const chain = chains.find((c) => c.id === chainId);

    return {
        chain: chain || null,
        chains,
    };
};

// Export all the modern hooks
export {
    useChainId,
    useChains,
    useAccount,
    useConnect,
    useDisconnect,
    useSendTransaction,
    useWriteContract,
    useReadContract,
    useBalance,
    useBlockNumber,
    useTransaction,
    useWaitForTransactionReceipt,
    useSwitchChain,
    useConnectors,
};

// Custom hooks for common operations

// Enhanced account hook with additional utilities
export const useAccountDetails = () => {
    const account = useAccount();
    const { data: balance } = useBalance({
        address: account.address,
        enabled: !!account.address,
    });

    return {
        ...account,
        balance,
        isConnected: account.status === "connected",
        isConnecting: account.status === "connecting",
        isDisconnected: account.status === "disconnected",
        isReconnecting: account.status === "reconnecting",
    };
};

// Helper hook for switching networks
export const useNetworkSwitch = () => {
    const { switchChain, isPending, error } = useSwitchChain();
    const currentChainId = useChainId();

    const switchToNetwork = async (chainId) => {
        if (currentChainId === chainId) {
            return {
                success: true,
                message: "Already on the requested network",
            };
        }

        try {
            await switchChain({ chainId });
            return { success: true, message: "Network switched successfully" };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    return {
        switchToNetwork,
        isPending,
        error,
        currentChainId,
    };
};

// Enhanced connect hook with error handling
export const useConnectWallet = () => {
    const { connect, connectors, isPending, error } = useConnect();
    const account = useAccount();

    const connectWithConnector = async (connectorId) => {
        const connector = connectors.find((c) => c.id === connectorId);
        if (!connector) {
            throw new Error(`Connector ${connectorId} not found`);
        }

        try {
            await connect({ connector });
            return { success: true, message: "Wallet connected successfully" };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    return {
        connect: connectWithConnector,
        connectors,
        isPending,
        error,
        isConnected: account.isConnected,
    };
};

// Transaction helper hook
export const useTransactionHelper = () => {
    const {
        sendTransaction,
        isPending: isSending,
        error: sendError,
    } = useSendTransaction();

    const sendTransactionWithStatus = async (params) => {
        try {
            const hash = await sendTransaction(params);
            return {
                success: true,
                hash,
                message: "Transaction sent successfully",
            };
        } catch (err) {
            return {
                success: false,
                message: err.message || "Transaction failed",
            };
        }
    };

    return {
        sendTransaction: sendTransactionWithStatus,
        isSending,
        sendError,
    };
};

// Contract interaction helper
export const useContractHelper = () => {
    const {
        writeContract,
        isPending: isWriting,
        error: writeError,
    } = useWriteContract();

    const writeContractWithStatus = async (params) => {
        try {
            const hash = await writeContract(params);
            return {
                success: true,
                hash,
                message: "Contract call successful",
            };
        } catch (err) {
            return {
                success: false,
                message: err.message || "Contract call failed",
            };
        }
    };

    return {
        writeContract: writeContractWithStatus,
        isWriting,
        writeError,
    };
};

// Network information helper
export const useNetworkInfo = () => {
    const chainId = useChainId();
    const chains = useChains();
    const currentChain = chains.find((c) => c.id === chainId);

    const getNetworkName = (id) => {
        const chain = chains.find((c) => c.id === id);
        return chain?.name || "Unknown Network";
    };

    const isMainnet = () => chainId === 1;
    const isTestnet = () => {
        const testnetIds = [3, 4, 5, 42, 11155111]; // Common testnets
        return testnetIds.includes(chainId);
    };

    return {
        chainId,
        currentChain,
        chains,
        getNetworkName,
        isMainnet: isMainnet(),
        isTestnet: isTestnet(),
        networkName: currentChain?.name || "Unknown",
    };
};
