import React from "react";
import BidTable from "./bid-table";
import BuyTable from "./buy-table";
import DepositTable from "./deposit-table";
import { useTransactions } from "./transactions-context";
import WithdrawTable from "./withdraw-table";
import CustomSpinner from "../../common/custom-spinner";
import StatementsTable from "./statements-table";

export default function Transactions() {
    const { loading, currentTab, setCurrentTab, tabs } = useTransactions();
    return (
        <div className="transaction-tab">
            <div className="transaction-tab-list">
                {tabs.map((item) => {
                    return (
                        <button
                            key={item.index}
                            onClick={() => setCurrentTab(item.index)}
                            className={`btn rounded-0 w-100 fw-bold text-uppercase bg-transparent ${
                                item.index === currentTab
                                    ? "btn-outline-light text-light"
                                    : "btn-outline-secondary"
                            }`}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>
            {loading ? (
                <div className="text-center mt-4 mb-2">
                    <CustomSpinner />
                </div>
            ) : (
                <>
                    {currentTab === 0 && <DepositTable />}
                    {currentTab === 1 && <WithdrawTable />}
                    {currentTab === 2 && <BidTable />}
                    {currentTab === 3 && <BuyTable />}
                    {currentTab === 4 && <StatementsTable />}
                </>
            )}
        </div>
    );
}
