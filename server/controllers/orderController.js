import Product from "../models/Product.js";
import Order from '../models/Order.js';

// Place order COD: /api/order/cod
export const placeOrderCOD = async(req, res) => {
    try {
        const {userId, items, address} = req.body;
        if(!address || items.length === 0) {
            return res.json({
                success: false,
                message: "Address and items are required"});
        }
        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        }, 0)

        // Add tax charge 2%
        amount += Math.floor(amount * 0.02);

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD",
        });
        return res.json({
            success: true,
            message: "Order placed successfully"
        });
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Error placing order",
            error: error.message
        });
    }
}

// Get orders by userId: /api/order/:userId
export const getOrdersByUserId = async(req, res) => {
    try {
        const {userId} = req.body;
        const orders = await Order.find({
            userId,
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});
        res.json({
            success: true,
            orders
        })
    } catch (error) {
        res.json({
            success: false,
            message: "Error fetching orders",
            error: error.message
        })
    }
}


// Get all orders (admin/seller): /api/order/seller
export const getAllOrders = async(req, res) => {
    try {
        const orders = await Order.find({
            userId,
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});
        res.json({
            success: true,
            orders
        })
    } catch (error) {
        res.json({
            success: false,
            message: "Error fetching orders",
            error: error.message
        })
    }
}

