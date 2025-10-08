import React from 'react';
import CryptoWithdrawProvider from './useCryptoWithdraw';
import DataTable from './DataTable';

const BankWithdrawTable = () => (
    <CryptoWithdrawProvider>
        <DataTable />
    </CryptoWithdrawProvider>
);


export default BankWithdrawTable;