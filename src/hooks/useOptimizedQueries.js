import { useQuery } from "@apollo/client";
import { GET_USER } from "../apollo/graphqls/querys/Auth";
import { GET_AVATARS } from "../apollo/graphqls/querys/AvatarComponent";
import { GET_SHUFT_REFERENCE } from "../components/verify-identity/kyc-webservice";

// Custom hook to consolidate and optimize queries
export const useOptimizedQueries = () => {
    // Single user query with optimized fetch policy
    const { data: userData, loading: userLoading } = useQuery(GET_USER, {
        fetchPolicy: "cache-first",
        errorPolicy: "ignore",
        notifyOnNetworkStatusChange: false,
    });

    // Single avatars query with optimized fetch policy
    const { data: avatarsData, loading: avatarsLoading } = useQuery(
        GET_AVATARS,
        {
            fetchPolicy: "cache-first",
            errorPolicy: "ignore",
            notifyOnNetworkStatusChange: false,
        },
    );

    // Single Shufti query with optimized fetch policy
    const { data: shuftiData, loading: shuftiLoading } = useQuery(
        GET_SHUFT_REFERENCE,
        {
            fetchPolicy: "cache-first",
            errorPolicy: "ignore",
            notifyOnNetworkStatusChange: false,
        },
    );

    return {
        userData,
        avatarsData,
        shuftiData,
        loading: userLoading || avatarsLoading || shuftiLoading,
    };
};
