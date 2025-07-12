import React from "react";
import { useSelector } from "react-redux";
import { GreenCup } from "../../utilities/imgImport";

const AuctionListHeader = ({ totalCount, auctionType, auctionTitle }) => {
    const currency = useSelector((state) => state.favAssets.currency);

    return (
        <div className="w-100 row border-bottom-scorpion p-2">
            <div className="col-2 d-flex align-items-center justify-content-start pl-8px">
                <img src={GreenCup} alt="Green Cup" />
                <div className="text-white pl-1 fw-bold fs-12px">{` / ${totalCount}`}</div>
            </div>
            <div className="col-10 d-flex justify-content-between align-items-center px-4px">
                <div className="d-flex align-items-center justify-content-start">
                    <div className="text-white fw-bold">{auctionType}</div>
                </div>
                <div className="d-flex align-items-center justify-content-end fw-bold">
                    <div className="text-white">
                        {auctionTitle}
                        <span className="text-success">
                            {" "}
                            ({currency.label})
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuctionListHeader;
