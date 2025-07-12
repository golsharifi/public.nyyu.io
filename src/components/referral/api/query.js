import { gql } from "@apollo/client";

export const GET_REFERRAL = gql`
    query GetReferral {
        getReferral {
            referralCode
            rate
            walletConnect
            commissionRate
        }
    }
`

export const GET_EARNING = gql`
    query GetReferredUsers {
        getReferredUsers {
            name
            amount
        }
    }
`

export const CHECK_TIMELOCK = gql`
    query CheckTimeLock {
        checkTimeLock
    }
`