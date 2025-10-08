import React from "react";
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';

import Seo from "../../components/seo";
import LayoutWithMenu from "../../components/admin/LayoutWithMenu";
import BankDepositTable from "../../components/admin/approval/BankDepositTable";
import CryptoWithdrawTable from "../../components/admin/approval/CryptoWithdrawTable";
import PaypalWithdrawTable from "../../components/admin/approval/PayPalWithdrawTable";
import BankWithdrawTable from "../../components/admin/approval/BankWithdrawTable";

const IndexPage = () => {

    return (
        <>
            <Seo title="Admin Approval" />
            <main className="admin-approval-page">
                <LayoutWithMenu>
                    <div className="tabs_container">
                        <Tabs>
                            <TabList>
                                <Tab>Bank Deposit</Tab>
                                <Tab>Crypto Withdraw</Tab>
                                <Tab>Paypal Withdraw</Tab>
                                <Tab>Bank Withdraw</Tab>
                            </TabList>
                            <TabPanel>
                                <BankDepositTable />
                            </TabPanel>
                            <TabPanel>
                                <CryptoWithdrawTable />
                            </TabPanel>
                            <TabPanel>
                                <PaypalWithdrawTable />
                            </TabPanel>
                            <TabPanel>
                                <BankWithdrawTable />
                            </TabPanel>
                        </Tabs>
                    </div>                    
                </LayoutWithMenu>
            </main>
        </>
    )
}

export default IndexPage
