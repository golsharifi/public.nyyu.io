import { gql } from "@apollo/client";

export const GET_PAPAL_DEPOSIT_TRANSACTIONS = gql`
    query GetPaypalDepositTxnsByUser(
        $showStatus: Int
    ) {
        getPaypalDepositTxnsByUser(
            showStatus: $showStatus
        ) {
            id
            userId
            amount
            createdAt
            confirmedAt
            status
            fiatType
            fiatAmount
            paypalOrderId
            paypalOrderStatus
            cryptoType
            fee
            deposited
        }
    }
`;

export const GET_PAYPAL_WITHDRAW_TRANSACTIONS = gql`
    query GetPaypalWithdrawByUser(
        $showStatus: Int
    ) {
        getPaypalWithdrawByUser(
            showStatus: $showStatus
        ) {
            id
            userId
            targetCurrency
            sourceToken
            tokenPrice
            withdrawAmount
            fee
            tokenAmount
            status
            deniedReason
            requestedAt
            confirmedAt
            senderBatchId
            senderItemId
            receiver
        }
    }
`;

export const GET_BID_LIST_BY_USER = gql`
    query {
        getBidListByUser {
            roundId
            round
            tokenAmount
            totalAmount
            paidAmount
            tokenPrice
            pendingIncrease
            payType
            cryptoType
            status
            placedAt
        }
    }
`;

export const GET_PRESALE_ORDERS_BY_USER = gql`
    query {
        getPresaleOrdersByUser {
            id
            userId
            presaleId
            prefix
            name
            destination
            extAddr
            ndbAmount
            ndbPrice
            status
            createdAt
            updatedAt
        }
    }
`;

export const GET_COINPAYMENT_DEPOSIT_TX_BY_USER = gql`
    query GetCoinpaymentDepositTxByUser(
        $showStatus: Int
    ) {
        getCoinpaymentDepositTxByUser(
            showStatus: $showStatus
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
            depositStatus
            orderId
            orderType
            txHash
            coin
        }
    }
`;

export const GET_CRYPTO_WITHDRAW_BY_USER = gql`
    query GetCryptoWithdrawByUser(
        $showStatus: Int
    ) {
        getCryptoWithdrawByUser(
            showStatus: $showStatus
        ) {
            id
            userId
            sourceToken
            tokenPrice
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

export const GET_STRIPE_DEPOSIT_TX_BY_USER = gql`
    query GetStripeDepositTxByUser(
        $showStatus: Int
    ) {
        getStripeDepositTxByUser(
            showStatus: $showStatus
        ) {
            id
            userId
            amount
            createdAt
            confirmedAt
            status
            fiatType
            fiatAmount
            paymentIntentId
            paymentMethodId
            cryptoType
            cryptoPrice
            fee
            deposited
        }
    }
`;

export const GET_BANK_DEPOSIT_TRANSACTIONS_BY_USER = gql`
    query GetBankDepositTxnsByUser(
        $showStatus: Int
    ) {
        getBankDepositTxnsByUser(
            showStatus: $showStatus
        ) {
            id
            userId
            uid
            createdAt
            confirmedAt
            status
            fiatType
            usdAmount
            cryptoType
            cryptoPrice
            fee
            deposited
            amount
        }
    }
`;

export const GET_BANK_WITHDRAW_TRANSACTIONS_BY_USER = gql`
    query GetBankWithdrawRequestsByUser(
        $showStatus: Int
    ) {
        getBankWithdrawRequestsByUser(
            showStatus: $showStatus
        ) {
            id
            userId
            sourceToken
            tokenPrice
            tokenAmount
            fee
            targetCurrency
            withdrawAmount
            status
            deniedReason
            requestedAt
            confirmedAt
            holderName
        }
    }
`;

export const GET_STATEMENTS = gql`
    query getStatement($from: Float, $to: Float) {
        getStatement(from: $from, to: $to) {
            cryptoWithdraws {
                id
                userId
                sourceToken
                tokenPrice
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
            paypalWithdraws {
                id
                userId
                targetCurrency
                sourceToken
                tokenPrice
                withdrawAmount
                fee
                tokenAmount
                status
                deniedReason
                requestedAt
                confirmedAt
                senderBatchId
                senderItemId
                receiver
            }
            stripeAuctionTxns {
                id
                auctionId
                userId
                amount
                fee
                createdAt
                confirmedAt
                status
                fiatType
                fiatAmount
                paymentIntentId
                paymentMethodId
                bidId
            }
            paypalAuctionTxns {
                id
                userId
                amount
                fee
                createdAt
                confirmedAt
                status
                fiatType
                fiatAmount
                paypalOrderId
                paypalOrderStatus
                auctionId
                bidId
            }
            coinpaymentAuctionTxns {
                id
                userId
                amount
                fee
                createdAt
                cryptoType
                network
                cryptoAmount
                confirmedAt
                coin
                depositStatus
                txHash
                orderId
                orderType
                isShow
            }
            stripePresaleTxns {
                id
                presaleId
                orderId
                userId
                amount
                fee
                createdAt
                confirmedAt
                status
                fiatType
                fiatAmount
                paymentIntentId
                paymentMethodId
            }
            paypalPresaleTxns {
                id
                userId
                amount
                fee
                createdAt
                confirmedAt
                status
                fiatType
                fiatAmount
                paypalOrderId
                paypalOrderStatus
                presaleId
                orderId
            }
            coinpaymentPresaleTxns {
                id
                userId
                amount
                fee
                createdAt
                cryptoType
                network
                cryptoAmount
                confirmedAt
                depositAddress
                coin
                depositStatus
                txHash
                orderId
                orderType
                isShow
            }
            paypalDepositTxns {
                id
                userId
                amount
                createdAt
                confirmedAt
                status
                fiatType
                fiatAmount
                paypalOrderId
                paypalOrderStatus
                cryptoType
                cryptoPrice
                fee
                deposited
            }
            coinpaymentDepositTxns {
                id
                userId
                amount
                fee
                createdAt
                cryptoType
                network
                cryptoAmount
                confirmedAt
                depositAddress
                coin
                depositStatus
                txHash
                orderId
                orderType
                isShow
            }
            stripeDepositTxns {
                id
                userId
                amount
                fee
                createdAt
                confirmedAt
                status
                fiatType
                fiatAmount
                paymentIntentId
                paymentMethodId
            }
            bankDepositTxns{
                id
                userId
                uid
                amount
                createdAt
                confirmedAt
                status
                fiatType
                usdAmount
                cryptoType
                cryptoPrice
                fee
                deposited
            }
        }
    }
`;

export const GET_PRESALE_ORDER_TXNS_BY_ORDER_ID = gql`
    query GetPresaleOrderTransactions(
        $orderId: Int
    ) {
        getPresaleOrderTransactions(
            orderId: $orderId
        ) {
            coinpaymentTxns {
                id
                amount
                createdAt
                depositAddress
                depositStatus
                cryptoType
                network
                cryptoAmount
                confirmedAt
                coin
                orderId
                orderType
                txHash
            }
            stripeTxns {
                id
                orderId
                amount
                createdAt
                confirmedAt
                status
                fiatType
                fiatAmount
                paymentIntentId
                paymentMethodId
            }
            paypalTxns {
                id
                userId
                amount
                createdAt
                confirmedAt
                status
                fiatType
                fiatAmount
                paypalOrderId
                paypalOrderStatus
                presaleId
                orderId
            }
        }
    }
`;
