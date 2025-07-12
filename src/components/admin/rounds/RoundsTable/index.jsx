import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import _ from "lodash";
import styled from "styled-components";
import { device } from "../../../../utilities/device";
import RoundDataRow from "./RoundDataRow";
import { width } from "./columnWidth";
import PaginationBar from "./../../PaginationBar";
import Loading from "./../../shared/Loading";
import { get_Auctions } from "../../../../store/actions/auctionAction";

const RoundsTable = () => {
    const dispatch = useDispatch();
    const { data } = useSelector((state) => state);

    const [pageInfo, setPageInfo] = useState({ page: 1, limit: 5 });
    const { page, limit } = pageInfo;

    const [loading, setLoading] = useState(false);
    const [pageData, setPageData] = useState([]);

    useEffect(() => {
        (async function () {
            setLoading(true);
            await dispatch(get_Auctions());
            setLoading(false);
        })();
    }, [dispatch]);

    useEffect(() => {
        setPageData(
            Object.values(data).slice((page - 1) * limit, page * limit),
        );
    }, [dispatch, data, page, limit]);

    return (
        <>
            <TableHead>
                <div className="round">Round</div>
                <div className="time">Time</div>
                <div className="token">Token</div>
                <div className="price">Min Price</div>
                <div className="sold">Sold</div>
                <div className="stats">Stats</div>
                <div className="round_status">Status</div>
            </TableHead>
            <TableHeadForMobile>
                <div className="name">Auctions Data</div>
            </TableHeadForMobile>
            {loading ? (
                <Loading />
            ) : _.isEmpty(data) ? (
                <p className="text-center mt-2">No Data</p>
            ) : (
                <>
                    <TableBody>
                        {pageData.map((datum) => {
                            return (
                                <RoundDataRow key={datum.id} datum={datum} />
                            );
                        })}
                    </TableBody>
                    <PaginationBar
                        setPage={setPageInfo}
                        page={page}
                        limit={limit}
                        total={Object.values(data).length}
                    />
                </>
            )}
        </>
    );
};

export default RoundsTable;

const TableHead = styled.div`
    height: 40px;
    border: 1px solid #464646;
    background-color: #464646;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    font-weight: 600;
    & > div {
        padding: 8px 2px;
    }
    & > div.round {
        width: ${width.round};
        padding-left: 16px;
    }
    & > div.time {
        width: ${width.time};
    }
    & > div.token {
        width: ${width.token};
    }
    & > div.price {
        width: ${width.price};
    }
    & > div.sold {
        width: ${width.sold};
    }
    & > div.stats {
        width: ${width.stats};
    }
    & > div.round_status {
        width: ${width.round_status};
    }

    @media screen and (max-width: ${device["phone"]}) {
        display: none;
    }
`;

const TableHeadForMobile = styled.div`
    height: 40px;
    border: 1px solid #464646;
    background-color: #464646;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    & > div.name {
        padding-left: 16px;
    }
    display: none;
    @media screen and (max-width: ${device["phone"]}) {
        display: flex;
    }
`;

const TableBody = styled.div`
    border-left: 1px solid #464646;
    border-right: 1px solid #464646;
`;
