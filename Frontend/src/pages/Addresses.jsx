import React, { useEffect, useState } from "react";
import { getAddresses, addAddress, updateAddress, deleteAddress } from "../api/AddressApi";
import { MapPin, Loader2, Edit, Trash2, X, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Addresses = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    streetAddress: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India"
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Toast notifications
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (msg, type = "success") => {
    setMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  useEffect(() => {
    fetchUserAddresses();
  }, []);

  const fetchUserAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await getAddresses();
      setAddresses(res.data.addresses || []);
    } catch (err) {
      console.error("Failed to load user addresses", err);
      showToast("Unable to fetch your address book", "error");
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    if (!addressForm.streetAddress.trim()) {
      showToast("Street address is required", "error");
      return;
    }
    if (!addressForm.city.trim()) {
      showToast("City is required", "error");
      return;
    }
    if (!addressForm.state.trim()) {
      showToast("State is required", "error");
      return;
    }
    if (!addressForm.pinCode.trim()) {
      showToast("Postal code is required", "error");
      return;
    }
    if (addressForm.pinCode.trim().length !== 6 || !/^\d+$/.test(addressForm.pinCode.trim())) {
      showToast("PIN / Postal Code must be a 6-digit number", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (editingAddressId) {
        // Edit Address
        await updateAddress(editingAddressId, {
          streetAddress: addressForm.streetAddress.trim(),
          city: addressForm.city.trim(),
          state: addressForm.state.trim(),
          pinCode: addressForm.pinCode.trim(),
          country: addressForm.country.trim()
        });
        showToast("Address updated successfully", "success");
      } else {
        // Add Address
        if (addresses.length >= 10) {
          showToast("You can save up to 10 addresses only.", "error");
          setSubmitting(false);
          return;
        }
        await addAddress({
          streetAddress: addressForm.streetAddress.trim(),
          city: addressForm.city.trim(),
          state: addressForm.state.trim(),
          pinCode: addressForm.pinCode.trim(),
          country: addressForm.country.trim()
        });
        showToast("Address saved successfully", "success");
      }
      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm({ streetAddress: "", city: "", state: "", pinCode: "", country: "India" });
      fetchUserAddresses();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.msg || "Failed to save address", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAddressClick = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      streetAddress: addr.streetAddress,
      city: addr.city,
      state: addr.state,
      pinCode: addr.pinCode,
      country: addr.country || "India"
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddressClick = async (addrId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteAddress(addrId);
        showToast("Address deleted successfully", "success");
        fetchUserAddresses();
      } catch (err) {
        console.error("Failed to delete address", err);
        showToast("Failed to delete address", "error");
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-dark-navy antialiased my-12 px-6">
      
      {/* Toast Alert Widget */}
      {message && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 md:top-auto md:left-auto md:bottom-5 md:right-5 md:translate-x-0 z-50 bg-dark-navy border border-light-border/10 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn max-w-[90vw] w-max">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center ${
              toastType === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {toastType === "success" ? <Check size={12} /> : <X size={12} />}
          </div>
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex justify-between items-start text-left animate-fadeIn">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-navy tracking-tight leading-normal">
            Address Book
          </h1>
          <p className="text-xs sm:text-sm text-muted-gray mt-1.5 font-medium leading-relaxed">
            Manage your saved shipping and billing addresses for checkouts.
          </p>
        </div>
      </div>

      <div className="space-y-4 text-left animate-fadeIn">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-soft-bg border border-light-border/60 p-4 rounded-3xl">
          <div>
            <h3 className="text-sm font-extrabold text-dark-navy flex items-center gap-1.5 uppercase tracking-wider">
              <MapPin size={15} className="text-primary" />
              Your Saved Addresses
            </h3>
            <p className="text-xs text-muted-gray mt-1 font-semibold">
              You have saved <span className="font-extrabold text-primary">{addresses.length}/10</span> addresses.
            </p>
          </div>
          {!showAddressForm && (
            <button
              type="button"
              onClick={() => {
                if (addresses.length >= 10) {
                  showToast("You can save up to 10 addresses only.", "error");
                  return;
                }
                setEditingAddressId(null);
                setAddressForm({ streetAddress: "", city: "", state: "", pinCode: "", country: "India" });
                setShowAddressForm(true);
              }}
              disabled={addresses.length >= 10}
              className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-center disabled:opacity-50 cursor-pointer transition active:scale-95"
            >
              Add New Address
            </button>
          )}
        </div>

        {/* Form to Add/Edit Address */}
        {showAddressForm && (
          <div className="bg-white border border-light-border/60 rounded-3xl p-5 md:p-6 shadow-2xs relative overflow-hidden animate-fadeIn">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
            <h4 className="text-xs font-extrabold text-dark-navy uppercase tracking-wider mb-4">
              {editingAddressId ? "Modify Saved Address" : "Add New Address"}
            </h4>
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">Street Address (Flat/House No., Colony)</label>
                <input
                  type="text"
                  id="profile-street"
                  name="street-address"
                  autoComplete="street-address"
                  required
                  value={addressForm.streetAddress}
                  onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy transition-all h-[38px] bg-white"
                  placeholder="E.g., Flat 405, Block B, Green Heights"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="profile-city" className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">Town / City</label>
                  <input
                    type="text"
                    id="profile-city"
                    name="city"
                    autoComplete="address-level2"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy transition-all h-[38px] bg-white"
                    placeholder="E.g., Bengaluru"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="profile-state" className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">State / Province</label>
                  <input
                    type="text"
                    id="profile-state"
                    name="state"
                    autoComplete="address-level1"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy transition-all h-[38px] bg-white"
                    placeholder="E.g., Karnataka"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="profile-pincode" className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">PIN / Postal Code</label>
                  <input
                    type="text"
                    id="profile-pincode"
                    name="pincode"
                    autoComplete="postal-code"
                    required
                    maxLength="6"
                    value={addressForm.pinCode}
                    onChange={(e) => setAddressForm({ ...addressForm, pinCode: e.target.value.replace(/\D/g, "") })}
                    className="w-full px-3 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy transition-all h-[38px] bg-white"
                    placeholder="E.g., 560001"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="profile-country" className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">Country</label>
                  <input
                    type="text"
                    id="profile-country"
                    name="country"
                    autoComplete="country-name"
                    required
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="w-full px-3 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy transition-all h-[38px] bg-white"
                    placeholder="E.g., India"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-light-border/40">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddressForm(false);
                    setEditingAddressId(null);
                  }}
                  className="px-4 py-2 border border-light-border hover:bg-slate-50 text-muted-gray text-xs font-bold rounded-xl transition h-[38px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition h-[38px] disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {submitting ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Saved Addresses list */}
        {loadingAddresses ? (
          <div className="py-16 flex flex-col items-center justify-center bg-white border border-light-border/60 rounded-3xl shadow-2xs">
            <Loader2 className="animate-spin text-primary w-8 h-8 mb-3" />
            <p className="text-xs text-muted-gray font-semibold uppercase tracking-wider animate-pulse">
              Loading Addresses...
            </p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="py-16 text-center bg-white border border-light-border/60 rounded-3xl shadow-2xs px-6">
            <MapPin size={42} className="text-muted-gray/50 mx-auto mb-4" strokeWidth={2.5} />
            <h3 className="text-base font-extrabold text-dark-navy">No Saved Addresses</h3>
            <p className="text-xs text-muted-gray mt-1 max-w-xs mx-auto leading-relaxed font-semibold">
              Add your billing or shipping addresses here to reuse them seamlessly during checkout.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.005)] hover:shadow-[0_12px_25px_rgba(0,0,0,0.01)] transition-all duration-300 flex flex-col justify-between gap-3 text-left relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-light-border/30"></div>
                <div className="space-y-2">
                  <span className="text-[9px] text-muted-gray block font-bold uppercase tracking-widest">
                    Address Details
                  </span>
                  <div className="text-xs font-semibold text-muted-gray leading-normal flex items-start gap-1">
                    <MapPin size={12} className="text-muted-gray/80 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-extrabold text-dark-navy">{addr.streetAddress}</p>
                      <p className="mt-0.5">
                        {addr.city}, {addr.state} - {addr.pinCode}
                      </p>
                      <p className="text-primary mt-1 text-[9px] uppercase font-extrabold tracking-wider">{addr.country}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2.5 border-t border-light-border/40">
                  <button
                    type="button"
                    onClick={() => handleEditAddressClick(addr)}
                    className="text-primary hover:text-primary-hover text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit size={12} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAddressClick(addr._id)}
                    className="text-red-500 hover:text-red-650 text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Addresses;
