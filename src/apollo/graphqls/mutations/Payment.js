import { gql } from "@apollo/client";

export const UPDATE_TRANSACTION_HASH = gql`
    mutation UpdateCoinpaymentTxHash(
        $id: Int!
        $txHash: String!
    ) {
        updateCoinpaymentTxHash(
            id: $id
            txHash: $txHash
        ) 
    }
`

export const CREATE_CRYPTO_PAYMENT = gql`
    mutation CreateCryptoPaymentForAuction(
        $roundId: Int!
        $cryptoType: String
        $network: String
        $coin: String!
    ) {
        createCryptoPaymentForAuction(
            roundId: $roundId
            cryptoType: $cryptoType
            network: $network
            coin: $coin
        ) {  
            id
            userId
            amount
            fee
            createdAt
            depositAddress
            cryptoType
            network
            cryptoAmount
            depositAddress
            coin
            orderId
            orderType
            txHash
            isShow
        }
    }
`;

export const CREATE_CHARGE_FOR_PRESALE = gql`
    mutation CreateChargeForPresale(
        $presaleId: Int
        $orderId: Int
        $coin: String
        $network: String
        $cryptoType: String
    ) {
        createChargeForPresale(
            presaleId: $presaleId
            orderId: $orderId
            coin: $coin
            network: $network
            cryptoType: $cryptoType
        ) {
            id
            userId
            amount
            cryptoAmount
            createdAt
            depositAddress
            coin
            orderId
            txHash
        }
    }
`;

export const GET_DEPOSIT_ADDRESS = gql`
    mutation GetDepositAddress($currency: String!) {
        getDepositAddress(currency: $currency)
    }
`;

export const CREATE_CHARGE_FOR_DEPOSIT = gql`
    mutation CreateChargeForDeposit(
        $coin: String
        $network: String
        $cryptoType: String
    ) {
        createChargeForDeposit(
            coin: $coin
            network: $network
            cryptoType: $cryptoType
        ) {
            id
            userId
            amount
            createdAt
            cryptoType
            network
            cryptoAmount
            confirmedAt
            depositAddress
            coin
        }
    }
`;

export const PAYPAL_FOR_AUCTION = gql`
    mutation PaypalForAuction(
        $roundId: Int
        $currencyCode: String
    ) {
        paypalForAuction(
            roundId: $roundId,
            currencyCode: $currencyCode
        ) {
            id
            status
            links {
                href
                rel
                method
            }
        }
    }
`;

export const CAPTURE_ORDER_FOR_AUCTION = gql`
    mutation CaptureOrderForAuction(
        $orderId: String
    ) {
        captureOrderForAuction(
            orderId: $orderId
        )
    }
`;

export const PAYPAL_FOR_PRESALE = gql`
    mutation PaypalForPresale(
        $presaleId: Int
        $orderId: Int
        $currencyCode: String
    ) {
        paypalForPresale(
            presaleId: $presaleId
            orderId: $orderId
            currencyCode: $currencyCode
        ) {
            id
            status
            links {
                href
                rel
                method
            }
        }
    }
`;

export const CAPTURE_ORDER_FOR_PRESALE = gql`
    mutation CaptureOrderForPresale(
        $orderId: String
    ) {
        captureOrderForPresale(
            orderId: $orderId
        )
    }
`;

export const PAYPAL_FOR_DEPOSIT = gql`
    mutation PaypalForDeposit(
        $amount: Float
        $currencyCode: String
        $cryptoType: String
    ) {
        paypalForDeposit(
            amount: $amount
            currencyCode: $currencyCode
            cryptoType: $cryptoType
        ) {
            id
            status
            links {
                href
                rel
                method
            }
        }
    }
`;

export const CAPTURE_ORDER_FOR_DEPOSIT = gql`
    mutation CaptureOrderForDeposit(
        $orderId: String
    ) {
        captureOrderForDeposit(
            orderId: $orderId
        )
    }
`;

export const BANK_FOR_DEPOSIT = gql`
    mutation {
        bankForDeposit
    }
`;

export const GENERATE_WITHDRAW = gql`
    mutation GenerateWithdraw {
        generateWithdraw
    }
`;

export const PAYPAL_WITHDRAW_REQUEST = gql`
    mutation PaypalWithdrawRequest(
        $email: String
        $target: String
        $amount: Float
        $sourceToken: String
        $code: String
    ) {
        paypalWithdrawRequest(
            email: $email
            target: $target
            amount: $amount
            sourceToken: $sourceToken
            code: $code
        ) {
            id
            userId
            withdrawAmount
            fee
            status
            deniedReason
        }
    }
`;

export const CONFIRM_PAYPAL_WITHDRAW = gql`
    mutation ConfirmPaypalWithdraw(
        $id: Int
        $status: Int
        $deniedReason: String
    ) {
        confirmPaypalWithdraw(
            id: $id
            status: $status
            deniedReason: $deniedReason
        )
    }
`;

export const CRYPTO_WITHDRAW_REQUEST = gql`
    mutation CryptoWithdrawRequest(
        $amount: Float
        $sourceToken: String
        $network: String
        $des: String
        $code: String
    ) {
        cryptoWithdrawRequest(
            amount: $amount
            sourceToken: $sourceToken
            network: $network
            des: $des
            code: $code
        ) {
            id
            userId
            withdrawAmount
            status
        }
    }
`;

export const BANK_WITHDRAW_REQUEST = gql`
    mutation BankWithdrawRequest(
        $targetCurrency: String
        $amount: Float
        $sourceToken: String
        $mode: Int
        $country: String
        $holderName: String
        $bankName: String
        $accNumber: String
        $metadata: String
        $address: String
        $postCode: String
        $code: String
    ) {
        bankWithdrawRequest(
            targetCurrency: $targetCurrency
            amount: $amount
            sourceToken: $sourceToken
            mode: $mode
            country: $country
            holderName: $holderName
            bankName: $bankName
            accNumber: $accNumber
            metadata: $metadata
            address: $address
            postCode: $postCode
            code: $code
        ) {
            userId
            targetCurrency
            sourceToken
            withdrawAmount
            tokenAmount
            holderName
            bankName
            accountNumber
            metadata
            address
            postCode
        }
    }
`;