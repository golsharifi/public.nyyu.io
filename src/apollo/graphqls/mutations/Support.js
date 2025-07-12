import { gql } from "@apollo/client";

export const GET_ZENDESK_JWT = gql`
    mutation {
        getZendeskJwt {
            status
            token
            twoStep
        }
    }
`;

export const UNKNOWN_MEMO_RECOVERY = gql`
    mutation UnknownMemoRecovery (
        $coin: String,
        $receiverAddr: String,
        $depositAmount: Float,
        $txId: String
    ) {
        unknownMemoRecovery(
            coin: $coin,
            receiverAddr: $receiverAddr,
            depositAmount: $depositAmount,
            txId: $txId
        )
    }
`;

export const SEND_VERIFY_CODE = gql`
    mutation SendVerifyCode {
        sendVerifyCode
    }
`;

export const REQUEST_PHONE_2FA = gql`
    mutation RequestPhone2FA(
        $phone: String
    ) {
        requestPhone2FA(phone: $phone)
    }
`

export const CONFIRM_PHONE_2FA = gql`
    mutation ConfirmPhone2FA(
        $smsCode: String
        $mailCode: String
        $token: String
    ) {
        confirmPhone2FA(
            smsCode: $smsCode
            mailCode: $mailCode
            token: $token
        )
    }
`
