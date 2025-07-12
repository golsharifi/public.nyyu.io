import React, { useState, useEffect } from 'react';
import CookieConsent from "react-cookie-consent";

const GDPRBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const hasConsent = localStorage.getItem('gatsby-gdpr-google-analytics');
    if (!hasConsent && typeof window !== 'undefined') {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    // Enable analytics with latest Google Analytics 4 approach
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
      });
    }
    setShowBanner(false);
  };

  const handleDecline = () => {
    // Disable analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
      });
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <CookieConsent
      location="bottom"
      buttonText="Accept All Cookies"
      declineButtonText="Decline All"
      enableDeclineButton
      onAccept={handleAccept}
      onDecline={handleDecline}
      cookieName="gatsby-gdpr-google-analytics"
      style={{ 
        background: "#333333",
        padding: "20px",
        alignItems: "center",
        justifyContent: "space-between"
      }}
      buttonStyle={{ 
        color: "#fff", 
        background: "#23C865", 
        fontSize: "14px",
        border: "none",
        borderRadius: "6px",
        padding: "12px 24px",
        marginRight: "10px",
        cursor: "pointer",
        fontWeight: "500"
      }}
      declineButtonStyle={{ 
        color: "#333333", 
        background: "#ffffff", 
        fontSize: "14px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        padding: "12px 24px",
        cursor: "pointer",
        fontWeight: "500"
      }}
      expires={365}
      overlay={false}
      sameSite="strict"
    >
      <div style={{ 
        color: "white", 
        fontSize: "14px", 
        lineHeight: "1.4",
        maxWidth: "70%"
      }}>
        <strong>We value your privacy</strong>
        <br />
        We use cookies to give you the best online experience and to analyze site traffic. 
        Please let us know if you agree to all of these cookies.
      </div>
    </CookieConsent>
  );
};

export default GDPRBanner;