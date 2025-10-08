import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import _ from "lodash";
import { Icon } from "@iconify/react";
import { device } from "../../../../utilities/device";
import UserDataRow from "./UserDataRow";
import PaginationBar from "../../PaginationBar";
import { width } from "./columnWidth";
import Loading from "./../../shared/Loading";
import { get_Users } from "../../../../store/actions/userAction";
import { get_User_Tiers_WithoutSvg } from "../../../../store/actions/userTierAction";

const UserTable = () => {
    const dispatch = useDispatch();
    const { data } = useSelector((state) => state);
    const [loading, setLoading] = useState(false);
    const [pageInfo, setPageInfo] = useState({ page: 1, limit: 5 });
    const { page, limit } = pageInfo;
    const [pageData, setPageData] = useState([]);

    // Search Bar
    const [inputText, setInputText] = useState("");
    const [searchValue, setSearchValue] = useState("");

    const hanldeEnterKeyDown = (e) => {
        if (e.key === "Enter") {
            setSearchValue(inputText);
        }
    };

    useEffect(() => {
        (async function () {
            setLoading(true);
            await dispatch(get_User_Tiers_WithoutSvg());
            await dispatch(get_Users());
            setLoading(false);
        })();
    }, [dispatch]);

    const showData = useMemo(() => {
        const sortedData = _.orderBy(Object.values(data), ["regDate"], ["asc"]);
        return !searchValue
            ? sortedData
            : sortedData.filter((item) =>
                  String(item?.email)
                      .toLowerCase()
                      .includes(searchValue.toLowerCase()),
              );
    }, [data, searchValue]);

    useEffect(() => {
        setPageData(showData.slice((page - 1) * limit, page * limit));
    }, [showData, page, limit]);

    return (
        <>
            <SearchBar>
                <button title="See All">
                    <Icon
                        icon="bi:list-stars"
                        onClick={() => {
                            setSearchValue("");
                            setInputText("");
                        }}
                    />
                </button>
                <div className="d-flex align-items-center">
                    <p>Email </p>
                    <input
                        className="mx-2 px-1"
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={hanldeEnterKeyDown}
                    />
                    <button
                        onClick={() => setSearchValue(inputText)}
                        disabled={!inputText}
                        title="Search"
                    >
                        <Icon icon="carbon:search" />
                    </button>
                </div>
            </SearchBar>
            <TableHead>
                <div className="name">Name</div>
                <div className="contact">Contact</div>
                <div className="password">Password</div>
                <div className="country">Country</div>
                <div className="privilege">Privilege</div>
                <div id="action">Action</div>
                <div id="brief"></div>
            </TableHead>
            <TableHeadForMobile>
                <div className="name">Users Data</div>
            </TableHeadForMobile>
            {loading ? (
                <Loading />
            ) : (
                <>
                    <TableBody>
                        {pageData.map((datum) => {
                            return (
                                <UserDataRow
                                    key={datum.id}
                                    datum={datum}
                                    index={datum.id}
                                />
                            );
                        })}
                    </TableBody>
                    <PaginationBar
                        setPage={setPageInfo}
                        page={page}
                        limit={limit}
                        total={showData.length}
                    />
                </>
            )}
        </>
    );
};

export default UserTable;

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
    & > div.name {
        width: ${width.name};
        padding-left: 16px;
    }
    & > div.contact {
        width: ${width.contact};
    }
    & > div.password {
        width: ${width.password};
    }
    & > div.country {
        width: ${width.country};
    }
    & > div.privilege {
        width: ${width.privilege};
    }
    & > div#action {
        width: ${width.action};
        padding-left: 25px;
    }
    & > div#brief {
        width: ${width.brief};
    }

    & > div#brief {
        display: none;
    }
    @media screen and (max-width: ${device["laptop-md"]}) {
        & > div.privilege {
            width: 13%;
        }
        & > div#action {
            display: none;
        }
        & > div#brief {
            display: block;
        }
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

const SearchBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    input {
        background-color: #1e1e1e;
        border: 1px solid white;
        color: white;
        font-size: 14px;
        height: 32px;
    }
    button {
        background: inherit;
        border: none;
        &:disabled {
            opacity: 0.5;
            cursor: unset;
        }
    }
    svg {
        font-size: 25px;
    }
`;
