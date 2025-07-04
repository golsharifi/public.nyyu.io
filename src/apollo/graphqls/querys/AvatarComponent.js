import { gql } from '@apollo/client';

export const GET_AVATAR_COMPONENTS = gql`
    query {
        getAvatarComponents {
            groupId
            compId
            tierLevel
            price
            limited
            purchased
            svg
            width
            top
            left
        }
    }
`;

export const GET_AVATARS = gql`
    query {
        getAvatars {
            id
            fname
            surname
            avatarSet {
                groupId
                compId
            }
            hairColor
            skinColor
            skillSet {
                name
                rate
            }
            factsSet {
                topic
                detail
            }
            details
        }
    }
`;