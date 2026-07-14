const axios = require("axios");

let cachedToken = null;

const getShiprocketToken = async () => {
  if (cachedToken) return cachedToken;
  try {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
      console.warn("Shiprocket credentials are not configured in environment variables.");
      return null;
    }

    const response = await axios.post("https://apiv2.shiprocket.in/v1/external/auth/login", {
      email,
      password,
    });

    if (response.data && response.data.token) {
      cachedToken = response.data.token;
      return cachedToken;
    }
    return null;
  } catch (err) {
    console.error("Failed to authenticate with Shiprocket:", err.response?.data || err.message);
    return null;
  }
};

const createShiprocketOrder = async (order, user) => {
  try {
    const token = await getShiprocketToken();
    if (!token) return null;

    // Map local order to Shiprocket order payload
    const orderItems = order.items.map(item => ({
      name: item.name,
      sku: item.productId.toString().substring(0, 8) + (item.variantId ? item.variantId.toString().substring(0, 8) : ""),
      units: item.quantity,
      selling_price: item.price,
    }));

    const orderPayload = {
      order_id: order._id.toString(),
      order_date: new Date(order.createdAt || Date.now()).toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(0, 16),
      pickup_location: "Primary",
      billing_customer_name: user?.name?.split(" ")[0] || "Customer",
      billing_last_name: user?.name?.split(" ")[1] || "Name",
      billing_address: order.shippingAddress.address,
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.postalCode,
      billing_state: order.shippingAddress.state,
      billing_country: order.shippingAddress.country || "India",
      billing_email: user?.email || "customer@yocart.com",
      billing_phone: user?.phoneNumber || "9999999999",
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
      sub_total: order.totalAmount,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5, // Standard estimated package details
    };

    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      orderPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data) {
      return {
        shiprocketOrderId: response.data.order_id,
        shiprocketShipmentId: response.data.shipment_id,
      };
    }
    return null;
  } catch (err) {
    console.error("Failed to create order in Shiprocket:", err.response?.data || err.message);
    return null;
  }
};

const getShiprocketTracking = async (awbCode) => {
  try {
    const token = await getShiprocketToken();
    if (!token) return null;

    const response = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data && response.data.tracking_data) {
      return response.data.tracking_data;
    }
    return null;
  } catch (err) {
    console.error(`Failed to fetch Shiprocket tracking for AWB ${awbCode}:`, err.response?.data || err.message);
    return null;
  }
};

module.exports = {
  createShiprocketOrder,
  getShiprocketTracking,
};
