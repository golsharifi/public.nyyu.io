import React from 'react';
import Zendesk from "react-zendesk";

const setting = {
    color: {
        theme: "#000",
    },
    launcher: {
        chatLabel: {
            "en-US": "Need Help",
        },
    },
    contactForm: {
        fields: [
            {
                id: "description",
                prefill: { "*": "My pre-filled description" },
            },
        ],
    },
};

export default () => (
    <Zendesk defer zendeskKey={process.env.GATSBY_ZENDESK_KEY} {...setting} />
)