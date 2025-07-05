import React from 'react';
import parse from "html-react-parser";

const SECTION_2 = [
    `In this Policy, the Personal Data means any information relating to an identified or identifiable natural person as may be collected or processed by us in connection with the Services on our Website.`,
    
    `We receive and store some Personal Data you knowingly provide to us during the account registration, by filling in forms and documents on the Website, and/or purchasing Services, or by corresponding with us
    by phone, email or otherwise, such as confirmation when you open an email from us. The Personal Data may include, but is not limited to the following.`,
    
    `<span className='fw-bold me-2'>(a)</span> Personal details, such as name, residential address, place and date of birth, gender, official identification number, nationality, personal description and primary occupation, photograph.`,
    
    `<span className='fw-bold me-2'>(b)</span> Contact information, such as email address, postal address, telephone number.`,
    
    `<span className='fw-bold me-2'>(c)</span> Account details, such as username, unique user ID, and password.`,
    
    `<span className='fw-bold me-2'>(d)</span> Location data, including the precise geolocation of your device if you consent to the collection of this data, and information about nearby Wi-Fi access points and cell towers that may be transmitted to us when you use certain Services.`,
    
    `<span className='fw-bold me-2'>(e)</span> Information about other individuals, such as your family members, friends.`,
    
    `<span className='fw-bold me-2'>(f)</span> Information about your IP address, information about your visit, your browsing activity, and how you use our website. This information may be combined with other information you provide.`,
    
    `<span className='fw-bold me-2'>(g)</span> Any other materials you willingly submit to us such as articles, images, feedback.`,
    
    `<span className='fw-bold me-2'>(h)</span> Financial and credit card information/number or other banking or payment information.`,
    
    `<span className='fw-bold me-2'>(i)</span> Source of wealth and funds.`,
    
    `Some of the information we collect is directly from your usage of the Website. However, we also collect the Personal Data we receive from other sources, 
    such as public databases and our joint marketing partners, or business partners, sub-contractors in technical, payment and delivery services, advertising networks, 
    analytics providers, search information providers, credit reference agencies, who may provide us with information about you. 
    We endeavor only to capture information that is necessary to provide our Services to you in compliance with our legal and regulatory obligations. 
    Users who are uncertain about what information is mandatory are welcome to contact us.`
];

const SECTION_3 = [
    `In order to make our Website, and Services available to you, and to comply with legal and regulatory policies, such as global or local industry regulatory standards, 
    and government orders, we are required to collect and use certain information. If you do not provide the information that we request, 
    we may not be able to provide you with our Services. However, we never sell or share your information with other organizations to use for their own purposes. 
    Any of the information we collect from you may be used for the following purposes:`,
    
    `<span className='fw-bold me-2'>(a)</span> To verify your identity and determine your eligibility to participate in the Token Sale.`,
    
    `<span className='fw-bold me-2'>(b)</span> To conduct and distribute the token.`,
    
    `<span className='fw-bold me-2'>(c)</span> To improve our Website, Services, and user experience, and to ensure that content from our Website is presented in the most effective manner for you and for your device`,
    
    `<span className='fw-bold me-2'>(d)</span> To provide you with information requested from us, relating to the details and status of your Services, technical information and to respond to any customer service issue you may have.`,
    
    `<span className='fw-bold me-2'>(e)</span> To respond to legal requests, enquiries, and prevent harm or abuse as well as malicious users.`,
    
    `<span className='fw-bold me-2'>(f)</span> To enforce any terms in relation to the provision and/or use of our Website, and Services.`,
    
    `<span className='fw-bold me-2'>(g)</span> To run and operate the Website, and Services.`,
    
    `<span className='fw-bold me-2'>(h)</span> To send announcements related to payment transactions.`,
    
    `<span className='fw-bold me-2'>(i)</span> To notify you about any changes and updates to our Website, and Services.`,
    
    `<span className='fw-bold me-2'>(j)</span> To request user feedback.`,
    
    `<span className='fw-bold me-2'>(k)</span> To improve our products and services.`,
    
    `<span className='fw-bold me-2'>(l)</span> Enhance the safety and security of our Website, and Services.`,
    
    `<span className='fw-bold me-2'>(m)</span> To send marketing information, such as offers, products, services, surveys, comments, invitations, and content about other matters in connection with the Company. 
    You can unsubscribe from the marketing and promotional materials at any time using the corresponding links in the emails or directly on our Website.`,
    
    `<span className='fw-bold me-2'>(n)</span> To send you personalised communications which you have requested and that may be of interest to you, which may be based on your activity on our website(s) or the website of our partners. 
    These may include information about campaigns, activities and events.`,
    
    `<span className='fw-bold me-2'>(o)</span> To understand and measure the effectiveness of how we serve you and others. To make suggestions and recommendations to you about services that may interest you, which may be based on your activity on our or our partner's websites.`,
    
    `Our collection and processing of your Personal Data depend on how you interact with the Website, and Services, 
    where you are located in the world and if one of the following legal basis applies: 
    (i) you have given your consent for one or more specific purposes; 
    (ii) provision of information is necessary for the performance of an agreement with you and/or for any pre-contractual obligations thereof; 
    (iii) processing is necessary for compliance with a legal obligation to which we are subject; 
    (iv) processing is necessary for the purposes of the legitimate interests pursued by us or by a third party.`,
    
    `Note that under some legislations we may be allowed to process information until you object to such processing (by opting out), 
    without having to rely on consent or any other of the legal bases listed above. In any case, we endeavor to clarify the specific legal basis that applies to the processing, 
    and in particular whether the provision of the Personal Data is a statutory or contractual requirement, or a requirement necessary to enter into a contract. 
    Notwithstanding, you have the right to request us to restrict the processing of your Personal Data but you understand that 
    such restriction of the processing may prevent us from providing you with some of our Services.`,
];

const SECTION_4 = [
    `You are able to delete certain Personal Data we have about you. The Personal Data you can delete may vary as the Website, and Services change. 
    However, when you delete the Personal Data, we may maintain a copy of the unrevised Personal Data in our records for the duration necessary to comply with our obligations to our affiliates and partners, 
    and for the purposes described in this Policy. If you would like to delete your Personal Data or permanently delete your account, you can do so by contacting us.`,
    
    `You have the right to inform us not to process your personal information for marketing purposes. You can exercise your right and prevent us from processing such information by checking or unchecking certain boxes on the forms we use to collect your data. 
    You can also exercise the right at any time by contacting us by email at <span className='text-info'>support@nyyu.io</span>`,

    `We will not contact you for marketing purposes unless you have given your prior consent. You can change your marketing preferences at any time by contacting us by email at <span className='text-info'>support@nyyu.io</span>`,

    `If you change your email address, or any of the other information we hold is inaccurate or out of date, please email us at <span className='text-info'>support@nyyu.io</span>`,
    
    `You have the right to ask for a copy of the information Voltamond SA holds about you at any time. We may charge a fee for our costs of retrieving and supplying the information to you.`,
    
    `Depending on the type of request that you make we may respond to your request immediately, otherwise we usually respond to you within seven days of receiving your request. 
    We may need to contact other entities to properly investigate your request.`,
];

const SECTION_5 = [
    `Your privacy is important for us, and we may ask you to verify your identity or provide additional information before we let you access or update your Personal Data. 
    We may also reject your request to access or update your Personal Data for a number of reasons, including, 
    for example, that the request risks the privacy of other users or is unlawful.`,
    
    `<span className='fw-bold'>(a)</span> Revoking Permissions`,

    `If you let us use your information, you can always change your mind and simply revoke your permission by changing the settings on your device if it allows those options. 
    You acknowledge that, if you do that, certain services may lose full functionality.`,
    
    `<span className='fw-bold'>(b)</span> Advertising Preferences`,

    `We try to show you ads that we think will be relevant to your interests. 
    If you would like to modify the information, we and our advertising partners use to select these ads, you can do so in the Website.`
];

const SECTION_6 = [
    `We may disclose your personal information (the Personal Data) to our employees, contractors or service providers for the purposes of operation of our business, 
    fulfilling requests by you, and to otherwise provide products and services to you including, without limitation, web hosting providers, couriers, 
    data entry service providers, electronic network administrators and professional advisors such as accountants, business advisors and consultants.`,

    `Your Personal Data could also be disclosed to suppliers and other third parties with whom we have commercial relationships, for business, marketing, and related purpose.`,
    
    `We may be asked to disclose any Personal Data we collect, use or receive if required or permitted by law, such as to comply with a subpoena or similar legal process, 
    and when we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, 
    or respond to a government request.`,
    
    `You acknowledge and agree that we are not responsible for how third parties collect or use your information. As always, we encourage you to review the privacy policies of every third party service that you visit or use, 
    including those third parties you interact with through our Website, and Services.`
];

const SECTION_7 = [
    `We will retain and use your Personal Data only for the period necessary to comply with our legal obligations, resolve disputes, 
    and enforce our agreements unless a longer retention period is required or permitted by law. 
    How long we keep your collected information will also depend on the type of information provided. For example, 
    we will retain your account information for as long as your account is active and a reasonable period thereafter in case you decide to re-activate the Services. 
    We may use any aggregated data derived from or incorporated into your Personal Data after you update or delete it, 
    but not in a manner that would identify you personally. Once the retention period expires, the Personal Data shall be deleted. 
    Therefore, the right to access, the right to erasure, the right to rectification and the right to data portability cannot be enforced after the expiration of the retention period.`
];

const SECTION_8 = [
    `We may collect your information from, transfer it to, store and process it in various countries or jurisdictions, 
    which may not have the same level of data protection as required within your residing jurisdiction. 
    Whenever we share information of users outside their residing jurisdiction, we make sure we provide, 
    or enter into legal agreements ensuring an adequate level of data protection, in accordance with this Policy. 
    We comply with laws on the transfer of Personal Data between countries to help ensure your data is protected.`
];

const SECTION_9 = [
    `You may exercise certain rights regarding your information processed by us. In particular, you have the following rights`,

    `<span className='fw-bold me-2'>(a)</span> You have the right to request access to your Personal Data that we store and have the ability to access your Personal Data.`,

    `<span className='fw-bold me-2'>(b)</span> You have the right to request that we correct any Personal Data you believe is inaccurate. You also have the right to request us to complete the Personal Data you believe is incomplete.`,
    
    `<span className='fw-bold me-2'>(c)</span> You have the right to request the erasure of your Personal Data under certain conditions): 
    your Personal Data is no longer necessary in relation to the purposes for which it was collected or otherwise processed, 
    your Personal Data was collected in relation to processing that you previously consented to, but later withdrew such consent; 
    or your Personal Data was collected in relation to processing activities to which you object, and there are no overriding legitimate grounds for our processing.`,
    
    `<span className='fw-bold me-2'>(d)</span> You also have the right to withdraw your consent at any time where we relied on your consent to process your Personal Data. We must then stop processing it. 
    The withdrawal of consent does not affect the lawfulness of processing based on consent before its withdrawal.`,
    
    `<span className='fw-bold me-2'>(e)</span> You have the right to object to the processing of your Personal Data based on legitimate interests and the right to object to direct marketing.`,
    
    `<span className='fw-bold me-2'>(f)</span> You have the right to learn if your Personal Data is being processed by us, obtain disclosure regarding certain aspects of the processing and obtain a copy of the information undergoing processing.`,
    
    `<span className='fw-bold me-2'>(g)</span> You have the right, under certain circumstances, to restrict the processing of your Personal Data, in which case, we will not process your information for any purpose other than storing it.`,
    
    `<span className='fw-bold me-2'>(h)</span> You have the right to restrict any automated decisions made with your Personal Data.`,
    
    `<span className='fw-bold me-2'>(i)</span> You have the right to receive your Personal Data in a structured, commonly used and machine readable format and, if technically feasible, 
    to have it transmitted to another controller without any hindrance. This provision is applicable provided that your Personal Data is processed by automated means and that the processing is based on your consent or a contract which you are part of.`,
    
    `You can exercise your rights through our Website. However, you understand that the objection to processing may prevent us from providing you with some of our Services. 
    If there are other types of information you do not agree to process, you can contact us.`,
];

const SECTION_10 = [
    `Any requests to exercise your rights can be directed to us through the CONTACT US section provided on <a href='https://nyyu.io' target='_blank' className='text-info'>https://nyyu.io</a>. 
    Please note that we may ask you to verify your identity before responding to such a request. 
    Your request must provide sufficient information that allows us to verify that you are the person you are claiming to be or 
    that you are the authorized representative of such person. You must include sufficient details to allow us to properly understand the request and respond to it. 
    We cannot respond to your request or provide you with Personal Data unless we first verify your identity or authority to make such a request and confirm that the Personal Data relates to you.`,

    `We may limit or reject your requests to exercise your rights (a) where the denial of access is required or authorized by law; (b) when granting access would have a negative impact on other's privacy; 
    (c) to protect our rights and properties; or (d) where the request is frivolous or burdensome.`
];

const SECTION_11 = [
    `When you use our Website, we may store Cookies on your computer in order to facilitate and customize your use of our Services. 
    Cookies are small text files that are placed on your computer's hard drive by your web browser when you visit any website. 
    They allow information gathered on one web page to be stored until it is needed for use on another, 
    allowing the Website to provide you with a personalized experience and the website owner with statistics about how you use the website so that it can be improved. 
    Some Cookies may last for a defined period of time, others last indefinitely. Your web browser should allow you to delete any you choose. 
    It also should allow you to prevent or limit their use.`,

    `Our Website uses Cookies and our Cookies may store information including, but not limited to your use of the Website, registration to the Token Sale and account information.`,

    `When you visit our Website, we ask you whether you wish us to use Cookies; you are always free to decline our Cookies if your browser permits, 
    but such disabling may hinder your ability to use some of the Website's features. If you choose not to accept them, 
    or you prevent their use through your browser settings, we shall not use them for your visit except to record that you have not consented to their use for any other purpose.`,
    
    `We use cookies in the following ways:`,
    
    `<span className='fw-bold me-2'>(a)</span> To track how you use our Website, and Services;`,
    
    `<span className='fw-bold me-2'>(b)</span> To customize the Website and advertising;`,
    
    `<span className='fw-bold me-2'>(c)</span> To record whether you have seen specific messages we display on our Website;`,
    
    `<span className='fw-bold me-2'>(d)</span> To keep you signed in our Website;`,
    
    `<span className='fw-bold me-2'>(e)</span> To record your answers to surveys and questionnaires on our Website while you complete them;`,
    
    `<span className='fw-bold me-2'>(f)</span> To measure promotional effectiveness and collect information about your computer or other access device to mitigate risk, help prevent fraud, and promote trust and safety.`
];

const SECTION_12 = [
    `We are concerned to protect the privacy of children aged 16 or under. If you are aged 16 or under, please get your parent/guardian's permission beforehand whenever you provide us with personal information.`,

    `If you believe that we have received information from any child, please notify us immediately, and we will ensure that reasonable efforts will be made to delete such information from our database.`,
];

const SECTION_13 = [
    `Our Website, and Services may contain links to other resources that are not owned or controlled by us. 
    Please be aware that, to the extent, any linked website, device, app or other resource is not owned or controlled by us, 
    we are not responsible for the content and privacy practices of such other resources or third parties. 
    We encourage you to be aware when you leave the Website to read the privacy statements of each and every resource that may collect the Personal Data.`
];

const SECTION_14 = [
    `We secure information you provide on computer servers in a controlled, secure environment, protected from unauthorized access, use, 
    or disclosure. We use strong encryption for your data. We maintain reasonable administrative, technical, 
    and physical safeguards in an effort to protect against unauthorized access, use, modification, and disclosure of the Personal Data in its control and custody. 
    However, users are responsible for maintaining the confidentiality of their user credentials used in the authentication process.`,

    `Nevertheless, no data transmission over the Internet or wireless network can be guaranteed. Therefore, while we strive to protect your Personal Data, 
    you acknowledge that (a) there are security and privacy limitations of the Internet which are beyond our control; (b) the security, 
    integrity, and privacy of any and all information and data exchanged between you and the Website cannot be guaranteed; 
    and (c) any such information and data may be viewed or tampered with in transit by a third party, despite best efforts. Once we have received your information, 
    we will use strict procedures and security features to try to prevent any unauthorized access.`
];

const SECTION_15 = [
    `In the event we become aware that the security of the Website, and Services has been compromised or users' Personal Data has been disclosed to unrelated third party(ies) 
    as a result of external activity, including, but not limited to, security attacks or fraud, we reserve the right to take reasonably appropriate measures, 
    including, but not limited to, investigation and reporting, as well as notification to and cooperation with law enforcement authorities. In the event of a data breach, 
    we will make reasonable efforts to notify affected individuals if we believe that there is a reasonable risk of harm to the User as a result of the breach or if notice is otherwise required by law. 
    When we do, we will get in touch with you via email.`
];

const SECTION_16 = [
    `This Policy may be modified and updated at any time, at our sole discretion, for any or no reason, and without liability, as indicated below, 
    so please check it occasionally to ensure that you agree with any changes. Updates of the Privacy Policy come into force as of the moment when they are published.`,

    `You may not assign or transfer your rights or obligations under this Privacy Policy to any third party.`,

    `This Policy came into existence on 28 March 2022.`
];

const SECTION_17 = [
    `You acknowledge that you have read this Policy and agree to all its terms and conditions. By accessing and using the Website, and Services you agree to be bound by this Policy. 
    If you do not agree to abide by the terms of this Policy, you are not authorized to access or use the Website, and Services.`
];

const SECTION_18 = [
    `If you would like to contact us to understand more about this Policy or wish to contact us concerning any matter relating to individual rights and your Personal Data, you may do so by emailing us at <span className='text-info'>support@nyyu.io</span>.`
];

export default () => (
    <div className="privacy_policy_content">
        <h4 className="text-center">Privacy policy</h4>
        <div>
            <h5>1. INTRODUCTION</h5>
            <p className='px-3 py-2'>
                The following privacy policy (the <span className="fw-bold">Policy</span>) governs how Nyyu UAB{' '}
                (<span className="fw-bold">we</span>, <span className="fw-bold">us</span>, or <span className="fw-bold">our</span>) treats personally identifiable information{' '}
                (<span className="fw-bold">Personal Data</span>) users (<span className="fw-bold">User</span>, <span className="fw-bold">you</span>, or <span className="fw-bold">your</span>){' '}
                may provide us when using our application or website (the <span className='fw-bold'>Website</span>), and any of its related products and services (the <span className='fw-bold'>Services</span>).
            </p>
            <p className='px-3 py-2'>
                This Policy is a legally binding agreement between you and the Company, which outlines our practices with respect to{' '}
                the Personal Data collected from users who access the Website at <a href='https://nyyu.io' target='_blank' className='text-info'>https://nyyu.io</a>, register an account, or participate in our Token Sale.{' '}
                By accessing and using the Website and Services, you acknowledge that you have read, understood, and agree to be bound by the terms of this Policy.
            </p>
            <p className='px-3 py-2'>
                This Policy applies to information we collect when you visit and use our Website, when you contact us via email or a web form or{' '}
                if you register to receive one of our regular newsletters or otherwise use our Services.
            </p>
        </div>
        <div>
            <h5>2. COLLECTION OF INFORMATION</h5>
            {SECTION_2.map((item, index) => (
                <p key={index} className='px-3 py-2'>{parse(item)}</p>
            ))}
        </div>
        <div>
            <h5>3. USE AND PROCESSING OF COLLECTED INFORMATION</h5>
            {SECTION_3.map((item, index) => (
                <p key={index} className='px-3 py-2'>{parse(item)}</p>
            ))}
        </div>
        <div>
            <h5>4. MANAGING INFORMATION</h5>
            {SECTION_4.map((item, index) => (
                <p key={index} className='px-3 py-2'>{parse(item)}</p>
            ))}
        </div>
        <div>
            <h5>5. CONTROL OVER YOUR INFORMATION</h5>
            {SECTION_5.map((item, index) => (
                <p key={index} className='px-3 py-2'>{parse(item)}</p>
            ))}
        </div>
        <div>
            <h5>6. DISCLOSURE OF INFORMATION WITH THIRD PARTIES</h5>
            {SECTION_6.map((item, index) => (
                <p key={index} className='px-3 py-2'>{parse(item)}</p>
            ))}
        </div>
        <div>
            <h5>7. RETENTION OF INFORMATION</h5>
            {SECTION_7.map((item, index) => (
                <p key={index} className='px-3 py-2'>{parse(item)}</p>
            ))}
        </div>
        <div>
            <h5>8. TRANSFER OF INFORMATION</h5>
            {SECTION_8.map((item, index) => (
                <p key={index} className='px-3 py-2'>{parse(item)}</p>
            ))}
        </div>
        <div>
            <h5>9. THE RIGHTS OF USERS</h5>
            {SECTION_9.map((item, index) => (
                <p key={index} className='px-3 py-2'>{parse(item)}</p>
            ))}
        </div>
        <div>
            <h5>10. HOW TO EXERCISE THESE RIGHTS</h5>
            {SECTION_10.map((item, index) => (
                <p key={index} className='px-3 py-2'>{parse(item)}</p>
            ))}
        </div>
        <div>
            <h5>11. COOKIES</h5>
            {SECTION_11.map((item, index) => (
                <p key={index} className='px-3 py-2'>{parse(item)}</p>
            ))}
        </div>
        <div>
            <h5>12. PRIVACY OF CHILDREN</h5>
            {SECTION_12.map((item, index) => (
                <p key={index} className='px-3 py-2'>{parse(item)}</p>
            ))}
        </div>
        <div>
            <h5>13. LINKS TO OTHER RESOURCES</h5>
            {SECTION_13.map((item, index) => (
                <p key={index} className='px-3 py-2'>{parse(item)}</p>
            ))}
        </div>
        <div>
            <h5>14. INFORMATION SECURITY</h5>
            {SECTION_14.map((item, index) => (
                <p key={index} className='px-3 py-2'>{parse(item)}</p>
            ))}
        </div>
        <div>
            <h5>15. DATA BREACH</h5>
            {SECTION_15.map((item, index) => (
                <p key={index} className='px-3 py-2'>{parse(item)}</p>
            ))}
        </div>
        <div>
            <h5>16. CHANGES AND AMENDMENTS</h5>
            {SECTION_16.map((item, index) => (
                <p key={index} className='px-3 py-2'>{parse(item)}</p>
            ))}
        </div>
        <div>
            <h5>17. ACCEPTANCE OF THIS POLICY</h5>
            {SECTION_17.map((item, index) => (
                <p key={index} className='px-3 py-2'>{parse(item)}</p>
            ))}
        </div>
        <div>
            <h5>18. CONTACTING US</h5>
            {SECTION_18.map((item, index) => (
                <p key={index} className='px-3 py-2'>{parse(item)}</p>
            ))}
        </div>
    </div>
);