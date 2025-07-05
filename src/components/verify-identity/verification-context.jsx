import useFileUpload from "react-use-file-upload";
import React, { useContext, useState } from "react";
import { VerificationCountriesList } from "../../utilities/countries-list";
import { getCurrentDate } from "../../utilities/utility-methods";

export const ACCEPTED_IMAGE_FORMAT = [
    'image/jpeg', 'image/jpg', 'image/png', 'application/pdf'
]

export const VerificationContext = React.createContext();

export const useVerification = () => useContext(VerificationContext);

const VerificationProvider = ({ children }) => {
    // Containers
    const [event, setEvent] = useState("");
    const consentText = `I and NYYU ${getCurrentDate()}`;
    const [address, setAddress] = useState("");
    const [firstName, setFirstName] = useState("");
    const [surname, setSurname] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [country, setCountry] = useState(VerificationCountriesList[0]);
    const [selfieImage, setSelfieImage] = useState();
    const [shuftReferencePayload, setShuftReferencePayload] = useState(null);
    const [userEmail, setUserEmail] = useState("");
    const [dob, setDob] = useState(Date.now());
    const [gender, setGender] = useState({label: "Male", value: "M"});
    const [expiryDate, setExpiryDate] = useState(Date.now());
    const [step, setStep] = useState(-1); // --> initial value is -1

    // used doc type
    // name of document, value! not lavel
    const [usedDocType, setUsedDocType] = useState("");

    const {
        files: documentFiles,
        handleDragDropEvent: documentHandleDragDropEvent,
        setFiles: documentSetFiles,
    } = useFileUpload();
    const {
        files: addressFiles,
        handleDragDropEvent: addressHandleDragDropEvent,
        setFiles: addressSetFiles,
    } = useFileUpload();
    const {
        files: consentFiles,
        handleDragDropEvent: consentHandleDragDropEvent,
        setFiles: consentSetFiles,
    } = useFileUpload();

    const clientId = process.env.GATSBY_SHUFTI_CLIENT;
    const secret = process.env.GATSBY_SHUFTI_SECRET;
    const shuftiProBaseUrl = "https://api.shuftipro.com";

    const callbackUrl = `${process.env.GATSBY_API_BASE_URL}/shufti`;
    const redirectUrl = `${process.env.GATSBY_SITE_URL}/app/profile`;

    // Methods
    const nextStep = () => {
        return setStep(step + 1);
    };
    const previousStep = () => {
        return setStep(step - 1);
    };

    const providerValue = {
        event,
        setEvent,
        usedDocType,
        setUsedDocType,
        userEmail,
        setUserEmail,
        dob,
        setDob,
        expiryDate,
        setExpiryDate,
        gender,
        setGender,
        consentText,
        shuftReferencePayload,
        setShuftReferencePayload,
        clientId,
        secret,
        redirectUrl,
        callbackUrl,
        shuftiProBaseUrl,
        nextStep,
        previousStep,
        step,
        setStep,
        submitting,
        setSubmitting,
        address,
        setAddress,
        firstName,
        setFirstName,
        surname,
        setSurname,
        country,
        setCountry,
        documentProof: {
            files: documentFiles,
            handleDragDropEvent: documentHandleDragDropEvent,
            setFiles: documentSetFiles,
        },
        addressProof: {
            files: addressFiles,
            handleDragDropEvent: addressHandleDragDropEvent,
            setFiles: addressSetFiles,
        },
        consentProof: {
            files: consentFiles,
            handleDragDropEvent: consentHandleDragDropEvent,
            setFiles: consentSetFiles,
        },
        faceProof: {
            selfieImage,
            setSelfieImage,
        },
    };
    return (
        <VerificationContext.Provider value={providerValue}>
            <div>{children}</div>
        </VerificationContext.Provider>
    );
};

export default VerificationProvider;
