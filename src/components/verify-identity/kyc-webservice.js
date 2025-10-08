import { gql } from "@apollo/client";

export const UPLOAD_DOCUMENT = gql`
    mutation UploadDocument($document: Upload!) {
        uploadDocument(document: $document)
    }
`;

export const UPLOAD_ADDRESS = gql`
    mutation ($document: Upload) {
        uploadAddress(address: $document)
    }
`;

export const UPLOAD_CONSENT = gql`
    mutation ($consent: Upload) {
        uploadConsent(consent: $consent)
    }
`;

export const UPLOAD_SELFIE = gql`
    mutation ($selfie: Upload) {
        uploadSelfie(selfie: $selfie)
    }
`;

export const SEND_VERIFY_REQUEST = gql`
    mutation (
        $country: String
        $fullAddr: String
        $firstName: String
        $middleName: String
        $lastName: String
    ) {
        sendVerifyRequest(
            country: $country
            fullAddr: $fullAddr
            names: {
                first_name: $firstName
                middle_name: $middleName
                last_name: $lastName
            }
        )
    }
`;

export const GET_SHUFT_REFERENCE = gql`
    {
        getShuftiReference {
            userId
            reference
            pending
        }
    }
`;

export const GET_SHUFTI_REF_PAYLOAD = gql`
    {
        getShuftiRefPayload {
            userId
            reference
            verificationType
            docStatus
            addrStatus
            conStatus
            selfieStatus
            pending
            failed
            error
            failureReason
            status
        }
    }
`;

export const MANUAL_STATUS_CHECK = gql`
    query {
        manualStatusCheck
    }
`;

export const INSERT_UPDATE_REFERENCE = gql`
    mutation ($reference: String) {
        insertOrUpdateReference(reference: $reference)
    }
`;
