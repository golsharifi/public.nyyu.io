import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { navigate } from "gatsby";
import { useMutation } from "@apollo/client";
import { Icon } from "@iconify/react";

import { useAuction } from "../../providers/auction-context";
import { setBidInfo, setCurrentRound } from "../../store/actions/bidAction";
import { PLACE_PRESALE_ORDER } from "../../apollo/graphqls/mutations/Bid";
import { FaArrowLeft } from "@react-icons/all-files/fa/FaArrowLeft";

import CustomSpinner from "../common/custom-spinner";
import { CheckBox } from "../common/FormControl";
import { ROUTES } from "../../utilities/routes";
import { setPresaleOrderId } from "../../store/actions/bidAction";
import WalletSelector from "../common/wallet/WalletSelector";

export default function PresalePlaceOrderWalletSelect() {
    // wagmi connect
    const [selectedWallet, setSelectedWallet] = useState("internal");
    const [walletAddress, setWalletAddress] = useState(null);
    const onWalletChanged = (wallet) => {
        setSelectedWallet(wallet.selectedWallet);
        setWalletAddress(wallet.address);
    };

    const auction = useAuction();
    const dispatch = useDispatch();
    const { setPresalePlaceOrderStage, optCurrentRound, presaleNdbAmount } =
        auction;
    const [error, setError] = useState("");
    const [reqPending, setReqPending] = useState(false);

    const [placePresaleOrderMutation] = useMutation(PLACE_PRESALE_ORDER, {
        onCompleted: (data) => {
            // console.log(data.placePreSaleOrder)
            if (data.placePreSaleOrder) {
                dispatch(setPresaleOrderId(data.placePreSaleOrder?.id));
                navigate(ROUTES.payment);
            }
            setReqPending(false);
        },
        onError: (err) => {
            setError(err.message);
            setReqPending(false);
        },
    });

    const handlePresale = () => {
        setReqPending(true);
        setError("");
        placePresaleOrderMutation({
            variables: {
                presaleId: optCurrentRound?.id,
                ndbAmount: presaleNdbAmount,
                destination: selectedWallet === "external" ? 2 : 1,
                extAddr: selectedWallet === "external" ? walletAddress : "",
            },
        });
        dispatch(
            setBidInfo(Number(optCurrentRound?.tokenPrice * presaleNdbAmount)),
        );
        dispatch(setCurrentRound(optCurrentRound?.id));
    };

    const handlePrevious = () => {
        if (selectedWallet === "external") {
            setSelectedWallet(null);
            return;
        }
        setPresalePlaceOrderStage(0);
    };

    return (
        <div className="my-30px mx-40px">
            <div className="w-100 d-flex justify-content-center align-items-center position-relative text-white fw-700 title">
                SELECT DESTINATION WALLET
                <div className="position-absolute top-0px left-0px fs-30px">
                    <FaArrowLeft
                        className="left-arrow cursor-pointer text-light mb-1"
                        size="1.5rem"
                        onClick={handlePrevious}
                    />
                </div>
            </div>
            <div>
                <WalletSelector
                    walletChanged={onWalletChanged}
                    selectedWallet={selectedWallet}
                />
            </div>

            <div className="custom-checkbox pb-10px d-flex align-items-center ">
                <CheckBox
                    type="checkbox"
                    name="allow_fraction"
                    // value={}
                    // onChange={handleAllowFraction}
                    id="remember_select_wallet"
                />
                <label
                    className="custom-control-label"
                    htmlFor="remember_select_wallet"
                >
                    Remember my selection
                </label>
            </div>
            {error && (
                <div className="mt-1 mb-2">
                    <div className="d-flex align-items-center gap-2">
                        <Icon
                            className="icon-23px text-danger"
                            icon="bx:error-circle"
                        />
                        <p className="text-danger fw-500 text-[#959595]">
                            {error}
                        </p>
                    </div>
                </div>
            )}
            <button
                className="btn btn-outline-light rounded-0 text-uppercase w-100 fw-bold py-12px fs-20px"
                onClick={handlePresale}
                disabled={reqPending || !selectedWallet}
                style={{ height: 58 }}
            >
                <div className="d-flex align-items-center justify-content-center gap-3">
                    {reqPending && <CustomSpinner />}
                    GO TO PAYMENT
                </div>
            </button>
        </div>
    );
}
