// EmailJS Configuration
// Replace these values with your actual EmailJS credentials
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_ykpjfsj',           // Your EmailJS service ID
  TEMPLATE_ID: 'template_bnmxxa1',        // Your EmailJS template ID for password reset
  PUBLIC_KEY: 'gZqfjAQFRdIkihxHU'           // Your EmailJS public key
};

// EmailJS Template Variables
// Your EmailJS template should include these variables:
// {{email}} - User's email address
// {{passcode}} - 6-digit OTP code
// {{time}} - Expiry time (e.g., "10 minutes")

// Instructions:
// 1. Sign up at https://emailjs.com
// 2. Create a new service (Gmail, Outlook, etc.)
// 3. Create a new template with the variables above
// 4. Get your service ID, template ID, and public key
// 5. Replace the values above with your actual credentials
// 6. Update the EmailJSService to use these config values
