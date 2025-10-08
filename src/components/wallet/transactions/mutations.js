import { gql } from '@apollo/client';

export const CHANGE_PAYPAL_DEPOSIT_SHOW_STATUS = gql`
  mutation ChangePayPalDepositShowStatus(
    $id: Int
    $showStatus: Int
  ) {
    changePayPalDepositShowStatus(
      id: $id
      showStatus: $showStatus
    )
  }
`;

export const CHANGE_PAYPAL_WITHDRAW_SHOW_STATUS = gql`
  mutation ChangePayPalWithdrawShowStatus(
    $id: Int
    $showStatus: Int
  ) {
    changePayPalWithdrawShowStatus(
      id: $id
      showStatus: $showStatus
    )
  }
`;

export const CHANGE_STRIPE_DEPOSIT_SHOW_STATUS = gql`
  mutation ChangeStripeDepositShowStatus(
    $id: Int
    $showStatus: Int
  ) {
    changeStripeDepositShowStatus(
      id: $id
      showStatus: $showStatus
    )
  }
`;

export const CHANGE_CRYPTO_WITHDRAW_SHOW_STATUS = gql`
  mutation ChangeCryptoWithdrawShowStatus(
    $id: Int
    $showStatus: Int
  ) {
    changeCryptoWithdrawShowStatus(
      id: $id
      showStatus: $showStatus
    )
  }
`;

export const CHANGE_COINPAYMENT_DEPOSIT_SHOW_STATUS = gql`
  mutation ChangeCoinpaymentDepositShowStatus(
    $id: Int
    $showStatus: Int
  ) {
    changeCoinpaymentDepositShowStatus(
      id: $id
      showStatus: $showStatus
    )
  }
`;

export const CHANGE_BANK_DEPOSIT_SHOW_STATUS = gql`
  mutation ChangeBankDepositShowStatus(
    $id: Int
    $showStatus: Int
  ) {
    changeBankDepositShowStatus(
      id: $id
      showStatus: $showStatus
    )
  }
`;

export const CHANGE_BANK_WITHDRAW_SHOW_STATUS = gql`
  mutation ChangeBankWithdrawShowStatus(
    $id: Int
    $showStatus: Int
  ) {
    changeBankWithdrawShowStatus(
      id: $id
      showStatus: $showStatus
    )
  }
`;