import React, { Suspense, lazy } from "react";
import { Router } from "@reach/router";
import { navigate } from "gatsby";
import Loading from "../../components/common/Loading";
import { useAuth } from "../../hooks/useAuth";

const Profile = lazy(() => import("../../components/Profile"));
const PrivateRoute = lazy(() => import("../../components/common/PrivateRoute"));
const SignIn = lazy(() => import("../../components/auth/signin"));
const SignUp = lazy(() => import("../../components/auth/signup"));
const VerifyEmail = lazy(() => import("../../components/auth/verify-email"));
const VerifyFailed = lazy(() => import("../../components/auth/verify-failed"));
const ForgotPassword = lazy(
    () => import("../../components/auth/forgot-password"),
);
const NewPassword = lazy(() => import("../../components/auth/new-password"));
const VerifyID = lazy(() => import("../../components/auth/verify-id"));
const VerifyCompany = lazy(
    () => import("../../components/auth/verify-company"),
);
const ChangePassword = lazy(
    () => import("../../components/auth/change-password"),
);
const SelectFigure = lazy(() => import("../../components/auth/select-figure"));
const Wallet = lazy(() => import("../../components/wallet"));
const AuctionWrapper = lazy(
    () => import("../../components/auction/auction-wrapper"),
);
const Payment = lazy(() => import("../../components/payment"));
const Support = lazy(() => import("../../components/Support"));
const Referral = lazy(() => import("../../components/referral"));

const NotFound = lazy(() => import("./../404"));

const AuthRoute = ({ component: Component, location, ...rest }) => {
    const auth = useAuth();

    // Check if user is logged in and redirect immediately
    React.useEffect(() => {
        // Use auth.authState.isAuthenticated instead of auth.isAuthenticated
        if (auth?.authState?.isAuthenticated) {
            console.log(
                "🔄 AuthRoute: User logged in detected, redirecting to wallet",
            );
            navigate(`/app/wallet/`, { replace: true });
        }
    }, [auth?.authState?.isAuthenticated]);

    // Don't render the component if user is logged in (redirect is happening)
    if (auth?.authState?.isAuthenticated) {
        return null;
    }

    return <Component {...rest} />;
};

const App = () => {
    const isSSR = typeof window === "undefined";
    return (
        <>
            {!isSSR && (
                <Suspense fallback={<Loading />}>
                    <Router basepath="app">
                        <AuthRoute path="signin" component={SignIn} />
                        <AuthRoute path="signin/:error" component={SignIn} />
                        <AuthRoute path="signup" component={SignUp} />

                        <AuthRoute
                            path="verify-email/:email"
                            component={VerifyEmail}
                        />

                        <VerifyFailed path="verify-failed" />
                        <SelectFigure path="select-figure" />
                        <NewPassword path="new-password" />
                        <ForgotPassword path="forgot-password" />
                        <ChangePassword path="change-password" />
                        <VerifyID path="verify-id" />
                        <VerifyCompany path="verify-company" />

                        <PrivateRoute path="profile" component={Profile} />
                        <PrivateRoute path="wallet" component={Wallet} />
                        <PrivateRoute
                            path="auction"
                            component={AuctionWrapper}
                        />
                        <PrivateRoute path="payment" component={Payment} />
                        <PrivateRoute path="support" component={Support} />
                        <PrivateRoute path="referral" component={Referral} />

                        <NotFound default />
                    </Router>
                </Suspense>
            )}
        </>
    );
};

export default App;
