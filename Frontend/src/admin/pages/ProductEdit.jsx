import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct, updateProduct, uploadProductImage } from "../../api/ProductApi";
import {
  getCategories,
  getBrandsByCategory,
} from "../../api/CategoryAndBrandApi";
import {
  Link as LinkIcon,
  Tag,
  Layers,
  Heading,
  IndianRupee,
  Box,
  AlignLeft,
  Sparkles,
  ArrowLeft,
  Loader2,
  X,
  Check,
  Image as ImageIcon,
  Upload,
  Trash2,
  Plus,
  Info
} from "lucide-react";

const ProductEdit = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    categoryId: "",
    brandId: "",
    heading: "",
    price: "",
    quantity: "",
    description: "",
  });

  const [productImages, setProductImages] = useState([]); // Max 6 images
  const [imageInputMethod, setImageInputMethod] = useState("upload"); // "upload" | "url"
  const [urlInput, setUrlInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [imgLoadError, setImgLoadError] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [uploading, setUploading] = useState(false);
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState(null);
  const [activeImagePickerVariant, setActiveImagePickerVariant] = useState(null);
  const [variantImageInputMethod, setVariantImageInputMethod] = useState("upload");
  const [variantUrlInput, setVariantUrlInput] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [draggedVariantImgIndex, setDraggedVariantImgIndex] = useState(null);

  // Variant States
  const [hasVariants, setHasVariants] = useState(false);
  const [options, setOptions] = useState([{ name: "", values: [] }]);
  const [variants, setVariants] = useState([]);
  
  // Storing the original default variant if it was a flat product
  const [originalDefaultVariantId, setOriginalDefaultVariantId] = useState("");

  // Bulk Variant States
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkQty, setBulkQty] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const categoryRes = await getCategories();
        setCategories(categoryRes.data.categories || []);

        const productRes = await getProduct();
        const product = productRes.data.data.find((p) => p._id === productId);

        if (product) {
          const categoryId = product.categoryId?._id || product.categoryId;
          
          const combined = [];
          if (product.imgUrl) combined.push(product.imgUrl);
          if (product.images && product.images.length > 0) {
            combined.push(...product.images);
          }
          setProductImages(combined);

          const hasOpts = product.options && product.options.length > 0;
          setHasVariants(hasOpts);

          if (hasOpts) {
            setOptions(product.options);
            setVariants(product.variants || []);
            setFormData({
              categoryId: categoryId || "",
              brandId: product.brandId?._id || product.brandId || "",
              heading: product.heading || "",
              price: "",
              quantity: "",
              description: product.description || "",
            });
          } else {
            const defVariant = product.variants?.[0] || {};
            setOriginalDefaultVariantId(defVariant._id || "");
            setOptions([{ name: "", values: [] }]);
            setVariants([]);
            setFormData({
              categoryId: categoryId || "",
              brandId: product.brandId?._id || product.brandId || "",
              heading: product.heading || "",
              price: defVariant.price || "",
              quantity: defVariant.quantity ?? 0,
              description: product.description || "",
            });
          }

          if (categoryId) {
            const brandRes = await getBrandsByCategory(categoryId);
            setBrands(brandRes.data.brands || []);
          }
        } else {
          showToast("Product not found", "error");
          setTimeout(() => navigate("/admin/products"), 1500);
        }
      } catch (err) {
        showToast("Error loading product record", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId, navigate]);

  useEffect(() => {
    if (formData.heading) {
      document.title = `YoCart | Admin - Edit ${formData.heading}`;
    }
  }, [formData.heading]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (productImages.length + files.length > 6) {
      showToast("You can add up to 6 images only.", "error");
      return;
    }

    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const res = await uploadProductImage(file);
        urls.push(res.data.url);
      }
      setProductImages((prev) => [...prev, ...urls]);
      setImgLoadError(false);
    } catch (err) {
      console.error("Image upload failed:", err);
      showToast("Failed to upload one or more images", "error");
    } finally {
      setUploading(false);
    }
  };

  const addImageUrl = () => {
    if (!urlInput.trim()) return;
    if (productImages.length >= 6) {
      showToast("You can add up to 6 images only.", "error");
      return;
    }
    setProductImages((prev) => [...prev, urlInput.trim()]);
    setUrlInput("");
    setImgLoadError(false);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reorderedImages = [...productImages];
    const [draggedItem] = reorderedImages.splice(draggedIndex, 1);
    reorderedImages.splice(index, 0, draggedItem);

    setProductImages(reorderedImages);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleVariantImgDragStart = (e, imgIdx) => {
    setDraggedVariantImgIndex(imgIdx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleVariantImgDragOver = (e) => {
    e.preventDefault();
  };

  const handleVariantImgDrop = (e, targetIdx, vIdx) => {
    e.preventDefault();
    if (draggedVariantImgIndex === null || draggedVariantImgIndex === targetIdx) return;

    setVariants((prev) => {
      const updated = prev.map((v, idx) => {
        if (idx === vIdx) {
          const reorderedImages = [...(v.images || [])];
          const [draggedItem] = reorderedImages.splice(draggedVariantImgIndex, 1);
          reorderedImages.splice(targetIdx, 0, draggedItem);
          return { ...v, images: reorderedImages };
        }
        return v;
      });
      return syncSharedVariantImages(updated, vIdx);
    });
  };

  const handleVariantImgDragEnd = () => {
    setDraggedVariantImgIndex(null);
  };

  const removeImage = (indexToRemove) => {
    setProductImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      categoryId,
      brandId: "",
    }));
    setBrands([]);

    if (categoryId) {
      try {
        const response = await getBrandsByCategory(categoryId);
        setBrands(response.data.brands || []);
      } catch (err) {
        showToast("Error loading brands", "error");
        console.error(err);
      }
    }
  };

  // Cartesian Product Generator
  const generateCombinations = (opts) => {
    const activeOpts = opts.filter(o => o.name.trim() !== "" && o.values.length > 0);
    if (activeOpts.length === 0) return [];
    
    const combos = [];
    const recurse = (index, current) => {
      if (index === activeOpts.length) {
        combos.push([...current]);
        return;
      }
      const opt = activeOpts[index];
      opt.values.forEach(val => {
        current.push({ name: opt.name, value: val });
        recurse(index + 1, current);
        current.pop();
      });
    };
    recurse(0, []);
    return combos;
  };

  // Sync Variants list when Options change
  useEffect(() => {
    if (!hasVariants) {
      setVariants([]);
      return;
    }
    const combos = generateCombinations(options);
    
    // Map combinations to variants structure while preserving already inputted details
    const newVariants = combos.map(combo => {
      const matchKey = combo.map(c => `${c.name}:${c.value}`).join("|");
      
      const existing = variants.find(v => {
        const existingKey = v.attributes.map(c => `${c.name}:${c.value}`).join("|");
        return existingKey === matchKey;
      });
      
      if (existing) {
        return existing;
      }
      
      // Auto-generate variant SKU
      const shortBrand = brands.find(b => b._id === formData.brandId)?.name?.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "") || "BRD";
      const shortHeading = formData.heading.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "") || "PROD";
      const attrVals = combo.map(c => c.value.slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, "")).join("-");
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const generatedSku = `SKU-${shortBrand}-${shortHeading}-${attrVals}-${randomId}`;

      return {
        sku: generatedSku,
        price: formData.price || "",
        quantity: formData.quantity || "",
        images: [],
        attributes: combo,
      };
    });
    
    setVariants(newVariants);
  }, [options, hasVariants]);

  // Options Handlers
  const handleAddOptionField = () => {
    if (options.length >= 3) {
      showToast("You can define at most 3 variant options (e.g. Color, Size, Storage).", "error");
      return;
    }
    setOptions([...options, { name: "", values: [] }]);
  };

  const handleRemoveOptionField = (idxToRemove) => {
    setOptions(options.filter((_, idx) => idx !== idxToRemove));
  };

  const handleOptionNameChange = (idx, newName) => {
    setOptions(options.map((opt, i) => i === idx ? { ...opt, name: newName } : opt));
  };

  const handleAddOptionValue = (idx, newValue) => {
    setOptions(options.map((opt, i) => {
      if (i === idx) {
        if (opt.values.includes(newValue)) return opt;
        return { ...opt, values: [...opt.values, newValue] };
      }
      return opt;
    }));
  };

  const handleRemoveOptionValue = (idx, valueIdxToRemove) => {
    setOptions(options.map((opt, i) => {
      if (i === idx) {
        return { ...opt, values: opt.values.filter((_, vIdx) => vIdx !== valueIdxToRemove) };
      }
      return opt;
    }));
  };

  // Row Handlers
  const handleVariantChange = (vIdx, field, val) => {
    setVariants(prev => prev.map((v, idx) => idx === vIdx ? { ...v, [field]: val } : v));
  };

  const syncSharedVariantImages = (variantsList, changedVariantIdx) => {
    const changedVariant = variantsList[changedVariantIdx];
    if (!changedVariant || !changedVariant.attributes || changedVariant.attributes.length === 0) return variantsList;

    let syncAttr = changedVariant.attributes.find(a => a.name.toLowerCase().includes("color") || a.name.toLowerCase().includes("colour"));
    if (!syncAttr) {
      syncAttr = changedVariant.attributes[0];
    }

    const syncValue = syncAttr.value;

    return variantsList.map((v, idx) => {
      if (idx === changedVariantIdx) return v;

      const matchingAttr = v.attributes.find(a => a.name === syncAttr.name);
      if (matchingAttr && matchingAttr.value === syncValue) {
        return { ...v, images: [...(changedVariant.images || [])] };
      }
      return v;
    });
  };

  const handleVariantImagesUpload = async (e, vIdx) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const currentImages = variants[vIdx]?.images || [];
    if (currentImages.length + files.length > 6) {
      showToast("You can add up to 6 images per variant.", "error");
      return;
    }

    setUploadingVariantIndex(vIdx);
    try {
      const urls = [];
      for (const file of files) {
        const res = await uploadProductImage(file);
        urls.push(res.data.url);
      }

      setVariants((prev) => {
        const updated = prev.map((v, idx) => {
          if (idx === vIdx) {
            return { ...v, images: [...(v.images || []), ...urls] };
          }
          return v;
        });
        return syncSharedVariantImages(updated, vIdx);
      });
      showToast("Variant images uploaded successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to upload one or more variant images", "error");
    } finally {
      setUploadingVariantIndex(null);
    }
  };

  const addVariantImageUrl = (vIdx) => {
    const url = variantUrlInput.trim();
    if (!url) return;

    const currentImages = variants[vIdx]?.images || [];
    if (currentImages.length >= 6) {
      showToast("You can add up to 6 images per variant.", "error");
      return;
    }

    setVariants((prev) => {
      const updated = prev.map((v, idx) => {
        if (idx === vIdx) {
          return { ...v, images: [...(v.images || []), url] };
        }
        return v;
      });
      return syncSharedVariantImages(updated, vIdx);
    });
    setVariantUrlInput("");
    showToast("Variant image URL added", "success");
  };

  const removeVariantImage = (vIdx, imgIdx) => {
    setVariants((prev) => {
      const updated = prev.map((v, idx) => {
        if (idx === vIdx) {
          return {
            ...v,
            images: (v.images || []).filter((_, i) => i !== imgIdx),
          };
        }
        return v;
      });
      return syncSharedVariantImages(updated, vIdx);
    });
    showToast("Variant image removed", "success");
  };

  const handleApplyBulk = () => {
    if (bulkPrice === "" && bulkQty === "") {
      showToast("Please enter a price or quantity to apply bulk settings.", "error");
      return;
    }
    setVariants(prev => prev.map(v => ({
      ...v,
      price: bulkPrice !== "" ? Number(bulkPrice) : v.price,
      quantity: bulkQty !== "" ? Number(bulkQty) : v.quantity,
    })));
    showToast("Bulk settings applied to all variants", "success");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    let finalData = {
      ...formData,
      options: hasVariants ? options.filter(o => o.name.trim() !== "" && o.values.length > 0) : [],
    };

    if (hasVariants) {
      // Validate variants
      if (variants.length === 0) {
        showToast("Please configure at least one variant option value.", "error");
        setSaving(false);
        return;
      }

      // Check if at least one variant has an image
      const firstVariantWithImage = variants.find(v => v.images && v.images.length > 0);
      if (!firstVariantWithImage) {
        showToast("Please upload or add at least one image to at least one variant.", "error");
        setSaving(false);
        return;
      }

      for (const v of variants) {
        const name = v.attributes.map(a => a.value).join(" • ");
        if (v.price === "" || isNaN(v.price) || Number(v.price) < 0) {
          showToast(`Invalid price rate for variant ${name}.`, "error");
          setSaving(false);
          return;
        }
        if (v.quantity === "" || isNaN(v.quantity) || Number(v.quantity) < 0) {
          showToast(`Invalid stock quantity for variant ${name}.`, "error");
          setSaving(false);
          return;
        }
      }

      // Format numbers and handle fallback images
      const formattedVariants = variants.map(v => ({
        _id: v._id || undefined,
        sku: v.sku || undefined,
        price: Number(v.price),
        quantity: Number(v.quantity),
        attributes: v.attributes,
        images: v.images && v.images.length > 0 ? v.images : [firstVariantWithImage.images[0]],
      }));

      finalData.imgUrl = firstVariantWithImage.images[0];
      finalData.images = firstVariantWithImage.images.slice(1);
      finalData.variants = formattedVariants;
      
      // Clean top level price/qty since they are variant-specific
      finalData.price = null;
      finalData.quantity = 0;
    } else {
      // Flat product pricing/quantity validation
      if (productImages.length === 0) {
        showToast("Please upload or add at least one product image.", "error");
        setSaving(false);
        return;
      }
      if (formData.price === "" || isNaN(formData.price) || Number(formData.price) < 0) {
        showToast("Please enter a valid product price.", "error");
        setSaving(false);
        return;
      }
      if (formData.quantity === "" || isNaN(formData.quantity) || Number(formData.quantity) < 0) {
        showToast("Please enter a valid stock quantity.", "error");
        setSaving(false);
        return;
      }
      
      finalData.imgUrl = productImages[0];
      finalData.images = productImages.slice(1);
      finalData.price = Number(formData.price);
      finalData.quantity = Number(formData.quantity);
      
      // Construct single default variant payload to update backend
      finalData.variants = [{
        _id: originalDefaultVariantId || undefined,
        sku: `SKU-${formData.heading.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "")}-${productId.slice(-4)}`,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        images: [productImages[0]],
        attributes: []
      }];
    }

    try {
      await updateProduct(productId, finalData);
      navigate(`/admin/products/${productId}`, {
        state: { message: "Product details updated successfully", type: "success" }
      });
    } catch (err) {
      showToast("Failed to update product details", "error");
      console.error(err);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
        <Loader2 className="animate-spin text-[#088178] w-8 h-8 mb-4" />
        <p className="text-sm font-semibold text-gray-505 animate-pulse">
          Loading product record editor...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Toast Alert Widget */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-xl bg-white border border-gray-150 shadow-xl animate-slideIn">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              toast.type === "success"
                ? "bg-green-50 text-green-600 border border-green-100"
                : "bg-red-50 text-red-655 border border-red-100"
            }`}
          >
            {toast.type === "success" ? <Check size={14} /> : <X size={14} />}
          </div>
          <span className="text-sm font-bold text-gray-800">{toast.message}</span>
        </div>
      )}

      {/* Header back button */}
      <div className="mb-4 text-left">
        <Link
          to={`/admin/products/${productId}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft size={14} />
          Cancel and Go Back
        </Link>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-slate-100 rounded-xl sm:rounded-2xl p-4 sm:p-8 relative overflow-hidden shadow-sm shadow-slate-100/40">
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#15877F] to-[#088178]"></div>

        <div className="mb-6 text-left">
          <h2 className="text-lg font-extrabold text-gray-900 leading-tight">
            Edit Product details
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Modify details and configure variants for this catalog item.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Form Fields: 8 columns */}
            <div className="md:col-span-8 space-y-4">
              {/* Grid for Category & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-gray-655 uppercase tracking-wider text-left">
                    Category Type
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                      <Tag size={15} />
                    </span>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleCategoryChange}
                      required
                      className="w-full pl-9.5 pr-8 py-2.5 rounded-xl border border-slate-100 bg-slate-50/70 focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none transition-all text-xs font-semibold text-gray-700 appearance-none cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-450 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 text-xs font-bold text-gray-655 uppercase tracking-wider text-left">
                    Brand
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                      <Layers size={15} />
                    </span>
                    <select
                      name="brandId"
                      value={formData.brandId}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.categoryId}
                      className="w-full pl-9.5 pr-8 py-2.5 rounded-xl border border-slate-100 bg-slate-50/70 focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none transition-all text-xs font-semibold text-gray-700 appearance-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="">Select Brand</option>
                      {brands.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-455 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Title */}
              <InputField
                label="Product Title Name"
                name="heading"
                value={formData.heading}
                onChange={handleInputChange}
                placeholder="Sony Headphones"
                icon={Heading}
              />
            </div>

            {/* Live Image Preview: 4 columns */}
            <div className="md:col-span-4 flex flex-col items-center justify-start border-l border-slate-100 pl-0 md:pl-6 pt-4 md:pt-0">
              <label className="block mb-2 text-xs font-bold text-gray-650 uppercase tracking-wider text-center w-full">
                Primary Image Preview
              </label>
              <div className="w-full aspect-square max-w-[200px] border border-slate-105 rounded-2xl bg-slate-50/50 flex items-center justify-center p-3 overflow-hidden relative">
                {productImages[0] && !imgLoadError ? (
                  <img
                    src={productImages[0]}
                    alt="Preview"
                    onError={() => setImgLoadError(true)}
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 text-center p-4">
                    <ImageIcon size={32} className="mb-2 text-gray-300" />
                    <span className="text-[10px] font-semibold leading-normal">
                      {imgLoadError ? "Broken/Invalid Image URL" : "No Image URL entered"}
                    </span>
                  </div>
                )}
              </div>
              {productImages[0] && !imgLoadError && (
                <span className="text-[9px] text-green-600 font-bold mt-2.5 flex items-center gap-1">
                  ✓ Image URL valid
                </span>
              )}
            </div>
          </div>

          {/* Description Block */}
          <div className="text-left">
            <label className="block mb-1.5 text-xs font-bold text-gray-655 uppercase tracking-wider">
              Product Description Specs
            </label>
            <div className="relative">
              <span className="absolute top-2.5 left-3 text-gray-400 pointer-events-none">
                <AlignLeft size={15} />
              </span>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Describe product specifications..."
                className="w-full pl-9.5 pr-4 py-2 bg-slate-50/70 border border-slate-100 rounded-xl focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-xs font-semibold text-gray-750 resize-none transition-all duration-300"
              />
            </div>
          </div>

          {/* Variants Toggle */}
          <div className="flex items-center justify-between p-4 bg-teal-50/30 border border-teal-100 rounded-xl text-left">
            <div>
              <span className="text-sm font-bold text-slate-800 block">Configure Product Variants</span>
              <span className="text-xs text-gray-500 font-medium">Toggle this to enable multiple options like size, color, storage.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={(e) => setHasVariants(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#088178] cursor-pointer"></div>
            </label>
          </div>

          {/* Flat Product Details (Only visible if hasVariants is false) */}
          {!hasVariants && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4 animate-fadeIn">
              <InputField
                label="Price Rate (₹)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="29990"
                icon={IndianRupee}
              />
              <InputField
                label="Available Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="10"
                icon={Box}
              />
            </div>
          )}

          {/* Unified Product Images Manager */}
          {!hasVariants && (
            <div className="space-y-4 border-t border-slate-100 pt-5 mt-4 animate-fadeIn">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="space-y-0.5 text-left">
                  <label className="block text-xs font-bold text-gray-655 uppercase tracking-wider">
                    Product Images ({productImages.length}/6)
                  </label>
                  <p className="text-[10px] text-gray-450 font-medium">
                    The first image will automatically be set as the Primary Cover.
                  </p>
                </div>
                
                {productImages.length < 6 && (
                  <div className="flex gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setImageInputMethod("upload")}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all cursor-pointer ${
                        imageInputMethod === "upload"
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-gray-550 hover:text-gray-800"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMethod("url")}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all cursor-pointer ${
                        imageInputMethod === "url"
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-gray-555 hover:text-gray-800"
                      }`}
                    >
                      Image Link URL
                    </button>
                  </div>
                )}
              </div>

              {productImages.length < 6 ? (
                imageInputMethod === "upload" ? (
                  <label className="w-full h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-3 hover:border-[#088178] hover:bg-[#088178]/5 transition-all cursor-pointer">
                    {uploading ? (
                      <div className="flex flex-col items-center justify-center text-[#088178]">
                        <Loader2 className="animate-spin mb-1.5" size={20} />
                        <span className="text-[10px] font-semibold">Uploading to Cloudinary...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 text-center">
                        <Upload className="mb-1" size={20} />
                        <span className="text-[11px] font-bold text-gray-500">Upload Product Photos</span>
                        <span className="text-[9px] text-gray-400 mt-0.5">Select up to {6 - productImages.length} more file(s)</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                        <LinkIcon size={14} />
                      </span>
                      <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Paste image link URL here..."
                        className="w-full pl-8.5 pr-3 py-1.5 rounded-lg border border-slate-100 bg-slate-50/70 focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none transition-all text-xs font-semibold text-gray-755 placeholder-gray-400 h-[32px]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addImageUrl}
                      className="px-4 py-1 bg-[#088178] hover:bg-[#06635c] text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center h-[32px]"
                    >
                      Add URL
                    </button>
                  </div>
                )
              ) : (
                <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-xl text-center text-xs font-semibold text-teal-800">
                  Maximum photo limit of 6 reached. Delete existing ones to add different images.
                </div>
              )}

              {productImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-start pt-1">
                  {productImages.map((url, index) => (
                    <div
                      key={index}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`relative aspect-square border rounded-xl bg-gray-50 flex items-center justify-center p-1.5 overflow-hidden shadow-sm group transition-all cursor-grab active:cursor-grabbing ${
                        index === 0 ? "border-[#088178]/40 ring-2 ring-[#088178]/5" : "border-slate-150"
                      } ${draggedIndex === index ? "opacity-40 border-[#088178] border-dashed" : ""}`}
                    >
                      <img
                        src={url}
                        alt={`Product Photo ${index + 1}`}
                        className="w-full h-full object-contain rounded-lg"
                      />
                      {index === 0 && (
                        <div className="absolute top-1 left-1.5 bg-[#088178] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">
                          PRIMARY
                        </div>
                      )}
                      <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1.5 right-1.5 w-5.5 h-5.5 bg-white border border-gray-150 hover:border-red-500 text-gray-500 hover:text-white hover:bg-red-500 rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer z-10"
                          title="Delete image"
                        >
                          <X size={12} strokeWidth={3} />
                        </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Variant Configurations */}
          {hasVariants && (
            <div className="space-y-6 border-t border-slate-100 pt-5 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  Configure Options
                </h3>
                <button
                  type="button"
                  onClick={handleAddOptionField}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#088178]/10 hover:bg-[#088178]/20 text-[#088178] text-[11px] font-bold rounded-lg transition cursor-pointer"
                >
                  <Plus size={12} /> Add Option Type
                </button>
              </div>

              {/* Options List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {options.map((option, idx) => (
                  <OptionInput
                    key={idx}
                    option={option}
                    onChangeName={(val) => handleOptionNameChange(idx, val)}
                    onAddValue={(val) => handleAddOptionValue(idx, val)}
                    onRemoveValue={(valIdx) => handleRemoveOptionValue(idx, valIdx)}
                    onRemoveOption={() => handleRemoveOptionField(idx)}
                  />
                ))}
              </div>

              {/* Variants Matrix */}
              {variants.length > 0 && (
                <div className="space-y-4 mt-6">
                  <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/50 flex flex-col sm:flex-row gap-3.5 sm:items-center justify-between">
                    <div className="text-left flex items-start gap-2">
                      <Info size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Generated Variants Matrix ({variants.length} combinations)</span>
                        <span className="text-[10px] text-gray-500 font-medium">Use bulk editor below or edit individual variant fields below.</span>
                      </div>
                    </div>
                    
                    {/* Bulk editing bar */}
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="number"
                        placeholder="Price (₹)"
                        value={bulkPrice}
                        onChange={(e) => setBulkPrice(e.target.value)}
                        className="px-2.5 py-1 text-xs border rounded-lg max-w-[90px] font-semibold bg-white"
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        value={bulkQty}
                        onChange={(e) => setBulkQty(e.target.value)}
                        className="px-2.5 py-1 text-xs border rounded-lg max-w-[70px] font-semibold bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleApplyBulk}
                        className="px-3 py-1 bg-slate-800 text-white hover:bg-black text-[11px] font-bold rounded-lg transition cursor-pointer"
                      >
                        Apply to All
                      </button>
                    </div>
                  </div>

                  {/* Table View of Variants */}
                  <div className="overflow-x-auto border border-slate-100 rounded-xl bg-white shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-slate-100">
                          <th className="py-2.5 px-4 w-12 text-center">Image</th>
                          <th className="py-2.5 px-4">Variant Attributes</th>
                          <th className="py-2.5 px-4">Price (₹)</th>
                          <th className="py-2.5 px-4">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                        {variants.map((v, vIdx) => {
                          const name = v.attributes.map(a => a.value).join(" • ");
                          return (
                            <tr key={vIdx} className="hover:bg-slate-50/20">
                              <td className="py-2.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => setActiveImagePickerVariant(vIdx)}
                                  title="Choose or upload variant image"
                                  className="relative w-8 h-8 rounded border bg-slate-50 border-dashed hover:border-[#088178] hover:bg-[#088178]/5 transition-all flex items-center justify-center overflow-hidden cursor-pointer mx-auto"
                                >
                                  {uploadingVariantIndex === vIdx ? (
                                    <Loader2 className="animate-spin text-[#088178] w-4 h-4" />
                                  ) : v.images && v.images.length > 0 ? (
                                    <img
                                      src={v.images[0]}
                                      alt="Variant"
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <ImageIcon size={14} className="text-gray-400" />
                                  )}
                                </button>
                              </td>
                              <td className="py-2.5 px-4 text-slate-800 font-bold">{name}</td>
                              <td className="py-2.5 px-4">
                                <input
                                  type="number"
                                  value={v.price}
                                  onChange={(e) => handleVariantChange(vIdx, "price", e.target.value)}
                                  placeholder="Price"
                                  className="px-2 py-1 text-xs border rounded w-[80px] bg-white font-medium"
                                />
                              </td>
                              <td className="py-2.5 px-4">
                                <input
                                  type="number"
                                  value={v.quantity}
                                  onChange={(e) => handleVariantChange(vIdx, "quantity", e.target.value)}
                                  placeholder="Stock"
                                  className="px-2 py-1 text-xs border rounded w-[65px] bg-white font-medium"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Row */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Link
              to={`/admin/products/${productId}`}
              className="px-5 py-2.5 bg-slate-50 border border-slate-200 text-gray-700 hover:bg-slate-100 text-xs font-bold rounded-xl transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#088178] hover:bg-[#06635c] text-white text-xs font-bold rounded-xl shadow-md shadow-[#088178]/10 hover:shadow-lg hover:shadow-[#088178]/15 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin w-3.5 h-3.5" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Save Product Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Variant Image Selector Modal */}
      {activeImagePickerVariant !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setActiveImagePickerVariant(null)}
          />
          <div className="bg-white border border-gray-150 rounded-2xl max-w-md w-full p-6 shadow-2xl z-10 relative overflow-hidden animate-slideUp text-left">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#088178]"></div>
            
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-extrabold text-gray-900 text-sm">
                Manage Variant Media Images
              </h3>
              <button
                type="button"
                onClick={() => setActiveImagePickerVariant(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-4 bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg truncate">
              Variant: {variants[activeImagePickerVariant]?.attributes.map(a => a.value).join(" • ")}
            </p>

            {/* Current Variant Images Grid */}
            <div className="space-y-2.5 mb-4">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Variant Photo Gallery ({(variants[activeImagePickerVariant]?.images || []).length}/6)
              </label>
              
              {(!variants[activeImagePickerVariant]?.images || variants[activeImagePickerVariant].images.length === 0) ? (
                <p className="text-[10px] text-gray-400 font-semibold italic bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                  No variant-specific photos uploaded yet. Upload or add link URLs below.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(variants[activeImagePickerVariant].images).map((url, idx) => (
                    <div
                      key={idx}
                      draggable={true}
                      onDragStart={(e) => handleVariantImgDragStart(e, idx)}
                      onDragOver={handleVariantImgDragOver}
                      onDrop={(e) => handleVariantImgDrop(e, idx, activeImagePickerVariant)}
                      onDragEnd={handleVariantImgDragEnd}
                      className={`relative aspect-square border rounded-lg bg-slate-50 p-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing ${
                        idx === 0 ? "border-[#088178]/40 ring-1 ring-[#088178]/5" : "border-slate-200"
                      } ${draggedVariantImgIndex === idx ? "opacity-40 border-[#088178] border-dashed" : ""}`}
                    >
                      <img src={url} alt="Variant media" className="w-full h-full object-contain rounded-md" />
                      {idx === 0 && (
                        <div className="absolute top-0.5 left-1 bg-[#088178] text-white text-[6px] font-extrabold px-1 rounded-sm">
                          COVER
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeVariantImage(activeImagePickerVariant, idx)}
                        className="absolute top-1 right-1 w-4.5 h-4.5 bg-white border border-gray-150 hover:border-red-500 text-gray-500 hover:text-white hover:bg-red-500 rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer z-10"
                        title="Delete image"
                      >
                        <X size={10} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 my-4"></div>

            {/* Upload / Link Inputs */}
            {(variants[activeImagePickerVariant]?.images || []).length < 6 ? (
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Add Photos
                  </span>
                  
                  <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setVariantImageInputMethod("upload")}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                        variantImageInputMethod === "upload"
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-gray-555 hover:text-gray-800"
                      }`}
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setVariantImageInputMethod("url")}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                        variantImageInputMethod === "url"
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-gray-555 hover:text-gray-800"
                      }`}
                    >
                      Link URL
                    </button>
                  </div>
                </div>

                {variantImageInputMethod === "upload" ? (
                  <label className="w-full h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-2.5 hover:border-[#088178] hover:bg-[#088178]/5 transition-all cursor-pointer">
                    {uploadingVariantIndex === activeImagePickerVariant ? (
                      <div className="flex flex-col items-center justify-center text-[#088178]">
                        <Loader2 className="animate-spin mb-1" size={16} />
                        <span className="text-[9px] font-semibold">Uploading to Cloudinary...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 text-center">
                        <Upload className="mb-0.5" size={16} />
                        <span className="text-[10px] font-bold text-gray-500">Upload Variant Photos</span>
                        <span className="text-[8px] text-gray-400 mt-0.5">Select up to {6 - (variants[activeImagePickerVariant]?.images || []).length} file(s)</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploadingVariantIndex !== null}
                      onChange={(e) => handleVariantImagesUpload(e, activeImagePickerVariant)}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                        <LinkIcon size={13} />
                      </span>
                      <input
                        type="text"
                        value={variantUrlInput}
                        onChange={(e) => setVariantUrlInput(e.target.value)}
                        placeholder="Paste photo link URL..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 focus:border-[#088178] outline-none text-xs bg-white placeholder-gray-400 font-medium h-[32px]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => addVariantImageUrl(activeImagePickerVariant)}
                      className="px-3 py-1 bg-[#088178] hover:bg-[#06635c] text-white text-xs font-bold rounded-lg transition h-[32px] cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2.5 bg-teal-50/50 border border-teal-100 rounded-xl text-center text-[10px] font-semibold text-teal-800">
                Variant maximum photos limit of 6 reached.
              </div>
            )}

            <div className="flex justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setActiveImagePickerVariant(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-black text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Option input component for dynamic chips/values
const OptionInput = ({ option, onChangeName, onAddValue, onRemoveValue, onRemoveOption }) => {
  const [inputValue, setInputValue] = useState("");
  
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = inputValue.trim().replace(/,/g, "");
      if (val && !option.values.includes(val)) {
        onAddValue(val);
        setInputValue("");
      }
    }
  };

  const handleAddClick = () => {
    const val = inputValue.trim();
    if (val && !option.values.includes(val)) {
      onAddValue(val);
      setInputValue("");
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 relative text-left shadow-sm">
      <button
        type="button"
        onClick={onRemoveOption}
        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 cursor-pointer"
      >
        <X size={15} />
      </button>
      
      <div>
        <label className="block mb-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          Option Name (e.g. Size)
        </label>
        <input
          type="text"
          value={option.name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="e.g. Color, Size, Storage"
          className="w-full px-3 py-1.5 rounded-lg border border-gray-250 focus:border-[#088178] outline-none text-xs font-semibold bg-white"
        />
      </div>

      <div>
        <label className="block mb-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          Option Values
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2 max-h-24 overflow-y-auto">
          {option.values.map((val, vIdx) => (
            <span
              key={vIdx}
              className="inline-flex items-center gap-1.5 bg-[#e8f6ea] text-[#088178] text-[10px] font-bold px-2 py-1 rounded"
            >
              {val}
              <button
                type="button"
                onClick={() => onRemoveValue(vIdx)}
                className="hover:text-red-500 cursor-pointer flex items-center justify-center"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add value (press Enter)"
            className="flex-1 px-3 py-1.5 rounded-lg border border-gray-250 focus:border-[#088178] outline-none text-xs font-semibold bg-white"
          />
          <button
            type="button"
            onClick={handleAddClick}
            className="px-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable input component with icons
const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
}) => (
  <div>
    <label className="block mb-1.5 text-xs font-bold text-gray-655 uppercase tracking-wider text-left">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
          <Icon size={15} />
        </span>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        className={`w-full ${
          Icon ? "pl-9" : "px-3"
        } pr-4 py-2 bg-slate-50/70 border border-slate-100 rounded-xl focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-xs font-semibold text-gray-700 transition-all duration-300`}
      />
    </div>
  </div>
);

export default ProductEdit;
