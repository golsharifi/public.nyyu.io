import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useSelector } from "react-redux";
import { useQuery } from "@apollo/client";
import { Icon } from "@iconify/react";
import CustomSpinner from "../common/custom-spinner";
import { CloseIcon } from "../../utilities/imgImport";
import { GET_USER_TIERS } from "../../apollo/graphqls/querys/UserTier";
import {
    GET_USER_TIER_TASK,
    GET_TASK_SETTING,
} from "../profile/profile-queries";
import { GET_BALANCES } from "../../apollo/graphqls/querys/Auth";

const ISSUE_TYPES = [
    { value: "account", label: "Account Issues" },
    { value: "deposit", label: "Deposit Problems" },
    { value: "withdrawal", label: "Withdrawal Problems" },
    { value: "trading", label: "Trading Issues" },
    { value: "verification", label: "Identity Verification" },
    { value: "security", label: "Security Concerns" },
    { value: "technical", label: "Technical Support" },
    { value: "billing", label: "Billing & Payments" },
    { value: "feature", label: "Feature Request" },
    { value: "other", label: "Other" },
];

export default function SupportRequestModal({ isOpen, closeModal }) {
    // Get user data from Redux - handle both possible structures
    const userData = useSelector((state) => state.auth?.user);
    const user = userData?.getUser || userData; // Handle nested or direct structure
    const currencyRates = useSelector((state) => state.currencyRates) || {};
    const favAssets = useSelector((state) => state.favAssets) || {
        currency: { value: "USD" },
    };

    console.log("🔍 Support Modal - User Debug:", {
        userData,
        user,
        userEmail: user?.email,
        userName: user?.name,
        userTierLevel: user?.tierLevel,
        userPhone: user?.phone,
        userCountry: user?.country,
    });

    // Auto-populated user data state
    const [userTierData, setUserTierData] = useState(null);
    const [userTierTaskData, setUserTierTaskData] = useState(null);
    const [userTiersData, setUserTiersData] = useState([]);
    const [userBalanceData, setUserBalanceData] = useState([]);

    const [formData, setFormData] = useState({
        issueType: "account",
        subject: "",
        message: "",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [ticketId, setTicketId] = useState("");

    // Load user tier information
    useQuery(GET_USER_TIERS, {
        skip: !isOpen,
        onCompleted: (data) => {
            setUserTiersData(data?.getUserTiers || []);
        },
        onError: (error) => {
            console.error("Error loading user tiers:", error);
        },
    });

    // Load user tier task data (includes wallet balance)
    useQuery(GET_USER_TIER_TASK, {
        skip: !isOpen,
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            setUserTierTaskData(data?.getUserTierTask);
        },
        onError: (error) => {
            console.error("Error loading user tier task:", error);
        },
    });

    // Load user balance data
    useQuery(GET_BALANCES, {
        skip: !isOpen,
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            console.log("📊 Balance data loaded:", data?.getBalances);
            setUserBalanceData(data?.getBalances || []);
        },
        onError: (error) => {
            console.error("Error loading balances:", error);
        },
    });

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                issueType: "account",
                subject: "",
                message: "",
            });
            setErrors({});
            setIsSuccess(false);
            setTicketId("");
        }
    }, [isOpen]);

    const resetForm = () => {
        setFormData({
            issueType: "account",
            subject: "",
            message: "",
        });
        setErrors({});
        setIsSuccess(false);
        setTicketId("");
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.subject.trim()) {
            newErrors.subject = "Subject is required";
        }

        if (!formData.message.trim()) {
            newErrors.message = "Message is required";
        } else if (formData.message.length < 10) {
            newErrors.message = "Message must be at least 10 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Generate user information summary
    const generateUserInfo = () => {
        const currentTier = userTiersData.find(
            (tier) => tier.level === user?.tierLevel,
        );
        const currency = favAssets.currency?.value || "USD";
        const currencyRate = currencyRates[currency] || 1;

        // Calculate total balance from the balance data
        let totalBalance = 0;
        const balanceDetails = [];

        if (userBalanceData.length > 0) {
            userBalanceData.forEach((asset) => {
                // Use 'free' field for available balance and calculate USD value
                const freeAmount = parseFloat(asset.free) || 0;
                const holdAmount = parseFloat(asset.hold) || 0;
                const totalAmount = freeAmount + holdAmount;

                if (totalAmount > 0) {
                    // For now, just show the amounts - proper USD conversion would need asset prices
                    balanceDetails.push(
                        `${asset.tokenSymbol}: ${freeAmount} available, ${holdAmount} on hold`,
                    );
                    totalBalance += totalAmount; // Simple sum for now
                }
            });
        }

        const userInfo = `
=== USER INFORMATION ===
Name: ${user?.name || "N/A"}
Email: ${user?.email || "N/A"}
User ID: ${user?.id || "N/A"}
Phone: ${user?.phone || "Not provided"}
Country: ${user?.country || "Not provided"}

=== ACCOUNT DETAILS ===
User Tier: ${currentTier?.name || "Unknown"} (Level ${user?.tierLevel || "N/A"})
Tier Points: ${user?.tierPoint || 0}
Registration Date: ${user?.regDate ? new Date(user.regDate).toLocaleDateString() : "N/A"}
Last Login: ${user?.lastLoginDate ? new Date(user.lastLoginDate).toLocaleDateString() : "N/A"}

=== VERIFICATION STATUS ===
Email Verified: ${user?.verify?.emailVerified ? "Yes" : "No"}
Phone Verified: ${user?.verify?.phoneVerified ? "Yes" : "No"}
KYC Verified: ${user?.verify?.kycVerified ? "Yes" : "No"}
AML Verified: ${user?.verify?.amlVerified ? "Yes" : "No"}

=== WALLET INFORMATION ===
Total Assets: ${balanceDetails.length}
Wallet Balance (Tier Points): ${userTierTaskData?.wallet || 0}

${
    balanceDetails.length > 0
        ? `=== ASSET BREAKDOWN ===
${balanceDetails.join("\n")}`
        : "No active assets found."
}

=== TECHNICAL INFORMATION ===
User Agent: ${navigator.userAgent}
Current URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}

=== USER'S ISSUE ===
`;
        return userInfo;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Check if user email exists
        if (!user?.email) {
            setErrors({
                submit: "User email not found. Please refresh the page and try again.",
            });
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            // Get issue type label
            const issueTypeLabel =
                ISSUE_TYPES.find((type) => type.value === formData.issueType)
                    ?.label || formData.issueType;

            // Generate unique ticket ID
            const newTicketId = `SUP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

            // Prepare the enhanced message with user information
            const enhancedMessage = generateUserInfo() + formData.message;

            // TEMPORARY: For testing - replace with your actual email service
            const USE_TEST_MODE = true; // Set to false when you have email service configured

            if (USE_TEST_MODE) {
                // Test mode - just log the data and simulate success
                console.log("🧪 TEST MODE - Support request data:", {
                    ticketId: newTicketId,
                    issueType: issueTypeLabel,
                    subject: formData.subject,
                    message: formData.message,
                    userInfo: generateUserInfo(),
                    userData: {
                        email: user?.email,
                        name: user?.name,
                        tier: userTiersData.find(
                            (t) => t.level === user?.tierLevel,
                        )?.name,
                        assets: userBalanceData.length,
                    },
                });

                // Simulate API delay
                await new Promise((resolve) => setTimeout(resolve, 1000));

                // Simulate success
                console.log("✅ TEST MODE - Simulated successful submission");
                setTicketId(newTicketId);
                setIsSuccess(true);

                // Reset form after 4 seconds and close modal
                setTimeout(() => {
                    setIsSuccess(false);
                    resetForm();
                    closeModal();
                }, 4000);

                return; // Exit early in test mode
            }

            const requestData = {
                access_key: "YOUR_WEB3FORMS_ACCESS_KEY", // You need to replace this with your actual key
                subject: `${issueTypeLabel}: ${formData.subject} [${newTicketId}]`,
                message: enhancedMessage,
                from_name: "Nyyu Support System",
                to: "support@nyyu.io",
                replyto: user?.email,
                // Additional metadata
                ticket_id: newTicketId,
                issue_type: issueTypeLabel,
                username: user?.name || user?.email,
                user_id: user?.id,
                user_tier:
                    userTiersData.find((t) => t.level === user?.tierLevel)
                        ?.name || "Unknown",
                total_assets: userBalanceData.length,
                user_agent: navigator.userAgent,
                url: window.location.href,
            };

            console.log("📤 Request data:", requestData);

            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(requestData),
            });

            const result = await response.json();

            console.log("📥 Response:", {
                status: response.status,
                ok: response.ok,
                result,
            });

            if (response.ok && result.success) {
                console.log("✅ Support request sent successfully");
                setTicketId(newTicketId);
                setIsSuccess(true);

                // Reset form after 4 seconds and close modal
                setTimeout(() => {
                    setIsSuccess(false);
                    resetForm();
                    closeModal();
                }, 4000);
            } else {
                console.error("❌ API Error:", result);
                throw new Error(
                    result.message ||
                        `Server responded with status ${response.status}`,
                );
            }
        } catch (error) {
            console.error("💥 Failed to send support request:", error);

            // More specific error messages
            let errorMessage = "Failed to send support request. ";

            if (error.message.includes("fetch")) {
                errorMessage += "Network connection issue. ";
            } else if (error.message.includes("access_key")) {
                errorMessage += "Configuration error. ";
            } else {
                errorMessage += `Error: ${error.message}. `;
            }

            errorMessage +=
                "Please try again or contact us directly at support@nyyu.io";

            setErrors({
                submit: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            resetForm();
            closeModal();
        }
    };

    const selectedIssueType = ISSUE_TYPES.find(
        (type) => type.value === formData.issueType,
    );

    // Get current tier name for display
    const currentTierName =
        userTiersData.find((tier) => tier.level === user?.tierLevel)?.name ||
        "Unknown";
    const totalAssets = userBalanceData.filter((asset) => {
        const freeAmount = parseFloat(asset.free) || 0;
        const holdAmount = parseFloat(asset.hold) || 0;
        return freeAmount + holdAmount > 0;
    }).length;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleClose}
            contentLabel="Support Request"
            className="modal-content-support-request"
            overlayClassName="modal-overlay"
            closeTimeoutMS={200}
        >
            <div className="modal-header">
                <h2 className="modal-title">Submit Support Request</h2>
                {!isSubmitting && (
                    <button
                        className="btn-close"
                        onClick={handleClose}
                        aria-label="Close"
                    >
                        <img src={CloseIcon} alt="Close" />
                    </button>
                )}
            </div>

            <div className="modal-body">
                <p className="modal-description">
                    Please fill in the form below and we will assist you with
                    your request as soon as possible. Your account information
                    will be automatically included.
                </p>

                {/* Auto-populated user info preview */}
                {user && (
                    <div
                        className="alert alert-info mb-3"
                        style={{
                            backgroundColor: "rgba(0, 123, 255, 0.1)",
                            borderColor: "#007bff",
                            color: "#ffffff",
                        }}
                    >
                        <small>
                            <strong>Account Info:</strong>{" "}
                            {user.name || user.email} ({user.email}) |
                            <strong> Tier:</strong> {currentTierName} |
                            <strong> Assets:</strong> {totalAssets} active
                        </small>
                    </div>
                )}

                {isSuccess ? (
                    <div className="success-content">
                        <Icon
                            icon="mdi:check-circle"
                            className="success-icon"
                        />
                        <h3 className="success-title">
                            Request Sent Successfully!
                        </h3>
                        <div className="ticket-id">Ticket ID: {ticketId}</div>
                        <p className="success-message">
                            Your support request has been sent to our team with
                            all your account information. We'll get back to you
                            at <strong>{user?.email}</strong> as soon as
                            possible.
                        </p>
                        <p className="success-note">
                            This window will close automatically in a few
                            seconds...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Issue Type Field */}
                        <div className="mb-3">
                            <label className="form-label">
                                Issue Type{" "}
                                <span className="text-danger">*</span>
                            </label>
                            <select
                                className="form-select"
                                value={formData.issueType}
                                onChange={(e) =>
                                    handleInputChange(
                                        "issueType",
                                        e.target.value,
                                    )
                                }
                                disabled={isSubmitting}
                            >
                                {ISSUE_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Subject Field */}
                        <div className="mb-3">
                            <label className="form-label">
                                Subject <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-control ${errors.subject ? "is-invalid" : ""}`}
                                value={formData.subject}
                                onChange={(e) =>
                                    handleInputChange("subject", e.target.value)
                                }
                                placeholder="Brief description of your issue"
                                disabled={isSubmitting}
                                maxLength={100}
                            />
                            {errors.subject && (
                                <div className="invalid-feedback">
                                    {errors.subject}
                                </div>
                            )}
                        </div>

                        {/* Message Field */}
                        <div className="mb-3">
                            <label className="form-label">
                                Message <span className="text-danger">*</span>
                            </label>
                            <textarea
                                className={`form-control ${errors.message ? "is-invalid" : ""}`}
                                value={formData.message}
                                onChange={(e) =>
                                    handleInputChange("message", e.target.value)
                                }
                                placeholder="Please describe your issue in detail. Your account information and wallet balances will be automatically included."
                                disabled={isSubmitting}
                                rows={5}
                                maxLength={2000}
                            />
                            <div className="form-text">
                                {formData.message.length}/2000 characters
                            </div>
                            {errors.message && (
                                <div className="invalid-feedback">
                                    {errors.message}
                                </div>
                            )}
                        </div>

                        {/* Error Display */}
                        {errors.submit && (
                            <div className="alert alert-danger">
                                {errors.submit}
                            </div>
                        )}

                        {/* Submit Button - Using btn-primary style */}
                        <div className="mt-4 mb-3">
                            <button
                                type="submit"
                                className="btn-primary w-100 text-uppercase d-flex align-items-center justify-content-center py-2"
                                disabled={isSubmitting}
                            >
                                <div
                                    className={`${
                                        isSubmitting
                                            ? "opacity-100"
                                            : "opacity-0"
                                    }`}
                                >
                                    <CustomSpinner />
                                </div>
                                <div
                                    className={`fs-20px ${
                                        isSubmitting ? "ms-3" : "pe-4"
                                    }`}
                                >
                                    {isSubmitting
                                        ? "Sending..."
                                        : "Submit Request"}
                                </div>
                            </button>
                        </div>

                        <div className="form-footer">
                            <small>
                                Your account information, tier level, and wallet
                                balances will be automatically included with
                                this request to help our support team assist you
                                better.
                            </small>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}
