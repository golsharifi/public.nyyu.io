import { gql } from "@apollo/client";

export const GET_USER_TIER_TASK = gql`
    {
        getUserTierTask {
            userId
            verification
            wallet
            auctions
            direct
            staking {
                expiredTime
                amount
            }
        }
    }
`;
export const GET_TASK_SETTING = gql`
    {
        getTaskSetting {
            id
            verification
            wallet {
                amount
                point
            }
            auction
            direct
            staking {
                expiredTime
                ratio
            }
        }
    }
`;

export const GET_USER_TIERS = gql`
    {
        getUserTiers {
            level
            name
            point
            svg
        }
    }
`;

export const CHANGE_EMAIL = gql`
    mutation {
        changeEmail
    }
`;

export const CONFIRM_CHANGE_EMAIL = gql`
    mutation confirmChangeEmail($newEmail: String, $code: String) {
        confirmChangeEmail(newEmail: $newEmail, code: $code)
    }
`;

export const CHANGE_BUY_NAME = gql`
    mutation changeBuyName($newName: String!) {
        changeBuyName(newName: $newName)
    }
`;

export const GET_ALL_BUY_NAME_PRICES = gql`
    query {
        getAllBuyNamePrices {
            id
            numOfChars
            price
        }
    }
`;

export const GET_DISCORD = gql`
    query {
        getDiscord
    }
`;

export const ADD_DISCORD = gql`
    mutation AddDiscord(
        $username: String!
    ) {
        addDiscord(
            username: $username
        )
    }
`;
