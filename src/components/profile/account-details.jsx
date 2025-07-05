import { Link } from "gatsby";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ROUTES } from "../../utilities/routes";
import ChangeEmailModal from "./ChangeEmailModal";
import ChangeNameModal from "./ChangeNameModal";
import ChangeDiscordModal from "./ChangeDiscordModal";
import SelectCurrencyModal from "./SelectCurrencyModal";
import { EuropeanFlag } from "../../utilities/imgImport";

export default function AccountDetails({
    setIsPasswordModalOpen,
    user,
    displayName,
    shuftiStatus,
    discordName,
}) {
    // Containers
    const [isChangeNameModalOpen, setIsChangeNameModalOpen] = useState(false);
    const [isChangeEmailModalOpen, setIsChangeEmailModalOpen] = useState(false);
    const [isChangeDiscordModalOpen, setIsChangeDiscordModalOpen] =
        useState(false);
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);

    // Fix: Add proper null checking for savedCurrency with fallback default
    const savedCurrency = useSelector((state) => state.favAssets?.currency) || {
        value: "USD",
        label: "USD",
        sign: "$",
    };

    // Render
    return (
        <>
            {isChangeEmailModalOpen && (
                <ChangeEmailModal
                    isOpen={isChangeEmailModalOpen}
                    setIsOpen={setIsChangeEmailModalOpen}
                />
            )}
            {isChangeNameModalOpen && (
                <ChangeNameModal
                    isOpen={isChangeNameModalOpen}
                    setIsOpen={setIsChangeNameModalOpen}
                />
            )}
            {isChangeDiscordModalOpen && (
                <ChangeDiscordModal
                    isOpen={isChangeDiscordModalOpen}
                    setIsOpen={setIsChangeDiscordModalOpen}
                />
            )}
            {isCurrencyModalOpen && (
                <SelectCurrencyModal
                    isOpen={isCurrencyModalOpen}
                    setIsOpen={setIsCurrencyModalOpen}
                />
            )}
            <div className="account_details_content w-100">
                <div className="row w-100 mx-auto">
                    <div className="detail_item col-sm-4 col-md-6 br">
                        Display name
                    </div>
                    <div className="detail_item col-sm-8 col-md-6">
                        <div className="d-flex align-items-center justify-content-between">
                            <p>{displayName}</p>
                            <button
                                onClick={() => setIsChangeNameModalOpen(true)}
                                className="btn fs-10px text-success text-underline text-capitalize ms-1"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                </div>
                <div className="row w-100 mx-auto">
                    <div className="detail_item col-sm-4 col-md-6 br">
                        Email address
                    </div>
                    <div className="detail_item col-sm-8 col-md-6">
                        <div className="d-flex align-items-center justify-content-between">
                            <p>{user?.email}</p>
                            <button
                                onClick={() => setIsChangeEmailModalOpen(true)}
                                className="btn fs-10px text-success text-underline text-capitalize ms-1"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                </div>
                <div className="row w-100 mx-auto">
                    <div className="detail_item col-sm-4 col-md-6 br">
                        Password
                    </div>
                    <div className="detail_item col-sm-8 col-md-6">
                        <div className="d-flex align-items-center justify-content-between">
                            <p>*******</p>
                            <button
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="btn fs-10px text-success text-underline text-capitalize ms-1"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                </div>
                <div className="row w-100 mx-auto">
                    <div className="detail_item col-sm-4 col-md-6 br">
                        Discord
                    </div>
                    <div className="detail_item col-sm-8 col-md-6">
                        <div className="d-flex align-items-center justify-content-between">
                            <p>{discordName || "Not Connected"}</p>
                            <button
                                onClick={() =>
                                    setIsChangeDiscordModalOpen(true)
                                }
                                className="btn fs-10px text-success text-underline text-capitalize ms-1"
                            >
                                {discordName ? "Change" : "Connect"}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="row w-100 mx-auto">
                    <div className="detail_item col-sm-4 col-md-6 br">
                        Verification Status
                    </div>
                    <div className="detail_item col-sm-8 col-md-6">
                        {shuftiStatus === "approved" ? (
                            <div className="d-flex align-items-center gap-2">
                                <div className="circle circle-success" />
                                <div className="text-light fs-15px fw-500 text-capitalize">
                                    verified
                                </div>
                            </div>
                        ) : shuftiStatus === "pending" ? (
                            <div className="d-flex align-items-center gap-2">
                                <div className="circle circle-warning" />
                                <div className="text-light fs-15px fw-500 text-capitalize">
                                    under review
                                </div>
                            </div>
                        ) : (
                            <div className="d-flex align-items-center gap-2">
                                <div className="circle circle-dark" />
                                <Link
                                    to={ROUTES.verifyId}
                                    className="text-light-blue fs-15px fw-bold text-underline text-capitalize"
                                >
                                    Setup
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
                <div className="row w-100 mx-auto">
                    <div className="detail_item col-sm-4 col-md-6 br">
                        Currency
                    </div>
                    <div className="detail_item col-sm-8 col-md-6">
                        <div
                            className="d-flex align-items-center justify-content-between"
                            style={{ height: 40 }}
                        >
                            <div className="d-flex align-items-center">
                                <div
                                    className="flag_div"
                                    style={{ width: 14, height: 14 }}
                                >
                                    <img
                                        src={
                                            savedCurrency.value !== "EUR"
                                                ? `${process.env.GATSBY_CurrencyIconEndpoint}/${String(savedCurrency.value).toLowerCase()}.png`
                                                : EuropeanFlag
                                        }
                                        alt={savedCurrency.value}
                                    />
                                </div>
                                <p className="ms-2">{savedCurrency.label}</p>
                            </div>
                            <button
                                onClick={() => setIsCurrencyModalOpen(true)}
                                className="btn fs-10px text-success text-underline text-capitalize ms-1"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
