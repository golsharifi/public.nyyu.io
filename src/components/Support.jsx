import React, { useState } from "react";
import SupportRequestModal from "./support/SupportRequestModal";
import { useMutation } from "@apollo/client";
import Header from "./header";
import {
    SupportAuthenticator,
    SupportCommunity,
    SupportDelete,
    SupportHelpCenter,
    SupportRecovery,
    SupportRequest,
    SupportReset,
    SupportSecurity,
    SupportTag,
    SupportUnlock,
} from "../utilities/imgImport";
import ResetPasswordModal from "./support/reset-password-modal";
import CustomSpinner from "./common/custom-spinner";
import Seo from "./seo";
import UnlockAccountModal from "./support/unlock-account-moda";
import ResetPhoneModal from "./support/reset-phone-modal";
import DepositAssetModal from "./support/deposit-asset-modal";
import DepositMissingModal from "./support/deposit-missing-modal";
import ResetAuthenticatorModal from "./support/reset-authenticator-modal";
import DeleteAccountModal from "./profile/delete-account-modal";
import { ZendeskURLWithJWT } from "../utilities/staticData";
import { GET_ZENDESK_JWT } from "../apollo/graphqls/mutations/Support";
import AlarmModal from "./admin/AlarmModal";
import { RESET_GOOGLE_AUTH } from "../apollo/graphqls/mutations/Auth";

const setting = {
    color: {
        theme: "#000",
    },
    launcher: {
        chatLabel: {
            "en-US": "Need Help",
        },
    },
    contactForm: {
        fields: [
            {
                id: "description",
                prefill: { "*": "My pre-filled description" },
            },
        ],
    },
};

const GOOGLE_AUTH_INDEX = 3;

const FAQ = () => {
    const [selfServiceData, setSelfServiceData] = useState([
        {
            id: 0,
            label: "Reset Password",
            icon: SupportReset,
            clickEvent: () => setIsResetPasswordModalOpen(true),
        },
        {
            id: 1,
            label: "Unlock Account",
            icon: SupportUnlock,
            clickEvent: () => setIsUnlockAccountModalOpen(true),
            disabled: true,
        },
        {
            id: 2,
            label: "Reset Phone Security Verification",
            icon: SupportSecurity,
            clickEvent: () => setIsResetPhoneModalOpen(true),
            disabled: false,
        },
        {
            id: 3,
            label: "Reset Google Authenticator",
            icon: SupportAuthenticator,
            clickEvent: () => handleGoogleAuth(),
            disabled: false,
            error: "Cannot Reset Google Authenticator",
            hasError: false,
            pending: false,
        },
        {
            id: 4,
            label: "Deposit Non Credit Asset Recovery",
            icon: SupportRecovery,
            clickEvent: () => setIsDepositAssetModalOpen(true),
            disabled: false,
        },
        {
            id: 5,
            label: "Deposit Missing Or Wrong Tag/Memo Asset Recovery",
            icon: SupportTag,
            clickEvent: () => setIsDepositMissingModalOpen(true),
            disabled: false,
        },
        {
            id: 6,
            label: "Suspend/Delete Account",
            icon: SupportDelete,
            clickEvent: () => setIsDeleteAccountModalOpen(true),
        },
        // {
        //     id: 7,
        //     label: "Submit a Request",
        //     icon: SupportRequest,
        //     clickEvent: () => {
        //         const link = document.createElement("a");
        //         link.href = "https://help.nyyu.io/hc/en-gb/requests/new";
        //         link.target = "_blank";
        //         link.click();
        //     },
        // },

        {
            id: 7,
            label: "Submit a Request",
            icon: SupportRequest,
            clickEvent: () => setIsSupportRequestModalOpen(true),
        },
    ]);

    // Container
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
        useState(false);
    const [isUnlockAccountModalOpen, setIsUnlockAccountModalOpen] =
        useState(false);
    const [isResetPhoneModalOpen, setIsResetPhoneModalOpen] = useState(false);
    const [isResetAuthenticatorModalOpen, setIsResetAuthenticatorModalOpen] =
        useState(false);
    const [isDepositAssetModalOpen, setIsDepositAssetModalOpen] =
        useState(false);
    const [isDepositMissingModalOpen, setIsDepositMissingModalOpen] =
        useState(false);
    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
        useState(false);
    const [pending, setPending] = useState(false);

    const [qrcode, setQRcode] = useState("");
    const [token, setToken] = useState("");
    const [isSupportRequestModalOpen, setIsSupportRequestModalOpen] =
        useState(false);

    const [getZendeskJwtMutation] = useMutation(GET_ZENDESK_JWT, {
        onCompleted: (data) => {
            if (data.getZendeskJwt) {
                const jwtToken = data.getZendeskJwt?.token;
                window.location.assign(`${ZendeskURLWithJWT}${jwtToken}`);
            }
            setPending(false);
        },
        onError: (err) => {
            console.log(err.message);
            setPending(false);
        },
    });

    const [getGoogleAuthSecret] = useMutation(RESET_GOOGLE_AUTH, {
        onCompleted: (data) => {
            setPending(false);
            if (data.resetGoogleAuthRequest) {
                const filtered = selfServiceData.map((item) => {
                    if (item.id === GOOGLE_AUTH_INDEX) {
                        item.hasError = false;
                        item.pending = false;
                    }
                    return item;
                });
                setSelfServiceData(filtered);
                setQRcode(data.resetGoogleAuthRequest.secret);
                setToken(data.resetGoogleAuthRequest.token);
                // open modal
                setIsResetAuthenticatorModalOpen(true);
            }
        },
        onError: (err) => {
            setPending(false);
            //set error
            const filtered = selfServiceData.map((item) => {
                if (item.id === GOOGLE_AUTH_INDEX) {
                    item.hasError = true;
                    item.pending = false;
                }
                return item;
            });
            setSelfServiceData(filtered);
        },
    });

    const handleGoogleAuth = () => {
        // send google auth reset request
        const filtered = selfServiceData.map((item) => {
            if (item.id === GOOGLE_AUTH_INDEX) {
                item.hasError = true;
                item.pending = true;
            }
            return item;
        });
        setSelfServiceData(filtered);
        getGoogleAuthSecret();
    };

    // const handleHelpCenter = () => {
    //     setPending(true);
    //     getZendeskJwtMutation();
    // };

    const handleHelpCenter = () => {
        const link = document.createElement("a");
        link.href = "https://docs.nyyu.io/";
        link.target = "_blank";
        link.click();
    };

    // const handleHelpCommunity = () => {
    //     setPending(true);
    //     getZendeskJwtMutation();
    // };

    // Render
    return (
        <>
            <Seo title="Support" />
            <main className="faq-page">
                <Header />
                <section className="container">
                    <div className="row mt-4 mt-sm-0 row-x">
                        <div className="col-lg-3 col-6 mb-2">
                            <button
                                className="h-100 border border-light text-light support-banner-item text-decoration-none d-block"
                                onClick={handleHelpCenter}
                            >
                                <div className="h-100 d-flex align-items-center justify-content-around flex-column gap-sm-0 gap-3 py-3 py-sm-0">
                                    {pending ? (
                                        <CustomSpinner />
                                    ) : (
                                        <>
                                            <div className="fw-bold text-uppercase support-banner-title">
                                                help center
                                            </div>
                                            <img
                                                src={SupportHelpCenter}
                                                alt="Support help center"
                                            />
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>

                        <div className="col-lg-3 col-6 mb-2 pe-lg-10px">
                            <a
                                className="h-100 border border-light text-light support-banner-item text-decoration-none d-block"
                                href="https://docs.nyyu.io/docs/api/getting-started"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <div className="h-100 d-flex align-items-center justify-content-around flex-column gap-sm-0 gap-3 py-3 py-sm-0">
                                    <div className="fw-bold text-uppercase support-banner-title">
                                        Developers
                                    </div>
                                    <img
                                        src={SupportCommunity}
                                        alt="Support help center"
                                    />
                                </div>
                            </a>
                        </div>

                        <div className="col-lg-6 col-12">
                            <div className="row row-x">
                                {selfServiceData.map((item, index) => {
                                    return (
                                        <div
                                            className={`support-self-security-item col-12 col-lg-6`}
                                        >
                                            <button
                                                key={index}
                                                className={`btn text-light border border-light text-center p-1`}
                                                onClick={item?.clickEvent}
                                                disabled={
                                                    item?.disabled
                                                        ? true
                                                        : false
                                                }
                                            >
                                                {item?.pending ? (
                                                    <CustomSpinner />
                                                ) : (
                                                    <>
                                                        <img
                                                            src={item?.icon}
                                                            alt="item figure"
                                                        />
                                                        <div>{item.label}</div>
                                                        {item?.hasError && (
                                                            <div className="error-message">
                                                                {item?.error}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <DeleteAccountModal
                            isDeleteAccountModalOpen={isDeleteAccountModalOpen}
                            setIsDeleteAccountModalOpen={
                                setIsDeleteAccountModalOpen
                            }
                        />
                    </div>
                    {isResetPasswordModalOpen && (
                        <ResetPasswordModal
                            isOpen={isResetPasswordModalOpen}
                            setIsOpen={setIsResetPasswordModalOpen}
                        />
                    )}
                    {isUnlockAccountModalOpen && (
                        <UnlockAccountModal
                            isOpen={isUnlockAccountModalOpen}
                            setIsOpen={setIsUnlockAccountModalOpen}
                        />
                    )}
                    {isResetPhoneModalOpen && (
                        <ResetPhoneModal
                            isOpen={isResetPhoneModalOpen}
                            setIsOpen={setIsResetPhoneModalOpen}
                        />
                    )}
                    {isResetAuthenticatorModalOpen && (
                        <ResetAuthenticatorModal
                            isOpen={isResetAuthenticatorModalOpen}
                            setIsOpen={setIsResetAuthenticatorModalOpen}
                            secret={qrcode}
                            token={token}
                        />
                    )}
                    {isDepositAssetModalOpen && (
                        <DepositAssetModal
                            isOpen={isDepositAssetModalOpen}
                            setIsOpen={setIsDepositAssetModalOpen}
                        />
                    )}
                    {isDepositMissingModalOpen && (
                        <DepositMissingModal
                            isOpen={isDepositMissingModalOpen}
                            setIsOpen={setIsDepositMissingModalOpen}
                        />
                    )}
                </section>
                <AlarmModal />
            </main>

            <SupportRequestModal
                isOpen={isSupportRequestModalOpen}
                closeModal={() => setIsSupportRequestModalOpen(false)}
            />
        </>
    );
};

export default FAQ;
