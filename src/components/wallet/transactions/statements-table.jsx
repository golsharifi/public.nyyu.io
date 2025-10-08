import React, { useEffect, useState } from "react";
import Pagination from "react-js-pagination";
import Select from "react-select";
import axios from "axios";
import { Icon } from "@iconify/react";
import {
    AccordionDownIcon,
    AccordionUpIcon,
    SPINNER,
} from "../../../utilities/imgImport";
import { createDateFromDateObject } from "../../../utilities/utility-methods";
import { useTransactions } from "./transactions-context";
import { DayPickerInput } from "../../../utilities/date-picker";
import "react-day-picker/dist/style.css";
import { GET_STATEMENTS } from "./queries";
import { useQuery } from "@apollo/client";
import CustomSpinner from "../../common/custom-spinner";
import NumberFormat from "../../../utilities/number";
import { useSelector } from "react-redux";
import { Icons } from "../../../utilities/Icons";
import { downloadContent as downloadSingle } from "../../../utilities/utility-methods";

const depositOptions = [
    { value: "deposit", label: "Deposit" },
    { value: "withdraw", label: "Withdraw" },
    { value: "bid", label: "Bid" },
    { value: "buy", label: "Buy" },
    { value: "all", label: "All" },
];
const periodOptions = [
    { index: 0, value: "weekly", label: "Weekly" },
    { index: 1, value: "monthly", label: "Monthly" },
    { index: 2, value: "quarterly", label: "Quarterly" },
    { index: 3, value: "semi_annually", label: "Semi Annually" },
    { index: 4, value: "annually", label: "Annually" },
    { index: 5, value: "all_time", label: "All Time" },
    { index: 6, value: "custom", label: "Custom" },
];

export default function StatementsTable() {
    // Containers
    // const user = useSelector((state) => state.auth.user);
    const [loading, setLoading] = useState(true);
    const [pending] = useState(false);
    const { itemsCountPerPage, createDateFromDate, createTimeFromDate } =
        useTransactions();
    const [currentRowOpen, setCurrentRowOpen] = useState(-1);
    const [activePage, setActivePage] = useState(1);
    const [list, setList] = useState([]);
    const [sortType, setSortType] = useState(null);
    const [depositList, setDepositList] = useState([]);
    const [withdrawList, setWithdrawList] = useState([]);
    const [bidList, setBidList] = useState([]);
    const [buyList, setBuyList] = useState([]);

    const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0);
    const [selectedPeriodOption, setSelectedPeriodOption] = useState(
        periodOptions[selectedPeriodIndex],
    );
    const [selectedDepositOption, setSelectedDepositOption] = useState(
        depositOptions[0],
    );

    const [singleDownloading, setSingleDonwloading] = useState(false);

    // Utility variables.
    const now = new Date();
    const lastWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7,
    );
    const lastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate(),
    );
    const last4Month = new Date(
        now.getFullYear(),
        now.getMonth() - 4,
        now.getDate(),
    );
    const last6Month = new Date(
        now.getFullYear(),
        now.getMonth() - 6,
        now.getDate(),
    );
    const lastYear = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate(),
    );
    const allTime = new Date(0);
    const timeFrames = [
        lastWeek,
        lastMonth,
        last4Month,
        last6Month,
        lastYear,
        allTime,
    ];
    const [from, setFrom] = useState(timeFrames[selectedPeriodIndex]);
    const [to, setTo] = useState(now);

    // Webserver
    const { refetch } = useQuery(GET_STATEMENTS, {
        fetchPolicy: "network-only",
        notifyOnNetworkStatusChange: true,
        variables: {
            from: from.getTime(),
            to: new Date(
                to.getFullYear(),
                to.getMonth(),
                to.getDate() + 1,
            ).getTime(),
        },
        onCompleted: (data) => {
            // Deposit
            const paypalDepositFooList =
                data.getStatement.paypalDepositTxns.map((item) => {
                    const createdTime = new Date(item?.createdAt);
                    return {
                        id: item?.id,
                        date: createDateFromDate(createdTime),
                        time: createTimeFromDate(createdTime),
                        fee: item?.fee,
                        status: item?.status,
                        amount: item?.fiatAmount,
                        type: "Paypal Deposit",
                        tx: "DEPOSIT",
                        payment: "PAYPAL",
                        paymentId: item?.paypalOrderId,
                        asset: item?.fiatType,
                    };
                });
            const coinPaymentDepositFooList =
                data.getStatement.coinpaymentDepositTxns.map((item) => {
                    const createdTime = new Date(item?.confirmedAt);
                    return {
                        id: item?.id,
                        date: createDateFromDate(createdTime),
                        time: createTimeFromDate(createdTime),
                        fee: item?.fee,
                        status: item?.status,
                        amount: item?.amount,
                        type: "Crypto Deposit",
                        tx: "DEPOSIT",
                        payment: "CRYPTO",
                        paymentId: "---",
                        asset: item?.coin,
                    };
                });

            const stripeDepositFooList =
                data.getStatement.stripeDepositTxns.map((item) => {
                    const createdTime = new Date(item?.confirmedAt);
                    return {
                        id: item?.id,
                        date: createDateFromDate(createdTime),
                        time: createTimeFromDate(createdTime),
                        fee: item?.fee,
                        status: item?.status,
                        amount: item?.amount,
                        type: "Credit Card Deposit",
                        tx: "DEPOSIT",
                        payment: "CREDIT",
                        paymentId: item?.paymentMethodId,
                        asset: item?.fiatType,
                    };
                });

            // Withdraw
            const cryptoWithdrawsFooList =
                data.getStatement.cryptoWithdraws.map((item) => {
                    const createdTime = new Date(item?.confirmedAt);
                    return {
                        id: item?.id,
                        date: createDateFromDate(createdTime),
                        time: createTimeFromDate(createdTime),
                        fee: item?.fee,
                        status: item?.status,
                        amount: item?.withdrawAmount,
                        type: "Crypto Withdraw",
                        tx: "WITHDRAW",
                        payment: "CRYPTO",
                        paymentId: "---",
                        asset: item?.sourceToken,
                    };
                });
            const paypalWithdrawsFooList =
                data.getStatement.paypalWithdraws.map((item) => {
                    const createdTime = new Date(item?.confirmedAt);
                    return {
                        id: item?.id,
                        date: createDateFromDate(createdTime),
                        time: createTimeFromDate(createdTime),
                        fee: item?.fee,
                        status: item?.status,
                        amount: item?.withdrawAmount,
                        type: "Paypal Withdraw",
                        tx: "WITHDRAW",
                        payment: "PAYPAL",
                        paymentId: "---",
                        asset: item?.targetCurrency,
                    };
                });

            // Auction
            const stripeBidFooList = data.getStatement.stripeAuctionTxns.map(
                (item) => {
                    const createdTime = new Date(item?.confirmedAt);
                    return {
                        id: item?.id,
                        date: createDateFromDate(createdTime),
                        time: createTimeFromDate(createdTime),
                        fee: item?.fee,
                        status: item?.status,
                        amount: item?.amount,
                        type: "Credit Card Auction",
                        paymentId: item?.paymentMethodId,
                        asset: item?.fiatType,
                    };
                },
            );
            const paypalBidFooList = data.getStatement.paypalAuctionTxns.map(
                (item) => {
                    const createdTime = new Date(item?.createdAt);
                    return {
                        id: item?.id,
                        date: createDateFromDate(createdTime),
                        time: createTimeFromDate(createdTime),
                        fee: item?.fee,
                        status: item?.status,
                        amount: item?.amount,
                        type: "Paypal Auction",
                        paymentId: item?.paypalOrderId,
                        asset: item?.fiatType,
                    };
                },
            );

            const coinPaymentBidFooList =
                data.getStatement.coinpaymentAuctionTxns.map((item) => {
                    const createdTime = new Date(item?.confirmedAt);
                    return {
                        id: item?.id,
                        date: createDateFromDate(createdTime),
                        time: createTimeFromDate(createdTime),
                        fee: item?.fee,
                        status: item?.status,
                        amount: item?.amount,
                        type: "Crypto Auction",
                        paymentId: "---",
                        asset: item?.coin,
                    };
                });

            // Presale
            const stripeBuyFooList = data.getStatement.stripePresaleTxns.map(
                (item) => {
                    const createdTime = new Date(item?.confirmedAt);
                    return {
                        id: item?.id,
                        date: createDateFromDate(createdTime),
                        time: createTimeFromDate(createdTime),
                        fee: item?.fee,
                        status: item?.status,
                        amount: item?.amount,
                        type: "Credit Card PreSale",
                        paymentId: item?.paymentMethodId,
                        asset: item?.fiatType,
                    };
                },
            );
            const paypalBuyFooList = data.getStatement.paypalPresaleTxns.map(
                (item) => {
                    const createdTime = new Date(item?.createdAt);
                    return {
                        id: item?.id,
                        date: createDateFromDate(createdTime),
                        time: createTimeFromDate(createdTime),
                        fee: item?.fee,
                        status: item?.status,
                        amount: item?.amount,
                        type: "Paypal PreSale",
                        paymentId: item?.paypalOrderId,
                        asset: item?.fiatType,
                    };
                },
            );
            const coinPaymentBuyFooList =
                data.getStatement.coinpaymentPresaleTxns.map((item) => {
                    const createdTime = new Date(item?.confirmedAt);
                    return {
                        id: item?.id,
                        date: createDateFromDate(createdTime),
                        time: createTimeFromDate(createdTime),
                        fee: item?.fee,
                        status: item?.status,
                        amount: item?.amount,
                        type: "Crypto PreSale",
                        paymentId: "---",
                        asset: item?.cryptoType,
                    };
                });

            const bankDepositFooList = data.getStatement.bankDepositTxns.map(
                (item) => {
                    const createdTime = new Date(item?.confirmedAt);
                    return {
                        id: item?.id,
                        date: createDateFromDate(createdTime),
                        time: createTimeFromDate(createdTime),
                        fee: item?.fee,
                        status: item?.status,
                        amount: item?.amount,
                        type: "Bank Deposit",
                        tx: "DEPOSIT",
                        payment: "BANK",
                        paymentId: "---",
                        asset: item?.fiatType,
                    };
                },
            );

            // Binding
            setDepositList([
                ...paypalDepositFooList,
                ...coinPaymentDepositFooList,
                ...stripeDepositFooList,
                ...bankDepositFooList,
            ]);
            setWithdrawList([
                ...cryptoWithdrawsFooList,
                ...paypalWithdrawsFooList,
            ]);
            setBidList([
                ...stripeBidFooList,
                ...paypalBidFooList,
                ...coinPaymentBidFooList,
            ]);
            setBuyList([
                ...stripeBuyFooList,
                ...paypalBuyFooList,
                ...coinPaymentBuyFooList,
            ]);

            setLoading(false);
        },
        onError: (error) => {
            console.log(error);
            setLoading(false);
        },
    });

    // Methods
    const headerTitle = ({ title, up, down, end }) => (
        <th scope="col">
            <div
                className={`d-flex align-items-center gap-1 noselect cursor-pointer ${
                    end && "justify-content-center justify-content-sm-end"
                }`}
                onClick={() =>
                    sortType === down
                        ? setSortType(up)
                        : sortType === up
                          ? setSortType(down)
                          : setSortType(up)
                }
            >
                <div>{title}</div>
                <div
                    className={`${
                        (sortType === up || sortType === down) && "text-success"
                    }`}
                >
                    {sortType === down
                        ? Icons.down()
                        : sortType === up
                          ? Icons.up()
                          : Icons.up()}
                </div>
            </div>
        </th>
    );
    const toggleDetails = (index) => {
        const previousItem = document.getElementById(
            `transaction-details-${currentRowOpen}`,
        );
        if (previousItem) previousItem.classList.toggle("d-none");

        setCurrentRowOpen(index);
        const item = document.getElementById(`transaction-details-${index}`);
        if (item) item.classList.toggle("d-none");
    };
    const onPeriodOptionChange = async (option) => {
        setSortType(null);
        setSelectedPeriodOption(option);
        setSelectedPeriodIndex(option.index);
        if (option.value === "custom") {
            setFrom(timeFrames[0]);
            setTo(now);
        } else setFrom(timeFrames[option.index]);
        setLoading(true);
        setList([]);

        await refetch();
        setLoading(false);
    };

    const onStartDateChange = async (day) => {
        setSortType(null);
        setFrom(new Date(day));
        setList([]);
        setLoading(true);
        await refetch();
        setLoading(false);
    };

    const onEndDateChange = async (day) => {
        setSortType(null);
        setTo(new Date(day));
        setList([]);
        setLoading(true);
        await refetch();
        setLoading(false);
    };

    const onTypeOptionsChange = (option) => {
        setSortType(null);
        setSelectedDepositOption(option);
        if (option.value === "deposit") return setList(depositList);
        if (option.value === "withdraw") return setList(withdrawList);
        if (option.value === "bid") return setList(bidList);
        if (option.value === "buy") return setList(buyList);
        if (option.value === "all")
            return setList([
                ...depositList,
                ...withdrawList,
                ...bidList,
                ...buyList,
            ]);
    };
    const downloadContent = async (_from, _to) => {
        try {
            const token = localStorage.getItem("ACCESS_TOKEN");
            const response = await axios({
                url: `${process.env.GATSBY_API_BASE_URL}/download/pdf/transactions`,
                method: "GET",
                responseType: "blob",
                params: { from: _from, to: _to },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            const fromDate = new Date(_from).toISOString().split("T")[0];
            const toDate = new Date(_to).toISOString().split("T")[0];
            link.setAttribute(
                "download",
                `transactions-${fromDate} ~ ${toDate}.pdf`,
            );
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (selectedDepositOption.value === "deposit") setList(depositList);
        if (selectedDepositOption.value === "withdraw") setList(withdrawList);
        if (selectedDepositOption.value === "bid") setList(bidList);
        if (selectedDepositOption.value === "buy") setList(buyList);
        if (selectedDepositOption.value === "all")
            setList([...depositList, ...withdrawList, ...bidList, ...buyList]);
    }, [depositList, withdrawList, bidList, buyList]);

    useEffect(() => {
        if (sortType === "date_down")
            return setList(
                list.sort(
                    (item2, item1) =>
                        new Date(item1.date).getTime() -
                        new Date(item2.date).getTime(),
                ),
            );
        if (sortType === "date_up")
            return setList(
                list.sort(
                    (item2, item1) =>
                        new Date(item2.date).getTime() -
                        new Date(item1.date).getTime(),
                ),
            );
        if (sortType === "amount_down")
            return setList(
                list.sort((item2, item1) => item1.amount - item2.amount),
            );

        if (sortType === "amount_up")
            return setList(
                list.sort((item2, item1) => item2.amount - item1.amount),
            );
        if (sortType === "fee_down")
            return setList(list.sort((item2, item1) => item1.fee - item2.fee));

        if (sortType === "fee_up")
            return setList(list.sort((item2, item1) => item2.fee - item1.fee));
    }, [sortType, list]);

    // Render
    return (
        <>
            <div className="text-capitalize text-light pt-4 px-4">
                <div className="row">
                    <div className="col-xl-5 d-flex justify-content-around mb-2">
                        <Select
                            isSearchable={false}
                            options={depositOptions}
                            value={selectedDepositOption}
                            onChange={onTypeOptionsChange}
                        />
                        <Select
                            isSearchable={false}
                            options={periodOptions}
                            value={selectedPeriodOption}
                            onChange={onPeriodOptionChange}
                        />
                    </div>
                    <div className="col-xl-7 d-flex flex-column flex-sm-row justify-content-start justify-content-sm-around align-items-center date_pickers">
                        <div className="d-flex align-items-center gap-2 mb-2 ">
                            <div className="date-title">start date:</div>
                            {selectedPeriodOption.value === "custom" ? (
                                <DayPickerInput
                                    placeholder="DD/MM/YYYY"
                                    format="DD/MM/YYYY"
                                    className="start-date-picker"
                                    value={new Date(from)}
                                    onDayChange={onStartDateChange}
                                    dayPickerProps={{
                                        disabledDays: {
                                            after: now,
                                        },
                                    }}
                                />
                            ) : (
                                <input
                                    type="text"
                                    disabled
                                    value={createDateFromDateObject(
                                        new Date(from),
                                    )}
                                    className="start-date-picker disabled text-secondary"
                                />
                            )}
                        </div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <div className="date-title">end date:</div>
                            {selectedPeriodOption.value === "custom" ? (
                                <DayPickerInput
                                    placeholder="DD/MM/YYYY"
                                    format="DD/MM/YYYY"
                                    className="start-date-picker"
                                    value={new Date(to)}
                                    onDayChange={onEndDateChange}
                                    dayPickerProps={{
                                        disabledDays: {
                                            before: from,
                                        },
                                    }}
                                />
                            ) : (
                                <input
                                    type="text"
                                    disabled
                                    value={createDateFromDateObject(
                                        new Date(to),
                                    )}
                                    className="start-date-picker disabled text-secondary"
                                />
                            )}
                        </div>
                        <div
                            className="mb-2 cursor-pointer"
                            onClick={() => {
                                const _from = from.getTime();
                                const _to = new Date(
                                    to.getFullYear(),
                                    to.getMonth(),
                                    to.getDate() + 1,
                                ).getTime();
                                downloadContent(_from, _to);
                            }}
                        >
                            <Icon
                                icon="bx:download"
                                className="download_icon"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-sm-4 px-3 table-responsive transaction-section-tables mt-3">
                <table className="wallet-transaction-table w-100">
                    {list?.length === 0 && !loading && (
                        <tr className="py-4 text-center">
                            <td
                                colSpan={4}
                                className="text-light fs-16px text-uppercase fw-500"
                            >
                                no records found
                            </td>
                        </tr>
                    )}
                    {!loading && list?.length !== 0 && (
                        <tr className="border-bottom-2-dark-gray py-3">
                            {headerTitle({
                                title: "Date",
                                up: "date_up",
                                down: "date_down",
                            })}
                            {headerTitle({
                                title: "FIAT/Crypto",
                                up: "amount_up",
                                down: "amount_down",
                                end: true,
                            })}
                            {headerTitle({
                                title: "Fee",
                                up: "fee_up",
                                down: "fee_down",
                                end: true,
                            })}
                            <th scope="col" className="text-center text-sm-end">
                                Status
                            </th>
                        </tr>
                    )}
                    {loading ? (
                        <tr className="text-center mt-4">
                            <td colSpan={4}>
                                <CustomSpinner />
                            </td>
                        </tr>
                    ) : (
                        list
                            ?.slice(
                                (activePage - 1) * itemsCountPerPage,
                                activePage * itemsCountPerPage,
                            )
                            ?.map(
                                ({
                                    id,
                                    date,
                                    time,
                                    fee,
                                    status,
                                    amount,
                                    type,
                                    tx,
                                    payment,
                                    paymentId,
                                    asset,
                                }) => (
                                    <>
                                        <tr className="border-bottom-2-dark-gray">
                                            <td
                                                scope="row"
                                                className="text-light pe-5 pe-sm-0 fw-light"
                                            >
                                                <label className="d-flex align-items-center gap-3 noselect">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input bg-transparent border border-light mt-0"
                                                    />
                                                    <div className="fs-16px">
                                                        {date}
                                                    </div>
                                                </label>
                                            </td>
                                            <td className="pe-5 pe-sm-0 white-space-nowrap text-uppercase">
                                                <div className="text-sm-end fs-16px">
                                                    <NumberFormat
                                                        value={amount}
                                                        displayType="text"
                                                        thousandSeparator={true}
                                                    />
                                                    {" " + asset}
                                                </div>
                                            </td>
                                            <td className="text-end pe-5 pe-sm-0 white-space-nowrap">
                                                {fee + " " + asset}
                                            </td>
                                            <td className="d-flex align-items-center justify-content-end">
                                                <div
                                                    className={`${
                                                        status
                                                            ? "green-bullet"
                                                            : "red-bullet"
                                                    } me-2`}
                                                ></div>
                                                <div>
                                                    {status
                                                        ? "Completed"
                                                        : "Failed"}
                                                </div>
                                                <button
                                                    className="btn text-light border-0"
                                                    onClick={() =>
                                                        toggleDetails(
                                                            id ===
                                                                currentRowOpen
                                                                ? -1
                                                                : id,
                                                        )
                                                    }
                                                >
                                                    {id === currentRowOpen ? (
                                                        <img
                                                            src={
                                                                AccordionUpIcon
                                                            }
                                                            className="icon-sm ms-2 cursor-pointer"
                                                            alt="Down arrow icon"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={
                                                                AccordionDownIcon
                                                            }
                                                            className="icon-sm ms-2 cursor-pointer"
                                                            alt="Down arrow icon"
                                                        />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                        <tr
                                            className="text-light d-none px-5"
                                            id={`transaction-details-${id}`}
                                        >
                                            <td colSpan={4}>
                                                <div className="d-flex align-items-start justify-content-between">
                                                    <div className="text-capitalize fs-12px">
                                                        <div>
                                                            <span className="text-secondary pe-1">
                                                                type:
                                                            </span>
                                                            <span className="fw-500">
                                                                {type}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-secondary pe-1">
                                                                amount:
                                                            </span>
                                                            <span className="fw-500">
                                                                <NumberFormat
                                                                    value={
                                                                        amount
                                                                    }
                                                                    displayType="text"
                                                                    thousandSeparator={
                                                                        true
                                                                    }
                                                                />
                                                                {" " + asset}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-secondary pe-1">
                                                                fee:
                                                            </span>
                                                            <span className="fw-500">
                                                                {fee +
                                                                    " " +
                                                                    asset}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-secondary pe-1">
                                                                date:
                                                            </span>
                                                            <span className="fw-500">
                                                                {date +
                                                                    " " +
                                                                    time}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-secondary pe-1">
                                                                asset:
                                                            </span>
                                                            <span className="fw-500">
                                                                {asset}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-capitalize fs-12px">
                                                        <div>
                                                            <span className="text-secondary pe-1">
                                                                Payment-ID:
                                                            </span>
                                                            <span className="fw-500">
                                                                {paymentId}
                                                            </span>
                                                        </div>
                                                        {type ===
                                                            "Crypto Auction" && (
                                                            <div>
                                                                <span className="text-secondary pe-1">
                                                                    Address:
                                                                </span>
                                                                <span className="fw-500">
                                                                    12hfi6sh...l6shi
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="text-secondary pe-1">
                                                                Status:
                                                            </span>
                                                            <span className="fw-500">
                                                                {status
                                                                    ? "Success"
                                                                    : "Failed"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="fs-12px d-flex flex-column">
                                                        {tx !== undefined && (
                                                            <button
                                                                className={`btn fs-12px p-0 text-success text-decoration-success text-decoration-underline`}
                                                                onClick={async () => {
                                                                    if (
                                                                        singleDownloading
                                                                    )
                                                                        return;
                                                                    setSingleDonwloading(
                                                                        true,
                                                                    );
                                                                    try {
                                                                        await downloadSingle(
                                                                            id,
                                                                            tx,
                                                                            payment,
                                                                        );
                                                                    } catch (error) {
                                                                        console.log(
                                                                            error,
                                                                        );
                                                                    }
                                                                    setSingleDonwloading(
                                                                        false,
                                                                    );
                                                                }}
                                                            >
                                                                <span
                                                                    className={
                                                                        singleDownloading
                                                                            ? "download-visible"
                                                                            : "download-hidden"
                                                                    }
                                                                >
                                                                    <img
                                                                        src={
                                                                            SPINNER
                                                                        }
                                                                        width="12"
                                                                        height="12"
                                                                        alt="loading spinner"
                                                                    />
                                                                    &nbsp;&nbsp;
                                                                </span>
                                                                Get PDF Receipt
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn btn-link text-light fs-12px d-none"
                                                            // onClick={() => handleHideActivity(id)}
                                                            disabled={pending}
                                                        >
                                                            {pending
                                                                ? "Processing . . ."
                                                                : "Hide this activity"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </>
                                ),
                            )
                    )}
                </table>
            </div>
            {list.length !== 0 && (
                <div className="px-4">
                    <Pagination
                        activePage={activePage}
                        itemsCountPerPage={itemsCountPerPage}
                        totalItemsCount={list.length}
                        pageRangeDisplayed={5}
                        onChange={(pageNumber) => {
                            toggleDetails(-1);
                            setActivePage(pageNumber);
                        }}
                    />
                </div>
            )}
        </>
    );
}
