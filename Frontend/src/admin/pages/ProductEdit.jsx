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
    onSale: false,
    salePrice: "",
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
  const [imageSyncAttribute, setImageSyncAttribute] = useState("");

  // Variant States
  const [hasVariants, setHasVariants] = useState(false);
  const [options, setOptions] = useState([{ name: "", values: [] }]);
  const [variants, setVariants] = useState([]);
  const [excludedVariantKeys, setExcludedVariantKeys] = useState([]);

  const getVariantKey = (attributes) => attributes.map(a => a.value.trim().toLowerCase()).sort().join("|");

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
            
            // Calculate originally excluded combinations
            const combos = generateCombinations(product.options);
            const loadedKeys = (product.variants || []).map(v => getVariantKey(v.attributes));
            const initiallyExcluded = [];
            combos.forEach(combo => {
              const key = getVariantKey(combo);
              if (!loadedKeys.includes(key)) {
                initiallyExcluded.push(key);
              }
            });
            setExcludedVariantKeys(initiallyExcluded);

            setFormData({
              categoryId: categoryId || "",
              brandId: product.brandId?._id || product.brandId || "",
              heading: product.heading || "",
              price: "",
              quantity: "",
              description: product.description || "",
              onSale: product.onSale || false,
              salePrice: product.salePrice || "",
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
              onSale: product.onSale || false,
              salePrice: product.salePrice || "",
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
      const currentUser = JSON.parse(localStorage.getItem("user")) || {};
      const isVendorUser = currentUser.role === "vendor";
      document.title = `YoCart | ${isVendorUser ? "Seller" : "Admin"} - Edit ${formData.heading}`;
    }
  }, [formData.heading]);

  // Auto-detect Color option as default image sync link
  useEffect(() => {
    const colorOpt = options.find(o => o.name && (o.name.toLowerCase().includes("color") || o.name.toLowerCase().includes("colour")));
    if (colorOpt) {
      setImageSyncAttribute(colorOpt.name);
    } else {
      setImageSyncAttribute("");
    }
  }, [options]);

  const triggerImageSyncAll = (syncAttrName) => {
    if (!syncAttrName) return;
    setVariants((prev) => {
      const imageMap = {};
      prev.forEach((v) => {
        const attr = v.attributes.find(a => a.name === syncAttrName);
        if (attr && v.images && v.images.length > 0) {
          if (!imageMap[attr.value]) {
            imageMap[attr.value] = v.images;
          }
        }
      });

      return prev.map((v) => {
        const attr = v.attributes.find(a => a.name === syncAttrName);
        if (attr && imageMap[attr.value]) {
          return { ...v, images: [...imageMap[attr.value]] };
        }
        return v;
      });
    });
  };

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
      e.target.value = "";
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
      e.target.value = "";
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

    // Filter out any generated combinations that are in excludedVariantKeys
    const filteredVariants = newVariants.filter(v => {
      const key = getVariantKey(v.attributes);
      return !excludedVariantKeys.includes(key);
    });
    
    setVariants(filteredVariants);
  }, [options, hasVariants, formData.heading, formData.brandId, excludedVariantKeys]);

  const handleExcludeVariant = (vIdx) => {
    const variantToExclude = variants[vIdx];
    if (!variantToExclude) return;
    const key = getVariantKey(variantToExclude.attributes);
    setExcludedVariantKeys(prev => [...prev, key]);
    showToast("Variant combination excluded from matrix list.", "success");
  };

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
    if (!imageSyncAttribute) return variantsList;

    const changedVariant = variantsList[changedVariantIdx];
    if (!changedVariant || !changedVariant.attributes || changedVariant.attributes.length === 0) return variantsList;

    const syncAttr = changedVariant.attributes.find(a => a.name === imageSyncAttribute);
    if (!syncAttr) return variantsList;

    const syncValue = syncAttr.value;

    return variantsList.map((v, idx) => {
      if (idx === changedVariantIdx) return v;

      const matchingAttr = v.attributes.find(a => a.name === imageSyncAttribute);
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
        onSale: !!v.onSale,
        salePrice: v.onSale ? Number(v.salePrice || 0) : 0,
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
      finalData.onSale = !!formData.onSale;
      finalData.salePrice = formData.onSale ? Number(formData.salePrice || 0) : 0;
      
      // Construct single default variant payload to update backend
      finalData.variants = [{
        _id: originalDefaultVariantId || undefined,
        sku: `SKU-${formData.heading.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "")}-${productId.slice(-4)}`,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        images: [productImages[0]],
        attributes: [],
        onSale: !!formData.onSale,
        salePrice: formData.onSale ? Number(formData.salePrice || 0) : 0,
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
  };  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12 bg-soft-bg/30">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-xs font-semibold text-muted-gray animate-pulse">
          Loading product record editor...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-dark-navy antialiased">
      {/* Toast Alert Widget */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-50 bg-dark-navy border border-light-border/10 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center ${
              toast.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {toast.type === "success" ? <Check size={12} /> : <X size={12} />}
          </div>
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header back button */}
      <div className="mb-6 text-left">
        <Link
          to={`/admin/products/${productId}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-light-border hover:bg-slate-50 text-muted-gray hover:text-dark-navy text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
        >
          <ArrowLeft size={14} />
          Cancel and Go Back
        </Link>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-light-border/60 rounded-3xl p-5 sm:p-8 relative overflow-hidden shadow-2xs">
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-accent"></div>

        <div className="mb-6 border-b border-light-border/40 pb-5 text-left">
          <h2 className="text-xl font-extrabold text-dark-navy tracking-tight">
            Edit Product details
          </h2>
          <p className="text-xs text-muted-gray font-semibold mt-1">
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
                  <label className="block mb-1.5 text-xs font-extrabold text-muted-gray uppercase tracking-widest text-left">
                    Category Type
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
                      <Tag size={15} />
                    </span>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleCategoryChange}
                      required
                      className="w-full pl-9.5 pr-8 py-2.5 rounded-xl border border-light-border bg-slate-50/70 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-xs font-semibold text-dark-navy appearance-none cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-gray pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 text-xs font-extrabold text-muted-gray uppercase tracking-widest text-left">
                    Brand
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
                      <Layers size={15} />
                    </span>
                    <select
                      name="brandId"
                      value={formData.brandId}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.categoryId}
                      className="w-full pl-9.5 pr-8 py-2.5 rounded-xl border border-light-border bg-slate-50/70 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-xs font-semibold text-dark-navy appearance-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="">Select Brand</option>
                      {brands.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-gray pointer-events-none">
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
            <label className="block mb-1.5 text-xs font-extrabold text-muted-gray uppercase tracking-widest">
              Product Description Specs
            </label>
            <div className="relative">
              <span className="absolute top-3.5 left-3.5 text-muted-gray pointer-events-none">
                <AlignLeft size={15} />
              </span>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Describe product specifications..."
                className="w-full pl-9.5 pr-4 py-3.5 bg-white border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy resize-none transition-all duration-300"
              />
            </div>
          </div>

          {/* Variants Toggle */}
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-2xl text-left">
            <div>
              <span className="text-xs font-extrabold text-dark-navy block uppercase tracking-wider">Configure Product Variants</span>
              <span className="text-[11px] text-muted-gray font-semibold mt-0.5 block leading-normal">Toggle this to enable multiple options like size, color, storage.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={(e) => setHasVariants(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary cursor-pointer"></div>
            </label>
          </div>

          {/* Flat Product Details (Only visible if hasVariants is false) */}
          {!hasVariants && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-light-border/40 pt-4 animate-fadeIn">
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
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-orange-50/50 border border-orange-100/50 sm:col-span-2 select-none">
                <input
                  type="checkbox"
                  id="onSale"
                  name="onSale"
                  checked={formData.onSale || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, onSale: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="onSale" className="text-xs font-bold text-dark-navy cursor-pointer select-none">
                  Include in Festive Sale
                </label>
              </div>
              {formData.onSale && (
                <InputField
                  label="Special Sale Price (₹)"
                  name="salePrice"
                  type="number"
                  value={formData.salePrice}
                  onChange={handleInputChange}
                  placeholder="19990"
                  icon={IndianRupee}
                />
              )}
            </div>
          )}

          {/* Unified Product Images Manager */}
          {!hasVariants && (
            <div className="space-y-4 border-t border-light-border/40 pt-5 mt-4 animate-fadeIn">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="space-y-0.5 text-left">
                  <label className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest">
                    Product Images ({productImages.length}/6)
                  </label>
                  <p className="text-[10px] text-muted-gray font-semibold mt-0.5 block leading-normal">
                    The first image will automatically be set as the Primary Cover.
                  </p>
                </div>
                
                {productImages.length < 6 && (
                  <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl border border-light-border/40">
                    <button
                      type="button"
                      onClick={() => setImageInputMethod("upload")}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        imageInputMethod === "upload"
                          ? "bg-white text-dark-navy shadow-xs"
                          : "text-muted-gray hover:text-dark-navy"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMethod("url")}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        imageInputMethod === "url"
                          ? "bg-white text-dark-navy shadow-xs"
                          : "text-muted-gray hover:text-dark-navy"
                      }`}
                    >
                      Image Link URL
                    </button>
                  </div>
                )}
              </div>

              {productImages.length < 6 ? (
                imageInputMethod === "upload" ? (
                  <label className="w-full h-24 border-2 border-dashed border-light-border hover:border-primary hover:bg-primary/5 rounded-2xl flex flex-col items-center justify-center p-3 transition-all cursor-pointer">
                    {uploading ? (
                      <div className="flex flex-col items-center justify-center text-primary">
                        <Loader2 className="animate-spin mb-1.5" size={20} />
                        <span className="text-[10px] font-bold">Uploading to Cloudinary...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-gray text-center">
                        <Upload className="mb-1" size={20} />
                        <span className="text-[11px] font-extrabold text-dark-navy uppercase tracking-wider">Upload Product Photos</span>
                        <span className="text-[9px] mt-0.5 font-semibold">Select up to {6 - productImages.length} more file(s)</span>
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
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
                        <LinkIcon size={14} />
                      </span>
                      <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Paste image link URL here..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-light-border focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-dark-navy text-xs bg-white placeholder-muted-gray/50 font-semibold h-[36px]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addImageUrl}
                      className="px-4 py-1.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center h-[36px]"
                    >
                      Add URL
                    </button>
                  </div>
                )
              ) : (
                <div className="p-3 bg-primary/5 border border-primary/10 rounded-2xl text-center text-xs font-bold text-primary">
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
                  <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/50 flex flex-col gap-3.5">
                    <div className="flex flex-col sm:flex-row gap-3.5 sm:items-center justify-between">
                      <div className="text-left flex items-start gap-2">
                        <Info size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-slate-700 block">Generated Variants Matrix ({variants.length} combinations)</span>
                          <span className="text-[10px] text-gray-500 font-medium">Use bulk editor below or edit individual variant fields below. You can also exclude combinations that are not sold.</span>
                        </div>
                      </div>
                      
                      {/* Bulk editing bar */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Image Sync Dropdown */}
                        <div className="flex items-center gap-1.5 mr-2">
                          <label className="text-[11px] font-bold text-slate-650 whitespace-nowrap">Link Images By:</label>
                          <div className="relative">
                            <select
                              value={imageSyncAttribute}
                              onChange={(e) => {
                                const val = e.target.value;
                                setImageSyncAttribute(val);
                                triggerImageSyncAll(val);
                              }}
                              className="appearance-none pl-2.5 pr-7 py-1 text-xs border border-slate-200 rounded-lg bg-white font-semibold cursor-pointer outline-none focus:border-slate-400 focus:ring-2 focus:ring-primary/5 h-[26px]"
                            >
                              <option value="">Individual Images</option>
                              {options.filter(o => o.name).map((o, idx) => (
                                <option key={idx} value={o.name}>{o.name}</option>
                              ))}
                            </select>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </span>
                          </div>
                        </div>
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

                    {/* Excluded combinations pills */}
                    {excludedVariantKeys.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-dashed border-slate-200">
                        <span className="text-[10px] font-extrabold text-muted-gray uppercase tracking-wider">Excluded ({excludedVariantKeys.length}):</span>
                        {excludedVariantKeys.map((key) => {
                          const label = key.split("|").map(val => val.charAt(0).toUpperCase() + val.slice(1)).join(" • ");
                          return (
                            <span
                              key={key}
                              onClick={() => setExcludedVariantKeys(prev => prev.filter(k => k !== key))}
                              className="inline-flex items-center gap-1 bg-rose-50 border border-rose-100 hover:border-emerald-500 hover:bg-emerald-50 text-rose-600 hover:text-emerald-600 text-[10px] font-extrabold px-2 py-0.5 rounded-xl cursor-pointer transition-all hover:scale-105"
                              title="Click to restore combination"
                            >
                              {label}
                              <Plus size={10} strokeWidth={3} />
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Table View of Variants */}
                  <div className="overflow-x-auto border border-slate-100 rounded-xl bg-white shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-slate-100">
                          <th className="py-2.5 px-4 w-12 text-center">Image</th>
                          <th className="py-2.5 px-4">Variant Attributes</th>
                          <th className="py-2.5 px-4">Price (₹)</th>
                          <th className="py-2.5 px-4 text-center">Sale?</th>
                          <th className="py-2.5 px-4">Sale Price (₹)</th>
                          <th className="py-2.5 px-4">Stock</th>
                          <th className="py-2.5 px-4 w-12 text-center">Exclude</th>
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
                              <td className="py-2.5 px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={v.onSale || false}
                                  onChange={(e) => handleVariantChange(vIdx, "onSale", e.target.checked)}
                                  className="h-3.5 w-3.5 rounded border-gray-300 text-orange-655 focus:ring-orange-500 cursor-pointer"
                                />
                              </td>
                              <td className="py-2.5 px-4">
                                <input
                                  type="number"
                                  value={v.salePrice || ""}
                                  disabled={!v.onSale}
                                  onChange={(e) => handleVariantChange(vIdx, "salePrice", e.target.value)}
                                  placeholder="Sale Price"
                                  className="px-2 py-1 text-xs border rounded w-[80px] bg-white font-medium disabled:bg-slate-50 disabled:text-gray-400"
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
                              <td className="py-2.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleExcludeVariant(vIdx)}
                                  className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                  title="Exclude variant combination"
                                >
                                  <Trash2 size={14} />
                                </button>
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
          <div className="flex justify-end gap-3 pt-4 border-t border-light-border/40">
            <Link
              to={`/admin/products/${productId}`}
              className="px-5 py-2.5 border border-light-border hover:bg-slate-50 text-muted-gray hover:text-dark-navy text-xs font-bold rounded-xl transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin w-3.5 h-3.5" />
                  Saving Changes...
                </>
              ) : (
                <>
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
    <div className="bg-soft-bg/85 border border-light-border/60 rounded-2xl p-4 space-y-3 relative text-left shadow-2xs">
      <button
        type="button"
        onClick={onRemoveOption}
        className="absolute top-3 right-3 text-muted-gray hover:text-red-500 cursor-pointer"
      >
        <X size={15} />
      </button>
      
      <div>
        <label className="block mb-1 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">
          Option Name (e.g. Size)
        </label>
        <input
          type="text"
          value={option.name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="e.g. Color, Size, Storage"
          className="w-full px-3.5 py-1.5 rounded-xl border border-light-border focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-semibold bg-white text-dark-navy"
        />
      </div>

      <div>
        <label className="block mb-1 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">
          Option Values
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2 max-h-24 overflow-y-auto">
          {option.values.map((val, vIdx) => (
            <span
              key={vIdx}
              className="inline-flex items-center gap-1.5 bg-primary/5 text-primary text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-primary/10 uppercase tracking-wider"
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
        <div className="flex gap-1.5 items-stretch">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add value..."
            className="flex-1 min-w-0 px-3.5 py-1.5 rounded-xl border border-light-border focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-semibold bg-white text-dark-navy h-[34px]"
          />
          <button
            type="button"
            onClick={handleAddClick}
            className="px-3 flex-shrink-0 min-w-[50px] bg-slate-100 hover:bg-slate-200 text-dark-navy text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center h-[34px]"
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
    <label className="block mb-1.5 text-xs font-extrabold text-muted-gray uppercase tracking-widest text-left">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
          <Icon size={16} />
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
          Icon ? "pl-9" : "px-4"
        } pr-4 py-2 rounded-xl border border-light-border focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-dark-navy text-sm bg-white placeholder-muted-gray/50 font-semibold h-[38px]`}
      />
    </div>
  </div>
);

export default ProductEdit;
