import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import _ from "lodash";
import styled from 'styled-components';
import { device } from '../../../../utilities/device';
import RoundDataRow from './RoundDataRow';
import { width } from './columnWidth';
import PaginationBar from './../../PaginationBar';
import Loading from './../../shared/Loading';
import * as Query from "../../../../apollo/graphqls/querys/Auction";
import { usePresaleTable } from './usePresaleTable';

const RoundsTable = () => {
    const presaleTable = usePresaleTable();
    
    const [pageInfo, setPageInfo] = useState({ page: 1, limit: 5 });
    const { page, limit } = pageInfo;

    const [loading, setLoading] = useState(true);
    const [pageData, setPageData] = useState([]);

    // Loading data
    useQuery(Query.GET_PRESALES, {
        onCompleted: data => {
            if(data.getPreSales) {
                presaleTable.fetchData(data.getPreSales);
            }
            setLoading(false);
        },
        onError: err => {
            console.log(err);
            setLoading(false);
        }
    });

    useEffect(() => {
        setPageData(Object.values(presaleTable.data).slice((page - 1) * limit, page * limit));
    }, [presaleTable.data, page, limit]);

    return (
        <>
            <TableHead>
                <div className='round'>Round</div>
                <div className='time'>Time</div>
                <div className='token'>Token Amount</div>
                <div className='price'>Token Price</div>
                <div className='sold'>Sold</div>
                <div className='round_status'>Status</div>
            </TableHead>
            <TableHeadForMobile>
                <div className='name'>Presales Data</div>
            </TableHeadForMobile>
            {loading?
                <Loading />:
                _.isEmpty(presaleTable.data)?
                <p className='text-center mt-2'>No Data</p>:
                <>
                    <TableBody>
                        {pageData.map(datum => {
                            return <RoundDataRow key={datum.id} datum={datum} />
                        })}
                    </TableBody>
                    <PaginationBar setPage={setPageInfo} page={page} limit={limit} total={Object.values(presaleTable.data).length} />
                </>
            }            
        </>
    )
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
    &>div {
        padding: 8px 2px;
    }
    &>div.round {width: ${width.round}; padding-left: 16px;}
    &>div.time {width: ${width.time};}
    &>div.token {width: ${width.token};}
    &>div.price {width: ${width.price};}
    &>div.sold {width: ${width.sold};}
    &>div.stats {width: ${width.stats};}
    &>div.round_status {width: ${width.round_status};}

    @media screen and (max-width: ${device['phone']}){
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
    &>div.name {padding-left: 16px;}
    display: none;
    @media screen and (max-width: ${device['phone']}){
        display: flex;
    }
`;

const TableBody = styled.div`
    border-left: 1px solid #464646;
    border-right: 1px solid #464646;
`;