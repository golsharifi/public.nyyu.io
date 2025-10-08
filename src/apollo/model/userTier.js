import { useQuery } from "@apollo/client";
import * as GraphQL from '../graphqls/querys/UserTier';

export const useGetUserTierQuery = () => {
    const queryResults = useQuery(GraphQL.GET_USER_TIERS);

    return queryResults;
};
