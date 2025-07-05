import React, { useCallback, useReducer, useState, useEffect } from "react";
import { Input } from "../common/FormControl";
import Modal from "react-modal";
import { CloseIcon } from "../../utilities/imgImport";
import { useSignUp2FA } from "../../apollo/model/auth";
import { useMutation } from "@apollo/client";
import {
    REQUEST_2FA,
    DISABLE_2FA,
    CONFIRM_REQUEST_2FA,
} from "../../apollo/graphqls/mutations/Auth";
import CustomSpinner from "../common/custom-spinner";
import { FaExclamationCircle } from "@react-icons/all-files/fa/FaExclamationCircle";
import "react-phone-number-input/style.css";
import ConnectMobile from "./connect-mobile";

const two_factors = [
    { label: "Authenticator App", method: "app" },
    { label: "SMS", method: "phone" },
    { label: "Email", method: "email" },
];

const initial = {
    result_code: "",
    set_type: -1,
    input_mobile: false,
    loading: false,
    error: false,
};

export default function TwoFactorModal({
    is2FAModalOpen,
    setIs2FAModalOpen,
    email,
    phone,
    twoStep,
    onResult,
    redirect,
}) {
    const [qrcode, setQRCode] = useState("");
    const [selected, setSelected] = useState(0);
    const [state, setState] = useReducer(
        (old, action) => ({ ...old, ...action }),
        initial,
    );
    const { result_code, set_type, input_mobile, loading, error } = state;

    const handleInput = useCallback((e) => {
        e.preventDefault();
        setState({ [e.target.name]: e.target.value });
    }, []);

    useEffect(() => {
        setState({ loading: false });
    }, [twoStep]);

    // for redirecting
    const [signup2faMutation] = useSignUp2FA();

    const [request2FA, { loading: request2FALoading }] = useMutation(
        REQUEST_2FA,
        {
            onCompleted: (data) => {
                if (
                    data.request2FA &&
                    data.request2FA.includes("already processed")
                ) {
                    // Handle the case where request was already processed
                    setState({
                        error: true,
                        loading: false,
                        errorMessage:
                            "A 2FA request is already in progress. Please wait a moment and try again.",
                    });
                    return;
                }
                setQRCode(data.request2FA);
                setState({ set_type: selected, loading: false, error: false });
            },
            onError: (error) => {
                console.error("2FA Request Error:", error);

                let errorMessage =
                    "An error occurred while setting up 2FA. Please try again.";

                // Handle specific constraint violation errors
                if (
                    error.message.includes("unique constraint") ||
                    error.message.includes("SYS_C005906") ||
                    error.message.includes("already processed")
                ) {
                    errorMessage =
                        "A 2FA request is already in progress. Please wait a moment and try again.";
                } else if (
                    error.graphQLErrors &&
                    error.graphQLErrors.length > 0
                ) {
                    const graphQLError = error.graphQLErrors[0];
                    if (graphQLError.message.includes("constraint")) {
                        errorMessage =
                            "A 2FA request is already in progress. Please wait a moment and try again.";
                    }
                }

                setState({
                    error: true,
                    loading: false,
                    errorMessage: errorMessage,
                });
                onResult(false);
            },
        },
    );

    // This will be only trigger on Profile page
    const [disable2FA] = useMutation(DISABLE_2FA, {
        onCompleted: (data) => {
            onResult(true);
        },
    });

    const [confirmRequest2FA, { loading: confirmLoading }] = useMutation(
        CONFIRM_REQUEST_2FA,
        {
            onCompleted: (data) => {
                if (data.confirmRequest2FA?.status === "Failed") {
                    setState(initial);
                    onResult(false);
                } else if (data.confirmRequest2FA?.status === "Success") {
                    onResult(true);
                    setState({
                        result_code: "",
                        set_type: -1,
                        input_mobile: false,
                        loading: false,
                        error: false,
                        errorMessage: "", // Add this line
                    });
                }
            },
            onError: (error) => {
                console.log("Error", error);
                onResult(false);
            },
        },
    );

    const sendRequest2FA = (i, mobile = "") => {
        // Clear any previous errors and set loading state
        setState({
            loading: true,
            error: false,
            errorMessage: "",
            set_type: -1, // Reset set_type until successful
        });

        // Add a small delay to prevent rapid successive calls
        setTimeout(() => {
            request2FA({
                variables: {
                    email,
                    method: two_factors[i].method,
                    phone: mobile,
                },
            });
        }, 100);
    };

    const closeModal = () => {
        setIs2FAModalOpen(false);
        setState(initial);
    };

    return (
        <Modal
            isOpen={is2FAModalOpen}
            onRequestClose={() => closeModal()}
            ariaHideApp={false}
            className="twoFA-modal"
            overlayClassName="2fa-modal__overlay"
        >
            <div className="tfa-modal__header">
                <div
                    onClick={() => closeModal()}
                    onKeyDown={() => closeModal()}
                    role="button"
                    tabIndex="0"
                >
                    <img
                        width="14px"
                        height="14px"
                        src={CloseIcon}
                        alt="close"
                    />
                </div>
            </div>
            <div className="twoFA-modal__body">
                {set_type === -1 ? (
                    input_mobile ? (
                        <ConnectMobile
                            confirm={(number) => sendRequest2FA(1, number)}
                        />
                    ) : (
                        <div className="tfa-select">
                            <h3 className="tfa-select-title">
                                Protect your account with 2-step verification
                            </h3>
                            <p className="mt-4 mb-5">
                                Each time you log in, in addition to your
                                password, you will enter a one-time code you
                                receive via text message or generate using an
                                authenticator app.
                            </p>
                            <div className="d-flex flex-column justify-content-center align-items-center">
                                {two_factors.map((item, idx) => {
                                    const enable = !!twoStep
                                        ? twoStep?.includes(item.method)
                                        : false;
                                    let available = true;
                                    if (item.method === "phone") {
                                        if (twoStep?.includes("app"))
                                            available = false;
                                    } else if (item.method === "app") {
                                        if (twoStep?.includes("phone"))
                                            available = false;
                                    }
                                    return (
                                        <div key={idx} className="tfa-line">
                                            <div className="tfa-line_labels">
                                                <p className="tfa-line_labels_type">
                                                    {item.label}
                                                </p>
                                                {enable && (
                                                    <p className="tfa-line_labels_preview">
                                                        {item.method ===
                                                            "phone" && phone
                                                            ? "*******" +
                                                              phone.slice(-3)
                                                            : ""}
                                                        {item.method ===
                                                            "email" &&
                                                            email.slice(0, 2) +
                                                                "***@***" +
                                                                email.slice(-2)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="tfa-line_buttons">
                                                {enable ? (
                                                    <>
                                                        <button className="tfa-line_buttons_change">
                                                            Change
                                                        </button>
                                                        <button
                                                            className="btn-primary select-tfa d-flex align-items-center justify-content-center"
                                                            onClick={() => {
                                                                setSelected(
                                                                    idx,
                                                                );
                                                                setState({
                                                                    loading: true,
                                                                });
                                                                disable2FA({
                                                                    variables: {
                                                                        method: item.method,
                                                                    },
                                                                });
                                                            }}
                                                        >
                                                            <div
                                                                className={`${
                                                                    selected ===
                                                                        idx &&
                                                                    loading
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                }`}
                                                            >
                                                                <CustomSpinner />
                                                            </div>
                                                            <div
                                                                className={`${
                                                                    selected ===
                                                                        idx &&
                                                                    loading
                                                                        ? "ms-3"
                                                                        : "pe-4"
                                                                }`}
                                                            >
                                                                Disable
                                                            </div>
                                                        </button>
                                                    </>
                                                ) : available === true ? (
                                                    <button
                                                        disabled={
                                                            (!!twoStep &&
                                                                two_factors[idx]
                                                                    .method ===
                                                                    "app" &&
                                                                twoStep?.includes(
                                                                    "phone",
                                                                )) ||
                                                            (!!twoStep &&
                                                                two_factors[idx]
                                                                    .method ===
                                                                    "phone" &&
                                                                twoStep?.includes(
                                                                    "app",
                                                                ))
                                                        }
                                                        className="btn-primary select-tfa d-flex align-items-center justify-content-center enable"
                                                        onClick={() => {
                                                            setSelected(idx);
                                                            if (
                                                                item.method ===
                                                                "phone"
                                                            ) {
                                                                setState({
                                                                    input_mobile: true,
                                                                });
                                                            } else {
                                                                setState({
                                                                    loading: true,
                                                                });
                                                                setTimeout(
                                                                    () =>
                                                                        sendRequest2FA(
                                                                            idx,
                                                                        ),
                                                                    300,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <div
                                                            className={`${
                                                                selected ===
                                                                    idx &&
                                                                loading
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            }`}
                                                        >
                                                            <CustomSpinner color="black" />
                                                        </div>
                                                        <div
                                                            className={`${
                                                                selected ===
                                                                    idx &&
                                                                loading
                                                                    ? "ms-3"
                                                                    : "pe-4"
                                                            }`}
                                                        >
                                                            Enable
                                                        </div>
                                                    </button>
                                                ) : (
                                                    <button
                                                        disabled
                                                        className="btn btn-light rounded-0 select-tfa d-flex align-items-center justify-content-center enable disabled"
                                                    >
                                                        Unavailable
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                ) : (
                    <div className="get-code">
                        {set_type === 0 && (
                            <>
                                <h3>Get codes from authenticator app</h3>
                                <div className="mt-3">
                                    <p className="fw-bolder">STEP 1</p>
                                    <p className="step1-label">
                                        Scan the QR code below or mannually type
                                        the secret key into your authenticator
                                        app.
                                    </p>
                                    <img
                                        src={qrcode}
                                        width={120}
                                        alt="qr code"
                                    />
                                    <p>
                                        <small className="fw-bold">SCAN</small>
                                    </p>
                                </div>
                                <div className="mt-3">
                                    <p className="fw-bolder">STEP 2</p>
                                    <p className="mt-2 mb-3">
                                        Enter 6-digit code you see in your
                                        authentificator app
                                    </p>
                                </div>
                            </>
                        )}

                        {set_type === 1 && (
                            <>
                                <h3>Get codes via SMS</h3>
                                <p className="mt-3 pb-3">
                                    Enter 6-digit code you got via text messages
                                </p>
                            </>
                        )}

                        {set_type === 2 && (
                            <>
                                <h3>Get codes via Email</h3>
                                <p className="mt-3 pb-3">
                                    Enter 6-digit code you got via email
                                </p>
                            </>
                        )}

                        <div className="mt-5">
                            <Input
                                style={
                                    result_code?.length > 0
                                        ? { opacity: 1 }
                                        : {}
                                }
                                type="text"
                                name="result_code"
                                value={result_code}
                                onChange={handleInput}
                                placeholder="000000"
                            />
                            <div className="result_code_error">
                                {error && (
                                    <span className="errorsapn">
                                        <FaExclamationCircle />{" "}
                                        {"Please input confirm code"}
                                    </span>
                                )}
                            </div>
                            <button
                                className="btn-primary next-step d-flex align-items-center justify-content-center"
                                onClick={() => {
                                    if (!result_code.length)
                                        setState({ error: true });
                                    else {
                                        if (redirect) {
                                            signup2faMutation(
                                                email,
                                                two_factors[selected].method,
                                                result_code,
                                            );
                                        } else {
                                            confirmRequest2FA({
                                                variables: {
                                                    email,
                                                    method: two_factors[
                                                        selected
                                                    ].method,
                                                    code: result_code,
                                                },
                                            });
                                        }
                                    }
                                }}
                            >
                                <div
                                    className={`${confirmLoading ? "opacity-100" : "opacity-0"}`}
                                >
                                    <CustomSpinner />
                                </div>
                                <div
                                    className={`${confirmLoading ? "ms-3" : "pe-4"}`}
                                >
                                    Confirm
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
