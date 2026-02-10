import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_qylrnjr";
const TEMPLATE_ID = "template_k35ufnw";
const PUBLIC_KEY = "s5omRmajJqLXFBhG9";

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOtpEmail = async (email, otp) => {
  try {
    const templateParams = {
      email: email,
      otp_code: otp,
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );

    return response;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};
