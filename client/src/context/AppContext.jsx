import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'; // Fallback to localhost if not set
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
    
    // Fetch Seller Status
    const fetchSeller = async() => {
        try {
            const {data} = await axios.get('http://localhost:4000/api/seller/is-auth');
            if(data.success) {
                setIsSeller(true);
            } else {
                setIsSeller(false);
            }
        }
        catch(error) {
            console.log(error);
            setIsSeller(false);
        }
    }

    // Fetch User Auth Status, User Data and Cart Items
    const fetchUser = async() => {
        try {
            const {data} = await axios.get('/api/user/is-auth');
            if(data.success) {
                setUser(data.user);
                setCartItems(data.user.cartItems);
            }
        } catch(error) {
            setUser(null);
        }
    }
   
    // ✅ Fix: Proper arrow function syntax
   const fetchProducts = async () => {
    try {
        const { data } = await axios.get('/api/product/list');
        if (data.success) {
            setProducts(data.products);
        } else {
            toast.error(data.message || "Failed to fetch products");
        }
    } catch (error) {
        // Axios wraps errors → error.response?.data?.message is safer
        const errMsg = error.response?.data?.message || error.message || "Error fetching products";
        toast.error(errMsg);
    }
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
        fetchUser();
        fetchSeller();
        fetchProducts();
    }, []);

    // Update databse cart items when cartItems state changes
    useEffect(() => {
        const updatecart = async() => {
            try {
                const {data} = await axios.post('http://localhost:4000/api/cart/update', {cartItems})
                if(!data.success) {
                    toast.error(data.message);
                }
            }    catch(error) {
                console.log(error);
                toast.error(error.message);
            }
        }
        
        if(user) {
            updatecart()
        }
    }, [cartItems])

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
        getCartAmount,
        axios,
        fetchProducts,
        setProducts,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);