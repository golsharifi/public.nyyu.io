import { gql } from '@apollo/client';

export const CONFIRM_BANK_DEPOSIT = gql`
    mutation ConfirmBankDeposit(
        $id: Int
        $currencyCode: String
        $amount: Float
        $cryptoType: String
        $code: String
    ) {
        confirmBankDeposit(
            id: $id
            currencyCode: $currencyCode
            amount: $amount
            cryptoType: $cryptoType
            code: $code
        ) {
            id
            userId
            email
            uid
            amount
            createdAt
            status
            fiatType
            usdAmount
            fee
            deposited
        }
    }
`;

export const CONFIRM_CRYPTO_WITHDRAW = gql`    
    mutation ConfirmCryptoWithdraw(
        $id: Int
        $status: Int
        $deniedReason: String
        $code: String
    ) {
        confirmCryptoWithdraw(
            id: $id
            status: $status
            deniedReason: $deniedReason
            code: $code
        )
    }
`;

export const CONFIRM_PAYPAL_WITHDRAW = gql`
    mutation ConfirmPaypalWithdraw(
        $id: Int
        $status: Int
        $deniedReason: String
        $code: String
    ) {
        confirmPaypalWithdraw(
            id: $id
            status: $status
            deniedReason: $deniedReason
            code: $code
        )
    }
`;

export const APPROVE_BANK_WITHDRAW_REQUEST = gql`
    mutation ApproveBankWithdrawRequest(
        $id: Int
        $code: String
    ) {
        approveBankWithdrawRequest(
            id: $id
            code: $code
        )
    }
`;

export const DENY_BANK_WITHDRAW_REQUEST = gql`
    mutation DenyBankWithdrawRequest(
        $id: Int
        $reason: String
    ) {
        denyBankWithdrawRequest(
            id: $id
            reason: $reason
        )
    }
`;

export const SEND_WITHDRAW_CONFIRM_CODE = gql`
    mutation {
        sendWithdrawConfirmCode
    }
`;