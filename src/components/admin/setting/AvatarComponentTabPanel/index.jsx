import React, { useEffect, useState } from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import _ from "lodash";
import { device } from "../../../../utilities/device";
import AvatarComponentDataRow from "./AvatarComponentDataRow";
import { width } from "./columnWidth";
import Loading from "./../../shared/Loading";
import PaginationBar from "../../PaginationBar";
import { get_User_Tiers_WithoutSvg } from "../../../../store/actions/userTierAction";

const AvatarCompTabel = () => {
    const dispatch = useDispatch();
    const { loaded, hairStyles, facialStyles, expressions, hats, others } =
        useSelector((state) => state.avatarComponents);
    const totalComp = {
        ...hairStyles,
        ...facialStyles,
        ...expressions,
        ...hats,
        ...others,
    };
    const compData = _.orderBy(Object.values(totalComp), ["groupId"], ["asc"]);
    const [pageInfo, setPageInfo] = useState({ page: 1, limit: 5 });
    const { page, limit } = pageInfo;

    const [pageData, setPageData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async function () {
            setLoading(true);
            await dispatch(get_User_Tiers_WithoutSvg());
            setLoading(false);
        })();
    }, [dispatch]);

    useDeepCompareEffect(() => {
        setPageData(compData.slice((page - 1) * limit, page * limit));
    }, [dispatch, compData, page, limit]);

    return (
        <>
            <TableHead>
                <div className="image text-center">Avatar Component</div>
                <div className="groupId">ID</div>
                <div className="position">Position (%)</div>
                <div className="config">Config</div>
                <div className="edit"> </div>
            </TableHead>
            <TableHeadForMobile>
                <div className="name">Avatar Component Data</div>
            </TableHeadForMobile>
            {!loaded || loading ? (
                <Loading />
            ) : (
                <>
                    <TableBody className="custom_scrollbar">
                        {pageData.map((datum) => {
                            return (
                                <AvatarComponentDataRow
                                    key={datum.compId}
                                    datum={datum}
                                />
                            );
                        })}
                    </TableBody>
                    <PaginationBar
                        setPage={setPageInfo}
                        page={page}
                        limit={limit}
                        total={compData.length}
                    />
                </>
            )}
        </>
    );
};

export default AvatarCompTabel;

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
    & > div.image {
        width: ${width.image};
    }
    & > div.groupId {
        width: ${width.groupId};
    }
    & > div.position {
        width: ${width.position};
    }
    & > div.config {
        width: ${width.config};
    }
    & > div.edit {
        width: ${width.edit};
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
    @media screen and (max-width: ${device["phone"]}) {
        max-height: unset;
    }
`;
