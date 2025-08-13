import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const currency = import.meta.env.VITE_CURRENCY || "₹"; // fallback if not set

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [showUserLogin, setShowUserLogin] = useState(false);
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [searchQuery, setSearchQuery] = useState({});

    // ✅ Fix: Proper arrow function syntax
    const fetchProducts = async () => {
        // This would be API call in real app
        setProducts(dummyProducts);
    };

    // ✅ Fix: Add itemId as argument
    const addToCart = (itemId) => {
        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            cartData[itemId] += 1;
        } else {
            cartData[itemId] = 1;
        }

        setCartItems(cartData);
        toast.success("Added to Cart");
    };

    const updateCartItem = (itemId, quantity) => {
        let cartData = structuredClone(cartItems);

        if (quantity <= 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }

        setCartItems(cartData);
        toast.success("Cart updated");
    };

    const removeFromCart = (itemId) => {
        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            cartData[itemId] -= 1;
            if (cartData[itemId] === 0) {
                delete cartData[itemId];
            }

            setCartItems(cartData);
            toast.success("Removed from cart");
        } else {
            toast.error("Item not in cart");
        }
    };

    // Get cart item count
    const getCartCount = () => {
        let count = 0;
        for(const item in cartItems) {
            count += cartItems[item];
        }
        return count;
    }

    // Get cart total amount
    const getCartAmount = () => {
        let totalAmount = 0;
        for(const item in cartItems) {
            let itemInfo = products.find((product) => product._id === item);
            if(cartItems[item] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[item];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        fetchProducts();
    }, []);

    const value = {
        navigate,
        user,
        setUser,
        isSeller,
        setIsSeller,
        showUserLogin,
        setShowUserLogin,
        products,
        currency,
        addToCart,
        updateCartItem,
        removeFromCart,
        cartItems,
        searchQuery,
        setSearchQuery,
        getCartCount,
        getCartAmount
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
