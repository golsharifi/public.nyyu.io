// File: src/hooks/useVerificationCheck.js
import { useState } from "react";
import { useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import { GET_USER } from "../apollo/graphqls/querys/Auth";

// GraphQL query to check user verification status
export const GET_USER_VERIFICATION = `
    query GetUserVerification {
        getUserVerification {
            id
            emailVerified
            phoneVerified
            kycVerified
            amlVerified
            kybVerified
        }
    }
`;

export const useVerificationCheck = () => {
    const [isVerificationModalOpen, setIsVerificationModalOpen] =
        useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    // Get user data from Redux store
    const userData = useSelector((state) => state.auth?.user);
    const user = userData?.getUser;

    // Query user verification status
    const {
        data: verificationData,
        loading,
        refetch,
    } = useQuery(GET_USER_VERIFICATION, {
        skip: !user?.id,
        fetchPolicy: "cache-and-network",
    });

    const isUserVerified = () => {
        // Check if user has completed KYC verification
        if (verificationData?.getUserVerification?.kycVerified) {
            return true;
        }

        // Fallback to checking user data from auth store
        if (user?.kycVerified || user?.isKycVerified) {
            return true;
        }

        return false;
    };

    const checkVerificationForAction = (actionType) => {
        if (loading) {
            return false; // Still loading, prevent action
        }

        if (isUserVerified()) {
            return true; // User is verified, allow action
        }

        // User is not verified, show modal
        setIsVerificationModalOpen(true);
        setPendingAction(actionType);
        return false;
    };

    const closeVerificationModal = () => {
        setIsVerificationModalOpen(false);
        setPendingAction(null);
    };

    const refreshVerificationStatus = () => {
        refetch();
    };

    return {
        isVerificationModalOpen,
        isUserVerified: isUserVerified(),
        pendingAction,
        checkVerificationForAction,
        closeVerificationModal,
        refreshVerificationStatus,
        loading,
    };
};
