import React from "react";
import {
    Facebook,
    Amazon,
    Google,
    Linkedin,
    Apple,
    Twitter,
    Coinbase,
    MetaMask,
    TrustWallet,
    WalletConnect,
} from "./imgImport";
import { ROUTES } from "./routes";

// Enhanced environment variable handling with fallbacks
const getEnvVar = (varName, fallback = "") => {
    const value = process.env[varName];
    if (!value && process.env.NODE_ENV === "development") {
        console.warn(
            `⚠️ Environment variable ${varName} is not set. Using fallback: ${fallback}`,
        );
    }
    return value || fallback;
};

export const BINANCE_API_KEY = getEnvVar(
    "GATSBY_BINANCE_API_KEY",
    "qApI1beZsgoaiHpgbM2S1wMF83cYwRE5PEaFGp7urj6fzxv0RHfGbxZ0LRgY0582",
);
const API_BASE_URL = process.env.GATSBY_API_BASE_URL;

// Enhanced OAuth redirect URI with mobile support
// Enhanced OAuth redirect URI with proper environment variable handling
const getSiteUrl = () => {
    // First priority: GATSBY_SITE_URL environment variable
    if (process.env.GATSBY_SITE_URL) {
        return process.env.GATSBY_SITE_URL;
    }

    // Second priority: browser window (for client-side)
    if (typeof window !== "undefined") {
        return `${window.location.protocol}//${window.location.host}`;
    }

    // Third priority: fallback based on environment
    if (process.env.NODE_ENV === "production") {
        // In production, we should always have GATSBY_SITE_URL set
        console.error(
            "❌ GATSBY_SITE_URL must be set in production environment!",
        );
        console.error(
            "Please add GATSBY_SITE_URL=https://your-domain.com to your production environment variables",
        );

        // Use GATSBY_PRODUCTION_URL as backup if available
        return getEnvVar("GATSBY_PRODUCTION_URL", "http://localhost");
    }

    // Development fallback - use environment variable or default
    return getEnvVar("GATSBY_DEV_URL", "http://localhost:4000");
};

export const OAUTH2_REDIRECT_URI = `${getSiteUrl()}/oauth2/redirect`;

// Mobile OAuth redirect URI for Flutter/React Native apps
export const MOBILE_OAUTH_REDIRECT_URI = getEnvVar(
    "GATSBY_MOBILE_REDIRECT_URI",
    "nyyu://oauth/callback",
);

// OAuth providers scope configuration
const getOAuthScope = (provider) => {
    const scopes = {
        google: "email profile",
        linkedin: "r_liteprofile r_emailaddress", // Updated for LinkedIn v2 API - FIXED
        amazon: "profile", // Amazon uses 'profile' which includes email
        apple: "email name", // Apple scopes
        twitter: "users.read tweet.read", // Twitter API v2 scopes
        facebook: "email public_profile", // Facebook scopes
    };

    return scopes[provider] || "email profile";
};

// Generate secure state parameter for OAuth
const generateStateParameter = () => {
    if (
        typeof window !== "undefined" &&
        window.crypto &&
        window.crypto.getRandomValues
    ) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0].toString(36);
    }
    return Math.random().toString(36).substring(2, 15);
};

// Enhanced OAuth URL creation
export const createOAuthURL = (provider, isMobile = false) => {
    if (!API_BASE_URL) {
        console.error("API_BASE_URL is not configured");
        return null;
    }

    const redirectUri = isMobile
        ? MOBILE_OAUTH_REDIRECT_URI
        : OAUTH2_REDIRECT_URI;
    const baseUrl = `${API_BASE_URL}/oauth2/authorize/${provider}`;

    const params = new URLSearchParams({
        redirect_uri: redirectUri,
        response_type: "code",
        scope: getOAuthScope(provider), // Use provider-specific scope
        state: generateStateParameter(),
        ...(isMobile && { mobile: "true" }),
    });

    return `${baseUrl}?${params.toString()}`;
};

// Detect if the request is from a mobile app (not mobile browser)
const isMobileApp = () => {
    if (typeof window === "undefined") return false;

    // Check for actual mobile app interfaces
    const hasFlutterInterface = window.flutter_inappwebview !== undefined;
    const hasReactNativeInterface = window.ReactNativeWebView !== undefined;

    // Check user agent for mobile app indicators
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isFlutterApp = userAgent.includes("flutter");

    // Only return true for actual mobile apps, not mobile browsers
    return hasFlutterInterface || hasReactNativeInterface || isFlutterApp;
};

export const social_links = [
    {
        icon: Google,
        provider: "google",
        to: createOAuthURL("google", isMobileApp()),
        mobileTo: createOAuthURL("google", true),
        name: "Google",
        clientId: getEnvVar("GATSBY_GOOGLE_CLIENT_ID"),
    },
    {
        icon: Linkedin,
        provider: "linkedin",
        to: createOAuthURL("linkedin", isMobileApp()),
        mobileTo: createOAuthURL("linkedin", true),
        name: "LinkedIn",
        clientId: getEnvVar("GATSBY_LINKEDIN_CLIENT_ID"),
    },
    {
        icon: Amazon,
        provider: "amazon",
        to: createOAuthURL("amazon", isMobileApp()),
        mobileTo: createOAuthURL("amazon", true),
        name: "Amazon",
        clientId: getEnvVar("GATSBY_AMAZON_CLIENT_ID"),
    },

    {
        icon: Apple,
        provider: "apple",
        to: createOAuthURL("apple", isMobileApp()),
        mobileTo: createOAuthURL("apple", true),
        name: "Apple",
        clientId: getEnvVar("GATSBY_APPLE_CLIENT_ID"),
    },
    {
        icon: Twitter,
        provider: "twitter",
        to: createOAuthURL("twitter", isMobileApp()),
        mobileTo: createOAuthURL("twitter", true),
        name: "Twitter",
        clientId: getEnvVar("GATSBY_TWITTER_CLIENT_ID"),
    },

    {
        icon: Facebook,
        provider: "facebook",
        to: createOAuthURL("facebook", isMobileApp()),
        mobileTo: createOAuthURL("facebook", true),
        name: "Facebook",
        clientId: getEnvVar("GATSBY_FACEBOOK_CLIENT_ID"),
    },
];

export const passwordValidatorOptions = {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
    returnScore: false,
    pointsPerUnique: 1,
    pointsPerRepeat: 0.5,
    pointsForContainingLower: 10,
    pointsForContainingUpper: 10,
    pointsForContainingNumber: 10,
    pointsForContainingSymbol: 10,
};

export const COLOR_LOAD = "#ffffff";
export const COLOR_ON = "#23c865";
export const COLOR_OFF = "#626161";

export const INFURA_ID = getEnvVar(
    "GATSBY_INFURA_ID",
    "b3926273acc243d1ab72dfe9f2be8539",
);

// Google Maps API Configuration
export const GOOGLE_MAPS_API_KEY = getEnvVar(
    "GATSBY_GOOGLE_MAPS_API_KEY",
    "", // Empty fallback - will show warning but won't break
);

// Add validation for Google Maps
export const isGoogleMapsConfigured = () => {
    return !!GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== "";
};

// Updated wallet mappings to match Wagmi v2 connector IDs
export const wallets = {
    // MetaMask connector ID in Wagmi v2
    metaMask: {
        icon: MetaMask,
        desc: "Connect to your MetaMask wallet",
        warn: "MetaMask is not supported by your Browser",
        short: "MetaMask Wallet",
    },
    // Legacy support for old connector ID
    metmask: {
        icon: MetaMask,
        desc: "Connect to your MetaMask wallet",
        warn: "MetaMask is not supported by your Browser",
        short: "MetaMask Wallet",
    },
    // WalletConnect connector ID in Wagmi v2
    walletConnect: {
        icon: WalletConnect,
        desc: "Scan with WalletConnect to connect",
        warn: "WalletConnect is not supported",
        short: "WalletConnect Wallet",
    },
    // Coinbase Wallet connector ID in Wagmi v2
    coinbaseWallet: {
        icon: Coinbase,
        desc: "Connect to your Coinbase Account",
        warn: "Coinbase Account is not supported",
        short: "CoinBase Wallet",
    },
    // Legacy support for old connector ID
    coinbase: {
        icon: Coinbase,
        desc: "Connect to your Coinbase Account",
        warn: "Coinbase Account is not supported",
        short: "CoinBase Wallet",
    },
    // Trust Wallet (still handled manually)
    trustWallet: {
        icon: TrustWallet,
        desc: "Connect to your Trust wallet",
        warn: "Trust wallet is only supported on Mobile",
        short: "TrustWallet",
    },
    // Additional mappings for connector names (fallback)
    MetaMask: {
        icon: MetaMask,
        desc: "Connect to your MetaMask wallet",
        warn: "MetaMask is not supported by your Browser",
        short: "MetaMask Wallet",
    },
    WalletConnect: {
        icon: WalletConnect,
        desc: "Scan with WalletConnect to connect",
        warn: "WalletConnect is not supported",
        short: "WalletConnect Wallet",
    },
    "Coinbase Wallet": {
        icon: Coinbase,
        desc: "Connect to your Coinbase Account",
        warn: "Coinbase Account is not supported",
        short: "CoinBase Wallet",
    },
};

export const externalWallets = [
    {
        icon: MetaMask,
        title: "MetaMask Wallet",
        value: "metamask",
    },
    {
        icon: WalletConnect,
        title: "WalletConnect",
        value: "wallet_connect",
    },
    {
        icon: Coinbase,
        title: "Coinbase account",
        value: "coinbase_account",
    },
    {
        icon: TrustWallet,
        title: "Trust Wallet",
        value: "trust_wallet",
    },
];

export const profile_tabs = [
    {
        value: "account details",
        label: "ACCOUNT DETAILS",
        index: 0,
    },
    {
        value: "notifications",
        label: "NOTIFICATIONS",
        index: 1,
    },
    {
        value: "connect wallet",
        label: "CONNECT WALLET",
        index: 2,
    },
    {
        value: "sign out",
        label: "SIGN OUT",
        index: 3,
    },
];

export const recentNotifications = [
    {
        status: true,
        act: "Failla.987 Placed a higher bid ",
    },
    {
        status: false,
        act: "Round 2 has just started",
    },
    {
        status: false,
        act: "round 1 ended",
    },
    {
        status: false,
        act: "Token has pumped in 23% since your last bid",
    },
    {
        status: true,
        act: "There are only 40 tokens left",
    },
];

export const Currencies = [
    {
        id: 0,
        label: "USD",
        value: "USD",
        symbol: "$",
    },
    {
        id: 1,
        label: "EUR",
        value: "EUR",
        symbol: "€",
    },
    {
        id: 2,
        label: "GBP",
        value: "GBP",
        symbol: "£",
    },
    {
        id: 3,
        label: "INR",
        value: "INR",
        symbol: "₹",
    },
    {
        id: 4,
        label: "SEK",
        value: "SEK",
        symbol: "KR",
    },
    {
        id: 5,
        label: "RUB",
        value: "RUB",
        symbol: "₽",
    },
    {
        id: 6,
        label: "CHF",
        value: "CHF",
        symbol: "CHF",
    },
];

export const TRANSACTION_TYPES = {
    deposit: "DEPOSIT",
    withdraw: "WITHDRAW",
};

export const PAYMENT_FRACTION_TOOLTIP_CONTENT =
    "If your bid is the last one to be accepted and there are not enough tokens to fulfil your order, by checking this box you allow us to complete your order with the remaining tokens only.";

export const TWO_FACTOR_AUTH_TOOLTIP_CONTENT =
    "Enable 2FA to secure your account. Email 2FA can be used along with mobile or Google authentication.";

export const AUCTION_TOOLTIP_CONTENT1 =
    "You can easily move between rounds to have a more clear understanding about auction statistics.";

export const AUCTION_TOOLTIP_CONTENT2 =
    "Access charts to see more detailed information about NDB token performance";

export const NDB_WALLET_TOOLTIP_CONTENT =
    "The balance will be available under the wallet page";
export const EXTERNAL_WALLET_TOOLTIP_CONTENT =
    "The balance will be transferred to your external wallet. Fees may be applicable.";

export const FAQ_CONTENT = [
    {
        question: "What is the Dual Token System?",
        answer: (
            <p>
                The Dual Token System combines two tokens, the NDB token, a
                fixed supply token, and the Volt Token, a variable supply token.
                The Dual token brings more incentives to the users and partners.
                For example, with this method we can provide to our partners
                more accurate measurements of the interest in their companies by
                utilizing our services and products from their customer’s
                perspective.
            </p>
        ),
    },
    {
        question: "What is Volt Token?",
        answer: (
            <p>
                The Volt token is the driving force behind the applications and
                interacts with NDB token. These tokens will be of variable
                supply, burnable and mintable and serve to power its
                applications. Through Volt token, the users will have the
                possibility to lease and access benefits from our products.
                Furthermore, the token can be used as an energy tracker for
                utility providers and consumers to earn rewards. There are also
                plans for this token to be used as a form of energy payment in
                the future.
            </p>
        ),
    },
    {
        question: "What is the NDB token?",
        answer: (
            <p>
                The NDB token is a tool for demonstrating the buyer’s interests
                in the partnership between companies inside our ecosystem. The
                inclusion of new proposals into our blockchain ecosystem enables
                people to stake their NDB tokens and support the project,
                company, or individuals. By staking NDB tokens on different
                Pools, you can earn dividends as Volt tokens over the staked
                amount.
            </p>
        ),
    },
    {
        question: "What is Airdrop?",
        answer: (
            <p>
                Our Airdrop function is the initial incentive for people to
                stake their NDB tokens into the Pools. The Airdrop will come as
                a reward for the interaction between the Pool entity and our
                products and services. As the ecosystem grows, more features
                will be announced, guaranteeing advantages on-chain and
                off-chain for the user’s interaction with specific Pools.
            </p>
        ),
    },
    {
        question: "What are the pools?",
        answer: (
            <p>
                Pools are the mechanism used for the token to gather and measure
                intention from users and organizations for us and our partners.
                The Pools act as quantifiers for value and will play an
                essential role in the early stages.
            </p>
        ),
    },
    {
        question: "What is the relationship between both tokens?",
        answer: (
            <p>
                NDB token interacts with Volt, both of which price-wise,
                interact freely on the open market. The interaction of NDB and
                Volt tokens will maintain the interest of users in the
                ecosystem, and create economic checks and balances to regulate
                the demand for tokens.
            </p>
        ),
    },
    {
        question: "What is the NDB Hub?",
        answer: (
            <p>
                NDB Hub is an institution governed by Voltamond SA based in
                Switzerland tasked with assessing and putting forward growth
                proposals related to energy applications. It is also responsible
                for maintaining and safeguarding the best interests of this
                project through oversight on maintaining developers, seeking
                feedback from the community, and searching for product
                improvement where needed. It will assess and seek potential
                partners that support the growth of the ecosystem. This
                initiative is the primary organization through which the NDB and
                Volt token operate.
            </p>
        ),
    },
    {
        question: "How can I earn more tokens?",
        answer: (
            <p>
                You can stake your NDB tokens on the different categories of
                Pools, to earn dividends as Volt tokens based on the staked
                value. In addition to that, you should bear in mind that
                NDB-powered devices constantly generate energy. That is why,
                when you have a device containing our products, you can earn
                Volt tokens for the unused energy sent to the grid when the
                device is inactive.
            </p>
        ),
    },
    {
        question: "How to send tokens to external sources?",
        answer: (
            <p>
                The in-built function of NDB App will allow users to move their
                tokens to private external wallets, or you can keep your tokens
                in custodian parties like crypto exchanges.
            </p>
        ),
    },
    {
        question:
            "Can I stake my NDB tokens without having an account on the NDB App?",
        answer: (
            <p>
                Safety and security of users of our platform is one of the top
                priorities for NDB. That is why, before you stake NDB tokens
                into a Pool of any kind, you must submit the required documents
                for the KYC process from our App.
            </p>
        ),
    },
    {
        question: "Which protocol are the tokens using?",
        answer: (
            <p>
                The NDB token is created in IBEP-20 protocol using the Binance
                Smart Chain network.
            </p>
        ),
    },
    {
        question: "Can I charge my devices with NDB token?",
        answer: (
            <p>
                No, NDB token serves as a tool to demonstrate the buyer’s
                interest in the partnership between companies inside the NDB
                ecosystem, but you can stake your NDB tokens to earn Volt. With
                Volt tokens you can lease and access benefits from NDB’s
                products.
            </p>
        ),
    },
];

export const NEWS_CONTENT = [
    {
        question: "What is the Dual Token System?",
        date: "17.01.2022",
        answer: (
            <p>
                The Dual Token System combines two tokens, the NDB token, a
                fixed supply token, and the Volt Token, a variable supply token.
                The Dual token brings more incentives to the users and partners.
                For example, with this method we can provide to our partners
                more accurate measurements of the interest in their companies by
                utilizing our services and products from their customer’s
                perspective.
            </p>
        ),
    },
    {
        question: "Latest NDB news",
        date: "08.01.2022",
        answer: <p></p>,
    },
    {
        question: "Latest activities",
        date: "26.12.2021",
        answer: <p></p>,
    },
    {
        question: "API updates",
        date: "19.12.2021",
        answer: <p></p>,
    },
    {
        question: "Crypto airdrop",
        date: "12.12.2021",
        answer: <p></p>,
    },
];

export const NDB_TOKEN_CONTENT = `Since the beginning of NDB’s project the vision is to provide clean green technologies to the world. The NDB token is not a security token nor does it represent any shares of NDB SA.

By using NDB token you will be able to contribute to the development of our technologies and our vision. We plan to expand our ecosystem to multiple areas including deep space exploration, sustainable fashion, quantum computing, and more. 
`;

export const VerificationDocumentTypes = [
    {
        label: "Passport",
        value: "passport",
    },
    {
        label: "National Identification Card",
        value: "id_card",
    },
    {
        label: "Driving License",
        value: "driving_license",
    },
];

export const VerificationStepThreeDocumentTypes = [
    {
        label: "National Identification Card",
        value: "id_card",
    },
    {
        label: "Driving license",
        value: "driving_license",
    },
    {
        label: "Employer letter",
        value: "employer_letter",
    },
    {
        label: "Rent agreement",
        value: "rent_agreement",
    },
    {
        label: "Utility bill",
        value: "utility_bill",
    },
    {
        label: "Tax bill",
        value: "tax_bill",
    },
    {
        label: "Bank statement",
        value: "bank_statement",
    },
];

export const navigationLinks = [
    {
        label: "Nyyu",
        url: "/",
        active: true,
        subMenu: [
            {
                label: "Wallet",
                url: ROUTES.wallet,
            },
            {
                label: "Sale",
                url: ROUTES.auction,
            },
            {
                label: "Profile",
                url: ROUTES.profile,
            },
            {
                label: "Support",
                url: ROUTES.faq,
            },
            {
                label: "Invite & Earn",
                url: ROUTES.referral,
            },
        ],
    },
    {
        label: "Wallet",
        url: ROUTES.wallet,
        active: false,
    },
    {
        label: "Sale",
        url: ROUTES.auction,
        active: false,
    },
    {
        label: "Profile",
        url: ROUTES.profile,
        active: false,
    },
    {
        label: "Invite & Earn",
        url: ROUTES.referral,
        active: false,
    },
    {
        label: "Support",
        url: ROUTES.faq,
        active: false,
    },
];

//     {
//         label: "Money",
//         url: "https://ndb.money/",
//         active: false,
//     },
//     {
//         label: "City",
//         url: "https://ndb.city",
//         active: false,
//     },
//     {
//         label: "Watt",
//         url: "https://watt.green/",
//         active: false,
//     },
//     {
//         label: "Charenji",
//         url: "https://charenji.me/",
//         active: false,
//     },
// ];

export const footerLinks = [
    {
        label: "Fee",
        url: "https://docs.nyyu.io/docs/services/fees",
    },
    {
        label: "Bug bounty",
        url: "https://docs.nyyu.io/docs/services/bug-bounty",
    },
    {
        label: "Apply for listings",
        url: "https://docs.nyyu.io/docs/services/token-listing",
    },
    {
        label: "Launchpad",
        url: "https://docs.nyyu.io/docs/services/startup-listing",
    },
    {
        label: "Terms of use",
        url: "https://docs.nyyu.io/docs/corporate/terms-of-use",
    },
    {
        label: "Privacy policy",
        url: "https://docs.nyyu.io/docs/corporate/privacy-policy",
    },
    {
        label: "AML policy",
        url: "https://docs.nyyu.io/docs/corporate/aml-cft",
    },
    {
        label: "About us",
        url: "https://docs.nyyu.io/docs/corporate/about-us",
    },
    {
        label: "Contacts",
        url: "https://docs.nyyu.io/docs/corporate/contact-us",
    },
];

export const Roles = [
    { label: "USER", value: "ROLE_USER" },
    { label: "ADMIN", value: "ROLE_ADMIN" },
];

export const ZendeskURLWithJWT = "https://nyyu.zendesk.com/access/jwt?jwt=";

export const CLIENT_ID =
    "90xX0xMPoYxtLd6CdQFbOtaIZM7E0YHovKao7MnrUlrDIQxqYQ1644914425";
export const SECRET =
    "$2y$10$501VfRCMRXitkUmuHhJCPelM5MYTdvzO3S8qlY319L9bnDdVJp24C";

// Enhanced OAuth utility functions
export const getOAuthUrl = (provider, mobile = false) => {
    const link = social_links.find((l) => l.provider === provider);
    if (!link) {
        console.error(`OAuth provider '${provider}' not found`);
        return null;
    }
    return mobile ? link.mobileTo : link.to;
};

export const isOAuthConfigured = (provider) => {
    const link = social_links.find((l) => l.provider === provider);
    return link && link.clientId;
};

// Enhanced OAuth configuration validation
export const validateOAuthConfig = () => {
    const issues = [];
    const warnings = [];

    // Check core configuration
    if (!API_BASE_URL) {
        issues.push("GATSBY_API_BASE_URL is not configured");
    }

    if (!process.env.GATSBY_SITE_URL) {
        issues.push("GATSBY_SITE_URL is not configured");
    }

    // Check required OAuth providers
    const oauthProviders = [
        { name: "Google", key: "GATSBY_GOOGLE_CLIENT_ID", required: true },
        { name: "LinkedIn", key: "GATSBY_LINKEDIN_CLIENT_ID", required: true },
        { name: "Amazon", key: "GATSBY_AMAZON_CLIENT_ID", required: true },
        { name: "Apple", key: "GATSBY_APPLE_CLIENT_ID", required: false },
        { name: "Twitter", key: "GATSBY_TWITTER_CLIENT_ID", required: false },
        { name: "Facebook", key: "GATSBY_FACEBOOK_CLIENT_ID", required: false },
    ];

    oauthProviders.forEach((provider) => {
        const value = getEnvVar(provider.key, "");
        if (
            !value ||
            value === `your-${provider.name.toLowerCase()}-client-id-here`
        ) {
            if (provider.required) {
                issues.push(`${provider.name} client ID is not configured`);
            } else {
                warnings.push(
                    `${provider.name} client ID is not configured (optional)`,
                );
            }
        }
    });

    // Check Google Maps API
    if (!isGoogleMapsConfigured()) {
        warnings.push("Google Maps API key is not configured");
    }

    // Also check the existing social_links for backward compatibility
    social_links.forEach((link) => {
        if (!link.clientId) {
            const existingIssue = issues.find((issue) =>
                issue.includes(link.name),
            );
            if (!existingIssue) {
                issues.push(`${link.name} client ID is not configured`);
            }
        }
    });

    // Only log if we're in development mode
    if (process.env.NODE_ENV === "development") {
        if (issues.length > 0) {
            console.warn("⚠️ OAuth Configuration Issues:", issues);
        }
        if (warnings.length > 0) {
            console.info("ℹ️ OAuth Configuration Warnings:", warnings);
        }
    }

    return {
        hasIssues: issues.length > 0,
        hasWarnings: warnings.length > 0,
        issues,
        warnings,
        // Keep backward compatibility
        length: issues.length,
        forEach: issues.forEach.bind(issues),
        [Symbol.iterator]: issues[Symbol.iterator].bind(issues),
    };
};

// Mobile OAuth utilities
export const handleMobileOAuth = (provider) => {
    if (!isMobileApp()) {
        window.location.href = getOAuthUrl(provider, false);
        return;
    }

    const mobileUrl = getOAuthUrl(provider, true);

    if (window.flutter_inappwebview) {
        window.flutter_inappwebview.callHandler("openOAuth", {
            url: mobileUrl,
            provider: provider,
        });
    } else if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
            JSON.stringify({
                type: "oauth_request",
                url: mobileUrl,
                provider: provider,
            }),
        );
    } else {
        window.location.href = mobileUrl;
    }
};

export const getProviderDisplayName = (provider) => {
    const providerNames = {
        google: "Google",
        facebook: "Facebook",
        amazon: "Amazon",
        linkedin: "LinkedIn",
        apple: "Apple",
        twitter: "Twitter",
    };

    return providerNames[provider?.toLowerCase()] || provider;
};

export const getProviderIcon = (provider) => {
    const icons = {
        google: Google,
        facebook: Facebook,
        amazon: Amazon,
        linkedin: Linkedin,
        apple: Apple,
        twitter: Twitter,
    };

    return icons[provider?.toLowerCase()] || null;
};

// Export configuration validation on module load
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    validateOAuthConfig();
}
