import { useQuery } from "@apollo/client";
import React, { useContext, useState } from "react";
import _ from 'lodash';
import {
    GET_BID_LIST_BY_USER,
    GET_COINPAYMENT_DEPOSIT_TX_BY_USER,
    GET_PAPAL_DEPOSIT_TRANSACTIONS,
    GET_PRESALE_ORDERS_BY_USER,
    GET_STRIPE_DEPOSIT_TX_BY_USER,
    GET_PAYPAL_WITHDRAW_TRANSACTIONS,
    GET_CRYPTO_WITHDRAW_BY_USER,
    GET_BANK_DEPOSIT_TRANSACTIONS_BY_USER,
    GET_BANK_WITHDRAW_TRANSACTIONS_BY_USER
} from "./queries";
import { GET_CURRENT_ROUND } from "../../../apollo/graphqls/querys/Auction";
import { createDateFromDate, createTimeFromDate } from '../../../utilities/string';

export const TransactionsContext = React.createContext();
export const useTransactions = () => useContext(TransactionsContext);

// static data
const tabs = [
    {
        index: 0,
        label: "deposit",
    },
    {
        index: 1,
        label: "withdrawal",
    },
    {
        index: 2,
        label: "bid",
    },
    {
        index: 3,
        label: "buy",
    },
    {
        index: 4,
        label: "statements",
    },
];

const TransactionsProvider = ({ children }) => {
    // Containers
    const [currentTab, setCurrentTab] = useState(0);
    const [showStatus, setShowStatus] = useState({
        deposit: 0,
        withdraw: 0,
    });

    const [currentRound, setCurrentRound] = useState(null);

    const [paypalDepositTransactions, setPaypalDepositTransactions] = useState(null);
    const [paypalWithdrawTransactions, setPaypalWithdrawTransactions] = useState(null);

    const [coinDepositTransactions, setCoinDepositTransactions] = useState(null);
    const [coinWithdrawTransactions, setCoinWithdrawTransactions] = useState(null);

    const [stripeDepositTransactions, setStripeDepositTransactions] = useState(null);
    
    const [bankDepositTransactions, setBankDepositTransactions] = useState(null);
    const [ bankWithdrawTransactions, setBankWithdrawTransactions ] = useState(null);
    
    const [bidList, setBidList] = useState(null);
    const [presaleList, setPresaleList] = useState(null);
    const loading = !(
        paypalDepositTransactions &&
        paypalWithdrawTransactions &&
        coinDepositTransactions &&
        coinWithdrawTransactions &&
        stripeDepositTransactions &&
        bankDepositTransactions &&
        bankWithdrawTransactions &&
        bidList &&
        presaleList &&
        currentRound
    );
    const itemsCountPerPage = 5;

    // Webserver
    useQuery(GET_CURRENT_ROUND, {
        onCompleted: data => {
            if(data.getCurrentRound) {
                setCurrentRound(data.getCurrentRound);
            }
        },
        onError: err => {
            console.log(err);
        }
    });
    
    useQuery(GET_PAPAL_DEPOSIT_TRANSACTIONS, {
        variables: {
            showStatus: showStatus.deposit
        },
        onCompleted: (data) => {
            const fooList = _.orderBy(data.getPaypalDepositTxnsByUser, ['createdAt'], ['desc'])
                .map((item) => {
                    const createdTime = new Date(item.createdAt);

                    return {
                        id: item.id,
                        date: createDateFromDate(createdTime),
                        time: createTimeFromDate(createdTime),
                        fee: item.fee,
                        status: item.status,
                        amount: item.fiatAmount,
                        deposited: item.deposited,
                        type: "Paypal Deposit",
                        paymentId: item.paypalOrderId,
                        asset: item.fiatType,
                        cryptoAsset: item.cryptoType
                    };
                });

            setPaypalDepositTransactions(fooList);
        },
    });

    useQuery(GET_PAYPAL_WITHDRAW_TRANSACTIONS, {
        variables: {
            showStatus: showStatus.withdraw
        },
        onCompleted: (data) => {
            const fooList = _.orderBy(data.getPaypalWithdrawByUser, ['confirmedAt'], ['desc'])
                .map((item) => {
                    const createdTime = new Date(item.confirmedAt);

                    return {
                        id: item.id,
                        date: createDateFromDate(createdTime),
                        time: createTimeFromDate(createdTime),
                        fee: item.fee,
                        status: item.status,
                        amount: item.withdrawAmount,
                        type: "Paypal Withdraw",
                        paymentId: item.senderBatchId,
                        deniedReason: item.deniedReason,
                        currency: item.targetCurrency,
                        asset: item.sourceToken,
                    };
                });

            setPaypalWithdrawTransactions(fooList);
        },
        onError: (error) => console.log(error),
    });

    useQuery(GET_STRIPE_DEPOSIT_TX_BY_USER, {
        variables: {
            showStatus: showStatus.deposit
        },
        onCompleted: (data) => {
            const fooList = _.orderBy(data.getStripeDepositTxByUser, ['createdAt'], ['desc'])
                .map((item) => {
                    const createdTime = new Date(item.createdAt);

                    return {
                        id: item.id,
                        date: createDateFromDate(createdTime),
                        time: createTimeFromDate(createdTime),
                        fee: item.fee,
                        status: item.status,
                        amount: item.amount,
                        deposited: item.deposited,
                        type: "Credit Card Deposit",
                        paymentId: item.paymentIntentId,
                        asset: "USD",
                        cryptoAsset: item.cryptoType
                    };
                });
            setStripeDepositTransactions(fooList);
        },
        onError: (error) => console.log(error),
    });

    useQuery(GET_BANK_DEPOSIT_TRANSACTIONS_BY_USER, {
        variables: {
            showStatus: showStatus.deposit
        },
        onCompleted: (data) => {
            const fooList = _.orderBy(data.getBankDepositTxnsByUser, ['createdAt'], ['desc'])
                .map((item) => {
                    const createdTime = new Date(item.createdAt);

                    return {
                        id: item.id,
                        date: createDateFromDate(createdTime),
                        time: createTimeFromDate(createdTime),
                        fee: item.fee,
                        status: item.status,
                        amount: item.amount,
                        deposited: item.deposited,
                        type: "Bank Deposit",
                        paymentId: item.uid,
                        asset: item.fiatType,
                        cryptoAsset: item.cryptoType
                    };
                });
            setBankDepositTransactions(fooList);
        },
        onError: (error) => console.log(error),
    });

    useQuery(GET_COINPAYMENT_DEPOSIT_TX_BY_USER, {
        variables: {
            showStatus: showStatus.deposit
        },
        onCompleted: (data) => {
            const fooList = _.orderBy(data.getCoinpaymentDepositTxByUser, ['createdAt'], ['desc'])
                .map((item) => {
                    const createdTime = new Date(item.createdAt);

                    return {
                        id: item.id,
                        date: createDateFromDate(createdTime),
                        time: createTimeFromDate(createdTime),
                        fee: item.fee || 0,
                        status: item.depositStatus,
                        amount: item.cryptoAmount,
                        type: "Crypto Deposit",
                        paymentId: item.depositAddress,
                        asset: item.cryptoType,
                        network: item.network,
                    };
                });
            setCoinDepositTransactions(fooList);
        },
        onError: (error) => console.log(error),
    });

    useQuery(GET_CRYPTO_WITHDRAW_BY_USER, {
        variables: {
            showStatus: showStatus.withdraw
        },
        onCompleted: (data) => {
            const fooList = _.orderBy(data.getCryptoWithdrawByUser, ['confirmedAt'], ['desc'])
                .map((item) => {
                    const createdTime = new Date(item.confirmedAt);
                    return {
                        id: item.id,
                        date: createDateFromDate(createdTime),
                        time: createTimeFromDate(createdTime),
                        fee: item.fee,
                        status: item.status,
                        amount: item.withdrawAmount,
                        type: "Crypto Withdraw",
                        paymentId: "---",
                        deniedReason: item.deniedReason,
                        asset: item.sourceToken,
                    };
                });
            setCoinWithdrawTransactions(fooList);
        },
        onError: (error) => console.log(error),
    });

    useQuery(GET_BANK_WITHDRAW_TRANSACTIONS_BY_USER, {
        variables: {
            showStatus: showStatus.withdraw
        },
        onCompleted: (data) => {
            const list = _.orderBy(data.getBankWithdrawRequestsByUser, ['confirmedAt'], ['desc'])
                .map(item => {
                    const createdTime = new Date(item.requestedAt);
                    return {
                        id: item.id,
                        date: createDateFromDate(createdTime),
                        time: createTimeFromDate(createdTime),
                        fee: item.fee,
                        status: item.status,
                        asset: item.sourceToken,
                        currency: item.targetCurrency,
                        deniedReason: item.deniedReason,
                        amount: item.withdrawAmount,
                        type: 'Bank Withdraw',
                    }
                })
            setBankWithdrawTransactions(list);
        }
    })

    useQuery(GET_BID_LIST_BY_USER, {
        onCompleted: (data) => {
            const fooList = _.orderBy(data.getBidListByUser, ['placedAt'], ['desc'])
                .map((item) => {
                    const createdTime = new Date(item.placedAt);
                    return {
                        round: item.round,
                        date: createDateFromDate(createdTime),
                        time: createTimeFromDate(createdTime),
                        amount: item.totalAmount,
                        payment: item.payType,
                        status: item.status,
                    };
                });
            setBidList(fooList);
        },
        onError: (error) => console.log(error),
    });

    useQuery(GET_PRESALE_ORDERS_BY_USER, {
        onCompleted: (data) => {
            const fooList = _.orderBy(data.getPresaleOrdersByUser, ['createdAt'], ['desc'])
                .map((item) => {
                    const createdTime = new Date(item.createdAt);
                    return {
                        id: item.id,
                        date: createDateFromDate(createdTime),
                        time: createTimeFromDate(createdTime),
                        createdAt: item.createdAt,
                        amount: item.ndbAmount * item.ndbPrice,
                        payment: 1,
                        status: item.status,
                    };
                });
            setPresaleList(fooList);
        },
        onError: (error) => console.log(error),
    });

    // Methods

    // Binding
    const valueObject = {
        // Data
        paypalDepositTransactions,
        coinDepositTransactions,
        coinWithdrawTransactions,
        stripeDepositTransactions,
        paypalWithdrawTransactions,
        bankDepositTransactions,
        bankWithdrawTransactions,
        bidList,
        presaleList,
        itemsCountPerPage,
        currentRound,
        showStatus,

        // Methods
        createDateFromDate,
        createTimeFromDate,
        setPaypalDepositTransactions,
        setCoinDepositTransactions,
        setStripeDepositTransactions,
        setBankDepositTransactions,
        setShowStatus,

        // Utilities
        currentTab,
        setCurrentTab,
        tabs,
        loading,
    };

    // Render
    return (
        <TransactionsContext.Provider value={valueObject}>
            {children}
        </TransactionsContext.Provider>
    );
};

export default TransactionsProvider;

// Here is the status of the bid:
// NOT_CONFIRMED : 0
// WINNER        : 1
// FAILED        : 2

// Payment Methods
// 	CREDIT: 1
// 	CRYPTO: 2
// 	WALLET: 3
