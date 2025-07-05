/* eslint-disable */
import React, { useReducer } from "react";
import Header from "./../header";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { Airdrop } from "../../utilities/imgImport";
import { useWindowSize } from "../../utilities/customHook";
import AirdropDetail from "../AirdropDetail";
import MarketTab from "./market-tab";
import Transactions from "./transactions";
import StakeTab from "./stake-tab";
import LockupTab from "./LockupTab";
import InternalWallet from "./internal-wallet";
import Seo from "../seo";
import TransactionsProvider from "./transactions/transactions-context";
import * as Mutation from "../../apollo/graphqls/mutations/Payment";
import { useMutation } from "@apollo/client";

const airdrops = [
    {
        icon: Airdrop,
        name: "ICON (ICX)",
        desc: "General-purpose blockchain protocol",
        status: "Active",
        end: "14 Apr 2022",
        reward: 150,
        participants: 60,
        winners: 20,
    },
    {
        icon: Airdrop,
        name: "BtcEX (BXC)",
        desc: "Crypto exchange platform",
        status: "Active",
        end: "14 Apr 2022",
        reward: 300,
        participants: 60,
        winners: 20,
    },
    {
        icon: Airdrop,
        name: "Publish0x",
        desc: "Crypto-publishing platform",
        status: "Ended",
        end: "Unkown",
        reward: 100,
        participants: 60,
        winners: 20,
    },
];

const Wallet = () => {
    const size = useWindowSize();

    const [state, setState] = useReducer(
        (old, action) => ({ ...old, ...action }),
        {
            detail_show: false,
            index: 0,
        },
    );

    const { detail_show, index } = state;

    const handleClick = (idx) => {
        setState({ detail_show: true });
        setState({ index: idx });
    };

    const handleJoinAirdrop = () => {
        setState({ joinAirdrop: true });
    };

    const [captureOrderForDeposit] = useMutation(
        Mutation.CAPTURE_ORDER_FOR_DEPOSIT,
        {
            onCompleted: (data) => {
                if (data.captureOrderForDeposit) {
                    alert("Your checkout was successfully!");
                } else {
                    alert("Error in checkout with PayPal");
                }
            },
            onError: (err) => {
                alert("Error in checkout with PayPal");
            },
        },
    );

    let orderCaptured = false;

    if (window.location.href.includes("token=") && !orderCaptured) {
        var url = new URL(window.location.href);
        let token = url.searchParams.get("token");
        orderCaptured = true;
        captureOrderForDeposit({ variables: { orderId: token } });
    }

    if (
        localStorage.getItem("PayPalDepositToken") != null &&
        localStorage.getItem("PayPalDepositToken") != undefined &&
        !orderCaptured
    ) {
        orderCaptured = true;
        let possibleToken = localStorage.getItem("PayPalDepositToken");
        captureOrderForDeposit({ variables: { orderId: possibleToken } });
        localStorage.setItem("PayPalDepositToken", null);
        localStorage.removeItem("PayPalDepositToken");
    }

    return (
        <>
            <Seo title="Wallet" />
            <main className="history-page">
                <Header />
                <section className="container">
                    <div className="section-history row">
                        <div className="section-history__left col-lg-4">
                            <InternalWallet />
                        </div>
                        <div className="section-history__right col-lg-8">
                            <div className="section-history__right__scroll">
                                <Tabs
                                    onSelect={() =>
                                        setState({ detail_show: false })
                                    }
                                >
                                    <div className="tab-top">
                                        <TabList>
                                            <Tab>market</Tab>
                                            {/* <Tab disabled={false}>lock-up</Tab> */}
                                            <Tab disabled={true}>stake</Tab>
                                            <Tab disabled={true}>airdrops</Tab>
                                            <Tab>transaction</Tab>
                                        </TabList>
                                    </div>
                                    <TabPanel>
                                        <MarketTab />
                                    </TabPanel>
                                    {/* <TabPanel>
                                        <LockupTab />
                                    </TabPanel> */}
                                    <TabPanel className="px-0">
                                        <StakeTab />
                                    </TabPanel>
                                    <TabPanel>
                                        <table
                                            className={`${
                                                detail_show &&
                                                (size.width > 1024 ||
                                                    size.width <= 576) &&
                                                "d-none"
                                            }`}
                                        >
                                            <thead>
                                                <tr>
                                                    <th className="w-50">
                                                        Airdrop
                                                    </th>
                                                    <th>Status</th>
                                                    <th className="laptop-not">
                                                        End
                                                    </th>
                                                    <th>Reward</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {airdrops.map((item, idx) => (
                                                    <tr
                                                        key={idx}
                                                        className="airdrop-link"
                                                        onClick={() => {
                                                            handleClick(idx);
                                                            setState({
                                                                airdropModal: true,
                                                            });
                                                        }}
                                                    >
                                                        <td className="w-50">
                                                            <div className="d-flex align-items-start ps-2">
                                                                <img
                                                                    src={
                                                                        item.icon
                                                                    }
                                                                    alt="coin icon"
                                                                    className="me-2"
                                                                />
                                                                <div>
                                                                    <p className="coin-abbr">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </p>
                                                                    <p className="coin-name mobile-not">
                                                                        {
                                                                            item.desc
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td
                                                            className={
                                                                item.status ===
                                                                "Active"
                                                                    ? "coin-status active"
                                                                    : "coin-status deactive"
                                                            }
                                                        >
                                                            {item.status}
                                                        </td>
                                                        <td className="laptop-not">
                                                            {item.end}
                                                        </td>
                                                        <td className="coin-reward">
                                                            ={item.reward} USD
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <AirdropDetail
                                            clsName={
                                                (size.width > 1024 ||
                                                    size.width <= 576) &&
                                                detail_show
                                                    ? "d-block"
                                                    : "d-none"
                                            }
                                            airdrop={airdrops[index]}
                                            onJoinClick={handleJoinAirdrop}
                                        />
                                    </TabPanel>
                                    <TabPanel className="border-0">
                                        <TransactionsProvider>
                                            <Transactions />
                                        </TransactionsProvider>
                                    </TabPanel>
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default Wallet;
