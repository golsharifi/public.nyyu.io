import { gql } from "@apollo/client"

export const GET_PRESALE_BY_STATUS = gql`
    query getPreSaleByStatus($status: Int!){
        getPreSaleByStatus(status: $status) {
            id
            round
            startedAt
            endedAt
            tokenAmount
            tokenPrice
            sold
            status
            conditions {
                presaleId
                task
                url
            }
        }
    }
`

export const GET_AUCTION_BY_STATUS = gql`
    query getAuctionByStatus($status: Int!){
        getAuctionByStatus(status: $status) {
            id
            regDate
            updateDate
            deleted
            round
            startedAt
            endedAt
            totalToken
            minPrice
            token
            sold
            stats{
              qty
              win
              fail
            }
            status
        }
    }
`
