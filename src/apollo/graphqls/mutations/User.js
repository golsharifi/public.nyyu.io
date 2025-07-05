import { gql } from '@apollo/client';

export const CREATE_NEW_USER = gql`
    mutation CreateNewUser(
        $email: String!
        $country: String!
        $role: String!
        $avatarName: String!
        $shortName: String!
    ) {
        createNewUser(
            email: $email
            country: $country
            role: $role
            avatarName: $avatarName
            shortName: $shortName
        )
    }
`;

export const CHANGE_ROLE = gql`
    mutation ChangeRole(
        $email: String!
        $role: String!
    ) {
        changeRole(
        email: $email
        role: $role
        )
    }
`;

export const RESET_PASSWORD_BY_ADMIN = gql`
    mutation resetPasswordByAdmin(
        $email: String!
    ) {
        resetPasswordByAdmin(
            email: $email
        )
    }
`;

export const SUSPEND_USER_BY_ADMIN = gql`
    mutation SuspendUserByAdmin(
        $email : String
    ) {
        suspendUserByAdmin(
            email: $email
        )
    }
`;

export const RELEASE_USER_BY_ADMIN = gql`
    mutation ReleaseUserByAdmin(
        $email : String
    ) {
        releaseUserByAdmin(
            email: $email
        )
    }
`;