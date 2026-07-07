import { createContext, useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "../hooks/useLocalStorage";
import { currency, delivery_fee, washingFee, backEndURL } from "../config";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
    // Constants imported from config.js

    // Persistent State using custom hook
    // Note: useLocalStorage handles JSON parsing/stringifying automatically

    // Token is stored as a raw string usually, but our hook stringifies everything. 
    // If backend expects raw string, we might need to be careful. 
    // However, existing logic was localStorage.getItem("token") which returns string.
    // If we use JSON.stringify("tokenstring"), it becomes "\"tokenstring\"".
    // Wait, the hook uses JSON.parse. If "token" is stored as plain string "abc", JSON.parse("abc") throws error?
    // "abc" is not valid JSON. valid JSON string is "\"abc\"".
    // EXISTING LOGIC: localStorage.getItem("token") -> returns "abc"
    // My hook: JSON.parse("abc") -> ERROR.

    // FIX: The hook should handle non-JSON strings gracefully or I should only use it for JSON data.
    // user, wishlist, includeWashing ARE JSON.
    // token is simple string.

    // Let's keep token as is or update duplication manually for token, but use hook for others.

    const [token, setToken] = useState(() => localStorage.getItem("token") || "");

    // User Object
    const [user, setUser] = useLocalStorage("user", null);

    // Wishlist
    const [wishlist, setWishlist] = useLocalStorage("wishlist", []);

    // Include Washing
    const [includeWashing, setIncludeWashing] = useLocalStorage("includeWashing", false);

    const [search, setSearch] = useState('');
    const [products, setProducts] = useState([]);
    const [showSearch, setShowSearch] = useState(true);
    const [cartItems, setCartItems] = useState({});

    const navigate = useNavigate();

    // Sync token manually since it might not be JSON
    useEffect(() => {
        if (token) localStorage.setItem("token", token);
        else localStorage.removeItem("token");
    }, [token]);

    // useLocalStorage hook handles syncing for user, wishlist, includeWashing automatically on change.

    // Toggle washing fee
    const toggleWashingFee = useCallback(() => {
        setIncludeWashing((prev) => !prev);
    }, [setIncludeWashing]);

    // Wishlist Functions
    const addToWishlist = useCallback((itemId) => {
        setWishlist((prev) => {
            if (prev.includes(itemId)) {
                toast.info("Removed from Wishlist");
                return prev.filter(id => id !== itemId);
            } else {
                toast.success("Added to Wishlist");
                return [...prev, itemId];
            }
        });
    }, [setWishlist]);

    // Explicit remove function for wishlist page
    const removeFromWishlist = useCallback((itemId) => {
        setWishlist((prev) => {
            const newWishlist = prev.filter(id => id !== itemId);
            toast.info("Removed from Wishlist");
            return newWishlist;
        });
    }, [setWishlist]);

    const isInWishlist = useCallback((itemId) => wishlist.includes(itemId), [wishlist]);

    // Add item to cart - ONLY if authenticated
    const addToCart = useCallback(async (itemId, size) => {
        if (!size) {
            return toast.error("⚠️ Please select a product size before adding to cart!");
        }

        // Check authentication FIRST - don't add locally if not logged in
        if (!token) {
            toast.error("⚠️ Please log in to add items to cart.");
            navigate('/login');
            return;
        }

        // User is authenticated - update local cart
        setCartItems((prev) => {
            const updatedCart = { ...prev, [itemId]: { ...prev[itemId], [size]: (prev[itemId]?.[size] || 0) + 1 } };
            return updatedCart;
        });

        // Sync with backend
        try {
            await axios.post(`${backEndURL}/api/cart/add`, { itemId, size }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("✓ Added to cart!");
        } catch (error) {
            console.error("API Error:", error);
            toast.error(error.response?.data?.message || "Failed to update cart!");
        }
    }, [token, backEndURL, navigate]);

    // Get cart item count
    const getCartCount = useCallback(() =>
        Object.values(cartItems).reduce(
            (total, sizes) => total + Object.values(sizes).reduce((sum, qty) => sum + qty, 0),
            0
        ), [cartItems]);

    // Update duration (rental days)
    const updateDuration = useCallback(async (itemId, size, duration) => {
        setCartItems((prev) => ({ ...prev, [itemId]: { ...prev[itemId], [size]: duration } }));

        if (token) {
            try {
                await axios.post(`${backEndURL}/api/cart/update`, { itemId, size, duration }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (error) {
                toast.error(error.message || "Failed to update duration.");
            }
        }
    }, [token, backEndURL]);

    // Calculate total cart amount
    const getCartAmount = useCallback(() =>
        Object.entries(cartItems).reduce((total, [itemId, sizes]) => {
            const item = products.find(product => product._id === itemId);
            return item ? total + Object.values(sizes).reduce((sum, qty) => sum + (item.rental_price * qty), 0) : total;
        }, 0), [cartItems, products]);

    // Fetch products
    const getProductData = useCallback(async () => {
        try {
            const { data } = await axios.get(`${backEndURL}/api/product/list`);
            if (data.success) setProducts(data.products);
            else toast.error("⚠️ Failed to fetch products!");
        } catch {
            toast.error("⚠️ Error fetching products!");
        }
    }, [backEndURL]);

    // Fetch user cart
    const getUserCart = useCallback(async (authToken) => {
        const tokenToUse = authToken || token;
        if (!tokenToUse) return;
        try {
            const { data } = await axios.post(`${backEndURL}/api/cart/get`, {}, {
                headers: { Authorization: `Bearer ${tokenToUse}` },
            });
            if (data.success) setCartItems(data.cartData || {});
        } catch (error) {
            console.error("Error fetching cart:", error);
        }
    }, [token, backEndURL]);

    // Fetch user profile
    const fetchUserProfile = useCallback(async (authToken) => {
        const tokenToUse = authToken || token;
        if (!tokenToUse) return;

        try {
            const { data } = await axios.get(`${backEndURL}/api/user/profile`, {
                headers: { Authorization: `Bearer ${tokenToUse}` },
            });

            if (data.success) {
                setUser(data.user);
                // localStorage.setItem("user", JSON.stringify(data.user)); // Handled by hook
            }
        } catch (error) {
            console.error("Profile fetch error:", error.response?.data || error.message);
            if (error.response?.status === 401) {
                setToken('');
                setUser(null);
                localStorage.removeItem("token");
                // localStorage.removeItem("user"); // Handled by hook setting null
            }
        }
    }, [token, backEndURL]);


    // Logout function
    const logout = useCallback(() => {
        setToken('');
        setUser(null);
        setCartItems({});
        setWishlist([]); // Clear wishlist on logout
        localStorage.removeItem("token");
        // user, includeWashing etc handled by useLocalStorage hook updates
        navigate('/login'); // Redirect to login page
        toast.success("Logged out successfully.");
    }, [navigate, setUser, setWishlist, setToken, setCartItems]);

    // Initial fetch
    useEffect(() => {
        getProductData();
    }, [getProductData]);

    // Fetch user data when token is available
    useEffect(() => {
        if (token) {
            fetchUserProfile(token);
            getUserCart(token);
        }
    }, [token]);

    const value = useMemo(() => ({
        products,
        currency,
        delivery_fee,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        getCartAmount,
        cartItems,
        setCartItems,
        addToCart,
        backEndURL,
        getCartCount,
        updateDuration,
        setToken,
        token,
        user,
        setUser,
        washingFee,
        navigate,
        includeWashing,
        toggleWashingFee,
        fetchUserProfile,
        logout,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist
    }), [products, currency, delivery_fee, search, showSearch, cartItems, addToCart, backEndURL, getCartAmount, getCartCount, updateDuration, token, user, washingFee, navigate, includeWashing, toggleWashingFee, fetchUserProfile, logout, wishlist, addToWishlist, removeFromWishlist, isInWishlist]);

    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
