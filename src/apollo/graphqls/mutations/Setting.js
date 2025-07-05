import { gql } from "@apollo/client";

export const UPDATE_FAVOR_ASSETS = gql`
    mutation UpdateFavorAssets(
        $assets: String
    ) {
        updateFavorAssets(
            assets: $assets
        )
    }
`;