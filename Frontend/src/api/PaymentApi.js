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

// Vendor Wallet API Helpers
export const createVendorRechargeOrderApi = async (amount) => {
  return await api.post("/payment/vendor/create-recharge-order", { amount });
};

export const verifyVendorRechargePaymentApi = async (data) => {
  return await api.post("/payment/vendor/verify-recharge-payment", data);
};

export const getVendorWalletStatusApi = async () => {
  return await api.get("/payment/vendor/wallet-status");
};

export const getAdminVendorWalletStatusApi = async (vendorId) => {
  return await api.get(`/payment/admin/vendor-wallet-status/${vendorId}`);
};

export const getCommissionSettingsApi = async () => {
  return await api.get("/payment/commission-settings");
};

export const updateCommissionSettingsApi = async (data) => {
  return await api.post("/payment/commission-settings", data);
};
