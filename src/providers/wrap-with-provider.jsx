import React from "react";
import { AuthProvider } from "../hooks/useAuth";
import { ApolloProvider } from "@apollo/client";
import { Provider as ReduxProvider } from "react-redux";
import { WagmiProvider, createConfig, http } from "wagmi";
import LoadCurrencyRates from "../components/header/LoadCurrencyRates";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    mainnet,
    polygon,
    optimism,
    arbitrum,
    sepolia,
    polygonMumbai,
    bsc,
    bscTestnet,
} from "wagmi/chains";
import { walletConnect, coinbaseWallet, metaMask } from "wagmi/connectors";

// FIXED: Import client as default export
import client from "../apollo/client";
import store from "../store/store";

// ADD THIS IMPORT for Google Maps controller
import GoogleMapsController from "../components/common/GoogleMapsController";

// Create React Query client (required for Wagmi v2)
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            cacheTime: 1000 * 60 * 10, // 10 minutes
            retry: 3,
            refetchOnWindowFocus: false,
        },
    },
});

// Custom BSC chains configuration (matching your original setup)
const customBscChain = {
    ...bsc,
    id: 56,
    name: "Binance Smart Chain",
    nativeCurrency: {
        name: "Binance",
        symbol: "BNB",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ["https://bsc-dataseed.binance.org/"],
        },
    },
    blockExplorers: {
        default: { name: "Bscscan", url: "https://bscscan.com" },
    },
};

const customBscTestChain = {
    ...bscTestnet,
    id: 97,
    name: "Smart Chain - Testnet",
    nativeCurrency: {
        name: "Binance",
        symbol: "BNB",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
        },
    },
    blockExplorers: {
        default: { name: "Bsctestscan", url: "https://testnet.bscscan.com" },
    },
};

// Add LoadCurrencyRates component
const CurrencyLoader = () => <LoadCurrencyRates />;

// Wagmi v2 configuration
// SSR-safe Wagmi v2 configuration - only initialize in browser
let config;

const getWagmiConfig = () => {
    // Return existing config if already created
    if (config) {
        return config;
    }

    // Only create config in browser environment
    if (typeof window === "undefined") {
        return null;
    }

    // Create config
    config = createConfig({
        chains: [
            mainnet,
            customBscChain,
            polygon,
            optimism,
            arbitrum,
            ...(process.env.NODE_ENV === "development"
                ? [sepolia, polygonMumbai, customBscTestChain]
                : [customBscTestChain]),
        ],
        connectors: [
            metaMask({
                dappMetadata: {
                    name: "Nyyu",
                    description: "NDB Token Pre-sale Platform",
                    url: window.location.origin,
                },
            }),
            walletConnect({
                projectId:
                    process.env.GATSBY_WALLET_CONNECT_PROJECT_ID ||
                    "0c9ae26da7b9e77a676d9c4e48e91718",
                metadata: {
                    name: "Nyyu",
                    description: "NDB Token Pre-sale Platform",
                    url: window.location.origin,
                    icons: [`${window.location.origin}/favicon.ico`],
                },
                showQrModal: true,
            }),
            coinbaseWallet({
                appName: "Nyyu",
                appLogoUrl: `${window.location.origin}/favicon.ico`,
            }),
        ],
        transports: {
            [mainnet.id]: http(),
            [customBscChain.id]: http(),
            [polygon.id]: http(),
            [optimism.id]: http(),
            [arbitrum.id]: http(),
            ...(process.env.NODE_ENV === "development"
                ? {
                      [sepolia.id]: http(),
                      [polygonMumbai.id]: http(),
                      [customBscTestChain.id]: http(),
                  }
                : { [customBscTestChain.id]: http() }),
        },
        ssr: true, // Enable SSR support
    });

    return config;
};

// Enhanced Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Provider Error:", error, errorInfo);

        // Log Apollo Client specific errors
        if (error.message && error.message.includes("apollo")) {
            console.error("Apollo Client Error Details:", {
                error: error,
                client: client,
                clientType: typeof client,
                clientKeys: client ? Object.keys(client) : "No client",
            });
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        padding: "20px",
                        textAlign: "center",
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #dee2e6",
                        borderRadius: "8px",
                        margin: "20px",
                    }}
                >
                    <h2>Something went wrong</h2>
                    <p>There was an error with the application providers.</p>
                    <details style={{ marginTop: "10px", textAlign: "left" }}>
                        <summary>Error Details</summary>
                        <pre style={{ fontSize: "12px", overflow: "auto" }}>
                            {this.state.error?.toString()}
                        </pre>
                    </details>
                    <button
                        onClick={() => {
                            if (typeof window !== "undefined") {
                                window.location.reload();
                            }
                        }}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            marginTop: "10px",
                        }}
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// Main provider wrapper with proper error handling
export const wrapRootElement = ({ element }) => {
    // Get Wagmi config (will be null during SSR)
    const wagmiConfig = getWagmiConfig();

    // Validate that client exists and is properly configured
    if (!client) {
        console.error("❌ Apollo Client is not available!");
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <h2>Configuration Error</h2>
                <p>Apollo Client is not properly configured.</p>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <ReduxProvider store={store}>
                <ApolloProvider client={client}>
                    <AuthProvider>
                        <QueryClientProvider client={queryClient}>
                            {wagmiConfig ? (
                                <WagmiProvider config={wagmiConfig}>
                                    <GoogleMapsController />
                                    <CurrencyLoader />
                                    {element}
                                </WagmiProvider>
                            ) : (
                                <>
                                    {/* SSR fallback - render without Wagmi during server-side rendering */}
                                    <GoogleMapsController />
                                    <CurrencyLoader />
                                    {element}
                                </>
                            )}
                        </QueryClientProvider>
                    </AuthProvider>
                </ApolloProvider>
            </ReduxProvider>
        </ErrorBoundary>
    );
};

// For Gatsby SSR compatibility
export const wrapPageElement = ({ element, props }) => {
    return element;
};

// Export config for external use if needed
export { getWagmiConfig as wagmiConfig, queryClient };
