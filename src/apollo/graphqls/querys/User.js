import { gql } from '@apollo/client';

export const GET_USERS = gql`
    query {
        getPaginatedUsers(
            offset: 0
            limit: 0
        ) {
            id
            regDate
            updateDate
            deleted
            email
            name
            country
            phone
            birthday
            role
            provider
            lastLoginDate
            tierLevel
            isSuspended
            verify {
                id
                emailVerified
                phoneVerified
                kycVerified
            }
        }
    }
`;