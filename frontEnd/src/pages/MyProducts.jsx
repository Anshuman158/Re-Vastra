import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Trash2, RefreshCw, Eye, EyeOff, Package } from 'lucide-react';

const MyProducts = () => {
  const { backEndURL, token, currency } = useContext(ShopContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null); // Track which product is being toggled

  const loadProductData = async () => {
    try {
      if (!token) {
        setError('No token found. Please log in.');
        return;
      }

      setLoading(true);
      const response = await axios.get(`${backEndURL}/api/product/my-product`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setProducts(response.data.products.reverse());
        setError(null);
      } else {
        setError('Failed to fetch products.');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Error fetching products.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle product availability
  const toggleAvailability = async (productId, currentStatus) => {
    setTogglingId(productId);
    const newStatus = currentStatus === 'available' ? 'out_of_stock' : 'available';

    try {
      const response = await axios.put(
        `${backEndURL}/api/product/status/${productId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(`Product marked as ${newStatus === 'available' ? 'Available' : 'Out of Stock'}`);
        // Update local state
        setProducts(prev => prev.map(p =>
          p._id === productId ? { ...p, status: newStatus } : p
        ));
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setTogglingId(null);
    }
  };

  // Delete product function
  const deleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await axios.delete(
        `${backEndURL}/api/product/my-product/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Product deleted successfully!');
        loadProductData(); // Refresh the list
      } else {
        toast.error(response.data.message || 'Failed to delete product.');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  useEffect(() => {
    loadProductData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) {
    return (
      <div className="border-t pt-24 bg-neutral-50 dark:bg-neutral-900 flex justify-center items-center h-screen">
        <p className="text-lg text-neutral-600 dark:text-neutral-400">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-t pt-24 bg-neutral-50 dark:bg-neutral-900 flex justify-center items-center h-screen">
        <p className="text-lg text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="border-t pt-24 bg-neutral-50 dark:bg-neutral-900 flex flex-col justify-center items-center h-screen">
        <Package size={64} className="text-neutral-300 dark:text-neutral-600 mb-4" />
        <p className="text-lg text-neutral-600 dark:text-neutral-400">You haven't uploaded any products yet.</p>
        <a href="/lend" className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition">
          Upload Your First Product
        </a>
      </div>
    );
  }

  return (
    <div className="border-t pt-24 bg-neutral-50 dark:bg-neutral-900 min-h-screen">
      <div className="text-2xl text-center font-semibold text-neutral-800 dark:text-neutral-200">
        <Title text1={'MY'} text2={'PRODUCTS'} />
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-6 lg:px-8 pb-8">
        {products.map((product, index) => (
          <div key={index} className="bg-white dark:bg-neutral-800 shadow-lg rounded-xl p-6 flex flex-col justify-between border border-neutral-100 dark:border-neutral-700 hover:shadow-xl transition-shadow">

            {/* Product Image & Info */}
            <div className="flex items-start gap-4 sm:gap-6">
              <img className="w-20 h-20 object-cover rounded-lg border dark:border-neutral-600" src={product.image[0]} alt={product.name} />
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 truncate">{product.name}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Size: {product.sizes?.join(', ') || 'N/A'}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{product.category}</p>
                <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold mt-1">
                  {currency}{product.rental_price}/day
                </p>
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Availability</span>

                {/* Toggle Switch */}
                <button
                  onClick={() => toggleAvailability(product._id, product.status)}
                  disabled={togglingId === product._id}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${product.status === 'available'
                    ? 'bg-green-500'
                    : 'bg-neutral-300 dark:bg-neutral-600'
                    } ${togglingId === product._id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ${product.status === 'available' ? 'translate-x-8' : 'translate-x-1'
                      }`}
                  >
                    {product.status === 'available'
                      ? <Eye size={12} className="text-green-500" />
                      : <EyeOff size={12} className="text-neutral-400" />
                    }
                  </span>
                </button>
              </div>

              <p className={`mt-2 text-sm font-medium ${product.status === 'available'
                ? 'text-green-600 dark:text-green-400'
                : 'text-neutral-500 dark:text-neutral-400'
                }`}>
                {product.status === 'available' ? '✓ Available for Rent' : '✗ Currently Unavailable'}
              </p>
            </div>

            {/* Additional Info */}
            <div className="mt-4 text-sm text-neutral-500 dark:text-neutral-400 space-y-1">
              <p>📍 Pickup: {product.pickuplocation}</p>
              <p>📞 Contact: {product.contactno}</p>
              <p className="text-xs">Uploaded: {new Date(product.date).toLocaleDateString()}</p>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex justify-between items-center gap-2 pt-4 border-t dark:border-neutral-700">
              <button
                onClick={loadProductData}
                className="flex items-center gap-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 text-sm font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all"
              >
                <RefreshCw size={14} /> Refresh
              </button>
              <button
                onClick={() => deleteProduct(product._id, product.name)}
                className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-all"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyProducts;
