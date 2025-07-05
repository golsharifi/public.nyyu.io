import axios from "axios";
import { isBrowser } from "./auth";

export const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

function blobToBase64(blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
}

export const getCurrentDate = () => {
    let today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();

    today = mm + "/" + dd + "/" + yyyy;
    return today;
};

const validateVerificationObject = (object) => {
    let output = 1;
    Object.values(object).forEach((item) => (output *= item ? item : 0));
    if (output === 1) return true;

    return false;
};

// download file from URL
export async function downloadFileFromShufti(url) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'blob'
    });
    const base64 = await blobToBase64(response.data);
    return base64;
}

export const getShuftiStatusByReference = async (reference) => {
    if (!reference) return "INVALID";
    const clientId = process.env.GATSBY_SHUFTI_CLIENT;
    const secret = process.env.GATSBY_SHUFTI_SECRET;
    const output = {};
    const response = await axios
        .post(
            "https://api.shuftipro.com/status",
            {
                reference,
            },
            {
                headers: {
                    Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
                },
            }
        )
        .catch((error) => {
            (output["event"] = "request.invalid");
            console.log(error);
        });

    if ("event" in output) {
        output["docStatus"] = false;
        output["addrStatus"] = false;
        output["conStatus"] = false;
        output["selfieStatus"] = false;
        return output;
    }
    if (response && "data" in response) {
        const { data } = response;
        if ("verification_result" in data && "event" in data) {
            if (data.event === null) output["event"] = "request.invalid";
            else output["event"] = data.event;

            output['proofs'] = data.proofs;
            output['data'] = data.verification_data;
            output.country = data.country;

            // Document
            if ("document" in data.verification_result) {
                output["docStatus"] = validateVerificationObject(data.verification_result.document);
            }

            // Address
            if ("address" in data.verification_result) {
                output["addrStatus"] = validateVerificationObject(data.verification_result.address);
            }

            //Consent
            if ("consent" in data.verification_result) {
                output["conStatus"] = validateVerificationObject(data.verification_result.consent);
            }

            // Selfie
            if ("face" in data.verification_result) {
                output["selfieStatus"] = data.verification_result.face === 1 ? true : false;
            }

            return output;
        }
        return "PENDING";
    }

    return "UNSET";
};

export const createPaymentIntent = (paymentMethodId, amount) => {
    const apiBaseUrl = "https://api.stripe.com/v1/payment_intents";
    const response = axios.post(apiBaseUrl, {
        paymentMethodId,
        amount,
        currency: "usd",
        confirmation_method: "manual",
        confirm: "true",
    });
    if (response && "data" in response) {
    }
};

export const getStripePaymentFee = (user, allFees, bidAmount) => {
    // finding the fee.
    let userTierLevel = user?.tierLevel;
    if (userTierLevel === 0) userTierLevel = 1;
    const userFee = allFees[userTierLevel]?.fee;
    const stripePaymentFee = ((2.9 + userFee) * bidAmount) / 100 + 0.3;
    return stripePaymentFee.toFixed(2);
};

export const getPaypalPaymentFee = (user, allFees, bidAmount) => {
    const PaypalTrxFee = 5;
    // finding the fee.
    let userTierLevel = user?.tierLevel;
    if (userTierLevel === 0) userTierLevel = 1;
    const userFee = allFees[userTierLevel]?.fee;
    const paypalPaymentFee = ((PaypalTrxFee + userFee) * bidAmount) / 100 + 0.3;
    return paypalPaymentFee.toFixed(2);
};

export const getBankTransferFee = (user, allFees, bidAmount) => {
    let userTierLevel = user?.tierLevel;
    if(userTierLevel === 0) userTierLevel = 1;
    const userFee = allFees[userTierLevel]?.fee;
    const bankTransferFee = (userFee * bidAmount) / 100;
    return bankTransferFee;
};

export const createDateFromDateObject = (newDate = new Date()) => {
    const today = newDate;
    let month = today.getMonth() + 1;
    if (month < 10) month = "0" + month;
    let day = today.getDate();
    if (day < 10) day = "0" + day;
    let year = today.getFullYear();

    return year + "-" + month + "-" + day;
};
export const getNDBWalletPaymentFee = (user, allFees, bidAmount) => {
    // Finding the fee based on the user.
    const allFeesArray = Object.values(allFees);
    let userTierLevel = user?.tierLevel;
    if (userTierLevel === 0) userTierLevel = 1;
    const userFee = allFeesArray.filter((item) => item?.tierLevel === userTierLevel)[0]?.fee;

    return (userFee * bidAmount) / 100;
};

export const getCurrentMarketCap = async () => {
    const { data } = await axios.get(`${process.env.GATSBY_API_BASE_URL}/marketcap`);
    if (data) return data;
    return null;
};

export const getCirculatingSupply = async () => {
    const { data } = await axios.get(`${process.env.GATSBY_API_BASE_URL}/circulatingsupply`);
    if (data) return data;
    return null;
};

/**
     * Download statement pdf
     * @param {int} id transaction id
     * @param {string} tx transaction type, DEPOSIT or WITHDRAW
     * @param {string} payment payment type, PAYPAL, CREDIT, CRYPTO and BANK
     * All string params must be UPPER case.
     */
export const downloadContent = async (id, tx, payment) => {
    if (!isBrowser) return
    const token = localStorage.getItem("ACCESS_TOKEN");
    const response = await axios({
        url: `${process.env.GATSBY_API_BASE_URL}/download/pdf/${id}`,
        method: 'GET',
        responseType: 'blob',
        params: { tx, payment },
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${payment}-${tx}-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
