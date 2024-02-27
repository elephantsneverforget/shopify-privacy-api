const G = "granted";
const D = "denied";

function gtag() {
  dataLayer.push(arguments);
}

// Helper function to update the consent status in gtag
function updateConsentStatus({ marketing, analytics, preferences, isDefault }) {
  gtag("consent", isDefault ? "default" : "update", {
    ad_user_data: marketing ? G : D,
    ad_personalization: marketing ? G : D,
    ad_storage: marketing ? G : D,
    analytics_storage: analytics ? G : D,
    functionality_storage: preferences ? G : D,
    personalization_storage: preferences ? G : D,
    security_storage: G,
  });
}

// Main consent handling logic
function handleConsent() {
  if (!window.Shopify.customerPrivacy.shouldShowBanner()) {
    // If consent isn't required, assume all consents are granted
    updateConsentStatus({
      marketing: true,
      analytics: true,
      preferences: true,
      isDefault: true,
    });
    return;
  }

  // Handle required consent based on the visitor's current consent settings
  const currentConsent = window.Shopify.customerPrivacy.currentVisitorConsent();
  updateConsentStatus({
    marketing: currentConsent.marketing === "yes",
    analytics: currentConsent.analytics === "yes",
    preferences: currentConsent.preferences === "yes",
    isDefault: true,
  });

  // Listen for changes in consent and update accordingly
  document.addEventListener("visitorConsentCollected", (event) => {
    updateConsentStatus({
      marketing: event.detail.marketingAllowed,
      analytics: event.detail.analyticsAllowed,
      preferences: event.detail.preferencesAllowed,
      isDefault: false,
    });
  });
}

function waitForShopify() {
  if (window.Shopify) {
    window.Shopify.loadFeatures(
      [
        {
          name: "consent-tracking-api",
          version: "0.1",
        },
      ],
      (error) => {
        if (error) {
          console.log(error);
          return;
        }
        handleConsent();
      }
    );
  } else {
    setTimeout(waitForShopify, 100); // Wait for 100ms before trying again
  }
}

waitForShopify();
