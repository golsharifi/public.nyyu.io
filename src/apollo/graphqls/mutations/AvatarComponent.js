import { gql } from "@apollo/client";

export const CREATE_NEW_COMPONENT = gql`
    mutation CreateNewComponent(
        $groupId: String!
        $tierLevel: Int!
        $price: Float!
        $limited: Int!
        $svg: String!
        $width: Int!
        $top: Int!
        $left: Int!
    ) {
        createNewComponent(
            groupId: $groupId
            tierLevel: $tierLevel
            price: $price
            limited: $limited
            svg: $svg
            width: $width
            top: $top
            left: $left
        ) {
            groupId
            compId
            tierLevel
            price
            limited
            svg
            width
            top
            left
        } 
    }
`;

export const UPDATE_COMPONENT = gql`
    mutation UpdateComponent(
        $groupId: String!
        $compId: Int!
        $tierLevel: Int
        $price: Float
        $limited: Int
        $svg: String
        $width: Int
        $top: Int
        $left: Int
    ) {
        updateComponent(
            groupId: $groupId
            compId: $compId
            tierLevel: $tierLevel
            price: $price
            limited: $limited
            svg: $svg
            width: $width
            top: $top
            left: $left
        ) {
            groupId
            compId
            tierLevel
            purchased
        }
    }
`;

export const DELETE_AVATAR_COMPONENT = gql`
    mutation deleteAvatarComponent(
        $groupId: String
        $compId: Int
    ) {
        deleteAvatarComponent(
            groupId: $groupId
            compId: $compId
        )
    }
`;

export const CREATE_NEW_AVATAR = gql`
    mutation CreateNewAvatar(
        $fname: String!
        $surname: String!
        $skillSet: [SkillSetInput]!
        $avatarSet: [AvatarSetInput]
        $factsSet: [FactsInput]
        $hairColor: String
        $skinColor: String
        $details: String
    ) {
        createNewAvatar(
            fname: $fname
            surname: $surname
            skillSet: $skillSet
            avatarSet: $avatarSet
            factsSet: $factsSet
            hairColor: $hairColor
            skinColor: $skinColor
            details: $details
        ) {
            id
        }
    }
`;

export const UPDATE_AVATAR_PROFILE = gql`
    mutation UpdateAvatarProfile(
        $id: Int!
        $fname: String!
        $surname: String!
        $skillSet: [SkillSetInput]!
        $avatarSet: [AvatarSetInput]
        $factsSet: [FactsInput]
        $hairColor: String
        $skinColor: String
        $details: String
    ) {
        updateAvatarProfile(
            id: $id
            fname: $fname
            surname: $surname
            skillSet: $skillSet
            avatarSet: $avatarSet
            factsSet: $factsSet
            hairColor: $hairColor
            skinColor: $skinColor
            details: $details
        ) 
    }
`;

export const UPDATE_AVATARSET = gql`
    mutation updateAvatarSet(
        $components: [AvatarSetInput]
        $hairColor: String
        $skinColor: String
    ) {
        updateAvatarSet(
            components: $components
            hairColor: $hairColor
            skinColor: $skinColor
        ) {
            id
            regDate
            updateDate
            deleted
            groupId
            compId
        }
    }
`;