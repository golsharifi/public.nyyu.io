import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import Pagination from "react-js-pagination";

import CustomSpinner from "../common/custom-spinner";
import { GET_NOTIFICATIONS } from "../../apollo/graphqls/querys/Notification";
import { SET_NOTIFICATION_READ_FLAG } from "../../apollo/graphqls/mutations/Notification";
import { SET_NOTIFICATION_READ_FLAG_ALL } from "../../apollo/graphqls/mutations/Notification";

export default function NotificationRecent() {
    // Containers
    // -- States
    const [loadingSection, setLoadingSection] = useState(true);
    const [activePage, setActivePage] = useState(1);
    const [NTList, setNTList] = useState([]);
    const itemsCountPerPage = 10;

    // -- Hooks
    const { data: ntf_list } = useQuery(GET_NOTIFICATIONS, {
        onCompleted: () => setLoadingSection(false),
        fetchPolicy: "network-only",
    });

    const tempList = ntf_list?.getNotifications;

    useEffect(() => {
        if (!tempList) return;
        setNTList((d) => [...d, ...tempList]);
    }, [tempList]);

    const [setNotificationReadFlag] = useMutation(SET_NOTIFICATION_READ_FLAG, {
        onCompleted: (data) => {
            let ids = [...NTList];
            let index = ids.findIndex(
                (el) => el.timeStamp === data.setNotificationReadFlag.timeStamp
            );
            ids[index] = { ...ids[index], pending: false, read: true };
            setNTList(ids);
        },
    });

    function setSingleNotificationRead(item, index, arr) {
        arr[index] = { ...arr[index], pending: false, read: true };
        console.log(arr[index].timeStamp);
    }

    const [setNotificationReadFlagAll] = useMutation(
        SET_NOTIFICATION_READ_FLAG_ALL,
        {
            onCompleted: () => {
                let ids = [...NTList];
                ids.forEach(setSingleNotificationRead);
                setNTList(ids);
            },
        }
    );

    const setRead = (item) => {
        if (item.read) return;
        let ids = [...NTList];
        let index = ids.findIndex((el) => el.timeStamp === item.timeStamp);
        ids[index] = { ...ids[index], pending: true };
        setNTList(ids);
        console.log(item);
        setNotificationReadFlag({
            variables: {
                id: item.id,
            },
        });
    };
    
    if (loadingSection)
        return (
            <div className="d-flex justify-content-center mt-5">
                <CustomSpinner />
            </div>
        );
    else
        return (
            <>
                <div className="recent-notification-wrapper pe-3">
                    {NTList.length &&
                        NTList.slice(
                            (activePage - 1) * itemsCountPerPage,
                            activePage * itemsCountPerPage
                        ).map((item, idx) => (
                            <div
                                className="recent-item"
                                key={idx}
                                tabIndex={0}
                                role="button"
                                onClick={() => setRead(item)}
                                onKeyDown={() => setRead(item)}
                            >
                                <div
                                    className={`status ${
                                        item?.pending
                                            ? "pending"
                                            : item?.read
                                            ? "deactive"
                                            : "active"
                                    }`}
                                />
                                <p>{item?.msg}</p>
                            </div>
                        ))}
                    {!NTList.length && (
                        <div className="text-light fw-500 text-center text-uppercase py-3">
                            no notifications yet
                        </div>
                    )}
                </div>
                <div className="row">
                    <div className="col-md-3 justify-content-center align-items-end text-end mt-3 d-block d-md-none">
                        <button
                            onClick={setNotificationReadFlagAll}
                            className="btn text-white text-decoration-underline fs-6"
                        >
                            Mark as all read
                        </button>
                    </div>
                    <div className="col-md-9">
                        {NTList.length && (
                            <div className="my-2 d-flex justify-content-center justify-content-md-start">
                                <Pagination
                                    activePage={activePage}
                                    itemsCountPerPage={itemsCountPerPage}
                                    totalItemsCount={NTList.length}
                                    pageRangeDisplayed={5}
                                    onChange={(pageNumber) =>
                                        setActivePage(pageNumber)
                                    }
                                />
                            </div>
                        )}
                    </div>
                    <div className="col-md-3 justify-content-center align-items-end text-end mt-3 d-none d-md-block">
                        <button
                            onClick={setNotificationReadFlagAll}
                            className="btn text-white text-decoration-underline fs-6"
                        >
                            Mark as all read
                        </button>
                    </div>
                </div>
            </>
        );
};
