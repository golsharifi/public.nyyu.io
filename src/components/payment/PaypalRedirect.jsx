import React, { useEffect } from 'react';
import { navigate } from 'gatsby';
import { useMutation } from '@apollo/client';

import AlarmModal, { showSuccessAlarm, showFailAlarm, closeAlarmModal } from '../admin/AlarmModal';
import * as Mutation from '../../apollo/graphqls/mutations/Payment';
import { getCookie, NDB_Paypal_TrxType, NDB_Auction, NDB_Presale, NDB_Deposit } from '../../utilities/cookies';
import { ROUTES, isRedirectUrl } from '../../utilities/routes';

const TIME_OUT = 3000;
const navigateTo_AfterTime = uri => {
    setTimeout(() => {
        closeAlarmModal();
        navigate(uri);
    }, TIME_OUT);
};

const PaypalRedirect = () => {
    const [captureOrderForAuction] = useMutation(Mutation.CAPTURE_ORDER_FOR_AUCTION, {
        onCompleted: (data) => {
            if (data.captureOrderForAuction) {
                showSuccessAlarm("Your paypal payment for Auction was done successfully!");
            } else {
                showFailAlarm("Error in checkout with PayPal in complete");
            }
            navigateTo_AfterTime(ROUTES.auction);
        },
        onError: (err) => {
            showFailAlarm("Error in checkout with PayPal");
            navigateTo_AfterTime(ROUTES.auction);
        },
    });

    const [captureOrderForPresale] = useMutation(Mutation.CAPTURE_ORDER_FOR_PRESALE, {
        onCompleted: data => {
            if (data.captureOrderForPresale) {
                showSuccessAlarm("Your paypal payment for Presale was done successfully!");
            } else {
                showFailAlarm("Error in checkout with PayPal in complete");
            }
            navigateTo_AfterTime(ROUTES.auction);
        },
        onError: err => {
            showFailAlarm('Error in checkout with PayPal');
            navigateTo_AfterTime(ROUTES.auction);
        }
    });

    const [captureOrderForDeposit] = useMutation(Mutation.CAPTURE_ORDER_FOR_DEPOSIT, {
        onCompleted: data => {
            if (data.captureOrderForDeposit) {
                showSuccessAlarm("Your paypal payment for Deposit was done successfully!");
            } else {
                showFailAlarm("Error in checkout with PayPal in complete");
            }
            navigateTo_AfterTime(ROUTES.wallet);
        },
        onError: err => {
            showFailAlarm('Error in checkout with PayPal');
            navigateTo_AfterTime(ROUTES.wallet);
        }
    });

    useEffect(() => {
        if (isRedirectUrl) {
            const url = new URL(window.location.href);
            const token = url.searchParams.get("token");
            const paypalTrxType = getCookie(NDB_Paypal_TrxType);
            // console.log(paypalTrxType, token)
            switch(paypalTrxType) {
                case NDB_Auction:
                    captureOrderForAuction({ variables: { orderId: token } });
                    break;
                case NDB_Presale:
                    captureOrderForPresale({ variables: { orderId: token } });
                    break;
                case NDB_Deposit:
                    captureOrderForDeposit({ variables: { orderId: token } });
                    break;
                default:
                    showFailAlarm('Action Failed', 'Something went wrong');
                    navigateTo_AfterTime(ROUTES.profile);
                    break;
            }
        }
    }, [captureOrderForAuction, captureOrderForPresale, captureOrderForDeposit]);

    return (
        <div>
            <AlarmModal />
        </div>
    );
};

export default PaypalRedirect;