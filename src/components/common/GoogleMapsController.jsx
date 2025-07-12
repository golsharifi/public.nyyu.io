import { useEffect } from "react";

const GoogleMapsController = () => {
    useEffect(() => {
        // Simple but effective Google Maps management
        const manageGoogleMaps = () => {
            // Get API key
            const apiKey = process.env.GATSBY_GOOGLE_MAPS_API_KEY;

            console.log("🗺️ Google Maps Controller Debug:", {
                hasKey: !!apiKey,
                keyPreview: apiKey
                    ? `${apiKey.substring(0, 10)}***`
                    : "undefined",
                environment: process.env.NODE_ENV,
            });

            // Remove any existing Google Maps scripts
            const existingScripts = document.querySelectorAll(
                'script[src*="maps.googleapis.com"]',
            );
            console.log(
                `🧹 Removing ${existingScripts.length} existing Google Maps scripts`,
            );
            existingScripts.forEach((script) => {
                console.log(`🗑️ Removing script:`, script.src);
                script.remove();
            });

            // Clean up Google Maps objects
            if (window.google) {
                console.log("🧹 Cleaning up Google Maps objects");
                delete window.google;
            }

            // Only proceed if we have a valid API key
            if (!apiKey || apiKey === "undefined" || apiKey.trim() === "") {
                console.warn(
                    "❌ Google Maps API key not found. Skipping Google Maps.",
                );
                return;
            }

            // Validate API key format
            if (!apiKey.startsWith("AIza")) {
                console.error("❌ Invalid Google Maps API key format!");
                return;
            }

            console.log("✅ Loading Google Maps with valid API key...");

            // Load Google Maps script
            setTimeout(() => {
                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
                script.async = true;
                script.defer = true;
                script.id = "google-maps-script";

                script.onload = () => {
                    console.log("✅ Google Maps loaded successfully!");
                };

                script.onerror = (error) => {
                    console.error("❌ Google Maps failed to load:", error);
                };

                document.head.appendChild(script);
            }, 100);
        };

        // Run when DOM is ready
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", manageGoogleMaps);
        } else {
            manageGoogleMaps();
        }

        // Monitor for bad scripts
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (
                        node.tagName === "SCRIPT" &&
                        node.src &&
                        node.src.includes("maps.googleapis.com") &&
                        node.src.includes("key=undefined")
                    ) {
                        console.warn(
                            "🚫 Blocking bad Google Maps script:",
                            node.src,
                        );
                        node.remove();
                    }
                });
            });
        });

        observer.observe(document.head, { childList: true });

        return () => observer.disconnect();
    }, []);

    return null;
};

export default GoogleMapsController;
