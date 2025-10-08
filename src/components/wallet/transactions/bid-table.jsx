import React, { useEffect, useState } from "react";
import { Link } from "gatsby";
import { BTCGrayIcon, Credit, NdbWallet } from "../../../utilities/imgImport";
import { useTransactions } from "./transactions-context";
import { ROUTES } from "../../../utilities/routes";
import Pagination from "react-js-pagination";
import { Icons } from "../../../utilities/Icons";

export default function BidTable() {
    // Containers
    const { bidList, itemsCountPerPage, currentRound } = useTransactions();
    const bidListForIncreaseBid = bidList.filter(item => item.status !== 0);

    const [list, setList] = useState(null);
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
                aria-hidden='true'
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
        if (sortType === null) return setList(bidListForIncreaseBid);
        if (sortType === "date_down")
            return setList(
                bidListForIncreaseBid.sort(
                    (item2, item1) =>
                        new Date(item1.date).getTime() -
                        new Date(item2.date).getTime()
                )
            );
        if (sortType === "date_up")
            return setList(
                bidListForIncreaseBid.sort(
                    (item2, item1) =>
                        new Date(item2.date).getTime() -
                        new Date(item1.date).getTime()
                )
            );
        if (sortType === "amount_down")
            return setList(
                bidListForIncreaseBid.sort(
                    (item2, item1) =>
                        new Date(item2.date).getTime() -
                        new Date(item1.date).getTime()
                )
            );
        if (sortType === "amount_up")
            return setList(
                bidListForIncreaseBid.sort(
                    (item2, item1) =>
                        new Date(item1.date).getTime() -
                        new Date(item2.date).getTime()
                )
            );
    }, [sortType, bidListForIncreaseBid]);

    // Render
    return (
        <>
            <div className="px-4 table-responsive transaction-section-tables mb-5 mb-sm-0">
                <table className="wallet-transaction-table w-100">
                    <tr className="border-bottom-2-dark-gray py-3">
                        <th scope="col">Auction</th>
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
                        <th scope="col" className="text-sm-end">
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
                        ?.map(
                            ({
                                round,
                                date,
                                time,
                                amount,
                                payment,
                                status,
                            }) => (
                                <tr className="border-bottom-2-dark-gray" key={date + time}>
                                    <td className="text-light pe-5 pe-sm-0 fw-light fs-16px ">
                                        <div className="fw-500">
                                            Round {round}
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
                                            {Number(amount).toFixed(2)} USD
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
                                            alt=""
                                        />
                                    </td>
                                    {currentRound.auction && currentRound.auction?.round === round? (
                                        <td className="d-flex flex-column align-items-end">
                                            <div className="d-flex align-items-center justify-content-end">
                                                {status === 1 ? (
                                                    <>
                                                        <div className="green-bullet me-2"></div>
                                                        <div>Won</div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="red-bullet me-2"></div>
                                                        <div>Lost</div>
                                                    </>
                                                )}
                                            </div>
                                            <Link
                                                to={ROUTES.auction}
                                                className="text-success mt-1 fw-500 text-decoration-underline text-decoration-success white-space-nowrap fs-14px"
                                            >
                                                Increase bid
                                            </Link>
                                        </td>
                                    ): (
                                        <>
                                            {status === 1 ? (
                                                <td className="d-flex align-items-center justify-content-end">
                                                    <div className="green-bullet me-2"></div>
                                                    <div>Won</div>
                                                </td>
                                            ) : (
                                                <td className="d-flex align-items-center justify-content-end">
                                                    <div className="red-bullet me-2"></div>
                                                    <div>Lost</div>
                                                </td>
                                            )}
                                        </>
                                    )}
                                </tr>
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