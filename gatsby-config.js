// gatsby-config.js
require("dotenv").config({
    path: `.env.${process.env.NODE_ENV}`,
});

// Validate required environment variables
const requiredEnvVars = ["GATSBY_SITE_URL", "GATSBY_API_BASE_URL"];

const missingEnvVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
);

if (missingEnvVars.length > 0) {
    console.error(
        "❌ Missing required environment variables:",
        missingEnvVars.join(", "),
    );
    console.error(
        "Please create a .env.development or .env.production file with the required variables.",
    );
    console.error("See .env.example for reference.");

    if (process.env.NODE_ENV === "production") {
        process.exit(1); // Fail build in production
    }
}

// Enhanced site metadata with OAuth support
const siteMetadata = {
    title: `NYYU`,
    description: `The NDB token pre-sale: NDB token will help you gain access to the NDB Ecosystem and allows the acquisition of some of its utilities, such as NFTs.`,
    author: `@nyyu`,
    siteUrl: process.env.GATSBY_SITE_URL || `https://nyyu.io`,
    // OAuth-specific metadata
    oauth: {
        redirectUri: `${process.env.GATSBY_SITE_URL}/oauth2/redirect`,
        mobileRedirectUri:
            process.env.GATSBY_MOBILE_REDIRECT_URI || "nyyu://oauth/callback",
        supportedProviders: ["google", "linkedin", "amazon"],
    },
    // API configuration
    api: {
        baseUrl: process.env.GATSBY_API_BASE_URL,
        version: "v1",
    },
};

module.exports = {
    siteMetadata,
    plugins: [
        // Enhanced Google Analytics with GDPR compliance and OAuth tracking
        {
            resolve: `gatsby-plugin-google-gtag`,
            options: {
                trackingIds: [
                    process.env.GATSBY_GA_TRACKING_ID || "UA-239898697-1",
                    process.env.GATSBY_GTM_ID || "GTM-T3PBD6T",
                ],
                pluginConfig: {
                    head: false,
                    respectDNT: true,
                    exclude: [
                        "/preview/**",
                        "/do-not-track/me/too/",
                        "/oauth2/**",
                    ],
                },
                gtagConfig: {
                    anonymize_ip: true,
                    cookie_expires: 0,
                    // Enhanced OAuth event tracking
                    custom_map: {
                        oauth_provider: "oauth_provider",
                        oauth_success: "oauth_success",
                        oauth_error: "oauth_error",
                    },
                },
            },
        },

        // Enhanced Google Tag Manager with OAuth events
        {
            resolve: `gatsby-plugin-google-tagmanager`,
            options: {
                id: process.env.GATSBY_GTM_ID || "GTM-T3PBD6T",
                includeInDevelopment: false,
                defaultDataLayer: {
                    platform: "gatsby",
                    oauth_enabled: true,
                    supported_providers: siteMetadata.oauth.supportedProviders,
                },
                routeChangeEventName: "gatsby-route-change",
                enableWebVitalsTracking: true,
            },
        },

        // Essential plugins
        `gatsby-plugin-react-helmet`,
        `gatsby-plugin-styled-components`,
        `gatsby-plugin-image`,

        // File system source
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `images`,
                path: `${__dirname}/src/images`,
            },
        },

        // Image processing
        `gatsby-transformer-sharp`,
        `gatsby-plugin-sharp`,

        // Enhanced PWA manifest with OAuth support
        {
            resolve: `gatsby-plugin-manifest`,
            options: {
                name: `NYYU - NDB Token Pre-sale`,
                short_name: `NYYU`,
                start_url: `/`,
                background_color: `#1a1a1a`,
                theme_color: `#23c865`,
                display: `standalone`,
                icon: `src/images/favicon.png`,
                cache_busting_mode: "query",
                include_favicon: true,
                legacy: true,
                theme_color_in_head: false,
                crossOrigin: `use-credentials`,
                icon_options: {
                    purpose: `any maskable`,
                },
                // Enhanced for mobile OAuth
                categories: ["finance", "business"],
                lang: "en",
                orientation: "portrait-primary",
                // Custom mobile OAuth handling
                custom: {
                    oauth_redirect_scheme:
                        process.env.GATSBY_MOBILE_DEEP_LINK_SCHEME || "nyyu",
                },
            },
        },

        // SASS support
        `gatsby-plugin-sass`,

        // Enhanced sitemap with OAuth pages excluded
        {
            resolve: `gatsby-plugin-sitemap`,
            options: {
                excludes: [
                    `/oauth2/**`,
                    `/admin/**`,
                    `/app/verify-failed/**`,
                    `/app/signin/**`,
                    `/app/signup/**`,
                ],
                query: `
                    {
                        allSitePage {
                            nodes {
                                path
                            }
                        }
                    }
                `,
                serialize: ({ path }) => ({
                    url: path,
                    changefreq: path === "/" ? "daily" : "weekly",
                    priority: path === "/" ? 1.0 : 0.7,
                }),
            },
        },

        // Robots.txt with OAuth paths
        {
            resolve: `gatsby-plugin-robots-txt`,
            options: {
                host: process.env.GATSBY_SITE_URL,
                sitemap: `${process.env.GATSBY_SITE_URL}/sitemap-index.xml`,
                policy: [
                    {
                        userAgent: "*",
                        allow: "/",
                        disallow: [
                            "/oauth2/",
                            "/admin/",
                            "/app/signin/",
                            "/app/signup/",
                        ],
                    },
                ],
            },
        },

        // Bundle analyzer (development only)
        process.env.ANALYZE && {
            resolve: "gatsby-plugin-webpack-bundle-analyser-v2",
            options: {
                analyzerMode: "server",
                analyzerPort: "8001",
                defaultSizes: "gzip",
            },
        },
    ].filter(Boolean), // Remove falsy plugins

    // Enhanced flags for better performance and OAuth support
    flags: {
        FAST_DEV: true,
        FAST_REFRESH: true,
        PRESERVE_FILE_DOWNLOAD_CACHE: true,
        PARALLEL_SOURCING: true,
        LMDB_STORE: true,
        // Disable SSR for OAuth pages to avoid hydration issues
        DEV_SSR: false,
    },

    // Enhanced development server configuration
    developMiddleware: (app) => {
        // Add CORS headers for OAuth development
        app.use((req, res, next) => {
            if (req.path.startsWith("/oauth2/")) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header(
                    "Access-Control-Allow-Methods",
                    "GET, POST, OPTIONS",
                );
                res.header(
                    "Access-Control-Allow-Headers",
                    "Content-Type, Authorization",
                );
            }
            next();
        });
    },

    // GraphQL type definitions for OAuth
    graphqlTypegen: {
        generateOnBuild: true,
        typesOutputPath: `src/types/gatsby-types.d.ts`,
    },
};
