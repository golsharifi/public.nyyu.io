// activate referrer address and code
import { gql } from "@apollo/client";

export const ACTIVATE_REFERRER = gql`
    mutation ActivateReferralCode(
        $wallet: String!
    ) {
        activateReferralCode(
            wallet: $wallet
        ) {
            code
            referralWallet
            rate
            commissionRate
        }
    }
`

export const CHANGE_COMMISSION_WALLET = gql`
    mutation changeReferralCommissionWallet(
        $wallet: String!
    ) {
        changeReferralCommissionWallet(
            wallet: $wallet
        ) {
            status
            referralWallet
            rate
            commissionRate
        }
    }
`

