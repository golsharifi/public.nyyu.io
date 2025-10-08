import React from "react";
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';

import Seo from "./../../components/seo"
import LayoutWithMenu from "../../components/admin/LayoutWithMenu";
import AuctionsTable from "../../components/admin/rounds/RoundsTable";
import PresalesTable from "../../components/admin/rounds/PresalesTable";

const IndexPage = () => {
    return (
        <>
            <Seo title="Admin Rounds" />
            <main className="admin-rounds-page">
                <LayoutWithMenu>
                    <div className="rounds_table">
                        <Tabs>
                            <TabList>
                                <Tab>Auctions</Tab>
                                <Tab>Presales</Tab>
                            </TabList>
                            <TabPanel>
                                <AuctionsTable />
                            </TabPanel>
                            <TabPanel>
                                <PresalesTable />
                            </TabPanel>
                        </Tabs>
                    </div>
                </LayoutWithMenu>
            </main>
        </>
    )
}

export default IndexPage
