import Switch from "react-switch";
import React, { useState, useEffect } from "react";
import CustomSpinner from "../common/custom-spinner";
import { useQuery, useMutation } from "@apollo/client";

import { COLOR_LOAD, COLOR_OFF, COLOR_ON } from "../../utilities/staticData";
import { GET_NOTICATION_TYPES } from "../../apollo/graphqls/querys/Notification";
import { USER_NOTIFICATION_SETTING } from "../../apollo/graphqls/mutations/Notification";
import { useSelector } from "react-redux";

export default function NotificationSetting() {
    // Containers
    const user = useSelector(state => state.auth?.user);
    const [pendingSwitch, setPendingSwitch] = useState(false);
    const [tempSetting, setTempSetting] = useState([]);
    const setting = user?.notifySetting;

    const [notificationTypeList, setNotificationTypeList] = useState(null);
    const loadingSection = !(user && notificationTypeList);

    // Webservice
    useQuery(GET_NOTICATION_TYPES, {
        onCompleted: (data) => {
            setNotificationTypeList(
                data.getNotificationTypes?.sort((type1, type2) => type2.index - type1.index)
            );
        },
    });
    const [changeNotifySetting] = useMutation(USER_NOTIFICATION_SETTING, {
        onCompleted: (data) => {
            const cList = tempSetting.slice();
            setTempSetting(
                cList.map((item) => {
                    return { ...item, loading: false };
                })
            );
            setPendingSwitch(false);
        },
    });

    // Methods
    const setChecked = (i) => {
        const cList = tempSetting.slice();
        cList[i].status = !cList[i].status;
        cList[i].loading = true;
        setTempSetting(cList);
        setPendingSwitch(true);

        changeNotifySetting({
            variables: {
                nType: Number(cList[i].index),
                status: cList[i].status,
            },
        });
    };
    const createBinaryString = (nMask) => {
        for (
            var nFlag = 0, nShifted = nMask, sMask = "";
            nFlag < 32;
            nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1
        );
        sMask = sMask.replace(/\B(?=(.{8})+(?!.))/g, " ");
        return sMask;
    };
    useEffect(() => {
        if (setting)
            setTempSetting(
                notificationTypeList
                    ? notificationTypeList.map((n) => {
                          const settingBinaryString = createBinaryString(setting)
                              .slice(35 - notificationTypeList?.length, 35)
                              .split("")
                              .reverse()
                              .join("");
                          return {
                              index: n.index,
                              type: n.type,
                              status: Number(settingBinaryString[n.index]) !== 0,
                              loading: false,
                          };
                      })
                    : []
            );
    }, [notificationTypeList, setting]);

    // Render
    if (loadingSection)
        return (
            <div className="d-flex justify-content-center my-5">
                <CustomSpinner />
            </div>
        );
    else
        return (
            <>
                {notificationTypeList &&
                    notificationTypeList.map(({ type }, index) => (
                        <div className="notification-item" key={index}>
                            <p>{type}</p>
                            <Switch
                                onColor={tempSetting[index]?.loading ? COLOR_LOAD : COLOR_ON}
                                offColor={tempSetting[index]?.loading ? COLOR_LOAD : COLOR_OFF}
                                height={3}
                                width={35}
                                disabled={pendingSwitch}
                                handleDiameter={12}
                                onHandleColor={tempSetting[index]?.loading ? COLOR_LOAD : COLOR_ON}
                                offHandleColor={
                                    tempSetting[index]?.loading ? COLOR_LOAD : COLOR_OFF
                                }
                                onChange={() => setChecked(index)}
                                checked={!!tempSetting[index]?.status}
                            />
                        </div>
                    ))}
            </>
        );
}
