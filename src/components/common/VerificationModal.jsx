import React from "react";
import Modal from "react-modal";
import { Icon } from "@iconify/react";
import { navigate } from "gatsby";
import { ROUTES } from "../../utilities/routes";

const VerificationModal = ({ isOpen, onClose, actionType = "transaction" }) => {
    if (!isOpen) return null;

    const handleVerifyNow = () => {
        onClose();
        navigate(ROUTES.verifyId);
    };

    const handleCancel = () => {
        onClose();
        // Do not allow bypassing verification
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleCancel}
            ariaHideApp={false}
            className="verification-modal"
            overlayClassName="verification-modal__overlay"
            style={{
                overlay: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    zIndex: 9999,
                },
                content: {
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    right: "auto",
                    bottom: "auto",
                    marginRight: "-50%",
                    transform: "translate(-50%, -50%)",
                    maxWidth: "500px",
                    width: "90%",
                    padding: "0",
                    border: "none",
                    borderRadius: "12px",
                    backgroundColor: "#1a1a1a",
                    color: "white",
                    overflow: "hidden",
                },
            }}
        >
            <div
                style={{
                    background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    padding: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h4 style={{ margin: 0, color: "white", fontWeight: "bold" }}>
                    Verification Required
                </h4>
                <Icon
                    icon="carbon:close"
                    style={{
                        fontSize: "24px",
                        cursor: "pointer",
                        color: "white",
                        opacity: 0.8,
                        transition: "opacity 0.2s",
                    }}
                    onClick={handleCancel}
                    onMouseEnter={(e) => (e.target.style.opacity = "1")}
                    onMouseLeave={(e) => (e.target.style.opacity = "0.8")}
                />
            </div>

            <div style={{ padding: "30px" }}>
                <div style={{ textAlign: "center", marginBottom: "25px" }}>
                    <Icon
                        icon="carbon:security"
                        style={{
                            fontSize: "64px",
                            color: "#667eea",
                            marginBottom: "15px",
                        }}
                    />
                    <p
                        style={{
                            fontSize: "16px",
                            lineHeight: "1.6",
                            color: "#cccccc",
                            margin: "0",
                        }}
                    >
                        To ensure security and compliance, KYC verification is
                        required before you can{" "}
                        {actionType === "deposit" ? "deposit" : "withdraw"}{" "}
                        funds.
                    </p>
                </div>

                <div
                    style={{
                        backgroundColor: "#2a2a2a",
                        borderRadius: "8px",
                        padding: "15px",
                        marginBottom: "25px",
                        border: "1px solid #444",
                    }}
                >
                    <h6
                        style={{
                            color: "#667eea",
                            marginBottom: "10px",
                            fontSize: "14px",
                            fontWeight: "bold",
                        }}
                    >
                        Why verification is needed:
                    </h6>
                    <ul
                        style={{
                            margin: "0",
                            paddingLeft: "20px",
                            color: "#cccccc",
                            fontSize: "13px",
                            lineHeight: "1.5",
                        }}
                    >
                        <li>Protect your account from unauthorized access</li>
                        <li>Comply with financial regulations</li>
                        <li>Enable higher transaction limits</li>
                        <li>Secure your digital assets</li>
                    </ul>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        justifyContent: "center",
                    }}
                >
                    <button
                        onClick={handleCancel}
                        style={{
                            padding: "12px 24px",
                            border: "1px solid #555",
                            borderRadius: "6px",
                            backgroundColor: "transparent",
                            color: "#cccccc",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                            transition: "all 0.2s",
                            minWidth: "100px",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#333";
                            e.target.style.borderColor = "#666";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.borderColor = "#555";
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleVerifyNow}
                        style={{
                            padding: "12px 24px",
                            border: "none",
                            borderRadius: "6px",
                            background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "bold",
                            transition: "all 0.2s",
                            minWidth: "140px",
                            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = "translateY(-1px)";
                            e.target.style.boxShadow =
                                "0 6px 16px rgba(102, 126, 234, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow =
                                "0 4px 12px rgba(102, 126, 234, 0.3)";
                        }}
                    >
                        Verify Now
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default VerificationModal;
