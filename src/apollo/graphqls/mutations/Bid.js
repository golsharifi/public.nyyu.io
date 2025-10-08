import { gql } from "@apollo/client"

export const PLACE_BID = gql`
    mutation PlaceBid(
        $roundId: Int!
        $tokenAmount: Float!
        $tokenPrice: Float!
    ) {
        placeBid(
            roundId: $roundId
            tokenAmount: $tokenAmount
            tokenPrice: $tokenPrice
        ) {
            userId
            prefix
            name
            roundId
            tokenAmount
            totalAmount
            paidAmount
            tokenPrice
            tempTokenAmount
            tempTokenPrice
            delta
            pendingIncrease
            holdings {
                key
                value {
                    crypto
                    usd
                }
            }
            payType
            cryptoType
            placedAt
            updatedAt
            status
        }
    }
`

export const INCREASE_BID = gql`
    mutation increaseBid(
        $roundId: Int!
        $tokenAmount: Float!
        $tokenPrice: Float!
    ) {
        increaseBid(
            roundId: $roundId
            tokenAmount: $tokenAmount
            tokenPrice: $tokenPrice
        ) {
            userId
            prefix
            name
            roundId
            tokenAmount
            totalAmount
            paidAmount
            tokenPrice
            tempTokenAmount
            tempTokenPrice
            delta
            pendingIncrease
            holdings {
                key
                value {
                    crypto
                    usd
                }
            }
            payType
            cryptoType
            placedAt
            updatedAt
            status
        }
    }
`

export const PLACE_PRESALE_ORDER = gql`
    mutation PlacePreSaleOrder(
        $presaleId: Int!
        $ndbAmount: Float!
        $destination: Int!
        $extAddr: String!
    ) {
        placePreSaleOrder(
            presaleId: $presaleId
            ndbAmount: $ndbAmount
            destination: $destination
            extAddr: $extAddr
        ) {
            id,
            userId,
            presaleId,
            destination,
            extAddr,
            ndbAmount,
            ndbPrice,
            status,
            createdAt,
            updatedAt
        }
    }
`
