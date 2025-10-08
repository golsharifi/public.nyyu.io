import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { navigate } from "gatsby";
import { isMobile } from "react-device-detect";
import { ReactTooltip } from "../../utilities/tooltip";
import { Icon } from "@iconify/react";

import { CheckBox } from "../common/FormControl";
import { TRUST_URL } from "./data";
import {
    PAYMENT_FRACTION_TOOLTIP_CONTENT,
    wallets,
} from "../../utilities/staticData";
import TokenSelectModal from "./token-select-modal";
import { SUPPORTED_COINS } from "../../utilities/staticData2";

export default function PaymentExternalWalletTab() {
    const { round_id: currentRound, bid_amount: bidAmount } = useSelector(
        (state) => state?.placeBid,
    );

    // wagmi hook
    const { data: accountInfo } = useAccount();
    const {
        activeConnector,
        connect,
        connectors,
        error: connectError,
    } = useConnect();
    const { disconnect } = useDisconnect();

    const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

    const showTokenModal = () => {
        setIsTokenModalOpen(true);
    };

    const closeModal = () => {
        setIsTokenModalOpen(false);
    };

    return (
        <div className="row">
            {activeConnector && isTokenModalOpen && (
                <TokenSelectModal
                    isTokenModalOpen={isTokenModalOpen}
                    closeModal={closeModal}
                    bidAmount={bidAmount}
                    currentRound={currentRound}
                    accountInfo={accountInfo}
                    SUPPORTED_COINS={SUPPORTED_COINS}
                    defaultNetwork={null}
                />
            )}
            <>
                {connectors?.map((connector, idx) =>
                    accountInfo &&
                    accountInfo?.connector.name === connector.name ? (
                        <div className="col-sm-6 mb-10px" key={idx}>
                            <div className="connected">
                                <img
                                    src={
                                        wallets[accountInfo.connector.id]?.icon
                                    }
                                    alt="wallet icon"
                                />
                                <p>{accountInfo.address}</p>
                                <button
                                    className="small-btn disconnect"
                                    onClick={() => disconnect()}
                                >
                                    Disconnect
                                </button>
                                <button
                                    className="small-btn payment"
                                    onClick={showTokenModal}
                                >
                                    Pay
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="col-sm-6"
                            key={idx}
                            role="presentation"
                            onClick={() => connect(connector)}
                        >
                            <div
                                className={`wallet-item  ${!connector.ready && "inactive"}`}
                            >
                                <img
                                    src={wallets[connector.id]?.icon}
                                    alt="wallet icon"
                                />
                                <p>
                                    {connector.ready
                                        ? wallets[connector.id]?.desc
                                        : wallets[connector.id]?.warn}
                                </p>
                            </div>
                        </div>
                    ),
                )}
                <div
                    className="col-sm-6"
                    onClick={() => {
                        isMobile && navigate(TRUST_URL);
                    }}
                    onKeyDown={() => {
                        isMobile && navigate(TRUST_URL);
                    }}
                    role="presentation"
                >
                    <div className={`wallet-item  ${!isMobile && "inactive"}`}>
                        <img src={wallets.trustWallet.icon} alt="wallet icon" />
                        <p>
                            {isMobile
                                ? wallets.trustWallet.desc
                                : wallets.trustWallet.warn}
                        </p>
                    </div>
                </div>
            </>
            <div
                className="py-2"
                style={{ color: connectError ? "#E8503A" : "#23C865" }}
            >
                {}
            </div>
            <div className="mt-1 d-flex justify-content-between">
                <div className="d-flex flex-row text-white align-items-center">
                    <CheckBox
                        type="checkbox"
                        name="allow_fraction"
                        // value={allow_fraction}
                        // onChange={
                        //     handleAllowFraction
                        // }
                        className="text-uppercase"
                    />
                    <div className="allow-text">
                        Do you allow fraction of order completion?
                        <span
                            className="ms-2 fs-20px"
                            data-tip="React-tooltip"
                            data-for="external-wallet-question-mark-tooltip"
                        >
                            <Icon icon="bi:question-circle" />
                        </span>
                    </div>
                    <ReactTooltip
                        id="external-wallet-question-mark-tooltip"
                        place="right"
                        type="light"
                        effect="solid"
                    >
                        <div
                            className="text-justify"
                            style={{
                                width: "300px",
                            }}
                        >
                            {PAYMENT_FRACTION_TOOLTIP_CONTENT}
                        </div>
                    </ReactTooltip>
                </div>
                <p className="payment-expire my-auto text-uppercase">
                    payment expires in{" "}
                    <span className="txt-green">10 minutes</span>
                </p>
            </div>
        </div>
    );
}
