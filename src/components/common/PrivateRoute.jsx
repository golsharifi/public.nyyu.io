import React, { useEffect, useState } from "react";
import { navigate } from "gatsby";
import { isBrowser } from "../../utilities/auth";
import { useAuth } from "../../hooks/useAuth";

const PrivateRoute = ({ component: Component, location, ...rest }) => {
    const auth = useAuth();
    const [isReady, setIsReady] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        console.log("🛡️ PrivateRoute mounted");
        console.log("🔐 Auth object:", auth);
        console.log("🔐 Auth initialized:", auth?.initialized);

        // Wait for auth to be initialized
        if (!auth?.initialized) {
            console.log("⏳ Waiting for auth to initialize...");
            return;
        }

        const checkAuthAndDecide = () => {
            // Use auth.authState.isAuthenticated instead of auth.isAuthenticated
            const isAuthenticated = auth.authState?.isAuthenticated;
            console.log("🛡️ PrivateRoute final auth check:");
            console.log("🔐 isAuthenticated result:", isAuthenticated);
            console.log("🔐 Auth state:", auth.authState);
            console.log(
                "📍 Current path:",
                isBrowser ? window.location.pathname : "SSR",
            );

            setIsReady(true);

            // Don't redirect if we're on a valid app route and recently logged in
            const isAppRoute =
                isBrowser && window.location.pathname.startsWith("/app/");
            const recentlyLoggedIn =
                isBrowser && localStorage.getItem("ACCESS_TOKEN");

            if (
                !isAuthenticated &&
                isBrowser &&
                window.location.pathname !== `/app/signin/`
            ) {
                // Add extra delay if we think user might have just logged in
                if (recentlyLoggedIn && isAppRoute) {
                    console.log(
                        "⏳ Recently logged in, waiting longer before redirect...",
                    );
                    setTimeout(() => {
                        // Use auth.authState.isAuthenticated for recheck too
                        const recheckAuth = auth.authState?.isAuthenticated;
                        if (!recheckAuth) {
                            console.log(
                                "❌ Still not authenticated after recheck - redirecting to signin",
                            );
                            navigate(`/app/signin/`, { replace: true });
                            setShouldRender(false);
                        } else {
                            console.log(
                                "✅ Auth confirmed on recheck - allowing render",
                            );
                            setShouldRender(true);
                        }
                    }, 2000);
                    return;
                }

                console.log("❌ Not authenticated - redirecting to signin");
                console.log("🎯 Redirecting from:", window.location.pathname);
                navigate(`/app/signin/`, { replace: true });
                setShouldRender(false);
            } else {
                console.log(
                    "✅ Authentication check passed - rendering component",
                );
                setShouldRender(true);
            }
        };

        // Small delay to ensure auth state is stable
        const timeoutId = setTimeout(checkAuthAndDecide, 100);

        return () => clearTimeout(timeoutId);
    }, [auth?.initialized, auth?.authState?.isAuthenticated]);

    // Force re-check when auth state changes
    useEffect(() => {
        if (auth?.initialized && auth?.authState?.forceCounter) {
            console.log("🔄 Auth state force counter changed, re-checking...");
            // Use auth.authState.isAuthenticated instead of auth.isAuthenticated
            const isAuthenticated = auth.authState?.isAuthenticated;

            if (
                !isAuthenticated &&
                isBrowser &&
                window.location.pathname !== `/app/signin/`
            ) {
                console.log("❌ Force check: Not authenticated - redirecting");
                navigate(`/app/signin/`, { replace: true });
                setShouldRender(false);
            } else {
                console.log("✅ Force check: Authenticated - allowing render");
                setShouldRender(true);
            }
        }
    }, [auth?.authState?.forceCounter, auth?.authState?.isAuthenticated]);

    // Don't render anything until auth is ready and we've made a decision
    if (!isReady) {
        console.log("⏳ PrivateRoute: Not ready, showing nothing");
        return null;
    }

    if (!shouldRender) {
        console.log("❌ PrivateRoute: Should not render");
        return null;
    }

    console.log("✅ PrivateRoute: Rendering protected component");
    return <Component {...rest} />;
};

export default PrivateRoute;
