/* eslint-disable */

import React from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import EquityValueTab from "./EquityValueTab";
import LockedStakingTab from "./LockedStakingTab";
import DefiStakingTab from "./DefiStakingTab";

export default function StakeTab() {
    return (
        <Tabs className="text-light stake-react-list__tab">
            <TabList className="py-3 px-0 px-sm-4 overflow-auto d-flex align-items-center justify-content-start white-space-nowrap">
                <Tab>Equity Value</Tab>
                <Tab>Locked Staking</Tab>
                <Tab>DeFi Staking</Tab>
            </TabList>
            <TabPanel className="px-4">
                <EquityValueTab />
            </TabPanel>
            <TabPanel className="px-4">
                <LockedStakingTab />
            </TabPanel>
            <TabPanel className="px-2 px-sm-4">
                <DefiStakingTab />
            </TabPanel>
        </Tabs>
    );
}
