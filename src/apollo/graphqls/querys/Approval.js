import { gql } from "@apollo/client";

export const GET_UNCONFIRMED_BANKDEPOSIT_TXNS = gql`
    query {
        getUnconfirmedBankDepositTxns {
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

export const GET_ALL_BANKDEPOSIT_TXNS = gql`
    query {
        getAllBankDepositTxns(
            orderBy: null
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

export const GET_ALL_CRYPTO_WITHDRAWS = gql`
    query {
        getAllCryptoWithdraws {
            id
            email
            sourceToken
            tokenAmount
            withdrawAmount
            status
            requestedAt
        }
    }
`;

export const GET_ALL_PAYPAL_WITHDRAWS = gql`
    query {
        getAllPaypalWithdraws {
            id
            email
            sourceToken
            tokenAmount
            withdrawAmount
            targetCurrency
            status
            requestedAt
        }
    }
`;

export const GET_CRYPTO_WITHDRAW_BY_ID = gql`
    query GetCryptoWithdrawById(
        $id: Int
    ) {
        getCryptoWithdrawById(
            id: $id
        ) {
            id
            userId
            email
            sourceToken
            withdrawAmount
            fee
            tokenAmount
            status
            deniedReason
            requestedAt
            confirmedAt
            network
            destination
        }
    }
`;

export const GET_CRYPTO_WITHDRAW_BY_ID_BY_ADMIN = gql`
    query GetCryptoWithdrawByIdByAdmin(
        $id: Int
    ) {
        getCryptoWithdrawByIdByAdmin(
            id: $id
        ) {
            id
            userId
            email
            sourceToken
            withdrawAmount
            fee
            tokenAmount
            status
            deniedReason
            requestedAt
            confirmedAt
            network
            destination
        }
    }
`;

export const GET_PAYPAL_WITHDRAW_BY_ID = gql`
    query GetPaypalWithdrawById(
        $id: Int
    ) {
        getPaypalWithdrawById(
            id: $id
        ) {
            id
            userId
            email
            targetCurrency
            sourceToken
            withdrawAmount
            fee
            tokenAmount
            status
            deniedReason
            requestedAt
            confirmedAt
            receiver
        }
    }
`;

export const GET_PAYPAL_WITHDRAW_BY_ID_BY_ADMIN = gql`
    query getPaypalWithdrawByIdByAdmin(
        $id: Int
    ) {
        getPaypalWithdrawByIdByAdmin(
            id: $id
        ) {
            id
            userId
            email
            targetCurrency
            sourceToken
            withdrawAmount
            fee
            tokenAmount
            status
            deniedReason
            requestedAt
            confirmedAt
            receiver
        }
    }
`;

export const GET_BANK_WITHDRAW_REQUESTS_BY_ADMIN = gql`
    query {
        getBankWithdrawRequestsByAdmin {
            id
            email
            targetCurrency
            withdrawAmount
            sourceToken
            tokenAmount
            status
            requestedAt
            confirmedAt
        }
    }
`;

export const GET_BANK_WITHDRAW_REQUEST_BY_ID_BY_ADMIN = gql`
    query GetBankWithdrawRequestByIdByAdmin(
        $id: Int
    ) {
        getBankWithdrawRequestByIdByAdmin(
            id: $id
        ) {
            id
            email
            targetCurrency
            withdrawAmount
            sourceToken
            tokenPrice
            tokenAmount
            status
            deniedReason
            requestedAt
            confirmedAt
            mode
            country
            holderName
            bankName
            accountNumber
            metadata
            address
            postCode
        }
    }
`;