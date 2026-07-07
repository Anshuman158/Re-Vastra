import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backEndURL, currency } from "../App";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";
import { Upload, Package, MapPin, Phone, Tag, Layers, FileText, Star, Check, X, Image } from "lucide-react";

const Add = ({ token }) => {
  const { darkMode } = useTheme();
  const [images, setImages] = useState([null, null, null, null]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestSeller, setBestSeller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [rental_price, setRentalPrice] = useState("");
  const [pickuplocation, setPickupLocation] = useState("");
  const [contactno, setContactNo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      images.forEach(image => image && URL.revokeObjectURL(URL.createObjectURL(image)));
    };
  }, []);

  const handleImageChange = (index, file) => {
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    const hasImage = images.some(img => img !== null);
    if (!hasImage) { toast.error("Please upload at least one image."); return; }
    if (sizes.length === 0) { toast.error("Please select at least one size."); return; }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("rental_price", rental_price);
      formData.append("subCategory", subCategory);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("pickuplocation", pickuplocation);
      formData.append("contactno", contactno);
      formData.append("bestSeller", bestSeller);

      images.forEach((image, index) => {
        if (image) formData.append(`image${index + 1}`, image);
      });

      const response = await axios.post(backEndURL + "/api/product/add", formData, { headers: { token } });

      if (response.data.success) {
        toast.success("Product added successfully!");
        setName(""); setDescription(""); setImages([null, null, null, null]);
        setPrice(""); setRentalPrice(""); setPickupLocation("");
        setContactNo(""); setSizes([]); setBestSeller(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-red-500 focus:border-transparent ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`;
  const labelClass = `text-sm font-medium mb-2 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className="py-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Add New Product</h1>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>List a new item for rental on the platform</p>
      </div>

      <form onSubmit={onSubmitHandler} className="space-y-8">
        {/* Image Upload Section */}
        <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <Image size={20} className="text-red-500" /> Product Images
          </h2>
          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Upload up to 4 images. First image will be the main display.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <label
                  htmlFor={`image${index + 1}`}
                  className={`flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${image
                    ? 'border-green-500'
                    : darkMode
                      ? 'border-gray-600 hover:border-red-500 bg-gray-700'
                      : 'border-gray-300 hover:border-red-500 bg-gray-50'
                    }`}
                >
                  {image ? (
                    <img
                      className="w-full h-full object-cover rounded-xl"
                      src={URL.createObjectURL(image)}
                      alt={`Upload ${index + 1}`}
                    />
                  ) : (
                    <div className="text-center">
                      <Upload size={32} className={`mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {index === 0 ? 'Main Image' : `Image ${index + 1}`}
                      </span>
                    </div>
                  )}
                  <input
                    onChange={(e) => handleImageChange(index, e.target.files[0])}
                    type="file"
                    id={`image${index + 1}`}
                    accept="image/*"
                    hidden
                  />
                </label>
                {image && (
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X size={14} />
                  </button>
                )}
                {index === 0 && image && (
                  <span className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">Main</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Product Details Section */}
        <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h2 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <Package size={20} className="text-red-500" /> Product Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}><Tag size={16} /> Product Name</label>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className={inputClass}
                type="text"
                placeholder="e.g., Designer Kurta Set"
                required
              />
            </div>

            <div>
              <label className={labelClass}>{currency} Original Price</label>
              <input
                onChange={(e) => setPrice(e.target.value)}
                value={price}
                className={inputClass}
                type="number"
                placeholder="e.g., 2500"
                required
              />
            </div>

            <div>
              <label className={labelClass}>{currency} Rental Price / Day</label>
              <input
                onChange={(e) => setRentalPrice(e.target.value)}
                value={rental_price}
                className={inputClass}
                type="number"
                placeholder="e.g., 150"
                required
              />
            </div>

            <div>
              <label className={labelClass}><MapPin size={16} /> Pickup Location</label>
              <input
                onChange={(e) => setPickupLocation(e.target.value)}
                value={pickuplocation}
                className={inputClass}
                type="text"
                placeholder="e.g., LPU Campus, Block 34"
                required
              />
            </div>

            <div>
              <label className={labelClass}><Phone size={16} /> Contact Number</label>
              <input
                onChange={(e) => setContactNo(e.target.value)}
                value={contactno}
                className={inputClass}
                type="tel"
                placeholder="e.g., 9876543210"
                required
              />
            </div>

            <div>
              <label className={labelClass}><Layers size={16} /> Category</label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  onChange={(e) => setCategory(e.target.value)}
                  value={category}
                  className={inputClass}
                  required
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                </select>
                <select
                  onChange={(e) => setSubCategory(e.target.value)}
                  value={subCategory}
                  className={inputClass}
                  required
                >
                  <optgroup label="Clothing">
                    <option value="Topwear">Topwear (T-shirts, Shirts)</option>
                    <option value="Bottomwear">Bottomwear (Jeans, Trousers)</option>
                    <option value="Ethnic">Ethnic Wear (Kurta, Saree)</option>
                    <option value="Dresses">Dresses & Gowns</option>
                    <option value="Outerwear">Outerwear (Jackets, Blazers)</option>
                    <option value="Winterwear">Winterwear (Sweaters)</option>
                  </optgroup>
                  <optgroup label="Accessories">
                    <option value="Footwear">Footwear (Shoes, Heels)</option>
                    <option value="Bags">Bags & Purses</option>
                    <option value="Jewelry">Jewelry & Watches</option>
                    <option value="Accessories">Other Accessories</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className={labelClass}><FileText size={16} /> Description</label>
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              className={`${inputClass} min-h-[120px] resize-none`}
              placeholder="Describe the product, its condition, and any special features..."
              required
            />
          </div>
        </div>

        {/* Sizes Section */}
        <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <Layers size={20} className="text-red-500" /> Available Sizes
          </h2>
          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Select all sizes that are available for this item</p>

          <div className="flex flex-wrap gap-3">
            {["XS", "S", "M", "L", "XL", "XXL", "Free Size"].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size])}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${sizes.includes(size)
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {sizes.includes(size) && <Check size={16} className="inline mr-1" />}
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Options & Submit */}
        <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <label className={`flex items-center gap-3 cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                onChange={() => setBestSeller((prev) => !prev)}
                checked={bestSeller}
                type="checkbox"
                className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-500"
              />
              <div>
                <span className="font-medium flex items-center gap-1"><Star size={16} className="text-yellow-500" /> Feature as Best Seller</span>
                <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Show this product on homepage</span>
              </div>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30 hover:shadow-xl'
                }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Package size={18} /> Add Product
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Add;
