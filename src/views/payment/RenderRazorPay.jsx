/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */

import { useEffect, useRef } from "react";

const loadScript = (src) =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => {
      // console.log("❌ Razorpay SDK failed to load");
      resolve(false);
    };
    document.body.appendChild(script);
  });

const RenderRazorPay = ({ orderId, currency, amount, razorpayKey, schoolName, setUpdateStatus, onSuccess, onClose }) => {
  const rzpInstance = useRef(null);



  const displayRazorpay = async () => {
    const sdkLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!sdkLoaded || !window.Razorpay) {
      return;
    }

    const options = {
      key: razorpayKey || "rzp_test_RnspXBsJPOZzW1",
      amount,
      currency,
      name: schoolName || "Franchise Fee Payment",
      order_id: orderId,
      handler: (response) => {

        // Notify parent about success
        setUpdateStatus({ status: "success", ...response });

        if (typeof onSuccess === "function") onSuccess(response);

        // Force close the modal to clean up
        rzpInstance.current?.close();
      },
      ondismiss: () => {
        if (typeof onClose === "function") onClose();
      },
      theme: { color: "#0c3b73" },
    };

    rzpInstance.current = new window.Razorpay(options);

    // Small delay ensures DOM ready
    setTimeout(() => rzpInstance.current?.open(), 50);
  };

  useEffect(() => {
    if (orderId) displayRazorpay();
    // Only cleanup on unmount
    return () => {
      rzpInstance.current?.close();
    };
  }, [orderId]);

  return null;
};

export default RenderRazorPay;
