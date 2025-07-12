import React from "react";
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';

import Seo from "./../../components/seo";
import LayoutWithMenu from "../../components/admin/LayoutWithMenu";
import UserTable from "../../components/admin/users/UserTable";
// import BidTable from "../../components/admin/users/BidTable";
// import WalletTable from "../../components/admin/users/WalletTable";
// import FiatTable from "../../components/admin/users/FiatTable";
// import KYBTable from "../../components/admin/users/KYBTable";

const wallets = [
    {name: 'Amy Matthews', avatar: 'Tesla.12' },
    {name: 'Amira Kandovsky', avatar: 'Voltapancake' },
    {name: 'Bernard Lane', avatar: 'CutieCurry' },
    {name: 'Joseph Martini', avatar: 'Johnson Johnson' },
    {name: 'Tom Jager', avatar: 'Cruto1431' },
];

const fiats = [
    {name: 'Amy Matthews', avatar: 'Tesla.12', status: 'complete' },
    {name: 'Amira Kandovsky', avatar: 'Voltapancake', status: 'pending' },
    {name: 'Bernard Lane', avatar: 'CutieCurry', status: 'pending' },
    {name: 'Joseph Martini', avatar: 'Johnson Johnson', status: 'complete' },
    {name: 'Tom Jager', avatar: 'Cruto1431', status: 'complete' },
];

const IndexPage = () => {
    return (
        <>
            <Seo title="Admin Users" />
            <main className="admin-users-page">
                <LayoutWithMenu>
                    <div className="tabs_container">
                        <Tabs>
                            <TabList>
                                <Tab>User</Tab>
                                {/* <Tab>Wallet</Tab>
                                <Tab>Fiat</Tab>
                                <Tab>KYB</Tab> */}
                            </TabList>
                            <TabPanel>
                                <UserTable/>
                            </TabPanel>
                            {/* <TabPanel>
                                <WalletTable data={wallets} />
                            </TabPanel>
                            <TabPanel>
                                <FiatTable data={fiats} />
                            </TabPanel>
                            <TabPanel>
                                <KYBTable />
                            </TabPanel> */}
                        </Tabs>
                    </div>
                </LayoutWithMenu>
            </main>
        </>
    )
}

export default IndexPage
