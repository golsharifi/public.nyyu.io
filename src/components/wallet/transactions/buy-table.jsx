import React, { useEffect, useState } from "react";
import { useQuery } from '@apollo/client';
import Countdown from "react-countdown";
import _ from 'lodash';
import Skeleton from '@mui/material/Skeleton';
import { BTCGrayIcon, Credit, NdbWallet } from "../../../utilities/imgImport";
import { useTransactions } from "./transactions-context";
import Pagination from "react-js-pagination";
import { Icons } from "../../../utilities/Icons";
import { AccordionUpIcon, AccordionDownIcon } from "../../../utilities/imgImport";
import { GET_PRESALE_ORDER_TXNS_BY_ORDER_ID } from './queries';

const EXPIRE_TIME = 8 * 3600 * 1000;

// Renderer callback with condition
const rendererMain = ({ completed }) => {
    if (completed) {
        // Render a completed state
        return <span className="text-danger">EXPIRED</span>;
    } else {
        // Render a countdown
        return (
            <span>Processing</span>
        );
    }
};

const rendererDetail = ({ hours, minutes, seconds, completed }) => {
    if(completed) {
        return <span>Payment Expired</span>;
    } else {
        return (
        <>
            <div>
                <span className="text-secondary pe-1">
                    Payment expires in
                </span>
                <span className="fw-500">
                    {hours}h: {minutes}m: {seconds}s
                </span>
            </div>
            <div>
                <span>Waiting for your funds</span>
            </div>
        </>
        )
    };
};

const TxnDataRow = ({ data }) => {
    const { id, date, time, amount, payment, status, createdAt } = data;
    const [showDetail, setShowDetail] = useState(false);
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState({});
    const [error, setError] = useState('');

    useQuery(GET_PRESALE_ORDER_TXNS_BY_ORDER_ID, {
        variables: {
            orderId: id
        },
        onCompleted: data => {
            if(data.getPresaleOrderTransactions) {
                let resData = data.getPresaleOrderTransactions;
                delete resData['__typename'];
                if(Object.values(resData).every(x => !x.length)) {
                    setError('No payment created');
                } else {
                    const coinpaymentTxns = { ..._.last(resData.coinpaymentTxns), paymentType: 'crypto' };
                    const paypalTxns = { ..._.last(resData.paypalTxns), paymentType: 'paypal' };
                    const stripeTxns = { ..._.last(resData.stripeTxns), paymentType: 'stripe' };

                    const sortedByCreatedAt = _.orderBy([coinpaymentTxns, paypalTxns, stripeTxns], ['createdAt'], ['asc']);
                    const latest = sortedByCreatedAt[0];
                    setDetail(latest);
                }
            }
            setLoading(false);
        },
        onError: err => {
            console.log(err);
            setLoading(false);
        }
    });

    return (
    <>
        <tr className="border-bottom-2-dark-gray" style={{cursor: 'pointer'}}
            onClick={() => setShowDetail(!showDetail)}
        >
            <td className="text-light pe-5 pe-sm-0 fw-light fs-16px">
                <div className="fw-500 white-space-nowrap">
                    {id + " #"}
                </div>
            </td>
            <td className="text-light pe-5 pe-sm-0 fw-light">
                <div className="fs-16px">
                    {date}
                </div>
                <div className="text-secondary fs-12px mt-1 fw-500">
                    {time}
                </div>
            </td>
            <td className="pe-5 pe-sm-0 white-space-nowrap text-uppercase">
                <div className="text-sm-start fs-16px">
                    {Number(amount).toFixed(2) + " USD"}
                </div>
            </td>
            <td className="text-end pe-5 pe-sm-0">
                <img
                    src={
                        payment === 1
                            ? Credit
                            : payment === 2
                            ? BTCGrayIcon
                            : NdbWallet
                    }
                    alt="Payment icon"
                />
            </td>
            {status === 0 ? (
                <td className="d-flex align-items-center justify-content-end">
                    <div className="gray-bullet me-2"></div>
                    <div>
                        <Countdown
                            date={createdAt + EXPIRE_TIME}
                            renderer={rendererMain}
                        />
                    </div>
                </td>
            ) : status === 1 ? (
                <td className="d-flex align-items-center justify-content-end">
                    <div className="green-bullet me-2"></div>
                    <div>Success</div>
                </td>
            ) : (
                <td className="d-flex align-items-center justify-content-end">
                    <div className="red-bullet me-2"></div>
                    <div>Failed</div>
                </td>
            )}
            <td style={{width: '5%'}}>
                <button className="btn text-light border-0">
                    {showDetail ? (
                        <img
                            src={AccordionUpIcon}
                            className="icon-sm ms-2 cursor-pointer"
                            alt="Up arrow icon"
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
        
        {showDetail && (
            <tr>
                <td colSpan={6}>
                    {loading?
                        (
                            <div className="mt-2 text-center d-flex justify-content-center">
                                <Skeleton sx={{backgroundColor: 'dimgrey', width: '50%'}} />
                            </div>
                        ) : (
                            <div>
                                {_.isEmpty(detail) && <p className="text-center">{error}</p>}
                                {!_.isEmpty(detail) &&
                                <>
                                    {detail.paymentType === 'crypto' && (
                                        <div className="d-flex align-items-start justify-content-between">
                                            <div className="text-capitalize fs-12px">
                                                <div>
                                                    <span className="text-secondary pe-1">
                                                        type:
                                                    </span>
                                                    <span className="fw-500">
                                                        Coin Payment
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-secondary pe-1">
                                                        amount:
                                                    </span>
                                                    <span className="fw-500">
                                                        {detail.amount} USD
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-secondary pe-1">
                                                        Crypto Type:
                                                    </span>
                                                    <span className="fw-500">
                                                        {detail.cryptoType}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-secondary pe-1">
                                                        Network:
                                                    </span>
                                                    <span className="fw-500">
                                                        {detail.network}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-secondary pe-1">
                                                        Deposit Address:
                                                    </span>
                                                    <span className="fw-500">
                                                        {detail.depositAddress}
                                                    </span>
                                                </div>
                                                {detail.txHash && 
                                                    <div>
                                                        <span className="text-secondary pe-1">
                                                            transaction Hash:
                                                        </span>
                                                        {
                                                            detail.network === 'ERC20'?
                                                            <a target='_blank' href={`https://etherscan.io/tx/${detail.txHash}`} rel='noreferrer'>{detail.txHash}</a>:
                                                            detail.network === 'BEP20'?
                                                            <a target='_blank' href={`https://bscscan.com/tx/${detail.txHash}`} rel='noreferrer'>{detail.txHash}</a>:
                                                            <span>{detail.txHash}</span>
                                                        }
                                                    </div>
                                                }
                                                <div>
                                                    <span className="text-secondary pe-1">
                                                        Created At:
                                                    </span>
                                                    <span className="fw-500">
                                                        {new Date(detail.createdAt).toLocaleDateString()} {new Date(detail.createdAt).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-capitalize fs-12px">
                                                {status === 0 &&
                                                    <div>
                                                        <Countdown
                                                            date={createdAt + EXPIRE_TIME}
                                                            renderer={rendererDetail}
                                                        />
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    )}
                                    {detail.paymentType === 'paypal' && (
                                        <div className="d-flex align-items-start justify-content-between">
                                            <div className="text-capitalize fs-12px">
                                                <div>
                                                    <span className="text-secondary pe-1">
                                                        type:
                                                    </span>
                                                    <span className="fw-500">
                                                        Paypal Payment
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-secondary pe-1">
                                                        amount:
                                                    </span>
                                                    <span className="fw-500">
                                                        {detail.amount}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-secondary pe-1">
                                                        Fiat Type:
                                                    </span>
                                                    <span className="fw-500">
                                                        {detail.fiatType}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-secondary pe-1">
                                                        Created At:
                                                    </span>
                                                    <span className="fw-500">
                                                        {new Date(detail.createdAt).toLocaleDateString()} {new Date(detail.createdAt).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-capitalize fs-12px">
                                                {detail.txHash && 
                                                    <div>
                                                        <span className="text-secondary pe-1">
                                                            transaction Hash:
                                                        </span>
                                                        <span className="fw-500">
                                                            {detail.txHash}
                                                        </span>
                                                    </div>
                                                }
                                                {status === 0 && 
                                                    <div>
                                                        <Countdown
                                                            date={createdAt + EXPIRE_TIME}
                                                            renderer={rendererDetail}
                                                        />
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    )}
                                    {detail.paymentType === 'stripe' && (
                                        <div className="d-flex align-items-start justify-content-between">
                                            <div className="text-capitalize fs-12px">
                                                <div>
                                                    <span className="text-secondary pe-1">
                                                        type:
                                                    </span>
                                                    <span className="fw-500">
                                                        Credit Card Payment
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-secondary pe-1">
                                                        amount:
                                                    </span>
                                                    <span className="fw-500">
                                                        {detail.amount}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-secondary pe-1">
                                                        Fiat Type:
                                                    </span>
                                                    <span className="fw-500">
                                                        {detail.fiatType}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-secondary pe-1">
                                                        Created At:
                                                    </span>
                                                    <span className="fw-500">
                                                        {new Date(detail.createdAt).toLocaleDateString()} {new Date(detail.createdAt).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-capitalize fs-12px">
                                                {detail.txHash && 
                                                    <div>
                                                        <span className="text-secondary pe-1">
                                                            transaction Hash:
                                                        </span>
                                                        <span className="fw-500">
                                                            {detail.txHash}
                                                        </span>
                                                    </div>
                                                }
                                                {status === 0 &&
                                                    <div>
                                                        <Countdown
                                                            date={createdAt + EXPIRE_TIME}
                                                            renderer={rendererDetail}
                                                        />
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    )}
                                </>
                                }
                            </div>
                        )
                    }
                </td>
            </tr>
        )}
    </>
    )
};

export default function BuyTable() {
    // Containers
    const { presaleList, itemsCountPerPage } = useTransactions();
    const [list, setList] = useState(presaleList);
    const [sortType, setSortType] = useState(null);
    const [activePage, setActivePage] = useState(1);

    // Methods
    const headerTitle = ({ title, up, down }) => (
        <th scope="col">
            <div
                className="d-flex align-items-center gap-1 noselect cursor-pointer"
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

    useEffect(() => {
        if (sortType === null) return setList(presaleList);
        if (sortType === "date_down")
            return setList(
                presaleList.sort(
                    (item2, item1) =>
                        new Date(item1.date).getTime() -
                        new Date(item2.date).getTime()
                )
            );
        if (sortType === "date_up")
            return setList(
                presaleList.sort(
                    (item2, item1) =>
                        new Date(item2.date).getTime() -
                        new Date(item1.date).getTime()
                )
            );
        if (sortType === "amount_down")
            return setList(
                presaleList.sort((item2, item1) => item1.amount - item2.amount)
            );
        if (sortType === "amount_up")
            return setList(
                presaleList.sort((item2, item1) => item2.amount - item1.amount)
            );
        if (sortType === "transaction_down")
            return setList(
                presaleList.sort(
                    (item2, item1) => item1.id - item2.id
                )
            );
        if (sortType === "transaction_up")
            return setList(
                presaleList.sort(
                    (item2, item1) => item2.id - item1.id
                )
            );
    }, [sortType]);

    // Render
    return (
        <>
            <div className="px-4 table-responsive transaction-section-tables mb-5 mb-sm-0">
                <table className="wallet-transaction-table w-100">
                    <tr className="border-bottom-2-dark-gray py-3">
                        {headerTitle({
                            title: "Transaction",
                            up: "transaction_up",
                            down: "transaction_down",
                        })}
                        {headerTitle({
                            title: "Date",
                            up: "date_up",
                            down: "date_down",
                        })}
                        {headerTitle({
                            title: "Amount",
                            up: "amount_up",
                            down: "amount_down",
                        })}
                        <th scope="col" className="text-sm-end">
                            Payment
                        </th>
                        <th scope="col" className="text-end">
                            Status
                        </th>
                    </tr>
                    {list?.length === 0 && (
                        <tr className="py-4 text-center">
                            <td
                                colSpan={5}
                                className="text-light fs-16px text-uppercase fw-500"
                            >
                                no records found
                            </td>
                        </tr>
                    )}
                    {list
                        ?.slice(
                            (activePage - 1) * itemsCountPerPage,
                            activePage * itemsCountPerPage
                        )
                        ?.map(item => (
                                <TxnDataRow key={item.id} data={item} />
                            )
                        )}
                </table>
            </div>
            {list?.length > 3 && (
                <div className="px-4">
                    <Pagination
                        activePage={activePage}
                        itemsCountPerPage={itemsCountPerPage}
                        totalItemsCount={list.length}
                        pageRangeDisplayed={5}
                        onChange={(pageNumber) => setActivePage(pageNumber)}
                    />
                </div>
            )}
        </>
    );
}
