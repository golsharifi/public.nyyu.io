import React, { useEffect, useState } from "react";
import client from "../../../apollo/client";
import Select from "react-select";
import _ from "lodash";
import {
    AccordionDownIcon,
    AccordionUpIcon,
    SPINNER,
} from "../../../utilities/imgImport";
import { useTransactions } from "./transactions-context";
import Pagination from "react-js-pagination";
import { Icons } from "../../../utilities/Icons";
import * as Mutation from "./mutations";
import { downloadContent } from "../../../utilities/utility-methods";

const depositOptions = [
    { value: "paypal", label: "Paypal", type: "PAYPAL" },
    { value: "crypto", label: "Crypto", type: "CRYPTO" },
    { value: "credit_card", label: "Credit Card", type: "CREDIT" },
    { value: "standard_bank_transfer", label: "Bank Transfer", type: "BANK" },
];

export default function DepositTable() {
    // Containers
    const {
        tabs,
        paypalDepositTransactions,
        coinDepositTransactions,
        stripeDepositTransactions,
        bankDepositTransactions,
        itemsCountPerPage,
        // showStatus,
        // setShowStatus,
        setPaypalDepositTransactions,
        setCoinDepositTransactions,
        setStripeDepositTransactions,
        setBankDepositTransactions,
    } = useTransactions();

    const [list, setList] = useState(paypalDepositTransactions);
    const [sortType, setSortType] = useState(null);
    const [currentDepositType, setCurrentDepositType] = useState(
        depositOptions[0],
    );
    const [activePage, setActivePage] = useState(1);
    const [toggle, setToggle] = useState(null);

    const [pending, setPending] = useState(false);
    const [downloading, setDownloading] = useState(false);

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
                onKeyDown={() =>
                    sortType === down
                        ? setSortType(up)
                        : sortType === up
                          ? setSortType(down)
                          : setSortType(up)
                }
                role="tab"
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

    const changeDepositType = (type) => {
        setActivePage(1);
        setCurrentDepositType(type);
        if (type.value === "paypal") setList(paypalDepositTransactions);
        if (type.value === "crypto") setList(coinDepositTransactions);
        if (type.value === "credit_card") setList(stripeDepositTransactions);
        if (type.value === "standard_bank_transfer")
            setList(bankDepositTransactions);
    };

    useEffect(() => {
        if (sortType === null) return changeDepositType(currentDepositType);
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
    }, [sortType, currentDepositType, list]);

    // ------- Functions for handling hide activity ----------------
    const change_Paypal_Deposit_ShowStatus = async (updateData) => {
        try {
            const { data } = await client.mutate({
                mutation: Mutation.CHANGE_PAYPAL_DEPOSIT_SHOW_STATUS,
                variables: { ...updateData },
            });
            if (data.changePayPalDepositShowStatus) {
                let trxList = [...paypalDepositTransactions];
                _.remove(trxList, (item) => item.id === updateData.id);
                setPaypalDepositTransactions(trxList);
                setList([...trxList]);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const change_Crypto_Deposit_ShowStatus = async (updateData) => {
        try {
            const { data } = await client.mutate({
                mutation: Mutation.CHANGE_COINPAYMENT_DEPOSIT_SHOW_STATUS,
                variables: { ...updateData },
            });
            if (data.changeCoinpaymentDepositShowStatus) {
                let trxList = [...coinDepositTransactions];
                _.remove(trxList, (item) => item.id === updateData.id);
                setCoinDepositTransactions(trxList);
                setList(trxList);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const change_Stripe_Deposit_ShowStatus = async (updateData) => {
        try {
            const { data } = await client.mutate({
                mutation: Mutation.CHANGE_STRIPE_DEPOSIT_SHOW_STATUS,
                variables: { ...updateData },
            });
            if (data.changeStripeDepositShowStatus) {
                let trxList = [...stripeDepositTransactions];
                _.remove(trxList, (item) => item.id === updateData.id);
                setStripeDepositTransactions(trxList);
                setList(trxList);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const change_Bank_Deposit_ShowStatus = async (updateData) => {
        try {
            const { data } = await client.mutate({
                mutation: Mutation.CHANGE_BANK_DEPOSIT_SHOW_STATUS,
                variables: { ...updateData },
            });
            if (data.changeBankDepositShowStatus) {
                let trxList = [...bankDepositTransactions];
                _.remove(trxList, (item) => item.id === updateData.id);
                setBankDepositTransactions(trxList);
                setList(trxList);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleHideActivity = async (id) => {
        setPending(true);
        const updateData = {
            id,
            showStatus: 0,
        };
        if (currentDepositType.value === "paypal") {
            await change_Paypal_Deposit_ShowStatus(updateData);
        } else if (currentDepositType.value === "crypto") {
            await change_Crypto_Deposit_ShowStatus(updateData);
        } else if (currentDepositType.value === "credit_card") {
            await change_Stripe_Deposit_ShowStatus(updateData);
        } else if (currentDepositType.value === "standard_bank_transfer") {
            await change_Bank_Deposit_ShowStatus(updateData);
        }
        setPending(false);
    };

    // Render
    return (
        <>
            <div className="mt-4 px-md-4 d-inline-block">
                <Select
                    isSearchable={false}
                    options={depositOptions}
                    defaultValue={depositOptions[0]}
                    value={currentDepositType}
                    onChange={changeDepositType}
                />
            </div>
            <div className="px-sm-4 px-3 table-responsive transaction-section-tables mb-5 mb-sm-0">
                <table className="wallet-transaction-table w-100">
                    {_.isEmpty(list) && (
                        <tr className="py-4 text-center">
                            <td
                                colSpan={4}
                                className="text-light fs-16px text-uppercase fw-500"
                            >
                                no records found
                            </td>
                        </tr>
                    )}
                    {!_.isEmpty(list) && (
                        <tr className="border-bottom-2-dark-gray pb-3 pt-1">
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
                    {!_.isEmpty(list) &&
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
                                    amount,
                                    deposited,
                                    asset,
                                    fee,
                                    status,
                                    type,
                                    paymentId,
                                    cryptoAsset,
                                    network,
                                }) => (
                                    <>
                                        <tr
                                            className="border-bottom-2-dark-gray cursor-pointer"
                                            onClick={() => {
                                                if (toggle === id) {
                                                    setToggle(null);
                                                } else {
                                                    setToggle(id);
                                                }
                                            }}
                                        >
                                            <td className="text-light pe-5 pe-sm-0 fw-light">
                                                <div className="fs-16px">
                                                    {date}
                                                </div>
                                                <div className="text-secondary fs-12px mt-1 fw-500">
                                                    {time}
                                                </div>
                                            </td>
                                            <td className="pe-5 pe-sm-0 white-space-nowrap text-uppercase">
                                                <div className="text-sm-end fs-16px">
                                                    {currentDepositType.value ===
                                                        "credit_card" &&
                                                        (amount / 100).toFixed(
                                                            2,
                                                        ) +
                                                            " " +
                                                            asset}
                                                    {currentDepositType.value ===
                                                        "paypal" &&
                                                        Number(amount).toFixed(
                                                            2,
                                                        ) +
                                                            " " +
                                                            asset}
                                                    {currentDepositType.value ===
                                                        "crypto" &&
                                                        amount.toFixed(8) +
                                                            " " +
                                                            asset}
                                                    {currentDepositType.value ===
                                                        "standard_bank_transfer" &&
                                                        amount.toFixed(2) +
                                                            " " +
                                                            (asset === null
                                                                ? "USD"
                                                                : asset)}
                                                </div>
                                            </td>
                                            <td className="text-end pe-5 pe-sm-0 white-space-nowrap">
                                                {currentDepositType.value ===
                                                "crypto"
                                                    ? Number(fee).toFixed(8) +
                                                      " " +
                                                      asset
                                                    : Number(fee).toFixed(2) +
                                                      " " +
                                                      "USDT"}
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
                                                        : "Pending"}
                                                </div>
                                                <button className="btn text-light border-0">
                                                    {id === toggle ? (
                                                        <img
                                                            src={
                                                                AccordionUpIcon
                                                            }
                                                            className="icon-sm ms-2 cursor-pointer"
                                                            alt="Up arrow icon"
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
                                        {toggle === id && (
                                            <tr className="text-light px-5">
                                                <td colSpan={tabs.length}>
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
                                                                    {currentDepositType.value ===
                                                                        "credit_card" &&
                                                                        (
                                                                            amount /
                                                                            100
                                                                        ).toFixed(
                                                                            2,
                                                                        ) +
                                                                            " " +
                                                                            asset}
                                                                    {currentDepositType.value ===
                                                                        "paypal" &&
                                                                        Number(
                                                                            amount,
                                                                        ).toFixed(
                                                                            2,
                                                                        ) +
                                                                            " " +
                                                                            asset}
                                                                    {currentDepositType.value ===
                                                                        "crypto" &&
                                                                        amount.toFixed(
                                                                            8,
                                                                        ) +
                                                                            " " +
                                                                            asset}
                                                                    {currentDepositType.value ===
                                                                        "standard_bank_transfer" &&
                                                                        amount.toFixed(
                                                                            2,
                                                                        ) +
                                                                            " " +
                                                                            (asset ===
                                                                            null
                                                                                ? "USD"
                                                                                : asset)}
                                                                </span>
                                                            </div>
                                                            {currentDepositType.value !==
                                                                "crypto" && (
                                                                <div>
                                                                    <span className="text-secondary pe-1">
                                                                        deposited:
                                                                    </span>
                                                                    <span className="fw-500">
                                                                        {currentDepositType.value ===
                                                                            "credit_card" &&
                                                                            deposited.toFixed(
                                                                                2,
                                                                            ) +
                                                                                " " +
                                                                                asset}
                                                                        {currentDepositType.value ===
                                                                            "paypal" &&
                                                                            Number(
                                                                                deposited,
                                                                            ).toFixed(
                                                                                2,
                                                                            ) +
                                                                                " " +
                                                                                (cryptoAsset ===
                                                                                null
                                                                                    ? "USDT"
                                                                                    : cryptoAsset)}
                                                                        {currentDepositType.value ===
                                                                            "standard_bank_transfer" &&
                                                                            deposited.toFixed(
                                                                                2,
                                                                            ) +
                                                                                " " +
                                                                                (cryptoAsset ===
                                                                                null
                                                                                    ? "USDT"
                                                                                    : cryptoAsset)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <span className="text-secondary pe-1">
                                                                    fee:
                                                                </span>
                                                                <span className="fw-500">
                                                                    {currentDepositType.value ===
                                                                    "crypto"
                                                                        ? Number(
                                                                              fee,
                                                                          ).toFixed(
                                                                              8,
                                                                          ) +
                                                                          " " +
                                                                          asset
                                                                        : Number(
                                                                              fee,
                                                                          ).toFixed(
                                                                              2,
                                                                          ) +
                                                                          " " +
                                                                          "USDT"}
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
                                                            {currentDepositType.value ===
                                                                "crypto" && (
                                                                <div>
                                                                    <span className="text-secondary pe-1">
                                                                        network:
                                                                    </span>
                                                                    <span className="fw-500">
                                                                        {
                                                                            network
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
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
                                                            <div>
                                                                <span className="text-secondary pe-1">
                                                                    Status:
                                                                </span>
                                                                <span className="fw-500">
                                                                    {status
                                                                        ? "Success"
                                                                        : "Pending"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="fs-12px d-flex flex-column">
                                                            <button
                                                                className="btn fs-12px p-0 text-success text-decoration-success text-decoration-underline"
                                                                onClick={async () => {
                                                                    if (
                                                                        downloading
                                                                    )
                                                                        return;
                                                                    setDownloading(
                                                                        true,
                                                                    );
                                                                    try {
                                                                        await downloadContent(
                                                                            id,
                                                                            "DEPOSIT",
                                                                            currentDepositType.type,
                                                                        );
                                                                    } catch (error) {
                                                                        console.log(
                                                                            error,
                                                                        );
                                                                    }
                                                                    setDownloading(
                                                                        false,
                                                                    );
                                                                }}
                                                            >
                                                                <span
                                                                    className={
                                                                        downloading
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
                                                            <button
                                                                className="btn btn-link text-light fs-12px d-none"
                                                                onClick={() =>
                                                                    handleHideActivity(
                                                                        id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    pending
                                                                }
                                                            >
                                                                {pending
                                                                    ? "Processing . . ."
                                                                    : "Hide this activity"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ),
                            )}
                </table>
            </div>
            {list?.length > 5 && (
                <div className="px-4">
                    <Pagination
                        activePage={activePage}
                        itemsCountPerPage={itemsCountPerPage}
                        totalItemsCount={list.length}
                        pageRangeDisplayed={5}
                        onChange={(pageNumber) => {
                            setActivePage(pageNumber);
                        }}
                    />
                </div>
            )}
        </>
    );
}
