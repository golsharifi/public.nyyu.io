import {
    ApolloClient,
    InMemoryCache,
    createHttpLink,
    from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { getInMemoryAuthToken, logout } from "../utilities/auth";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// GraphQL endpoint configuration with better error handling
const getGraphQLEndpoint = () => {
    // Try to get from environment variable first
    const baseUrl = process.env.GATSBY_API_BASE_URL;

    if (baseUrl) {
        const endpoint = `${baseUrl}/graphql`;

        if (process.env.NODE_ENV === "development") {
            console.log("🔗 GraphQL Endpoint:", endpoint);
            console.log("🌍 Environment:", process.env.NODE_ENV);
        }

        return endpoint;
    }

    // Fallback if environment variable is not set
    console.warn("⚠️ GATSBY_API_BASE_URL is not defined!");
    console.warn("Please create .env.development or .env.production file");

    const fallbackUrl =
        process.env.NODE_ENV === "production"
            ? "https://api.nyyu.io"
            : "http://localhost:8080";

    console.warn(`🔄 Using fallback URL: ${fallbackUrl}/graphql`);
    return `${fallbackUrl}/graphql`;
};

const graphqlEndpoint = getGraphQLEndpoint();

// Upload link for file uploads (replaces httpLink)
const uploadLink = createUploadLink({
    uri: graphqlEndpoint,
    credentials: "include", // Include cookies for CORS
    headers: {
        "Apollo-Require-Preflight": "true",
    },
});

// Auth link for adding authorization headers (SSR-safe)
const authLink = setContext((_, { headers }) => {
    // Only get token in browser environment
    const token = isBrowser ? getInMemoryAuthToken() : null;

    const authHeaders = {
        ...headers,
        "Content-Type": "application/json",
        // Add CORS headers for development
        ...(process.env.NODE_ENV === "development" && {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }),
    };

    // Add authorization header if token exists
    if (token) {
        authHeaders.authorization = `Bearer ${token}`;
    }

    return {
        headers: authHeaders,
    };
});

// Enhanced error handling link with better user feedback
const errorLink = onError(
    ({ graphQLErrors, networkError, operation, forward }) => {
        if (graphQLErrors) {
            graphQLErrors.forEach(
                ({ message, locations, path, extensions }) => {
                    console.error(
                        `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`,
                    );

                    // Handle different types of GraphQL errors
                    if (
                        extensions?.code === "UNAUTHENTICATED" ||
                        message.includes("Access Denied")
                    ) {
                        console.warn(
                            "🔐 Authentication required for:",
                            operation.operationName,
                        );

                        // Don't automatically logout for ANY queries that might be public or expected to fail
                        // Only log the error, don't redirect
                        const shouldLogout = false; // Disable automatic logout to prevent infinite loops

                        if (shouldLogout && isBrowser) {
                            // Only logout if we're on a protected route and have a valid session that just expired
                            const currentPath = window.location.pathname;
                            const isOnSigninPage =
                                currentPath.includes("/signin") ||
                                currentPath.includes("/signup");

                            if (!isOnSigninPage) {
                                console.warn(
                                    "Authentication error detected, logging out user",
                                );
                                logout(() => {
                                    if (typeof window !== "undefined") {
                                        window.location.href = "/app/signin/";
                                    }
                                });
                            }
                        }
                    } else if (extensions?.code === "FORBIDDEN") {
                        console.warn(
                            "🚫 Access forbidden for:",
                            operation.operationName,
                        );
                    }
                },
            );
        }

        if (networkError) {
            console.error(
                `Network error: ${networkError.message}`,
                networkError,
            );

            // Handle specific network errors - but don't auto-logout
            if (networkError.statusCode === 401) {
                console.warn("401 Unauthorized");
                // Don't auto-logout here either to prevent loops
            } else if (
                networkError.statusCode === 0 ||
                networkError.message.includes("fetch")
            ) {
                console.error("🔌 Backend connection failed!");
                console.error(
                    "Make sure your Spring Boot backend is running on:",
                    process.env.GATSBY_API_BASE_URL,
                );

                // Show user-friendly error in development (only once)
                if (process.env.NODE_ENV === "development" && isBrowser) {
                    const showError = localStorage.getItem("showBackendError");
                    if (!showError) {
                        setTimeout(() => {
                            console.warn(
                                `Backend Connection Failed! Please ensure your Spring Boot backend is running on: ${process.env.GATSBY_API_BASE_URL}`,
                            );
                            localStorage.setItem("showBackendError", "true");
                        }, 1000);
                    }
                }
            }
        }
    },
);

// Combine all links in the correct order (using uploadLink instead of httpLink)
const link = from([errorLink, authLink, uploadLink]);

// Create Apollo Client with enhanced configuration
const client = new ApolloClient({
    link: link,
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    // Handle cursor-based pagination
                    getTransactions: {
                        keyArgs: false,
                        merge(existing = [], incoming) {
                            return [...existing, ...incoming];
                        },
                    },
                    // Cache user data
                    getUser: {
                        merge: true,
                    },
                    // ENHANCED: Cache verification status with smart TTL
                    getShuftiRefPayload: {
                        merge: true,
                        read(existing, { cache, readField }) {
                            // Cache for 3 minutes (180 seconds)
                            if (existing && existing.__timestamp) {
                                const now = Date.now();
                                const age = now - existing.__timestamp;
                                const maxAge = 3 * 60 * 1000; // 3 minutes in milliseconds

                                if (age < maxAge) {
                                    console.log(
                                        "📦 Using cached verification status (age: " +
                                            Math.round(age / 1000) +
                                            "s)",
                                    );
                                    return existing;
                                } else {
                                    console.log(
                                        "⏰ Verification status cache expired, will fetch fresh data",
                                    );
                                    return undefined; // Force fresh fetch
                                }
                            }
                            return existing;
                        },
                    },
                },
            },
            ShuftiRefPayload: {
                fields: {
                    // Add timestamp to track cache age
                    __timestamp: {
                        read() {
                            return Date.now();
                        },
                    },
                },
            },
        },
        // Enhanced cache retention policy
        dataIdFromObject: (object) => {
            // Better cache key generation
            switch (object.__typename) {
                case "ShuftiRefPayload":
                    return `ShuftiRefPayload:${object.userId}`;
                case "User":
                    return `User:${object.id}`;
                default:
                    return object.id
                        ? `${object.__typename}:${object.id}`
                        : null;
            }
        },
    }),
    // Enhanced default options
    defaultOptions: {
        watchQuery: {
            errorPolicy: "all",
            notifyOnNetworkStatusChange: true,
        },
        query: {
            errorPolicy: "all",
        },
        mutate: {
            errorPolicy: "all",
        },
    },
    // Development-only options
    connectToDevTools: process.env.NODE_ENV === "development",
    // Handle SSR
    ssrMode: !isBrowser,
});

// Log client creation in development
if (process.env.NODE_ENV === "development") {
    console.log("🚀 Apollo Client created successfully");
    console.log("🌐 SSR Mode:", !isBrowser);
    console.log("🔗 GraphQL Endpoint:", graphqlEndpoint);
}

// Enhanced Apollo Client configuration to add to your existing client.js
// Add this to your InMemoryCache configuration

// File path: src/apollo/client.js (enhancement to existing cache config)

const enhancedCacheConfig = {
    typePolicies: {
        Query: {
            fields: {
                // Handle cursor-based pagination
                getTransactions: {
                    keyArgs: false,
                    merge(existing = [], incoming) {
                        return [...existing, ...incoming];
                    },
                },
                // Cache user data
                getUser: {
                    merge: true,
                },
                // ENHANCED: Cache verification status with 5-minute TTL
                getShuftiRefPayload: {
                    merge: true,
                    read(existing, { cache, readField }) {
                        // Cache for 5 minutes (300 seconds)
                        if (existing && existing.__timestamp) {
                            const now = Date.now();
                            const age = now - existing.__timestamp;
                            const maxAge = 5 * 60 * 1000; // 5 minutes in milliseconds

                            if (age < maxAge) {
                                console.log(
                                    "📦 Using cached verification status (age: " +
                                        Math.round(age / 1000) +
                                        "s)",
                                );
                                return existing;
                            } else {
                                console.log(
                                    "⏰ Verification status cache expired, will fetch fresh data",
                                );
                                return undefined; // Force fresh fetch
                            }
                        }
                        return existing;
                    },
                },
            },
        },
        ShuftiRefPayload: {
            fields: {
                // Add timestamp to track cache age
                __timestamp: {
                    read() {
                        return Date.now();
                    },
                },
            },
        },
    },
    // Enhanced cache retention policy
    possibleTypes: {},
    dataIdFromObject: (object) => {
        // Better cache key generation
        switch (object.__typename) {
            case "ShuftiRefPayload":
                return `ShuftiRefPayload:${object.userId}`;
            case "User":
                return `User:${object.id}`;
            default:
                return object.id ? `${object.__typename}:${object.id}` : null;
        }
    },
};

export default client;
