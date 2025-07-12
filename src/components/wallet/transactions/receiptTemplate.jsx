import React from "react";
export const receiptTemplate = ({
    id,
    date,
    time,
    amount,
    asset,
    fee,
    status,
    type,
    paymentId,
    user,
}) => {
    return `<div style="width: 750px; height: 800px;font-family: 'Montserrat' !important;padding: 20px 50px;">
        <div style="display:flex; justify-content: space-between; align-items:center; margin-bottom: 150px;">
            <svg width="122" height="47" viewBox="0 0 122 47" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M89.2569 0H84.5947V9.2888V13.9154V46.4084H121.999V9.2888H89.2569V0ZM89.2569 13.9154H117.301V41.7462H89.2569V13.9154Z" fill="#020202"/>
                <path d="M75.2001 9.2888H42.458V46.4084H79.8623V13.9154V9.2888V0H75.2001V9.2888ZM75.2001 41.7818H47.1558V13.951H75.2001V41.7818Z" fill="#020202"/>
                <path d="M37.6533 9.35986H0.249023V14.0577H37.6533V9.35986Z" fill="#23C865"/>
                <path d="M37.6535 9.35986H33.0625V46.4083H37.6535V9.35986Z" fill="#23C865"/>
                <path d="M4.6266 9.35986H0V46.4083H4.6266V9.35986Z" fill="#23C865"/>
            </svg>
            <div style="text-align: right">
                <div>${date}</div>
                <div style="text-transform:uppercase; font-weight: bold; margin-top: 5px;font-size:12px;">${
                    user.avatar.prefix + " " + user.avatar.name
                }</div>
            </div>
        </div>
        <div style="margin-bottom: 75px">
            <div style="width: 100%; display:flex; justify-content: space-between; align-items:center; border-bottom: 1px solid #C7C7C7;padding: 8px 0px;">
                <div>Type</div>
                <div>${type}</div>
            </div>
            <div style="width: 100%; display:flex; justify-content: space-between; align-items:center; border-bottom: 1px solid #C7C7C7;padding: 8px 0px;">
                <div>Status</div>
                <div>${status ? "Successful" : "Unsuccessful"}</div>
            </div>
            <div style="width: 100%; display:flex; justify-content: space-between; align-items:center; border-bottom: 1px solid #C7C7C7;padding: 8px 0px;">
                <div>Amount Sent</div>
                <div>${amount + fee} USD</div>
            </div>
            <div style="width: 100%; display:flex; justify-content: space-between; align-items:center; border-bottom: 1px solid #C7C7C7;padding: 8px 0px;">
                <div>Fee</div>
                <div>${fee} USD</div>
            </div>
            <div style="width: 100%; display:flex; justify-content: space-between; align-items:center; border-top: 3px solid #23C865; padding: 10px 0px; color: #23C865; margin-top: 40px; font-weight:bold; font-size: 20px;">
                <div>Amount Received</div>
                <div>${amount} USD</div>
            </div>
        </div>
        <div style="margin-bottom: 75px">
            <div style="width: 100%; display:flex; justify-content: space-between; align-items:center; border-bottom: 1px solid #C7C7C7;padding: 8px 0px;">
                <div>Date</div>
                <div>${date} ${time}</div>
            </div>
            <div style="width: 100%; display:flex; justify-content: space-between; align-items:center; border-bottom: 1px solid #C7C7C7;padding: 8px 0px;">
                <div>Payment-ID</div>
                <div>${paymentId}</div>
            </div>
        </div>
        <div style="margin-bottom: 100px">
            <div style="width: 100%; display:flex; justify-content: space-between; align-items:center; border-bottom: 1px solid #C7C7C7;padding: 8px 0px;">
                <div>Beneficiary</div>
                <div>Water Department Ltd.</div>
            </div>
            <div style="width: 100%; display:flex; justify-content: space-between; align-items:center; border-bottom: 1px solid #C7C7C7;padding: 8px 0px;">
                <div>Account/IBAN</div>
                <div>IB3948583293948588</div>
            </div>
            <div style="width: 100%; display:flex; justify-content: space-between; align-items:center; border-bottom: 1px solid #C7C7C7;padding: 8px 0px;">
                <div>Bank code (BIC/SWIFT)</div>
                <div>SE394572</div>
            </div>
        </div>
        <div style="display:flex; justify-content: space-between; align-items:flex-end; padding-bottom: 10px; color: #777777;">
            <div style="display: flex; align-items: flex-end; justify-content: center; gap: 15px;">
                <div style="width: 112px;height:auto;">
                    ${qrCode()}
                </div>
                <div style="font-size: 12px">
                    2000 Neuchâtel, Rue Pierre-à-Mazel 39 Microcity SA, Switzerland
                </div>
            </div>
            <div style="text-align: right">
                <div>ndb.money</div>
                <div>+1 (650) 252-0002</div>
                <div>info@ndb.money</div>
            </div>
        </div>
    </div>`;
};

const qrCode = () => {
    return `<svg
            width="112"
            height="112"
            viewBox="0 0 224 224"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M8.96 0H0V8.96H8.96V0Z" fill="#1E1E1E" />
            <path d="M17.9209 0H8.96094V8.96H17.9209V0Z" fill="#1E1E1E" />
            <path d="M26.8799 0H17.9199V8.96H26.8799V0Z" fill="#1E1E1E" />
            <path d="M35.8409 0H26.8809V8.96H35.8409V0Z" fill="#1E1E1E" />
            <path d="M44.7998 0H35.8398V8.96H44.7998V0Z" fill="#1E1E1E" />
            <path d="M53.7608 0H44.8008V8.96H53.7608V0Z" fill="#1E1E1E" />
            <path d="M62.7198 0H53.7598V8.96H62.7198V0Z" fill="#1E1E1E" />
            <path d="M80.6397 0H71.6797V8.96H80.6397V0Z" fill="#1E1E1E" />
            <path d="M89.6006 0H80.6406V8.96H89.6006V0Z" fill="#1E1E1E" />
            <path d="M125.44 0H116.48V8.96H125.44V0Z" fill="#1E1E1E" />
            <path d="M134.399 0H125.439V8.96H134.399V0Z" fill="#1E1E1E" />
            <path d="M143.36 0H134.4V8.96H143.36V0Z" fill="#1E1E1E" />
            <path d="M152.319 0H143.359V8.96H152.319V0Z" fill="#1E1E1E" />
            <path d="M170.239 0H161.279V8.96H170.239V0Z" fill="#1E1E1E" />
            <path d="M179.2 0H170.24V8.96H179.2V0Z" fill="#1E1E1E" />
            <path d="M188.159 0H179.199V8.96H188.159V0Z" fill="#1E1E1E" />
            <path d="M197.12 0H188.16V8.96H197.12V0Z" fill="#1E1E1E" />
            <path d="M206.079 0H197.119V8.96H206.079V0Z" fill="#1E1E1E" />
            <path d="M215.04 0H206.08V8.96H215.04V0Z" fill="#1E1E1E" />
            <path d="M223.999 0H215.039V8.96H223.999V0Z" fill="#1E1E1E" />
            <path d="M8.96 8.95996H0V17.92H8.96V8.95996Z" fill="#1E1E1E" />
            <path
                d="M62.7198 8.95996H53.7598V17.92H62.7198V8.95996Z"
                fill="#1E1E1E"
            />
            <path
                d="M89.6006 8.95996H80.6406V17.92H89.6006V8.95996Z"
                fill="#1E1E1E"
            />
            <path
                d="M98.5596 8.95996H89.5996V17.92H98.5596V8.95996Z"
                fill="#1E1E1E"
            />
            <path
                d="M107.521 8.95996H98.5605V17.92H107.521V8.95996Z"
                fill="#1E1E1E"
            />
            <path
                d="M125.44 8.95996H116.48V17.92H125.44V8.95996Z"
                fill="#1E1E1E"
            />
            <path
                d="M170.239 8.95996H161.279V17.92H170.239V8.95996Z"
                fill="#1E1E1E"
            />
            <path
                d="M223.999 8.95996H215.039V17.92H223.999V8.95996Z"
                fill="#1E1E1E"
            />
            <path d="M8.96 17.9199H0V26.8799H8.96V17.9199Z" fill="#1E1E1E" />
            <path
                d="M26.8799 17.9199H17.9199V26.8799H26.8799V17.9199Z"
                fill="#1E1E1E"
            />
            <path
                d="M35.8409 17.9199H26.8809V26.8799H35.8409V17.9199Z"
                fill="#1E1E1E"
            />
            <path
                d="M44.7998 17.9199H35.8398V26.8799H44.7998V17.9199Z"
                fill="#1E1E1E"
            />
            <path
                d="M62.7198 17.9199H53.7598V26.8799H62.7198V17.9199Z"
                fill="#1E1E1E"
            />
            <path
                d="M80.6397 17.9199H71.6797V26.8799H80.6397V17.9199Z"
                fill="#1E1E1E"
            />
            <path
                d="M89.6006 17.9199H80.6406V26.8799H89.6006V17.9199Z"
                fill="#1E1E1E"
            />
            <path
                d="M116.48 17.9199H107.52V26.8799H116.48V17.9199Z"
                fill="#1E1E1E"
            />
            <path
                d="M143.36 17.9199H134.4V26.8799H143.36V17.9199Z"
                fill="#1E1E1E"
            />
            <path
                d="M152.319 17.9199H143.359V26.8799H152.319V17.9199Z"
                fill="#1E1E1E"
            />
            <path
                d="M170.239 17.9199H161.279V26.8799H170.239V17.9199Z"
                fill="#1E1E1E"
            />
            <path
                d="M188.159 17.9199H179.199V26.8799H188.159V17.9199Z"
                fill="#1E1E1E"
            />
            <path
                d="M197.12 17.9199H188.16V26.8799H197.12V17.9199Z"
                fill="#1E1E1E"
            />
            <path
                d="M206.079 17.9199H197.119V26.8799H206.079V17.9199Z"
                fill="#1E1E1E"
            />
            <path
                d="M223.999 17.9199H215.039V26.8799H223.999V17.9199Z"
                fill="#1E1E1E"
            />
            <path d="M8.96 26.8799H0V35.8399H8.96V26.8799Z" fill="#1E1E1E" />
            <path
                d="M26.8799 26.8799H17.9199V35.8399H26.8799V26.8799Z"
                fill="#1E1E1E"
            />
            <path
                d="M35.8409 26.8799H26.8809V35.8399H35.8409V26.8799Z"
                fill="#1E1E1E"
            />
            <path
                d="M44.7998 26.8799H35.8398V35.8399H44.7998V26.8799Z"
                fill="#1E1E1E"
            />
            <path
                d="M62.7198 26.8799H53.7598V35.8399H62.7198V26.8799Z"
                fill="#1E1E1E"
            />
            <path
                d="M80.6397 26.8799H71.6797V35.8399H80.6397V26.8799Z"
                fill="#1E1E1E"
            />
            <path
                d="M116.48 26.8799H107.52V35.8399H116.48V26.8799Z"
                fill="#1E1E1E"
            />
            <path
                d="M170.239 26.8799H161.279V35.8399H170.239V26.8799Z"
                fill="#1E1E1E"
            />
            <path
                d="M188.159 26.8799H179.199V35.8399H188.159V26.8799Z"
                fill="#1E1E1E"
            />
            <path
                d="M197.12 26.8799H188.16V35.8399H197.12V26.8799Z"
                fill="#1E1E1E"
            />
            <path
                d="M206.079 26.8799H197.119V35.8399H206.079V26.8799Z"
                fill="#1E1E1E"
            />
            <path
                d="M223.999 26.8799H215.039V35.8399H223.999V26.8799Z"
                fill="#1E1E1E"
            />
            <path d="M8.96 35.8401H0V44.8001H8.96V35.8401Z" fill="#1E1E1E" />
            <path
                d="M26.8799 35.8401H17.9199V44.8001H26.8799V35.8401Z"
                fill="#1E1E1E"
            />
            <path
                d="M35.8409 35.8401H26.8809V44.8001H35.8409V35.8401Z"
                fill="#1E1E1E"
            />
            <path
                d="M44.7998 35.8401H35.8398V44.8001H44.7998V35.8401Z"
                fill="#1E1E1E"
            />
            <path
                d="M62.7198 35.8401H53.7598V44.8001H62.7198V35.8401Z"
                fill="#1E1E1E"
            />
            <path
                d="M80.6397 35.8401H71.6797V44.8001H80.6397V35.8401Z"
                fill="#1E1E1E"
            />
            <path
                d="M98.5596 35.8401H89.5996V44.8001H98.5596V35.8401Z"
                fill="#1E1E1E"
            />
            <path
                d="M107.521 35.8401H98.5605V44.8001H107.521V35.8401Z"
                fill="#1E1E1E"
            />
            <path
                d="M116.48 35.8401H107.52V44.8001H116.48V35.8401Z"
                fill="#1E1E1E"
            />
            <path
                d="M134.399 35.8401H125.439V44.8001H134.399V35.8401Z"
                fill="#1E1E1E"
            />
            <path
                d="M143.36 35.8401H134.4V44.8001H143.36V35.8401Z"
                fill="#1E1E1E"
            />
            <path
                d="M170.239 35.8401H161.279V44.8001H170.239V35.8401Z"
                fill="#1E1E1E"
            />
            <path
                d="M188.159 35.8401H179.199V44.8001H188.159V35.8401Z"
                fill="#1E1E1E"
            />
            <path
                d="M197.12 35.8401H188.16V44.8001H197.12V35.8401Z"
                fill="#1E1E1E"
            />
            <path
                d="M206.079 35.8401H197.119V44.8001H206.079V35.8401Z"
                fill="#1E1E1E"
            />
            <path
                d="M223.999 35.8401H215.039V44.8001H223.999V35.8401Z"
                fill="#1E1E1E"
            />
            <path d="M8.96 44.8H0V53.76H8.96V44.8Z" fill="#1E1E1E" />
            <path
                d="M62.7198 44.8H53.7598V53.76H62.7198V44.8Z"
                fill="#1E1E1E"
            />
            <path
                d="M80.6397 44.8H71.6797V53.76H80.6397V44.8Z"
                fill="#1E1E1E"
            />
            <path
                d="M98.5596 44.8H89.5996V53.76H98.5596V44.8Z"
                fill="#1E1E1E"
            />
            <path
                d="M107.521 44.8H98.5605V53.76H107.521V44.8Z"
                fill="#1E1E1E"
            />
            <path d="M125.44 44.8H116.48V53.76H125.44V44.8Z" fill="#1E1E1E" />
            <path
                d="M170.239 44.8H161.279V53.76H170.239V44.8Z"
                fill="#1E1E1E"
            />
            <path
                d="M223.999 44.8H215.039V53.76H223.999V44.8Z"
                fill="#1E1E1E"
            />
            <path d="M8.96 53.76H0V62.72H8.96V53.76Z" fill="#1E1E1E" />
            <path
                d="M17.9209 53.76H8.96094V62.72H17.9209V53.76Z"
                fill="#1E1E1E"
            />
            <path
                d="M26.8799 53.76H17.9199V62.72H26.8799V53.76Z"
                fill="#1E1E1E"
            />
            <path
                d="M35.8409 53.76H26.8809V62.72H35.8409V53.76Z"
                fill="#1E1E1E"
            />
            <path
                d="M44.7998 53.76H35.8398V62.72H44.7998V53.76Z"
                fill="#1E1E1E"
            />
            <path
                d="M53.7608 53.76H44.8008V62.72H53.7608V53.76Z"
                fill="#1E1E1E"
            />
            <path
                d="M62.7198 53.76H53.7598V62.72H62.7198V53.76Z"
                fill="#1E1E1E"
            />
            <path
                d="M80.6397 53.76H71.6797V62.72H80.6397V53.76Z"
                fill="#1E1E1E"
            />
            <path
                d="M98.5596 53.76H89.5996V62.72H98.5596V53.76Z"
                fill="#1E1E1E"
            />
            <path d="M116.48 53.76H107.52V62.72H116.48V53.76Z" fill="#1E1E1E" />
            <path
                d="M134.399 53.76H125.439V62.72H134.399V53.76Z"
                fill="#1E1E1E"
            />
            <path
                d="M152.319 53.76H143.359V62.72H152.319V53.76Z"
                fill="#1E1E1E"
            />
            <path
                d="M170.239 53.76H161.279V62.72H170.239V53.76Z"
                fill="#1E1E1E"
            />
            <path d="M179.2 53.76H170.24V62.72H179.2V53.76Z" fill="#1E1E1E" />
            <path
                d="M188.159 53.76H179.199V62.72H188.159V53.76Z"
                fill="#1E1E1E"
            />
            <path d="M197.12 53.76H188.16V62.72H197.12V53.76Z" fill="#1E1E1E" />
            <path
                d="M206.079 53.76H197.119V62.72H206.079V53.76Z"
                fill="#1E1E1E"
            />
            <path d="M215.04 53.76H206.08V62.72H215.04V53.76Z" fill="#1E1E1E" />
            <path
                d="M223.999 53.76H215.039V62.72H223.999V53.76Z"
                fill="#1E1E1E"
            />
            <path
                d="M98.5596 62.72H89.5996V71.68H98.5596V62.72Z"
                fill="#1E1E1E"
            />
            <path d="M116.48 62.72H107.52V71.68H116.48V62.72Z" fill="#1E1E1E" />
            <path
                d="M152.319 62.72H143.359V71.68H152.319V62.72Z"
                fill="#1E1E1E"
            />
            <path
                d="M26.8799 71.6799H17.9199V80.6399H26.8799V71.6799Z"
                fill="#1E1E1E"
            />
            <path
                d="M35.8409 71.6799H26.8809V80.6399H35.8409V71.6799Z"
                fill="#1E1E1E"
            />
            <path
                d="M44.7998 71.6799H35.8398V80.6399H44.7998V71.6799Z"
                fill="#1E1E1E"
            />
            <path
                d="M53.7608 71.6799H44.8008V80.6399H53.7608V71.6799Z"
                fill="#1E1E1E"
            />
            <path
                d="M62.7198 71.6799H53.7598V80.6399H62.7198V71.6799Z"
                fill="#1E1E1E"
            />
            <path
                d="M71.6807 71.6799H62.7207V80.6399H71.6807V71.6799Z"
                fill="#1E1E1E"
            />
            <path
                d="M89.6006 71.6799H80.6406V80.6399H89.6006V71.6799Z"
                fill="#1E1E1E"
            />
            <path
                d="M125.44 71.6799H116.48V80.6399H125.44V71.6799Z"
                fill="#1E1E1E"
            />
            <path
                d="M143.36 71.6799H134.4V80.6399H143.36V71.6799Z"
                fill="#1E1E1E"
            />
            <path
                d="M161.28 71.6799H152.32V80.6399H161.28V71.6799Z"
                fill="#1E1E1E"
            />
            <path
                d="M179.2 71.6799H170.24V80.6399H179.2V71.6799Z"
                fill="#1E1E1E"
            />
            <path
                d="M188.159 71.6799H179.199V80.6399H188.159V71.6799Z"
                fill="#1E1E1E"
            />
            <path
                d="M197.12 71.6799H188.16V80.6399H197.12V71.6799Z"
                fill="#1E1E1E"
            />
            <path
                d="M206.079 71.6799H197.119V80.6399H206.079V71.6799Z"
                fill="#1E1E1E"
            />
            <path
                d="M223.999 71.6799H215.039V80.6399H223.999V71.6799Z"
                fill="#1E1E1E"
            />
            <path
                d="M35.8409 80.6399H26.8809V89.5999H35.8409V80.6399Z"
                fill="#1E1E1E"
            />
            <path
                d="M44.7998 80.6399H35.8398V89.5999H44.7998V80.6399Z"
                fill="#1E1E1E"
            />
            <path
                d="M71.6807 80.6399H62.7207V89.5999H71.6807V80.6399Z"
                fill="#1E1E1E"
            />
            <path
                d="M89.6006 80.6399H80.6406V89.5999H89.6006V80.6399Z"
                fill="#1E1E1E"
            />
            <path
                d="M107.521 80.6399H98.5605V89.5999H107.521V80.6399Z"
                fill="#1E1E1E"
            />
            <path
                d="M116.48 80.6399H107.52V89.5999H116.48V80.6399Z"
                fill="#1E1E1E"
            />
            <path
                d="M143.36 80.6399H134.4V89.5999H143.36V80.6399Z"
                fill="#1E1E1E"
            />
            <path
                d="M170.239 80.6399H161.279V89.5999H170.239V80.6399Z"
                fill="#1E1E1E"
            />
            <path
                d="M179.2 80.6399H170.24V89.5999H179.2V80.6399Z"
                fill="#1E1E1E"
            />
            <path
                d="M188.159 80.6399H179.199V89.5999H188.159V80.6399Z"
                fill="#1E1E1E"
            />
            <path
                d="M197.12 80.6399H188.16V89.5999H197.12V80.6399Z"
                fill="#1E1E1E"
            />
            <path
                d="M215.04 80.6399H206.08V89.5999H215.04V80.6399Z"
                fill="#1E1E1E"
            />
            <path d="M8.96 89.6001H0V98.5601H8.96V89.6001Z" fill="#1E1E1E" />
            <path
                d="M26.8799 89.6001H17.9199V98.5601H26.8799V89.6001Z"
                fill="#1E1E1E"
            />
            <path
                d="M35.8409 89.6001H26.8809V98.5601H35.8409V89.6001Z"
                fill="#1E1E1E"
            />
            <path
                d="M62.7198 89.6001H53.7598V98.5601H62.7198V89.6001Z"
                fill="#1E1E1E"
            />
            <path
                d="M71.6807 89.6001H62.7207V98.5601H71.6807V89.6001Z"
                fill="#1E1E1E"
            />
            <path
                d="M89.6006 89.6001H80.6406V98.5601H89.6006V89.6001Z"
                fill="#1E1E1E"
            />
            <path
                d="M98.5596 89.6001H89.5996V98.5601H98.5596V89.6001Z"
                fill="#1E1E1E"
            />
            <path
                d="M116.48 89.6001H107.52V98.5601H116.48V89.6001Z"
                fill="#1E1E1E"
            />
            <path
                d="M125.44 89.6001H116.48V98.5601H125.44V89.6001Z"
                fill="#1E1E1E"
            />
            <path
                d="M134.399 89.6001H125.439V98.5601H134.399V89.6001Z"
                fill="#1E1E1E"
            />
            <path
                d="M143.36 89.6001H134.4V98.5601H143.36V89.6001Z"
                fill="#1E1E1E"
            />
            <path
                d="M170.239 89.6001H161.279V98.5601H170.239V89.6001Z"
                fill="#1E1E1E"
            />
            <path
                d="M179.2 89.6001H170.24V98.5601H179.2V89.6001Z"
                fill="#1E1E1E"
            />
            <path
                d="M215.04 89.6001H206.08V98.5601H215.04V89.6001Z"
                fill="#1E1E1E"
            />
            <path
                d="M223.999 89.6001H215.039V98.5601H223.999V89.6001Z"
                fill="#1E1E1E"
            />
            <path d="M8.96 98.5601H0V107.52H8.96V98.5601Z" fill="#1E1E1E" />
            <path
                d="M35.8409 98.5601H26.8809V107.52H35.8409V98.5601Z"
                fill="#1E1E1E"
            />
            <path
                d="M44.7998 98.5601H35.8398V107.52H44.7998V98.5601Z"
                fill="#1E1E1E"
            />
            <path
                d="M53.7608 98.5601H44.8008V107.52H53.7608V98.5601Z"
                fill="#1E1E1E"
            />
            <path
                d="M71.6807 98.5601H62.7207V107.52H71.6807V98.5601Z"
                fill="#1E1E1E"
            />
            <path
                d="M80.6397 98.5601H71.6797V107.52H80.6397V98.5601Z"
                fill="#1E1E1E"
            />
            <path
                d="M89.6006 98.5601H80.6406V107.52H89.6006V98.5601Z"
                fill="#1E1E1E"
            />
            <path
                d="M134.399 98.5601H125.439V107.52H134.399V98.5601Z"
                fill="#1E1E1E"
            />
            <path
                d="M143.36 98.5601H134.4V107.52H143.36V98.5601Z"
                fill="#1E1E1E"
            />
            <path
                d="M152.319 98.5601H143.359V107.52H152.319V98.5601Z"
                fill="#1E1E1E"
            />
            <path
                d="M206.079 98.5601H197.119V107.52H206.079V98.5601Z"
                fill="#1E1E1E"
            />
            <path
                d="M215.04 98.5601H206.08V107.52H215.04V98.5601Z"
                fill="#1E1E1E"
            />
            <path
                d="M223.999 98.5601H215.039V107.52H223.999V98.5601Z"
                fill="#1E1E1E"
            />
            <path d="M8.96 107.52H0V116.48H8.96V107.52Z" fill="#1E1E1E" />
            <path
                d="M44.7998 107.52H35.8398V116.48H44.7998V107.52Z"
                fill="#1E1E1E"
            />
            <path
                d="M62.7198 107.52H53.7598V116.48H62.7198V107.52Z"
                fill="#1E1E1E"
            />
            <path
                d="M116.48 107.52H107.52V116.48H116.48V107.52Z"
                fill="#1E1E1E"
            />
            <path
                d="M134.399 107.52H125.439V116.48H134.399V107.52Z"
                fill="#1E1E1E"
            />
            <path
                d="M161.28 107.52H152.32V116.48H161.28V107.52Z"
                fill="#1E1E1E"
            />
            <path
                d="M179.2 107.52H170.24V116.48H179.2V107.52Z"
                fill="#1E1E1E"
            />
            <path
                d="M188.159 107.52H179.199V116.48H188.159V107.52Z"
                fill="#1E1E1E"
            />
            <path
                d="M206.079 107.52H197.119V116.48H206.079V107.52Z"
                fill="#1E1E1E"
            />
            <path
                d="M223.999 107.52H215.039V116.48H223.999V107.52Z"
                fill="#1E1E1E"
            />
            <path d="M8.96 116.48H0V125.44H8.96V116.48Z" fill="#1E1E1E" />
            <path
                d="M17.9209 116.48H8.96094V125.44H17.9209V116.48Z"
                fill="#1E1E1E"
            />
            <path
                d="M35.8409 116.48H26.8809V125.44H35.8409V116.48Z"
                fill="#1E1E1E"
            />
            <path
                d="M44.7998 116.48H35.8398V125.44H44.7998V116.48Z"
                fill="#1E1E1E"
            />
            <path
                d="M80.6397 116.48H71.6797V125.44H80.6397V116.48Z"
                fill="#1E1E1E"
            />
            <path
                d="M89.6006 116.48H80.6406V125.44H89.6006V116.48Z"
                fill="#1E1E1E"
            />
            <path
                d="M98.5596 116.48H89.5996V125.44H98.5596V116.48Z"
                fill="#1E1E1E"
            />
            <path
                d="M116.48 116.48H107.52V125.44H116.48V116.48Z"
                fill="#1E1E1E"
            />
            <path
                d="M134.399 116.48H125.439V125.44H134.399V116.48Z"
                fill="#1E1E1E"
            />
            <path
                d="M152.319 116.48H143.359V125.44H152.319V116.48Z"
                fill="#1E1E1E"
            />
            <path
                d="M161.28 116.48H152.32V125.44H161.28V116.48Z"
                fill="#1E1E1E"
            />
            <path
                d="M188.159 116.48H179.199V125.44H188.159V116.48Z"
                fill="#1E1E1E"
            />
            <path
                d="M197.12 116.48H188.16V125.44H197.12V116.48Z"
                fill="#1E1E1E"
            />
            <path
                d="M206.079 116.48H197.119V125.44H206.079V116.48Z"
                fill="#1E1E1E"
            />
            <path
                d="M17.9209 125.44H8.96094V134.4H17.9209V125.44Z"
                fill="#1E1E1E"
            />
            <path
                d="M26.8799 125.44H17.9199V134.4H26.8799V125.44Z"
                fill="#1E1E1E"
            />
            <path
                d="M35.8409 125.44H26.8809V134.4H35.8409V125.44Z"
                fill="#1E1E1E"
            />
            <path
                d="M53.7608 125.44H44.8008V134.4H53.7608V125.44Z"
                fill="#1E1E1E"
            />
            <path
                d="M62.7198 125.44H53.7598V134.4H62.7198V125.44Z"
                fill="#1E1E1E"
            />
            <path
                d="M80.6397 125.44H71.6797V134.4H80.6397V125.44Z"
                fill="#1E1E1E"
            />
            <path
                d="M98.5596 125.44H89.5996V134.4H98.5596V125.44Z"
                fill="#1E1E1E"
            />
            <path
                d="M107.521 125.44H98.5605V134.4H107.521V125.44Z"
                fill="#1E1E1E"
            />
            <path
                d="M116.48 125.44H107.52V134.4H116.48V125.44Z"
                fill="#1E1E1E"
            />
            <path
                d="M134.399 125.44H125.439V134.4H134.399V125.44Z"
                fill="#1E1E1E"
            />
            <path
                d="M143.36 125.44H134.4V134.4H143.36V125.44Z"
                fill="#1E1E1E"
            />
            <path
                d="M152.319 125.44H143.359V134.4H152.319V125.44Z"
                fill="#1E1E1E"
            />
            <path
                d="M161.28 125.44H152.32V134.4H161.28V125.44Z"
                fill="#1E1E1E"
            />
            <path d="M179.2 125.44H170.24V134.4H179.2V125.44Z" fill="#1E1E1E" />
            <path
                d="M206.079 125.44H197.119V134.4H206.079V125.44Z"
                fill="#1E1E1E"
            />
            <path
                d="M215.04 125.44H206.08V134.4H215.04V125.44Z"
                fill="#1E1E1E"
            />
            <path
                d="M17.9209 134.4H8.96094V143.36H17.9209V134.4Z"
                fill="#1E1E1E"
            />
            <path
                d="M53.7608 134.4H44.8008V143.36H53.7608V134.4Z"
                fill="#1E1E1E"
            />
            <path
                d="M71.6807 134.4H62.7207V143.36H71.6807V134.4Z"
                fill="#1E1E1E"
            />
            <path
                d="M98.5596 134.4H89.5996V143.36H98.5596V134.4Z"
                fill="#1E1E1E"
            />
            <path
                d="M116.48 134.4H107.52V143.36H116.48V134.4Z"
                fill="#1E1E1E"
            />
            <path
                d="M134.399 134.4H125.439V143.36H134.399V134.4Z"
                fill="#1E1E1E"
            />
            <path d="M143.36 134.4H134.4V143.36H143.36V134.4Z" fill="#1E1E1E" />
            <path
                d="M152.319 134.4H143.359V143.36H152.319V134.4Z"
                fill="#1E1E1E"
            />
            <path
                d="M161.28 134.4H152.32V143.36H161.28V134.4Z"
                fill="#1E1E1E"
            />
            <path
                d="M188.159 134.4H179.199V143.36H188.159V134.4Z"
                fill="#1E1E1E"
            />
            <path
                d="M197.12 134.4H188.16V143.36H197.12V134.4Z"
                fill="#1E1E1E"
            />
            <path d="M8.96 143.36H0V152.32H8.96V143.36Z" fill="#1E1E1E" />
            <path
                d="M26.8799 143.36H17.9199V152.32H26.8799V143.36Z"
                fill="#1E1E1E"
            />
            <path
                d="M44.7998 143.36H35.8398V152.32H44.7998V143.36Z"
                fill="#1E1E1E"
            />
            <path
                d="M62.7198 143.36H53.7598V152.32H62.7198V143.36Z"
                fill="#1E1E1E"
            />
            <path
                d="M89.6006 143.36H80.6406V152.32H89.6006V143.36Z"
                fill="#1E1E1E"
            />
            <path
                d="M98.5596 143.36H89.5996V152.32H98.5596V143.36Z"
                fill="#1E1E1E"
            />
            <path
                d="M125.44 143.36H116.48V152.32H125.44V143.36Z"
                fill="#1E1E1E"
            />
            <path
                d="M134.399 143.36H125.439V152.32H134.399V143.36Z"
                fill="#1E1E1E"
            />
            <path
                d="M143.36 143.36H134.4V152.32H143.36V143.36Z"
                fill="#1E1E1E"
            />
            <path
                d="M152.319 143.36H143.359V152.32H152.319V143.36Z"
                fill="#1E1E1E"
            />
            <path
                d="M161.28 143.36H152.32V152.32H161.28V143.36Z"
                fill="#1E1E1E"
            />
            <path
                d="M170.239 143.36H161.279V152.32H170.239V143.36Z"
                fill="#1E1E1E"
            />
            <path
                d="M179.2 143.36H170.24V152.32H179.2V143.36Z"
                fill="#1E1E1E"
            />
            <path
                d="M188.159 143.36H179.199V152.32H188.159V143.36Z"
                fill="#1E1E1E"
            />
            <path
                d="M215.04 143.36H206.08V152.32H215.04V143.36Z"
                fill="#1E1E1E"
            />
            <path
                d="M98.5596 152.32H89.5996V161.28H98.5596V152.32Z"
                fill="#1E1E1E"
            />
            <path
                d="M116.48 152.32H107.52V161.28H116.48V152.32Z"
                fill="#1E1E1E"
            />
            <path
                d="M152.319 152.32H143.359V161.28H152.319V152.32Z"
                fill="#1E1E1E"
            />
            <path
                d="M188.159 152.32H179.199V161.28H188.159V152.32Z"
                fill="#1E1E1E"
            />
            <path
                d="M215.04 152.32H206.08V161.28H215.04V152.32Z"
                fill="#1E1E1E"
            />
            <path d="M8.96 161.28H0V170.24H8.96V161.28Z" fill="#1E1E1E" />
            <path
                d="M17.9209 161.28H8.96094V170.24H17.9209V161.28Z"
                fill="#1E1E1E"
            />
            <path
                d="M26.8799 161.28H17.9199V170.24H26.8799V161.28Z"
                fill="#1E1E1E"
            />
            <path
                d="M35.8409 161.28H26.8809V170.24H35.8409V161.28Z"
                fill="#1E1E1E"
            />
            <path
                d="M44.7998 161.28H35.8398V170.24H44.7998V161.28Z"
                fill="#1E1E1E"
            />
            <path
                d="M53.7608 161.28H44.8008V170.24H53.7608V161.28Z"
                fill="#1E1E1E"
            />
            <path
                d="M62.7198 161.28H53.7598V170.24H62.7198V161.28Z"
                fill="#1E1E1E"
            />
            <path
                d="M80.6397 161.28H71.6797V170.24H80.6397V161.28Z"
                fill="#1E1E1E"
            />
            <path
                d="M98.5596 161.28H89.5996V170.24H98.5596V161.28Z"
                fill="#1E1E1E"
            />
            <path
                d="M107.521 161.28H98.5605V170.24H107.521V161.28Z"
                fill="#1E1E1E"
            />
            <path
                d="M116.48 161.28H107.52V170.24H116.48V161.28Z"
                fill="#1E1E1E"
            />
            <path
                d="M134.399 161.28H125.439V170.24H134.399V161.28Z"
                fill="#1E1E1E"
            />
            <path
                d="M152.319 161.28H143.359V170.24H152.319V161.28Z"
                fill="#1E1E1E"
            />
            <path
                d="M170.239 161.28H161.279V170.24H170.239V161.28Z"
                fill="#1E1E1E"
            />
            <path
                d="M188.159 161.28H179.199V170.24H188.159V161.28Z"
                fill="#1E1E1E"
            />
            <path
                d="M197.12 161.28H188.16V170.24H197.12V161.28Z"
                fill="#1E1E1E"
            />
            <path d="M8.96 170.24H0V179.2H8.96V170.24Z" fill="#1E1E1E" />
            <path
                d="M62.7198 170.24H53.7598V179.2H62.7198V170.24Z"
                fill="#1E1E1E"
            />
            <path
                d="M80.6397 170.24H71.6797V179.2H80.6397V170.24Z"
                fill="#1E1E1E"
            />
            <path
                d="M89.6006 170.24H80.6406V179.2H89.6006V170.24Z"
                fill="#1E1E1E"
            />
            <path
                d="M107.521 170.24H98.5605V179.2H107.521V170.24Z"
                fill="#1E1E1E"
            />
            <path
                d="M125.44 170.24H116.48V179.2H125.44V170.24Z"
                fill="#1E1E1E"
            />
            <path
                d="M134.399 170.24H125.439V179.2H134.399V170.24Z"
                fill="#1E1E1E"
            />
            <path
                d="M143.36 170.24H134.4V179.2H143.36V170.24Z"
                fill="#1E1E1E"
            />
            <path
                d="M152.319 170.24H143.359V179.2H152.319V170.24Z"
                fill="#1E1E1E"
            />
            <path
                d="M188.159 170.24H179.199V179.2H188.159V170.24Z"
                fill="#1E1E1E"
            />
            <path
                d="M215.04 170.24H206.08V179.2H215.04V170.24Z"
                fill="#1E1E1E"
            />
            <path
                d="M223.999 170.24H215.039V179.2H223.999V170.24Z"
                fill="#1E1E1E"
            />
            <path d="M8.96 179.2H0V188.16H8.96V179.2Z" fill="#1E1E1E" />
            <path
                d="M26.8799 179.2H17.9199V188.16H26.8799V179.2Z"
                fill="#1E1E1E"
            />
            <path
                d="M35.8409 179.2H26.8809V188.16H35.8409V179.2Z"
                fill="#1E1E1E"
            />
            <path
                d="M44.7998 179.2H35.8398V188.16H44.7998V179.2Z"
                fill="#1E1E1E"
            />
            <path
                d="M62.7198 179.2H53.7598V188.16H62.7198V179.2Z"
                fill="#1E1E1E"
            />
            <path
                d="M80.6397 179.2H71.6797V188.16H80.6397V179.2Z"
                fill="#1E1E1E"
            />
            <path
                d="M98.5596 179.2H89.5996V188.16H98.5596V179.2Z"
                fill="#1E1E1E"
            />
            <path
                d="M107.521 179.2H98.5605V188.16H107.521V179.2Z"
                fill="#1E1E1E"
            />
            <path
                d="M116.48 179.2H107.52V188.16H116.48V179.2Z"
                fill="#1E1E1E"
            />
            <path
                d="M134.399 179.2H125.439V188.16H134.399V179.2Z"
                fill="#1E1E1E"
            />
            <path d="M143.36 179.2H134.4V188.16H143.36V179.2Z" fill="#1E1E1E" />
            <path
                d="M152.319 179.2H143.359V188.16H152.319V179.2Z"
                fill="#1E1E1E"
            />
            <path
                d="M161.28 179.2H152.32V188.16H161.28V179.2Z"
                fill="#1E1E1E"
            />
            <path
                d="M170.239 179.2H161.279V188.16H170.239V179.2Z"
                fill="#1E1E1E"
            />
            <path d="M179.2 179.2H170.24V188.16H179.2V179.2Z" fill="#1E1E1E" />
            <path
                d="M188.159 179.2H179.199V188.16H188.159V179.2Z"
                fill="#1E1E1E"
            />
            <path
                d="M197.12 179.2H188.16V188.16H197.12V179.2Z"
                fill="#1E1E1E"
            />
            <path
                d="M215.04 179.2H206.08V188.16H215.04V179.2Z"
                fill="#1E1E1E"
            />
            <path
                d="M223.999 179.2H215.039V188.16H223.999V179.2Z"
                fill="#1E1E1E"
            />
            <path d="M8.96 188.16H0V197.12H8.96V188.16Z" fill="#1E1E1E" />
            <path
                d="M26.8799 188.16H17.9199V197.12H26.8799V188.16Z"
                fill="#1E1E1E"
            />
            <path
                d="M35.8409 188.16H26.8809V197.12H35.8409V188.16Z"
                fill="#1E1E1E"
            />
            <path
                d="M44.7998 188.16H35.8398V197.12H44.7998V188.16Z"
                fill="#1E1E1E"
            />
            <path
                d="M62.7198 188.16H53.7598V197.12H62.7198V188.16Z"
                fill="#1E1E1E"
            />
            <path
                d="M80.6397 188.16H71.6797V197.12H80.6397V188.16Z"
                fill="#1E1E1E"
            />
            <path
                d="M98.5596 188.16H89.5996V197.12H98.5596V188.16Z"
                fill="#1E1E1E"
            />
            <path
                d="M125.44 188.16H116.48V197.12H125.44V188.16Z"
                fill="#1E1E1E"
            />
            <path
                d="M134.399 188.16H125.439V197.12H134.399V188.16Z"
                fill="#1E1E1E"
            />
            <path
                d="M161.28 188.16H152.32V197.12H161.28V188.16Z"
                fill="#1E1E1E"
            />
            <path
                d="M179.2 188.16H170.24V197.12H179.2V188.16Z"
                fill="#1E1E1E"
            />
            <path
                d="M197.12 188.16H188.16V197.12H197.12V188.16Z"
                fill="#1E1E1E"
            />
            <path
                d="M206.079 188.16H197.119V197.12H206.079V188.16Z"
                fill="#1E1E1E"
            />
            <path
                d="M215.04 188.16H206.08V197.12H215.04V188.16Z"
                fill="#1E1E1E"
            />
            <path
                d="M223.999 188.16H215.039V197.12H223.999V188.16Z"
                fill="#1E1E1E"
            />
            <path d="M8.96 197.12H0V206.08H8.96V197.12Z" fill="#1E1E1E" />
            <path
                d="M26.8799 197.12H17.9199V206.08H26.8799V197.12Z"
                fill="#1E1E1E"
            />
            <path
                d="M35.8409 197.12H26.8809V206.08H35.8409V197.12Z"
                fill="#1E1E1E"
            />
            <path
                d="M44.7998 197.12H35.8398V206.08H44.7998V197.12Z"
                fill="#1E1E1E"
            />
            <path
                d="M62.7198 197.12H53.7598V206.08H62.7198V197.12Z"
                fill="#1E1E1E"
            />
            <path
                d="M80.6397 197.12H71.6797V206.08H80.6397V197.12Z"
                fill="#1E1E1E"
            />
            <path
                d="M116.48 197.12H107.52V206.08H116.48V197.12Z"
                fill="#1E1E1E"
            />
            <path
                d="M152.319 197.12H143.359V206.08H152.319V197.12Z"
                fill="#1E1E1E"
            />
            <path
                d="M170.239 197.12H161.279V206.08H170.239V197.12Z"
                fill="#1E1E1E"
            />
            <path
                d="M188.159 197.12H179.199V206.08H188.159V197.12Z"
                fill="#1E1E1E"
            />
            <path
                d="M197.12 197.12H188.16V206.08H197.12V197.12Z"
                fill="#1E1E1E"
            />
            <path
                d="M206.079 197.12H197.119V206.08H206.079V197.12Z"
                fill="#1E1E1E"
            />
            <path
                d="M223.999 197.12H215.039V206.08H223.999V197.12Z"
                fill="#1E1E1E"
            />
            <path d="M8.96 206.08H0V215.04H8.96V206.08Z" fill="#1E1E1E" />
            <path
                d="M62.7198 206.08H53.7598V215.04H62.7198V206.08Z"
                fill="#1E1E1E"
            />
            <path
                d="M89.6006 206.08H80.6406V215.04H89.6006V206.08Z"
                fill="#1E1E1E"
            />
            <path
                d="M98.5596 206.08H89.5996V215.04H98.5596V206.08Z"
                fill="#1E1E1E"
            />
            <path
                d="M116.48 206.08H107.52V215.04H116.48V206.08Z"
                fill="#1E1E1E"
            />
            <path
                d="M125.44 206.08H116.48V215.04H125.44V206.08Z"
                fill="#1E1E1E"
            />
            <path
                d="M134.399 206.08H125.439V215.04H134.399V206.08Z"
                fill="#1E1E1E"
            />
            <path
                d="M170.239 206.08H161.279V215.04H170.239V206.08Z"
                fill="#1E1E1E"
            />
            <path
                d="M179.2 206.08H170.24V215.04H179.2V206.08Z"
                fill="#1E1E1E"
            />
            <path
                d="M188.159 206.08H179.199V215.04H188.159V206.08Z"
                fill="#1E1E1E"
            />
            <path
                d="M197.12 206.08H188.16V215.04H197.12V206.08Z"
                fill="#1E1E1E"
            />
            <path
                d="M223.999 206.08H215.039V215.04H223.999V206.08Z"
                fill="#1E1E1E"
            />
            <path d="M8.96 215.04H0V224H8.96V215.04Z" fill="#1E1E1E" />
            <path
                d="M17.9209 215.04H8.96094V224H17.9209V215.04Z"
                fill="#1E1E1E"
            />
            <path
                d="M26.8799 215.04H17.9199V224H26.8799V215.04Z"
                fill="#1E1E1E"
            />
            <path
                d="M35.8409 215.04H26.8809V224H35.8409V215.04Z"
                fill="#1E1E1E"
            />
            <path
                d="M44.7998 215.04H35.8398V224H44.7998V215.04Z"
                fill="#1E1E1E"
            />
            <path
                d="M53.7608 215.04H44.8008V224H53.7608V215.04Z"
                fill="#1E1E1E"
            />
            <path
                d="M62.7198 215.04H53.7598V224H62.7198V215.04Z"
                fill="#1E1E1E"
            />
            <path
                d="M98.5596 215.04H89.5996V224H98.5596V215.04Z"
                fill="#1E1E1E"
            />
            <path
                d="M107.521 215.04H98.5605V224H107.521V215.04Z"
                fill="#1E1E1E"
            />
            <path d="M116.48 215.04H107.52V224H116.48V215.04Z" fill="#1E1E1E" />
            <path
                d="M134.399 215.04H125.439V224H134.399V215.04Z"
                fill="#1E1E1E"
            />
            <path d="M143.36 215.04H134.4V224H143.36V215.04Z" fill="#1E1E1E" />
            <path
                d="M170.239 215.04H161.279V224H170.239V215.04Z"
                fill="#1E1E1E"
            />
            <path
                d="M188.159 215.04H179.199V224H188.159V215.04Z"
                fill="#1E1E1E"
            />
            <path d="M197.12 215.04H188.16V224H197.12V215.04Z" fill="#1E1E1E" />
            <path
                d="M206.079 215.04H197.119V224H206.079V215.04Z"
                fill="#1E1E1E"
            />
            <path d="M215.04 215.04H206.08V224H215.04V215.04Z" fill="#1E1E1E" />
            <path
                d="M223.999 215.04H215.039V224H223.999V215.04Z"
                fill="#1E1E1E"
            />
        </svg>`;
};
