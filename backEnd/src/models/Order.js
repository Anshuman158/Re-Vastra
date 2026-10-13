import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        image: {
            type: [String],
            default: []
        },
        size: {
            type: String,
            default: ''
        },
        quantity: {
            type: Number,
            default: 1
        },
        duration: {
            type: Number,
            default: 1
        },
        rentalPrice: {
            type: Number,
            default: 0
        }
    },
    { _id: true }
);

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        items: [orderItemSchema],
        amount: {
            type: Number,
            required: true
        },
        address: {
            type: Object,
            required: true
        },
        status: {
            type: String,
            enum: ['Order Placed', 'Processing', 'Packing', 'Shipped', 'Out for Delivery', 'Out for delivery', 'Delivered', 'Cancelled', 'Returned'],
            default: 'Order Placed'
        },
        paymentMethod: {
            type: String,
            default: 'COD'
        },
        payment: {
            type: Boolean,
            default: false
        },
        washingFee: {
            type: Number,
            default: 0
        },
        deliveryFee: {
            type: Number,
            default: 0
        },
        securityDeposit: {
            type: Number,
            default: 0
        },
        rentalStartDate: {
            type: String,
            default: null
        },
        rentalEndDate: {
            type: String,
            default: null
        },
        deliveryDate: {
            type: String,
            default: null
        },
        urgentOrder: {
            type: Boolean,
            default: false
        },
        urgentFee: {
            type: Number,
            default: 0
        },
        pricingBreakdown: {
            type: Object,
            default: null
        }
    },
    {
        timestamps: true,
        minimize: false
    }
);

orderSchema.methods.toClientJSON = function () {
    const doc = this.toObject();
    delete doc.__v;

    const idStr = doc._id.toString();
    const userIdStr = doc.userId ? doc.userId.toString() : '';

    const formattedItems = (doc.items || []).map(item => {
        const prodId = item.productId ? item.productId.toString() : '';
        return {
            ...item,
            _id: prodId,
            productId: prodId,
            product_id: prodId,
            rental_price: item.rentalPrice,
            rentalPrice: item.rentalPrice
        };
    });

    return {
        ...doc,
        _id: idStr,
        id: idStr,
        userId: userIdStr,
        user_id: userIdStr,
        items: formattedItems,
        date: doc.createdAt,
        created_at: doc.createdAt,
        washing_fee: doc.washingFee || 0,
        washingFee: doc.washingFee || 0,
        delivery_fee: doc.deliveryFee || 0,
        deliveryFee: doc.deliveryFee || 0,
        security_deposit: doc.securityDeposit || 0,
        securityDeposit: doc.securityDeposit || 0,
        urgent_order: doc.urgentOrder ? 1 : 0,
        urgentOrder: Boolean(doc.urgentOrder),
        urgent_fee: doc.urgentFee || 0,
        urgentFee: doc.urgentFee || 0,
        rental_start_date: doc.rentalStartDate,
        rentalStartDate: doc.rentalStartDate,
        rental_end_date: doc.rentalEndDate,
        rentalEndDate: doc.rentalEndDate,
        delivery_date: doc.deliveryDate,
        deliveryDate: doc.deliveryDate,
        payment_method: doc.paymentMethod,
        paymentMethod: doc.paymentMethod
    };
};

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
