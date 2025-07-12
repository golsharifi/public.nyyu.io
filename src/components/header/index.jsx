import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery } from "@apollo/client";
import { Link, navigate } from "gatsby";
import { isBrowser } from "../../utilities/auth";
import { Bell, Logo, NotificationBell } from "../../utilities/imgImport";

import { useAuth } from "../../hooks/useAuth";
import { setCurrentAuthInfo } from "../../store/actions/authAction";
import { fetch_Avatar_Components } from "../../store/actions/avatarAction";

import { navigationLinks, profile_tabs } from "../../utilities/staticData";
import { GET_USER } from "../../apollo/graphqls/querys/Auth";
import { ROUTES, navLinks } from "../../utilities/routes";
import { GET_ALL_UNREAD_NOTIFICATIONS } from "../../apollo/graphqls/querys/Notification";
import {
    setCookie,
    removeCookie,
    NDB_Privilege,
    NDB_Admin,
} from "../../utilities/cookies";
import { fetch_Favor_Assets } from "../../store/actions/settingAction";
import { TWITTER, DISCORD } from "../../utilities/imgImport";
import { logout } from "../../utilities/auth";

// Working components
import Avatar from "../dress-up/avatar";
import UserTier from "./user-tier";

// Safe component imports with fallbacks
let ReactTooltip, InformBannedModal, InformMaintenanceModal;

try {
    ReactTooltip = require("react-tooltip").default || require("react-tooltip");
} catch (e) {
    console.warn("ReactTooltip not found, using fallback");
    ReactTooltip = ({ children, ...props }) => <div {...props}>{children}</div>;
}

try {
    InformBannedModal =
        require("./InformBannedModal").default ||
        require("./InformBannedModal");
} catch (e) {
    console.warn("InformBannedModal not found, using fallback");
    InformBannedModal = () => null;
}

try {
    InformMaintenanceModal =
        require("./Inform_MaintenanceModal").default ||
        require("./Inform_MaintenanceModal");
} catch (e) {
    console.warn("InformMaintenanceModal not found, using fallback");
    InformMaintenanceModal = () => null;
}

const Menu = ({ setTabIndex, setCurrentProfileTab, setTab }) => {
    const dispatch = useDispatch();
    const [banned, setBanned] = useState(false);
    const [isBannedOpen, setIsBannedOpen] = useState(false);
    const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
    const [informMessage, setInformMessage] = useState({
        first: "It seems you are accessing nyyu via anonymous proxy, VPN or VPS.",
        second: "we are unable to provide services to you.",
    });

    // 🔧 FIX: Declare auth and authentication state FIRST
    const auth = useAuth();
    const isAuthenticated = auth?.authState?.isAuthenticated || false;

    // State hooks
    const [active, setActive] = useState(false);
    const [newNotification, setNewNotification] = useState(false);

    // Redux selectors
    const avatarComponents = useSelector((state) => state.avatarComponents);
    const user = useSelector((state) => state.auth?.user);
    const isAdmin = user?.role && user?.role?.includes("ROLE_ADMIN");

    // Webservice - now isAuthenticated is available
    const { data: user_data } = useQuery(GET_USER, {
        skip: !isAuthenticated,
        errorPolicy: "all",
    });

    const { data: notificationData, error: notificationError } = useQuery(
        GET_ALL_UNREAD_NOTIFICATIONS,
        {
            skip: !isAuthenticated, // Now isAuthenticated is properly defined
            fetchPolicy: "network-only",
            errorPolicy: "all",
            onCompleted: (data) => {
                if (!data?.getAllUnReadNotifications) return;
                setNewNotification(
                    data?.getAllUnReadNotifications?.length !== 0,
                );
            },
            onError: (err) => {
                console.log("Notification query error:", err);
                if (err.graphQLErrors[0]?.isBannedCountry) {
                    setInformMessage({
                        first: `It seems you are accessing nyyu from an IP address belonging to ${err.graphQLErrors[0].country}.`,
                        second: "we are unable to provide services to users from this region.",
                    });
                    navigate("/");
                    setBanned(true);
                    setIsBannedOpen(true);
                } else if (err.graphQLErrors[0]?.isAnonymousIp) {
                    setInformMessage({
                        first: "It seems you are accessing nyyu via anonymous proxy, VPN or VPS.",
                        second: "we are unable to provide services to you.",
                    });
                    navigate("/");
                    setBanned(true);
                    setIsBannedOpen(true);
                } else if (err.graphQLErrors[0]?.isUnderMaintenance) {
                    navigate("/");
                    setBanned(true);
                    setIsMaintenanceOpen(true);
                    logout();
                }
            },
        },
    );

    // Computed values
    const userInfo = user_data?.getUser;

    const isShowNavLinks =
        isBrowser &&
        (window.location.pathname.includes(ROUTES.app) ||
            window.location.pathname.includes(ROUTES.admin));

    const isCurrentSignin =
        isBrowser && window.location.pathname.includes("/app/sign");

    // Methods
    useEffect(() => {
        if (!avatarComponents.loaded) {
            dispatch(fetch_Avatar_Components());
        }
        if (userInfo) {
            dispatch(setCurrentAuthInfo(userInfo));
            if (userInfo.role && userInfo.role.includes("ROLE_ADMIN")) {
                setCookie(NDB_Privilege, NDB_Admin);
            } else {
                removeCookie(NDB_Privilege);
            }
        }
    }, [dispatch, userInfo, avatarComponents.loaded, isAuthenticated]);

    useEffect(() => {
        const handleEscKeyPress = (event) => {
            if (event.key === "Escape" && active) {
                setActive(false);
            }
        };
        document.addEventListener("keydown", handleEscKeyPress);
        return () => document.removeEventListener("keydown", handleEscKeyPress);
    }, [active]);

    useEffect(() => {
        dispatch(fetch_Favor_Assets());
    }, [dispatch]);

    const isActive = (paths) => {
        if (!paths || !Array.isArray(paths)) return false;
        return (
            paths.filter((item) => item === window.location.pathname).length > 0
        );
    };

    // Debug logging
    useEffect(() => {
        console.log("🔧 Menu Component Debug:");
        console.log("🔐 Auth object:", auth);
        console.log("🔐 Auth state:", auth?.authState);
        console.log("🔐 isAuthenticated:", isAuthenticated);
        console.log("🔐 isShowNavLinks:", isShowNavLinks);
        console.log("🔐 User info:", userInfo);
        console.log("🔐 User from Redux:", user);
    }, [auth, isAuthenticated, isShowNavLinks, userInfo, user]);

    return (
        <nav className={active ? "menu menu--active" : "menu"}>
            <div className="px-4 d-flex justify-content-between">
                <div className="d-flex align-items-center gap-5 text-white text-uppercase fw-bold">
                    <Link to="/" className="menu__logo d-flex" title="Logo">
                        <img src={Logo} alt="NDB Brand Logo" />
                    </Link>
                    {/* 🔧 FIX: Use isAuthenticated instead of auth?.isAuthenticated */}
                    {isAuthenticated && isShowNavLinks && (
                        <div className="d-none d-lg-flex justify-content-between gap-5">
                            {navLinks?.map((link, key) => {
                                return (
                                    <Link
                                        key={key}
                                        to={link.to}
                                        className={`${isActive(link.active) && "txt-green"}`}
                                    >
                                        {link.title}
                                    </Link>
                                );
                            })}
                            {isAdmin && (
                                <Link
                                    to={ROUTES.admin}
                                    className={`${
                                        window.location.pathname.includes(
                                            ROUTES.admin,
                                        ) && "txt-green"
                                    }`}
                                >
                                    admin
                                </Link>
                            )}
                        </div>
                    )}
                </div>
                <div className="d-flex align-items-center">
                    <div>
                        {/* 🔧 FIX: Use isAuthenticated instead of auth?.isAuthenticated */}
                        {!isAuthenticated ? (
                            !banned ? (
                                !isCurrentSignin ? (
                                    <Link
                                        className="header-btn"
                                        to={ROUTES.signIn}
                                    >
                                        Sign In
                                    </Link>
                                ) : (
                                    ""
                                )
                            ) : (
                                ""
                            )
                        ) : (
                            <ul className="d-flex align-items-center">
                                <li className="scale-75 cursor-pointer pe-3 d-none d-sm-block">
                                    <a
                                        href="https://x.com/nyyuio"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <img
                                            src={TWITTER}
                                            alt="twitter social link"
                                            className="social-link"
                                        />
                                    </a>
                                </li>
                                <li className="scale-75 cursor-pointer pe-3 d-none d-sm-block">
                                    <a
                                        href="https://discord.gg/38tFxghPdz"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <img
                                            src={DISCORD}
                                            alt="discord social link"
                                            className="social-link"
                                        />
                                    </a>
                                </li>
                                <div className="dropdown me-2 d-block d-sm-none">
                                    <button
                                        type="button"
                                        className="btn btn-primary dropdown-toggle fs-16px px-3 py-2"
                                        data-bs-toggle="dropdown"
                                    >
                                        Sale
                                    </button>
                                    <ul className="dropdown-menu">
                                        <li>
                                            <Link
                                                className="fs-16px text-uppercase fw-bold"
                                                to={ROUTES.auction}
                                            >
                                                Sale
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                className="fs-16px text-uppercase fw-bold"
                                                to={ROUTES.referral}
                                            >
                                                Invite & Earn
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                                <li className="scale-75 cursor-pointer pe-3">
                                    <Link to={ROUTES.profile}>
                                        <img
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={
                                                isBrowser &&
                                                window.location.pathname ===
                                                    ROUTES.profile
                                                    ? () => {
                                                          setTabIndex &&
                                                              setTabIndex(1);
                                                          setCurrentProfileTab &&
                                                              setCurrentProfileTab(
                                                                  profile_tabs[1],
                                                              );
                                                          setTab && setTab(1);
                                                      }
                                                    : () => {
                                                          dispatch({
                                                              type: "CREATE_NOTIFICATION_ROUTE",
                                                          });
                                                      }
                                            }
                                            onClick={
                                                isBrowser &&
                                                window.location.pathname ===
                                                    ROUTES.profile
                                                    ? () => {
                                                          setTabIndex &&
                                                              setTabIndex(1);
                                                          setCurrentProfileTab &&
                                                              setCurrentProfileTab(
                                                                  profile_tabs[1],
                                                              );
                                                          setTab && setTab(1);
                                                      }
                                                    : () => {
                                                          dispatch({
                                                              type: "CREATE_NOTIFICATION_ROUTE",
                                                          });
                                                      }
                                            }
                                            src={
                                                newNotification
                                                    ? NotificationBell
                                                    : Bell
                                            }
                                            alt="Bell Icon"
                                        />
                                    </Link>
                                    {/* Only render ReactTooltip if it's properly loaded */}
                                    {typeof ReactTooltip === "function" && (
                                        <ReactTooltip
                                            id="bell-icon-tooltip"
                                            place="bottom"
                                            type="light"
                                            effect="solid"
                                        >
                                            <div
                                                className="text-uppercase text-center"
                                                style={{ width: "200px" }}
                                            >
                                                no unread notification
                                            </div>
                                        </ReactTooltip>
                                    )}
                                </li>
                                <li className="pe-sm-3 px-0 scale-75">
                                    <Link to={ROUTES.profile}>
                                        <div
                                            className="avatar-container"
                                            style={{
                                                position: "relative",
                                                display: "inline-block",
                                            }}
                                        >
                                            <Avatar
                                                onClick={() => {
                                                    dispatch({
                                                        type: "DISABLE_NOTIFICATION_ROUTE",
                                                    });
                                                }}
                                                className="user-avatar"
                                            />
                                            <UserTier />
                                        </div>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </div>
                    {/* LoadCurrencyRates removed - handled in wrap-with-providers.jsx */}
                    <button
                        type="button"
                        className="menu__toggler"
                        onClick={() => setActive(!active)}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>

                <div className="menu__content">
                    <div className="content d-md-flex align-items-center">
                        <ul className="content__section menu__items">
                            {navigationLinks?.map((link) => (
                                <li className="menu__item" key={link.label}>
                                    <a
                                        href={link.url}
                                        className={`d-inline-block ${link.active && "active"}`}
                                        onClick={() => setActive(false)}
                                    >
                                        {link.label}
                                    </a>
                                    {/* 🔧 FIX: Use isAuthenticated consistently here too */}
                                    {isAuthenticated && link.active && (
                                        <ul className="my-4 d-block d-lg-none">
                                            {link.subMenu?.map(
                                                (subLink, index) => (
                                                    <li
                                                        className="mb-3"
                                                        key={index}
                                                    >
                                                        <Link
                                                            to={subLink.url}
                                                            className="fw-500 fs-20px d-block text-light header-item"
                                                            activeClassName="first-letter:txt-green header-item"
                                                        >
                                                            {subLink.label}
                                                        </Link>
                                                    </li>
                                                ),
                                            )}
                                            {isAdmin && (
                                                <li className="mb-3">
                                                    <Link
                                                        to={ROUTES.admin}
                                                        className="fw-500 fs-20px d-block text-light header-item"
                                                        activeClassName="first-letter:txt-green header-item"
                                                    >
                                                        ADMIN
                                                    </Link>
                                                </li>
                                            )}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                {/* Only render modals if they're properly loaded */}
                {isBannedOpen && typeof InformBannedModal === "function" && (
                    <InformBannedModal
                        isModalOpen={isBannedOpen}
                        setIsModalOpen={setIsBannedOpen}
                        informMessage={informMessage}
                    />
                )}
                {isMaintenanceOpen &&
                    typeof InformMaintenanceModal === "function" && (
                        <InformMaintenanceModal
                            isModalOpen={isMaintenanceOpen}
                            setIsModalOpen={setIsMaintenanceOpen}
                        />
                    )}
            </div>
        </nav>
    );
};

export default Menu;
