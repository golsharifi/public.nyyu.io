import Select from "react-select";
import Loading from "./common/Loading";
import { navigate } from "gatsby";
import { useQuery, useMutation } from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";
import { Alert } from "@mui/material";
import { Icon } from "@iconify/react";
import Modal from "react-modal";

import Header from "../components/header";
import { ROUTES } from "../utilities/routes";
import SignOutTab from "./profile/sign-out-tab";
import {
    profile_tabs,
    TWO_FACTOR_AUTH_TOOLTIP_CONTENT,
} from "../utilities/staticData";
import Seo from "./seo";
import TwoFactorModal from "./profile/two-factor-modal";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { GET_USER } from "../apollo/graphqls/querys/Auth";
import ConnectWalletTab from "./profile/connect-wallet-tab";
import React, { useEffect, useState } from "react";
import DeleteAccountModal from "./profile/delete-account-modal";
import { setCurrentAuthInfo } from "../store/actions/authAction";
import NotificationRecent from "./profile/notification-recent-switch";
import NotificationSetting from "./profile/notification-setting-switch";
import ProfileChangePasswordModal from "./profile/change-password-modal";
import TierDetailsTab from "./profile/TierDetailsTab";
import Avatar from "../components/dress-up/avatar";
import { QuestionMark } from "../utilities/imgImport";
import AccountDetails from "./profile/account-details";
import { ReactTooltip } from "../utilities/tooltip";
import { GET_SHUFT_REFERENCE } from "./verify-identity/kyc-webservice";
import { logout } from "../utilities/auth";
import { getShuftiStatusByReference } from "../utilities/utility-methods";
import TierProgressBar from "./profile/TierProgressBar";
import DressupModal from "./dress-up/dressup-user-modal";
import { getAuthInfo } from "../store/actions/authAction";
import { UPDATE_AVATARSET } from "../apollo/graphqls/mutations/AvatarComponent";
import { GET_USER_TIERS } from "../apollo/graphqls/querys/UserTier";
import { GET_DISCORD } from "./profile/profile-queries";

const ErrorModal = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            ariaHideApp={false}
            className="support-modal"
            overlayClassName="support-modal__overlay"
        >
            <div className="support-modal__header justify-content-end">
                <div
                    onClick={onClose}
                    onKeyDown={onClose}
                    role="button"
                    tabIndex="0"
                >
                    <Icon icon="ep:close-bold" />
                </div>
            </div>
            <div className="text-center p-4">
                <h4 className="mb-3">{title}</h4>
                <Alert
                    severity={title.includes("Success") ? "success" : "error"}
                    className="mb-3"
                >
                    {message}
                </Alert>
                <button
                    className="btn btn-outline-light rounded-0 px-4 py-2 fw-bold text-uppercase mt-3"
                    onClick={onClose}
                >
                    OK
                </button>
            </div>
        </Modal>
    );
};

const Profile = () => {
    const dispatch = useDispatch();
    const targetTabIndex = useSelector((state) => state.profileTab);

    const [tab, setTab] = useState(targetTabIndex !== 2 ? targetTabIndex : 0);
    const [userTiersData, setUserTiersData] = useState(null);
    const [tabIndex, setTabIndex] = useState(tab);
    const [displayName, setDisplayName] = useState("");
    const [discordName, setDiscordName] = useState("");
    const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
    const [isDressUpModalOpen, setIsDressUpModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [currentProfileTab, setCurrentProfileTab] = useState(
        profile_tabs[tab],
    );
    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
        useState(false);
    const [shuftiStatus, setShuftiStatus] = useState(null);
    const [shuftReference, setShuftiReference] = useState(null);
    const [shuftiReferenceLoading, setShuftiReferenceLoading] = useState(true);

    const [errorModal, setErrorModal] = useState({
        isOpen: false,
        title: "",
        message: "",
    });

    useQuery(GET_USER_TIERS, {
        onCompleted: (data) => {
            setUserTiersData(data?.getUserTiers);
        },
    });

    // Webservice
    const { data: userData, refetch } = useQuery(GET_USER, {
        onCompleted: (res) => {
            if (!res?.getUser) {
                return logout(() => {
                    navigate(ROUTES.home);
                });
            }
            if (res?.getUser?.avatar) {
                const { prefix, name } = res.getUser.avatar;
                if (prefix && name) {
                    return setDisplayName(prefix + "." + name);
                } else return navigate(ROUTES.selectFigure);
            }
            return navigate(ROUTES.selectFigure);
        },
        fetchPolicy: "network-only",
    });

    const { loading: loadingDiscord } = useQuery(GET_DISCORD, {
        onCompleted: (data) => {
            if (data.getDiscord) {
                setDiscordName(data.getDiscord);
            }
        },
    });

    useQuery(GET_SHUFT_REFERENCE, {
        onCompleted: (data) => {
            setShuftiReference(data?.getShuftiReference);
            return setShuftiReferenceLoading(false);
        },
        fetchPolicy: "network-only",
        errorpolicy: "ignore",
    });

    const [updateAvatarSet, { loading }] = useMutation(UPDATE_AVATARSET, {
        onCompleted: (data) => {
            console.log("✅ Avatar updated successfully:", data);

            // Refresh user data immediately to reflect changes
            dispatch(getAuthInfo());
            refetch();

            // Close the modal
            setIsDressUpModalOpen(false);

            // Show success message
            setErrorModal({
                isOpen: true,
                title: "Success!",
                message: "Your avatar has been updated successfully!",
            });
        },
        onError: (err) => {
            console.error("❌ Avatar update error:", err);

            let title = "Update Failed";
            let message = "Failed to update avatar. Please try again.";

            // Handle specific error types
            if (err.message.includes("Insufficient funds")) {
                title = "Insufficient Funds";
                message =
                    "You don't have enough funds to purchase these avatar components. Please add funds to your account or select free components.";
            } else if (err.message.includes("Unauthorized")) {
                title = "Access Denied";
                message =
                    "You don't have permission to use some of these avatar components.";
            } else {
                message = err.message;
            }

            setErrorModal({
                isOpen: true,
                title: title,
                message: message,
            });
        },
    });

    const loadingPage =
        !(displayName && userTiersData && shuftiStatus) || loadingDiscord;
    // Containers
    const user = userData?.getUser;
    const twoStep = user?.security
        ? user.security.filter((f) => f.tfaEnabled).map((m) => m.authType)
        : [];

    const currentTier = userTiersData?.filter(
        (item) => item?.level === user?.tierLevel,
    );
    const nextTier = userTiersData?.filter(
        (item) => item?.level === user?.tierLevel + 1,
    );

    // Methods
    const handleProfileTab = (value) => {
        setCurrentProfileTab(value);
        setTabIndex(value.index);
    };

    useEffect(() => {
        return setTabIndex(tab);
    }, []);

    const getSecurityStatus = (key) =>
        user?.security?.find((f) => f?.authType === key && f?.tfaEnabled);

    const TfaConfig = ({ title, method }) => {
        const config = !!getSecurityStatus(method);

        let available = true;
        if (method === "phone") {
            if (twoStep.includes("app")) available = false;
        } else if (method === "app") {
            if (twoStep.includes("phone")) available = false;
        }

        return (
            <>
                <div
                    className={`status ${
                        config ? "active" : "deactive"
                    } mt-3px`}
                />
                <div className="security-item">
                    <p className="security-name">{title}</p>

                    {!config &&
                        (available ? (
                            <p
                                className="security-link"
                                onClick={() => setIs2FAModalOpen(true)}
                                onKeyDown={() => setIs2FAModalOpen(true)}
                                role="presentation"
                            >
                                Setup
                            </p>
                        ) : (
                            <p className="text-secondary security-link text-decoration-none">
                                Unavailable
                            </p>
                        ))}
                </div>
                {config && (
                    <div className="security-item-disable">
                        <p
                            className="txt-red security-link"
                            onClick={() => setIs2FAModalOpen(true)}
                            onKeyDown={() => setIs2FAModalOpen(true)}
                            role="presentation"
                        >
                            Disable
                        </p>
                    </div>
                )}
            </>
        );
    };

    useEffect(() => dispatch(setCurrentAuthInfo(user)), [dispatch, user]);

    const getShuftiStatusByReferenceFn = async () => {
        if (!shuftiReferenceLoading) {
            const response = await getShuftiStatusByReference(
                shuftReference?.reference,
            );
            return setShuftiStatus(response);
        }
    };
    useEffect(() => {
        getShuftiStatusByReferenceFn();
    }, [shuftiReferenceLoading]);

    if (loadingPage) return <Loading />;
    else {
        return (
            <>
                <Seo title="Profile" />
                <main className="profile-page">
                    <TwoFactorModal
                        is2FAModalOpen={is2FAModalOpen}
                        email={user?.email}
                        phone={user?.phone}
                        twoStep={twoStep}
                        onResult={(res) => {
                            if (res) {
                                refetch();
                            }
                        }}
                        redirect={false}
                        setIs2FAModalOpen={setIs2FAModalOpen}
                    />

                    <Header
                        setTabIndex={setTabIndex}
                        setCurrentProfileTab={setCurrentProfileTab}
                        setTab={setTab}
                    />
                    <section className="container">
                        <div className="row">
                            <div className="col-lg-3 profile-page__left border-light border-0 border-end">
                                <div className="user-info">
                                    <div
                                        className="my-5 user-info__avatar"
                                        onClick={() =>
                                            setIsDressUpModalOpen(true)
                                        }
                                        onKeyDown={() =>
                                            setIsDressUpModalOpen(true)
                                        }
                                        style={{ opacity: loading ? 0.5 : 1 }}
                                    >
                                        <Avatar />
                                    </div>
                                    <div className="user-info__name">
                                        {currentTier?.length > 0 ? (
                                            <div
                                                className="me-2"
                                                dangerouslySetInnerHTML={{
                                                    __html: currentTier[0]?.svg,
                                                }}
                                            />
                                        ) : (
                                            <></>
                                        )}
                                        <p
                                            className="text-truncate fs-18px"
                                            title={displayName}
                                        >
                                            {displayName}
                                        </p>
                                    </div>
                                    <p className="silver-cnt">
                                        {nextTier?.length > 0 &&
                                            nextTier[0]?.point -
                                                user?.tierPoint +
                                                "p to " +
                                                nextTier[0]?.name}
                                    </p>
                                    <TierProgressBar
                                        user={user}
                                        nextTier={nextTier}
                                    />
                                </div>
                                <Tabs
                                    className="profile-tab"
                                    onSelect={(index) => setTabIndex(index)}
                                    selectedIndex={tabIndex}
                                >
                                    <TabList>
                                        {profile_tabs.map((item, idx) => (
                                            <Tab
                                                // selected={tabIndex == idx}
                                                // focus={tabIndex == idx}
                                                key={idx}
                                            >
                                                {item.label}
                                            </Tab>
                                        ))}
                                    </TabList>
                                    <Select
                                        isSearchable={false}
                                        options={profile_tabs}
                                        value={currentProfileTab}
                                        onChange={(v) => handleProfileTab(v)}
                                        className="black_input w-75 m-auto mb-3 d-block d-lg-none"
                                        components={{
                                            IndicatorSeparator: null,
                                        }}
                                        styles={customSelectStyles}
                                    />
                                    <TabPanel>0</TabPanel>
                                    <TabPanel>1</TabPanel>
                                    <TabPanel>2</TabPanel>
                                    <TabPanel>3</TabPanel>
                                </Tabs>
                            </div>
                            <div className="col-lg-9 profile-page__right">
                                {tabIndex === 0 && (
                                    <>
                                        <Tabs
                                            defaultIndex={
                                                targetTabIndex === 2 ? 1 : 0
                                            }
                                            className="detail-tab"
                                        >
                                            <TabList>
                                                <Tab>
                                                    <div className="pt-3">
                                                        account
                                                    </div>
                                                </Tab>
                                                <Tab>
                                                    <div className="pt-3">
                                                        tier
                                                    </div>
                                                </Tab>
                                                <Tab
                                                    onClick={() =>
                                                        setIsDressUpModalOpen(
                                                            true,
                                                        )
                                                    }
                                                    onKeyDown={() =>
                                                        setIsDressUpModalOpen(
                                                            true,
                                                        )
                                                    }
                                                >
                                                    <div className="pt-3">
                                                        Dress Up
                                                    </div>
                                                </Tab>
                                            </TabList>
                                            <TabPanel>
                                                <div className="account-details">
                                                    <AccountDetails
                                                        setIsPasswordModalOpen={
                                                            setIsPasswordModalOpen
                                                        }
                                                        user={user}
                                                        displayName={
                                                            displayName
                                                        }
                                                        shuftReference={
                                                            shuftReference
                                                        }
                                                        shuftiStatus={
                                                            shuftiStatus
                                                        }
                                                        discordName={
                                                            discordName
                                                        }
                                                    />
                                                    <div className="account-security">
                                                        <h4 className="d-flex align-items-center">
                                                            <div className="title_desktop">
                                                                <div>
                                                                    Security
                                                                </div>
                                                                <img
                                                                    data-tip
                                                                    data-for="question-mark-tooltip"
                                                                    className="cursor-pointer ms-2"
                                                                    src={
                                                                        QuestionMark
                                                                    }
                                                                    alt="Question Mark"
                                                                />
                                                                <ReactTooltip
                                                                    id="question-mark-tooltip"
                                                                    place="right"
                                                                    type="light"
                                                                    effect="solid"
                                                                >
                                                                    <div
                                                                        className="text-capitalize text-start fw-normal"
                                                                        style={{
                                                                            width: "320px",
                                                                        }}
                                                                    >
                                                                        {
                                                                            TWO_FACTOR_AUTH_TOOLTIP_CONTENT
                                                                        }
                                                                    </div>
                                                                </ReactTooltip>
                                                            </div>
                                                            <div className="title_mobile">
                                                                <div className="text-center">
                                                                    Security
                                                                </div>
                                                                <img
                                                                    data-tip
                                                                    data-for="question-mark-tooltip"
                                                                    className="cursor-pointer ms-2"
                                                                    src={
                                                                        QuestionMark
                                                                    }
                                                                    alt="Question Mark"
                                                                />
                                                                <ReactTooltip
                                                                    id="question-mark-tooltip"
                                                                    place="left"
                                                                    type="light"
                                                                    effect="solid"
                                                                >
                                                                    <div
                                                                        className="text-capitalize text-start fw-normal"
                                                                        style={{
                                                                            width: "250px",
                                                                        }}
                                                                    >
                                                                        {
                                                                            TWO_FACTOR_AUTH_TOOLTIP_CONTENT
                                                                        }
                                                                    </div>
                                                                </ReactTooltip>
                                                            </div>
                                                        </h4>
                                                        <div className="row w-100 mx-auto">
                                                            <div className="col-md-4 br">
                                                                <TfaConfig
                                                                    title="2FA Email"
                                                                    method="email"
                                                                />
                                                            </div>
                                                            <div className="col-md-4 br">
                                                                <TfaConfig
                                                                    title="2FA Mobile"
                                                                    method="phone"
                                                                />
                                                            </div>
                                                            <div className="col-md-4">
                                                                <TfaConfig
                                                                    title="2FA Google Authentication"
                                                                    method="app"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TabPanel>
                                            <TabPanel>
                                                <TierDetailsTab
                                                    shuftiStatus={shuftiStatus}
                                                />
                                            </TabPanel>
                                            <TabPanel>
                                                <>
                                                    <div
                                                        className="user-info_avatar cursor-pointer"
                                                        style={{
                                                            opacity: loading
                                                                ? 0.5
                                                                : 1,
                                                        }}
                                                        onClick={() =>
                                                            setIsDressUpModalOpen(
                                                                true,
                                                            )
                                                        }
                                                        onKeyDown={() =>
                                                            setIsDressUpModalOpen(
                                                                true,
                                                            )
                                                        }
                                                    >
                                                        <Avatar />
                                                    </div>
                                                </>
                                            </TabPanel>
                                        </Tabs>
                                    </>
                                )}
                                {tabIndex === 1 && (
                                    <div className="notification-set">
                                        <Tabs className="notification-tab">
                                            <TabList>
                                                <Tab>
                                                    <div className="pt-3 pb-2">
                                                        Recent
                                                    </div>
                                                </Tab>
                                                <Tab>
                                                    <div className="py-3 pb-2">
                                                        Setup
                                                    </div>
                                                </Tab>
                                            </TabList>
                                            <TabPanel>
                                                <NotificationRecent />
                                            </TabPanel>
                                            <TabPanel>
                                                <NotificationSetting />
                                            </TabPanel>
                                        </Tabs>
                                    </div>
                                )}
                                {tabIndex === 2 && (
                                    <div className="connect-wallet">
                                        <h4 className="pt-3">select wallet</h4>
                                        <ConnectWalletTab />
                                    </div>
                                )}
                                {tabIndex === 3 && <SignOutTab />}
                            </div>
                        </div>
                    </section>
                    {isPasswordModalOpen && (
                        <ProfileChangePasswordModal
                            isPasswordModalOpen={isPasswordModalOpen}
                            setIsPasswordModalOpen={setIsPasswordModalOpen}
                        />
                    )}
                    {isDeleteAccountModalOpen && (
                        <DeleteAccountModal
                            isDeleteAccountModalOpen={isDeleteAccountModalOpen}
                            setIsDeleteAccountModalOpen={
                                setIsDeleteAccountModalOpen
                            }
                        />
                    )}
                    {isDressUpModalOpen && (
                        <DressupModal
                            setIsModalOpen={setIsDressUpModalOpen}
                            isModalOpen={isDressUpModalOpen}
                            onSave={(res) => {
                                console.log("🎨 Saving avatar with data:", res);
                                updateAvatarSet({
                                    variables: res,
                                });
                            }}
                        />
                    )}

                    <ErrorModal
                        isOpen={errorModal.isOpen}
                        title={errorModal.title}
                        message={errorModal.message}
                        onClose={() =>
                            setErrorModal({
                                isOpen: false,
                                title: "",
                                message: "",
                            })
                        }
                    />
                </main>
            </>
        );
    }
};

export default Profile;

const customSelectStyles = {
    option: (provided, state) => ({
        ...provided,
        color: "white",
        backgroundColor: state.isSelected ? "#000000" : undefined,
        fontSize: 14,
        fontWeight: "bold",
        borderBottom: "1px solid dimgrey",
        cursor: "pointer",
        ":hover": {
            backgroundColor: "inherit",
        },
    }),
    control: (provided) => ({
        ...provided,
        backgroundColor: "#1e1e1e",
        border: "none",
        borderRadius: 0,
        height: 47,
        cursor: "pointer",
    }),
    input: (provided) => ({
        ...provided,
        color: "white",
        paddingLeft: 7,
    }),
    menu: (provided) => ({
        ...provided,
        borderRadius: 0,
        backgroundColor: "#1e1e1e",
        border: "1px solid white",
    }),
    menuList: (provided) => ({
        ...provided,
        borderRadius: 0,
        margin: 0,
        padding: 0,
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: 0,
    }),
    singleValue: (provided) => ({
        ...provided,
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        marginLeft: 10,
    }),
    placeholder: (provided) => ({
        ...provided,
        color: "dimgrey",
    }),
};
