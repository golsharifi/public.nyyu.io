import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Modal from "react-modal";
import _ from "lodash";
import { CloseIcon } from "../../utilities/imgImport";
import { Icon } from "@iconify/react";
import Select, { components } from "react-select";
import { update_Favor_Assets } from "../../store/actions/settingAction";
import { EuropeanFlag } from "../../utilities/imgImport";
import { Currencies } from "../../utilities/staticData2";
import CustomSpinner from "../common/custom-spinner";
import { changeEquity } from "../../store/actions/tempAction";
import { Alert } from "@mui/material";

const ErrorModal = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            ariaHideApp={false}
            className="support-modal"
            overlayClassName="support-modal__overlay"
        >
            <div className="support-modal__header justify-content-end">
                <div
                    onClick={onClose}
                    onKeyDown={onClose}
                    role="button"
                    tabIndex="0"
                >
                    <Icon icon="ep:close-bold" />
                </div>
            </div>
            <div className="text-center p-4">
                <h4 className="mb-3">{title}</h4>
                <Alert
                    severity={title.includes("Success") ? "success" : "error"}
                    className="mb-3"
                >
                    {message}
                </Alert>
                <button
                    className="btn btn-outline-light rounded-0 px-4 py-2 fw-bold text-uppercase mt-3"
                    onClick={onClose}
                >
                    OK
                </button>
            </div>
        </Modal>
    );
};

const { Option } = components;

const SelectOption = (props) => {
    const { data } = props;
    return (
        <Option {...props}>
            <div className="d-flex justify-content-center justify-content-sm-start align-items-center ">
                <div className="flag_div">
                    <img
                        src={
                            data.value !== "EUR"
                                ? `${process.env.GATSBY_CurrencyIconEndpoint}/${String(data.value).toLowerCase()}.png`
                                : EuropeanFlag
                        }
                        alt={data.value}
                        onError={(e) => {
                            // Fallback if image fails to load
                            e.target.style.display = "none";
                        }}
                    />
                </div>
                <p className="coin-label ms-2">{data.value}</p>
            </div>
        </Option>
    );
};

const SelectCurrencyModal = ({ isOpen, setIsOpen }) => {
    const dispatch = useDispatch();
    const favAssets = useSelector((state) => state.favAssets);
    const savedCurrency = favAssets?.currency || {
        label: "USD",
        value: "USD",
        sign: "$",
    };
    const assets = favAssets?.assets || [];
    const { currencyRates } = useSelector((state) => state);
    const [pending, setPending] = useState(false);

    const [selectedCurrency, setSelectedCurrency] = useState(savedCurrency);

    const [errorModal, setErrorModal] = useState({
        isOpen: false,
        title: "",
        message: "",
    });

    // Don't block the dropdown based on currency rates loading
    // const loading = _.isEmpty(currencyRates);
    const loading = false; // Allow user to select currency even if rates aren't loaded

    console.log("🏛️ SelectCurrencyModal Debug:", {
        isOpen,
        savedCurrency,
        selectedCurrency,
        currenciesCount: Currencies?.length || 0,
        currenciesPreview: Currencies?.slice(0, 3),
        loading,
        currencyRatesLoaded: !_.isEmpty(currencyRates),
        currencyRatesCount: Object.keys(currencyRates || {}).length,
        sampleRates: currencyRates
            ? Object.fromEntries(Object.entries(currencyRates).slice(0, 3))
            : {},
        currentCurrencyRate: currencyRates[savedCurrency?.value],
        selectedCurrencyRate: currencyRates[selectedCurrency?.value],
        // Check if currency mapping might be the issue
        currencyInMapByValue: Currencies?.find(
            (c) => c.value === savedCurrency?.value,
        ),
        currencyInMapByLabel: Currencies?.find(
            (c) => c.label === savedCurrency?.value,
        ),
    });

    const DropdownIndicator = (props) => {
        return (
            <components.DropdownIndicator {...props}>
                <Icon icon="ant-design:caret-down-filled" />
            </components.DropdownIndicator>
        );
    };

    const selectCurrency = async () => {
        if (
            !selectedCurrency ||
            selectedCurrency.value === savedCurrency.value
        ) {
            setIsOpen(false);
            return;
        }

        setPending(true);
        try {
            console.log(
                "🔄 Updating currency from",
                savedCurrency.value,
                "to",
                selectedCurrency.value,
            );

            // Format the assets string properly
            const assetsString =
                assets && assets.length > 0
                    ? selectedCurrency.value + "," + assets.join(",")
                    : selectedCurrency.value + ",NDB,BTC,ETH,SOL"; // Include some default assets

            const updateData = {
                assets: assetsString,
            };

            console.log("📤 Sending update data:", updateData);

            // Update the currency in Redux store and backend
            const result = await dispatch(update_Favor_Assets(updateData));
            console.log("✅ Currency update result:", result);

            // Update equity calculation
            dispatch(changeEquity(selectedCurrency.value));

            // Also dispatch a direct currency update to ensure immediate UI change
            dispatch({
                type: "UPDATE_FAVOR_ASSETS",
                payload: {
                    currency: selectedCurrency,
                    assets: assets || [],
                },
            });

            setIsOpen(false);

            // Show success message
            setErrorModal({
                isOpen: true,
                title: "Success!",
                message: `Currency changed to ${selectedCurrency.value} successfully!`,
            });

            // Force page refresh after a brief delay to ensure all components update
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error("❌ Error updating currency:", error);
            setErrorModal({
                isOpen: true,
                title: "Error",
                message: "your error message here",
            });
        } finally {
            setPending(false);
        }
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            className="support-modal"
            overlayClassName="deposit-widthdraw-modal__overlay"
            ariaHideApp={false}
        >
            <div className="support-modal__header justify-content-end">
                <div
                    onClick={() => setIsOpen(false)}
                    onKeyDown={() => setIsOpen(false)}
                    role="button"
                    tabIndex="0"
                >
                    <img
                        width="14px"
                        height="14px"
                        src={CloseIcon}
                        alt="close"
                    />
                </div>
            </div>
            <div className="text-center">
                <h4 className="mt-3">Currency Change</h4>

                {/* Clean currency info display */}
                <div
                    style={{
                        margin: "15px 0",
                        fontSize: "14px",
                        lineHeight: "1.4",
                    }}
                >
                    <div style={{ color: "#00ff88", fontWeight: "500" }}>
                        {Currencies?.length || 0} currencies available
                    </div>
                    <div style={{ color: "#ffffff", opacity: 0.8 }}>
                        Current: {savedCurrency?.value || "None"}
                    </div>
                    {/* Add currency rates status */}
                    <div
                        style={{
                            color: "#ffa500",
                            fontSize: "12px",
                            marginTop: "5px",
                        }}
                    >
                        Exchange rates:{" "}
                        {Object.keys(currencyRates || {}).length > 0
                            ? `${Object.keys(currencyRates).length} loaded`
                            : "Not loaded - values will show in USD"}
                    </div>
                </div>

                <div className="mt-5 d-flex justify-content-center">
                    <Select
                        id="select_currency_in_profile"
                        isSearchable={false}
                        className={`${loading ? "disabled" : ""} w-50`}
                        options={Currencies || []}
                        value={selectedCurrency}
                        onChange={(selected) => {
                            console.log("Currency selected:", selected);
                            setSelectedCurrency(selected);
                        }}
                        styles={customSelectStyles}
                        components={{
                            IndicatorSeparator: null,
                            DropdownIndicator,
                            Option: SelectOption,
                            SingleValue: SelectOption,
                        }}
                        isDisabled={loading}
                        placeholder="Select currency..."
                        menuIsOpen={undefined} // Let react-select control this
                        menuPlacement="auto" // Let react-select determine best placement
                    />
                </div>
                <button
                    className="btn btn-outline-light rounded-0 w-50 mt-50px mb-5 fw-bold"
                    style={{ height: 47 }}
                    onClick={selectCurrency}
                    disabled={pending || !selectedCurrency}
                >
                    {pending ? <CustomSpinner /> : "CONFIRM"}
                </button>
            </div>
            <ErrorModal
                isOpen={errorModal.isOpen}
                title={errorModal.title}
                message={errorModal.message}
                onClose={() =>
                    setErrorModal({ isOpen: false, title: "", message: "" })
                }
            />
        </Modal>
    );
};

export default SelectCurrencyModal;

const customSelectStyles = {
    container: (provided) => ({
        ...provided,
        border: "1px solid white",
        width: 130,
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? "#000000" : "#1e1e1e",
        fontSize: 14,
        borderBottom: "1px solid dimgrey",
        cursor: "pointer",
        color: "white",
        ":hover": {
            backgroundColor: "#333333",
        },
    }),
    control: (provided) => ({
        ...provided,
        backgroundColor: "#1e1e1e",
        border: "none",
        borderRadius: 0,
        height: 47,
        color: "lightgrey",
        cursor: "pointer",
    }),
    input: (provided) => ({
        ...provided,
        color: "white",
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "#1e1e1e",
        border: "1px solid white",
        borderRadius: 0,
        opacity: 1,
        zIndex: 9999, // Ensure dropdown appears above other elements
    }),
    menuList: (provided) => ({
        ...provided,
        margin: 0,
        padding: 0,
        maxHeight: 200, // Limit height and enable scrolling
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: 0,
    }),
    singleValue: (provided) => ({
        ...provided,
        color: "white",
        marginLeft: 10,
        fontWeight: 600,
    }),
    placeholder: (provided) => ({
        ...provided,
        color: "dimgrey",
        marginLeft: 10,
    }),
};
