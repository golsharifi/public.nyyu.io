import React, { Suspense, lazy } from "react";
import { navigate } from "gatsby";
import { Router } from "@reach/router";
import Loading from "../../components/common/Loading";
import AlarmModal from "./../../components/admin/AlarmModal";
import { isBrowser } from "../../utilities/auth";
import { getCookie, NDB_Privilege, NDB_Admin } from "../../utilities/cookies";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../utilities/routes";

const Dashboard = lazy(() => import("./../../subPages/admin/dashboard"));
const Rounds = lazy(() => import("./../../subPages/admin/rounds"));
const Approval = lazy(() => import("./../../subPages/admin/approval"));
const Users = lazy(() => import("./../../subPages/admin/users"));
const Airdrop = lazy(() => import("./../../subPages/admin/airdrop"));
const Setting = lazy(() => import("./../../subPages/admin/setting"));
const CreateAuction = lazy(
    () => import("./../../subPages/admin/create/create-auction"),
);
const CreateDirectPurchase = lazy(
    () => import("./../../subPages/admin/create/create-direct-purchase"),
);
const CreateUser = lazy(
    () => import("./../../subPages/admin/create/create-user"),
);
const CreateUserTier = lazy(
    () => import("./../../subPages/admin/create/create-userTier"),
);
const CreateAvatar = lazy(
    () => import("./../../subPages/admin/create/create-avatar"),
);
const CustomizeAvatar = lazy(
    () => import("./../../subPages/admin/create/customize-avatar"),
);
const CreateEmail = lazy(
    () => import("./../../subPages/admin/create/create-email"),
);
const CreateToken = lazy(
    () => import("./../../subPages/admin/create/create-token"),
);
const CreateGeoLocation = lazy(
    () => import("./../../subPages/admin/create/create-geo-location"),
);
const NotFound = lazy(() => import("./../404"));

const App = () => {
    const isAdmin = getCookie(NDB_Privilege) === NDB_Admin;
    const auth = useAuth();

    // Use auth.authState.isAuthenticated instead of auth.isAuthenticated
    if (
        !auth?.authState?.isAuthenticated &&
        isBrowser &&
        window.location.pathname !== ROUTES.signIn
    ) {
        navigate(ROUTES.signIn, { replace: true });
        return null;
    }

    if (isAdmin) {
        return (
            <>
                {isBrowser && (
                    <Suspense fallback={<Loading />}>
                        <Router basepath="admin">
                            <Dashboard path="/" />
                            <Rounds path="/rounds" />
                            <Users path="/users" />
                            <Approval path="/approval" />
                            <Airdrop path="/airdrop" />
                            <Setting path="/setting" />
                            <CreateAuction path="/create/auction" />
                            <CreateDirectPurchase path="/create/direct-purchase" />
                            <CreateUser path="/create/user" />
                            <CreateUserTier path="/create/user-tier" />
                            <CreateAvatar path="/create/avatar" />
                            <CustomizeAvatar path="/create/customize-avatar" />
                            <CreateEmail path="/create/email" />
                            <CreateToken path="/create/token" />
                            <CreateGeoLocation path="/create/geo-location" />
                            <Loading path="/loading" />
                            <NotFound default />
                        </Router>
                    </Suspense>
                )}
                <AlarmModal />
            </>
        );
    } else {
        return (
            <div>
                <h1>Access Denied</h1>
                <p>You don't have permission to access this area.</p>
            </div>
        );
    }
};

export default App;
