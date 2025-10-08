import { gql } from "@apollo/client"

export const GET_PRESALE_LIST_BY_ROUND = gql`
    query getPresaleOrders($presaleId: Int!) {
        getPresaleOrders(presaleId: $presaleId) {
            id
            userId
            name
            prefix
            presaleId
            destination
            extAddr
            ndbAmount
            ndbPrice
            paidAmount
            status
            createdAt
            updatedAt
        }
    }
`;

export const GET_NEW_PRESALE_ORDERS = gql`
    query getNewPresaleOrders(
        $presaleId: Int
        $lastOrderId: Int
    ) {
        getNewPresaleOrders(
            presaleId: $presaleId
            lastOrderId: $lastOrderId
        ) {
            id
            userId
            name
            prefix
            presaleId
            destination
            extAddr
            ndbAmount
            ndbPrice
            paidAmount
            status
            createdAt
            updatedAt    
        }
    }
`;
