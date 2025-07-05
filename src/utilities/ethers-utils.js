import { ethers } from "ethers";

// BigNumber compatibility layer for migration from v5 to v6
// This version avoids BigInt entirely for better compatibility
export const BigNumber = {
    from: (value) => {
        return Number(value);
    },

    isBigNumber: (value) => {
        return typeof value === "number" && !isNaN(value);
    },

    // Common BigNumber methods adapted for regular numbers
    toString: (value) => {
        return String(value);
    },

    toNumber: (value) => {
        return Number(value);
    },

    eq: (a, b) => {
        return Number(a) === Number(b);
    },

    gt: (a, b) => {
        return Number(a) > Number(b);
    },

    gte: (a, b) => {
        return Number(a) >= Number(b);
    },

    lt: (a, b) => {
        return Number(a) < Number(b);
    },

    lte: (a, b) => {
        return Number(a) <= Number(b);
    },

    add: (a, b) => {
        return Number(a) + Number(b);
    },

    sub: (a, b) => {
        return Number(a) - Number(b);
    },

    mul: (a, b) => {
        return Number(a) * Number(b);
    },

    div: (a, b) => {
        return Math.floor(Number(a) / Number(b));
    },

    mod: (a, b) => {
        return Number(a) % Number(b);
    },

    isZero: (value) => {
        return Number(value) === 0;
    },
};

// Export main ethers object
export { ethers };

// Common ethers utilities
export const parseEther = ethers.parseEther;
export const formatEther = ethers.formatEther;
export const parseUnits = ethers.parseUnits;
export const formatUnits = ethers.formatUnits;
export const isAddress = ethers.isAddress;
export const getAddress = ethers.getAddress;
export const keccak256 = ethers.keccak256;
export const solidityPackedKeccak256 = ethers.solidityPackedKeccak256;
export const toUtf8Bytes = ethers.toUtf8Bytes;
export const toUtf8String = ethers.toUtf8String;
export const hexlify = ethers.hexlify;
export const arrayify = ethers.getBytes; // arrayify was renamed to getBytes in v6

// Provider helpers
export const getDefaultProvider = ethers.getDefaultProvider;
export const JsonRpcProvider = ethers.JsonRpcProvider;
export const BrowserProvider = ethers.BrowserProvider; // replaces Web3Provider in v6

// Contract utilities
export const Contract = ethers.Contract;
export const ContractFactory = ethers.ContractFactory;
export const Interface = ethers.Interface;

// Wallet utilities
export const Wallet = ethers.Wallet;
export const HDNodeWallet = ethers.HDNodeWallet;

// Common constants
export const constants = {
    AddressZero: ethers.ZeroAddress,
    HashZero: ethers.ZeroHash,
    MaxUint256: Number.MAX_SAFE_INTEGER, // Use safe integer instead of BigInt
    WeiPerEther: ethers.parseEther("1"),
};

// Utility functions for common operations
export const weiToEther = (wei) => {
    return ethers.formatEther(wei);
};

export const etherToWei = (ether) => {
    return ethers.parseEther(ether.toString());
};

export const formatTokenAmount = (amount, decimals = 18) => {
    return ethers.formatUnits(amount, decimals);
};

export const parseTokenAmount = (amount, decimals = 18) => {
    return ethers.parseUnits(amount.toString(), decimals);
};

// Helper for checking if a value is a valid number
export const isBigNumberish = (value) => {
    return !isNaN(Number(value));
};
