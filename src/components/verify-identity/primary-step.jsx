import React, { useState } from "react"
import { Link } from "gatsby"
import { ROUTES } from "../../utilities/routes"
import PrivacyPolicy from "./privacy-policy"
import languages from "../../assets/lang/languages.json"
import SelectLang from "./select-lang"
import { useVerification } from "./verification-context"


export default function PrimaryStep() {
    // Containers
    const verification = useVerification()
    const [langKey, setLangKey] = useState("en")
    const language = languages[langKey]
    const [accept, setAccept] = useState(false)

    // Render
    if (verification.shuftReferencePayload !== "INVALID") verification.nextStep()
    return (
        <div className="verify-step0 col-sm-12 col-10 mx-auto mt-5 mt-sm-0">
            <SelectLang
                className="languageDropdown"
                languages={languages}
                langKey={langKey}
                onLangChange={(res) => setLangKey(res.value)}
            />
            <h4 className="text-center  mt-5 mt-sm-2 mb-4">{language?.content?.verify_id}</h4>
            <p className="pre-wrap">
                <span className="text-white fw-bold fs-18px">
                    {language?.content?.subtitle}
                    <br />
                </span>
                {language?.content?.content}
            </p>
            <div className="form-group">
                <PrivacyPolicy
                    agree={accept}
                    setAgree={(res) => setAccept(res)}
                    lang={language?.content}
                />
            </div>
            <div className="d-flex justify-content-center gap-3 my-5 col-md-12">
                <Link
                    to={ROUTES.profile}
                    className="btn btn-outline-light rounded-0 px-5 py-2 text-uppercase fw-500 col-sm-3 col-6"
                >
                    skip
                </Link>
                <button
                    disabled={!accept}
                    className="btn btn-success rounded-0 px-5 py-2 text-uppercase fw-500 text-light col-sm-3 col-6"
                    onClick={() => verification.nextStep()}
                >
                    next
                </button>
            </div>
        </div>
    )
}
