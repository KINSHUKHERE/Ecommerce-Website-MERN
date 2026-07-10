import api from "./api";

export const createRazorpayOrderApi = async (amount) => {
  return await api.post("/payment/create-razorpay-order", { amount });
};

export const verifyRazorpayPaymentApi = async ({ razorpay_payment_id, razorpay_order_id, razorpay_signature, orderData }) => {
  return await api.post("/payment/verify-razorpay-payment", {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    orderData,
  });
};
