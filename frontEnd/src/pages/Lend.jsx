import React, { useContext, useEffect, useState } from 'react';
import { toast } from "react-toastify";
import axios from "axios";
import { ShopContext } from '../context/ShopContext';
import { Upload, CheckCircle, ChevronRight, ChevronLeft, MapPin, Phone, Info, DollarSign } from 'lucide-react';
import Title from '../components/Title';

const Lend = () => {
  const { token, backEndURL, navigate, user } = useContext(ShopContext);

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [images, setImages] = useState([null, null, null, null]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Men",
    subCategory: "Topwear",
    sizes: [],
    pickuplocation: "",
    contactno: "",
    bestSeller: false
  });

  const [pricing, setPricing] = useState({
    rentalPrice: "",
    charge: 0,
    earning: 0
  });

  // Calculate pricing automatically
  useEffect(() => {
    if (formData.price) {
      const priceNum = parseFloat(formData.price);
      let rentalPercentage = 0.08;
      let chargePercentage = 0.05;

      if (priceNum > 1000 && priceNum <= 1500) chargePercentage = 0.15;
      else if (priceNum > 1500 && priceNum <= 3000) chargePercentage = 0.20;
      else if (priceNum > 3000) chargePercentage = 0.25;

      const calculatedRentalPrice = (priceNum * rentalPercentage).toFixed(2);
      const calculatedCharge = (calculatedRentalPrice * chargePercentage).toFixed(2);
      const calculatedEarning = (calculatedRentalPrice - calculatedCharge).toFixed(2);

      setPricing({
        rentalPrice: calculatedRentalPrice,
        charge: calculatedCharge,
        earning: calculatedEarning
      });
    } else {
      setPricing({ rentalPrice: "", charge: 0, earning: 0 });
    }
  }, [formData.price]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      images.forEach(image => image && URL.revokeObjectURL(URL.createObjectURL(image)));
    };
  }, []);

  // Check if user is a seller - redirect to become-seller if not
  useEffect(() => {
    if (token && user && !user.isSeller) {
      toast.info("You need to become a seller first to list products!");
      navigate('/become-seller');
    }
  }, [token, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSizeChange = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleImageChange = (index, file) => {
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate Images
      if (!images.some(img => img)) {
        toast.error("Please upload at least one image");
        return;
      }
    }
    if (currentStep === 2) {
      // Validate Details
      if (!formData.name || !formData.description || formData.sizes.length === 0) {
        toast.error("Please fill all details and select a size");
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  // Upload image to Cloudinary directly from frontend
  const uploadToCloudinary = async (file) => {
    const cloudinaryURL = `https://api.cloudinary.com/v1_1/dwfotl87t/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'revastra_unsigned');
    formData.append('folder', 'revastra_products');

    try {
      const response = await fetch(cloudinaryURL, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Cloudinary response:', data);

      if (data.secure_url) {
        return data.secure_url;
      }

      // Show actual error from Cloudinary
      throw new Error(data.error?.message || 'Failed to upload image');
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!token) {
      toast.error("Please login to list a product");
      navigate('/login');
      return;
    }

    setIsLoading(true);

    try {
      // Upload images to Cloudinary first
      toast.info("Uploading images...");
      const imagePromises = images
        .filter(img => img !== null)
        .map(img => uploadToCloudinary(img));

      const imageUrls = await Promise.all(imagePromises);

      if (imageUrls.length === 0) {
        toast.error("Please upload at least one image");
        setIsLoading(false);
        return;
      }

      // Send product data with image URLs to backend
      const productData = {
        ...formData,
        sizes: formData.sizes,
        rental_price: pricing.rentalPrice,
        images: imageUrls, // Array of Cloudinary URLs
      };

      const response = await axios.post(`${backEndURL}/api/product/add`, productData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        toast.success("Product listed successfully!");
        navigate('/collection');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to list product");
    } finally {
      setIsLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex justify-between mb-8 relative">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-neutral-200 dark:bg-neutral-700 -z-10 rounded-full"></div>
      <div className={`absolute top-1/2 left-0 h-1 bg-primary-500 -z-10 rounded-full transition-all duration-300`}
        style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>

      {[1, 2, 3, 4].map((step) => (
        <div key={step} className={`flex flex-col items-center gap-2 bg-neutral-50 dark:bg-neutral-800 px-2`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                    ${step <= currentStep ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-neutral-200 text-neutral-500'}`}>
            {step < currentStep ? <CheckCircle size={16} /> : step}
          </div>
          <span className={`text-xs font-medium ${step <= currentStep ? 'text-primary-600' : 'text-neutral-400'}`}>
            {step === 1 ? "Photos" : step === 2 ? "Details" : step === 3 ? "Pricing" : "Review"}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container-custom py-10 min-h-[80vh]">
      <div className="max-w-3xl mx-auto bg-white dark:bg-neutral-800 rounded-2xl shadow-soft p-8 border border-neutral-100 dark:border-neutral-700">
        <div className="mb-6 text-center">
          <Title text1={"LIST YOUR"} text2={"ITEM"} />
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-[-10px]">Rent out your fashion and earn money.</p>
        </div>

        <StepIndicator />

        <form onSubmit={onSubmitHandler} className="mt-8">
          {/* Step 1: Photos */}
          {currentStep === 1 && (
            <div className="animate-fade-in space-y-6">
              <h3 className="text-xl font-display font-semibold text-neutral-800 dark:text-neutral-200">Upload Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <label key={index} className={`aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-neutral-50
                                    ${img ? 'border-primary-500 bg-primary-50/10' : 'border-neutral-300 text-neutral-400'}`}>
                    {img ? (
                      <img src={URL.createObjectURL(img)} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <>
                        <Upload size={24} className="mb-2" />
                        <span className="text-xs font-medium">Add Photo</span>
                      </>
                    )}
                    <input type="file" hidden accept="image/*" onChange={(e) => handleImageChange(index, e.target.files[0])} />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="animate-fade-in space-y-4">
              <h3 className="text-xl font-display font-semibold text-neutral-800 dark:text-neutral-200">Item Details</h3>
              <div className="space-y-4">
                <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Product Name" className="input-field" />
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" rows={3} className="input-field" />

                <div className="grid grid-cols-2 gap-4">
                  <select name="category" value={formData.category} onChange={handleInputChange} className="input-field">
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                  <select name="subCategory" value={formData.subCategory} onChange={handleInputChange} className="input-field">
                    <optgroup label="Clothing">
                      <option value="Topwear">Topwear (T-shirts, Shirts)</option>
                      <option value="Bottomwear">Bottomwear (Jeans, Trousers)</option>
                      <option value="Ethnic">Ethnic Wear (Kurta, Saree, Lehenga)</option>
                      <option value="Dresses">Dresses & Gowns</option>
                      <option value="Outerwear">Outerwear (Jackets, Blazers)</option>
                      <option value="Winterwear">Winterwear (Sweaters, Hoodies)</option>
                    </optgroup>
                    <optgroup label="Accessories">
                      <option value="Footwear">Footwear (Shoes, Heels)</option>
                      <option value="Bags">Bags & Purses</option>
                      <option value="Jewelry">Jewelry & Watches</option>
                      <option value="Accessories">Other Accessories</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <p className="mb-2 font-medium text-neutral-700 dark:text-neutral-300">Select Sizes</p>
                  <div className="flex gap-2 flex-wrap">
                    {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                      <button type="button" key={size} onClick={() => handleSizeChange(size)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${formData.sizes.includes(size) ? 'bg-primary-500 text-white border-primary-500' : 'bg-white border-neutral-200 text-neutral-600 hover:border-primary-300'
                          }`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pricing & Location */}
          {currentStep === 3 && (
            <div className="animate-fade-in space-y-6">
              <h3 className="text-xl font-display font-semibold text-neutral-800 dark:text-neutral-200">Pricing & Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">Original Price (MRP)</label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-3.5 text-neutral-400" />
                      <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="0.00" className="input-field pl-10" />
                    </div>
                  </div>
                  <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
                    <h4 className="font-semibold text-primary-700 mb-2 flex items-center gap-2"><Info size={16} /> Earning Estimator</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Rental Price:</span>
                        <span className="font-bold">₹{pricing.rentalPrice || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Platform Fee:</span>
                        <span className="text-red-500">-₹{pricing.charge}</span>
                      </div>
                      <div className="h-[1px] bg-primary-200 my-2"></div>
                      <div className="flex justify-between font-bold text-lg">
                        <span className="text-primary-800">You Earn:</span>
                        <span className="text-green-600">₹{pricing.earning}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">Pickup Location</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-3.5 text-neutral-400" />
                      <input type="text" name="pickuplocation" value={formData.pickuplocation} onChange={handleInputChange} placeholder="Your Address / Hostel" className="input-field pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">Contact Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-3.5 text-neutral-400" />
                      <input type="text" name="contactno" value={formData.contactno} onChange={handleInputChange} placeholder="+91 99999 99999" className="input-field pl-10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="animate-fade-in space-y-6 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-2xl font-display font-bold text-neutral-800 dark:text-neutral-200">Ready to List?</h3>
              <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                Please review your details before submitting. Your item "{formData.name}" will be listed for rent at <span className="font-bold text-neutral-800">₹{pricing.rentalPrice}</span>/day.
              </p>

              <div className="bg-neutral-50 dark:bg-neutral-700 p-6 rounded-xl text-left max-w-md mx-auto border border-neutral-100 dark:border-neutral-600 mt-6">
                <h4 className="font-bold text-neutral-800 dark:text-neutral-200 mb-2">Summary</h4>
                <ul className="text-sm space-y-2 text-neutral-600 dark:text-neutral-400">
                  <li>• Category: {formData.category} / {formData.subCategory}</li>
                  <li>• Sizes: {formData.sizes.join(', ')}</li>
                  <li>• Location: {formData.pickuplocation}</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10 pt-6 border-t border-neutral-100 dark:border-neutral-700">
            <button type="button" onClick={prevStep} disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors
                        ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-neutral-600 hover:bg-neutral-50'}`}>
              <ChevronLeft size={20} /> Back
            </button>

            {currentStep < 4 ? (
              <button type="button" onClick={nextStep} className="btn-primary flex items-center gap-2">
                Next <ChevronRight size={20} />
              </button>
            ) : (
              <button type="submit" disabled={isLoading} className="btn-primary bg-green-600 hover:bg-green-700 shadow-green-200">
                {isLoading ? 'Listing Item...' : 'Confirm & List'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Lend;
