import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
    AccordionDownIcon,
    AccordionUpIcon,
    SPINNER
} from "../../../utilities/imgImport";
import { useTransactions } from "./transactions-context";
import Pagination from "react-js-pagination";
import _ from 'lodash';
import { Icons } from "../../../utilities/Icons";
import { downloadContent } from "../../../utilities/utility-methods";

const withdrawOptions = [
    { value: "paypal", label: "Paypal", type: 'PAYPAL' },
    { value: "crypto", label: "Crypto", type: 'CRYPTO' },
    { value: "bank", label: "Bank Transfer", type: 'BANK' },
];


export default function WithdrawTable() {
    // Containers
    const {
        tabs,
        paypalWithdrawTransactions,
        coinWithdrawTransactions,
        bankWithdrawTransactions,
        itemsCountPerPage,
    } = useTransactions();
    const [list, setList] = useState(paypalWithdrawTransactions);
    const [sortType, setSortType] = useState(null);
    const [currentWithdrawType, setCurrentWithdrawType] = useState(
        withdrawOptions[0]
    );
    const [toggle, setToggle] = useState(null);
    const [activePage, setActivePage] = useState(1);
    const [pending] = useState(false);

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
        setCurrentWithdrawType(type);
        if (type.value === "paypal") setList(paypalWithdrawTransactions);
        if (type.value === "crypto") setList(coinWithdrawTransactions);
        if (type.value === "bank") setList(bankWithdrawTransactions);
    };

    useEffect(() => {
        if (sortType === null) return changeDepositType(currentWithdrawType);
        if (sortType === "date_down")
            return setList(
                list.sort(
                    (item2, item1) =>
                        new Date(item1.date).getTime() -
                        new Date(item2.date).getTime()
                )
            );
        if (sortType === "date_up")
            return setList(
                list.sort(
                    (item2, item1) =>
                        new Date(item2.date).getTime() -
                        new Date(item1.date).getTime()
                )
            );

        if (sortType === "amount_down")
            return setList(
                list.sort((item2, item1) => item1.amount - item2.amount)
            );
        if (sortType === "amount_up")
            return setList(
                list.sort((item2, item1) => item2.amount - item1.amount)
            );
        if (sortType === "fee_down")
            return setList(list.sort((item2, item1) => item1.fee - item2.fee));

        if (sortType === "fee_up")
            return setList(list.sort((item2, item1) => item2.fee - item1.fee));
    }, [sortType, currentWithdrawType, list]);

    // Render
    return (
        <>
            <div className="mt-4 px-md-4 d-inline-block">
                <Select
                    isSearchable={false}
                    options={withdrawOptions}
                    defaultValue={withdrawOptions[0]}
                    value={currentWithdrawType}
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
                    {!_.isEmpty(list) && list
                        ?.slice(
                            (activePage - 1) * itemsCountPerPage,
                            activePage * itemsCountPerPage
                        )
                        ?.map(
                            ({
                                id,
                                date,
                                time,
                                amount,
                                asset,
                                fee,
                                status,
                                currency,
                                type,
                                paymentId,
                                deniedReason,
                            }) => (
                                <>
                                    <tr
                                        className="border-bottom-2-dark-gray cursor-pointer"
                                        onClick={() => {
                                            if(toggle === id) {
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
                                                {currentWithdrawType.value === 'paypal' && Number(amount).toFixed(2) + ' ' + currency}
                                                {currentWithdrawType.value === 'crypto' && (amount).toFixed(8) + ' ' + asset}
                                                {currentWithdrawType.value === 'bank' && (amount).toFixed(2) + ' ' + currency}
                                            </div>
                                        </td>
                                        <td className="text-end pe-5 pe-sm-0 white-space-nowrap">
                                            {currentWithdrawType.value === 'paypal' && Number(fee).toFixed(2) + ' ' + currency}
                                            {currentWithdrawType.value === 'crypto' && (fee).toFixed(8) + ' ' + asset}
                                            {currentWithdrawType.value === 'bank' && (fee).toFixed(2) + ' ' + currency}
                                        </td>
                                        <td className="d-flex align-items-center justify-content-end">
                                            <div
                                                className={`
                                                ${status === 0 ? "gray-bullet" : ""}
                                                ${status === 1 ? "green-bullet" : ""}
                                                ${status === 2 ? "red-bullet" : ""}
                                                    me-2`}
                                            ></div>
                                            <div>
                                                {status === 0 && "Pending"}
                                                {status === 1 && "Completed"}
                                                {status === 2 && "Denied"}
                                            </div>
                                            <button className="btn text-light border-0">
                                                {toggle === id ? (
                                                    <img
                                                        src={AccordionUpIcon}
                                                        className="icon-sm ms-2 cursor-pointer"
                                                        alt="Down arrow icon"
                                                    />
                                                ) : (
                                                    <img
                                                        src={AccordionDownIcon}
                                                        className="icon-sm ms-2 cursor-pointer"
                                                        alt="Down arrow icon"
                                                    />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                    {toggle === id && (
                                        <tr
                                            className="text-light px-5"
                                            id={`transaction-details-${id}`}
                                        >
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
                                                                {currentWithdrawType.value === 'paypal' && Number(amount).toFixed(2) + ' ' + currency}
                                                                {currentWithdrawType.value === 'crypto' && Number(amount).toFixed(8) + ' ' + asset}
                                                                {currentWithdrawType.value === 'bank' && Number(amount).toFixed(2) + ' ' + currency}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-secondary pe-1">
                                                                fee:
                                                            </span>
                                                            <span className="fw-500">
                                                                {currentWithdrawType.value === 'paypal' && Number(fee).toFixed(2) + ' ' + currency}
                                                                {currentWithdrawType.value === 'crypto' && Number(fee).toFixed(8) + ' ' + asset}
                                                                {currentWithdrawType.value === 'bank' && Number(fee).toFixed(2) + ' ' + currency}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-secondary pe-1">
                                                                date:
                                                            </span>
                                                            <span className="fw-500">
                                                                {date + " " + time}
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
                                                            "Crypto Deposit" && (
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
                                                                {status === 0 && "Pending"}
                                                                {status === 1 && "Success"}
                                                                {status === 2 && "Denied"}
                                                            </span>
                                                        </div>
                                                        {status === 2 &&
                                                            <div>
                                                                <span className="text-secondary pe-1">
                                                                    Denied Reason:
                                                                </span>
                                                                <span className="fw-500 d-block text-justify overflow-auto" style={{width: 320, maxHeight: 100}}>
                                                                    {deniedReason}
                                                                </span>
                                                            </div>
                                                        }
                                                    </div>
                                                    <div className="fs-12px d-flex flex-column">
                                                        <button
                                                            className="btn fs-12px p-0 text-success text-decoration-success text-decoration-underline"
                                                            onClick={async () => {
                                                                    if(downloading) return;
                                                                    setDownloading(true);
                                                                    try {
                                                                        await downloadContent(
                                                                            id,
                                                                            "WITHDRAW",
                                                                            currentWithdrawType.type
                                                                        );
                                                                    } catch (error) {
                                                                        console.log(error);
                                                                    }
                                                                    setDownloading(false);
                                                                }
                                                            }
                                                        >
                                                            <span className={downloading ? 'download-visible': "download-hidden"}>
                                                                <img src={SPINNER} width="12" height="12" alt="loading spinner"/>
                                                                &nbsp;&nbsp;
                                                            </span>Get PDF Receipt
                                                        </button>
                                                        <button className="btn btn-link text-light fs-12px d-none"
                                                            // onClick={() => handleHideActivity(id)}
                                                            disabled={pending}
                                                        >
                                                            {pending? 'Processing . . .' : 'Hide this activity'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )
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
