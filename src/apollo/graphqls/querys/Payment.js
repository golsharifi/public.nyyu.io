import { gql } from "@apollo/client"

export const GET_EXCHANGE_RATE = gql`
    query {
        getExchangeRate
    }
`

export const GET_ALL_FEES = gql`
    query {
        getAllFees {
            id
            tierLevel
            fee
        }
    }
`

export const GET_PAYPAL_DEPOSIT_TXN_BY_USER = gql` {
	query {
        getPaypalDepositTxnsByUser {
		    id
            deposited
            fee
        }
    }
}
`

export const GET_COINPAYMENT_DEPOSITTX_BYID = gql`
    query GetCoinpaymentDepositTxById(
        $id: Int
    ) {
        getCoinpaymentDepositTxById(
            id: $id
        ) {
            id
            depositStatus
            cryptoAmount
            createdAt
        }
    }
`;

export const GET_PRESALE_ORDER_BYID = gql`
    query GetPresaleById(
        $id: Int
    ) {
        getPresaleById(
            id: $id
        ) {
            id
            userId
            presaleId
            status
        }
    }
`;

export const GET_CRYPTO_AUCTOIN_TX_BYID = gql`
    query GetCryptoAuctionTxById(
        $id: Int
    ) {
        getCryptoAuctionTxById(
            id: $id
        ) {
            id
            depositStatus
        }
    }
`;

export const GET_CRYPTO_PRESALE_TX_BYID = gql`
    query GetCryptoPresaleTxById(
        $id: Int
    ) {
        getCryptoPresaleTxById(
            id: $id
        ) {
            id
            depositStatus
        }
    }
`;