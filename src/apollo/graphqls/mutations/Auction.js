import { gql } from '@apollo/client';

export const CREATE_AUCTION = gql`
    mutation CreateAuction(
        $startedAt: Float!
        $duration: Float!
        $totalToken: Float!
        $minPrice: Float!
        $avatar: [AvatarSetInput]
        $token: Float
    ) {
        createAuction(
            startedAt: $startedAt
            duration: $duration
            totalToken: $totalToken
            minPrice: $minPrice
            avatar: $avatar
            token: $token
        ) {
            id
            round
        }
    }
`;

export const CREATE_NEW_PRESALE = gql`
    mutation CreateNewPresale(
        $startedAt: Float!
        $endedAt: Float!
        $tokenAmount: Float!
        $tokenPrice: Float!
        $conditions: [PreSaleConditionInput!]!
    ) {
        createNewPresale(
            startedAt: $startedAt
            endedAt: $endedAt
            tokenAmount: $tokenAmount
            tokenPrice: $tokenPrice
            conditions: $conditions
        )
    }
`;