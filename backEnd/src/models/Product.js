import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [200, 'Name cannot exceed 200 characters']
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            maxlength: [5000, 'Description cannot exceed 5000 characters']
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [1, 'Price must be greater than 0']
        },
        rentalPrice: {
            type: Number,
            required: [true, 'Rental price is required'],
            min: [1, 'Rental price must be greater than 0']
        },
        image: {
            type: [String],
            default: []
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            index: true
        },
        subCategory: {
            type: String,
            default: ''
        },
        sizes: {
            type: [String],
            required: [true, 'Sizes are required']
        },
        bestSeller: {
            type: Boolean,
            default: false
        },
        pickupLocation: {
            type: String,
            required: [true, 'Pickup location is required']
        },
        contactNo: {
            type: String,
            required: [true, 'Contact number is required']
        },
        status: {
            type: String,
            enum: ['available', 'out_of_stock', 'rented'],
            default: 'available'
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    {
        timestamps: true,
        minimize: false
    }
);

productSchema.methods.toClientJSON = function (sellerInfo = null) {
    const doc = this.toObject();
    delete doc.__v;

    const idStr = doc._id.toString();
    const userIdStr = doc.userId ? doc.userId.toString() : '';

    return {
        ...doc,
        _id: idStr,
        id: idStr,
        userId: userIdStr,
        user_id: userIdStr,
        rentalPrice: doc.rentalPrice,
        rental_price: doc.rentalPrice,
        subCategory: doc.subCategory || '',
        sub_category: doc.subCategory || '',
        bestSeller: Boolean(doc.bestSeller),
        bestseller: Boolean(doc.bestSeller),
        best_seller: Boolean(doc.bestSeller) ? 1 : 0,
        pickupLocation: doc.pickupLocation,
        pickup_location: doc.pickupLocation,
        pickuplocation: doc.pickupLocation,
        contactNo: doc.contactNo,
        contact_no: doc.contactNo,
        contactno: doc.contactNo,
        isActive: Boolean(doc.isActive),
        is_active: doc.isActive ? 1 : 0,
        createdAt: doc.createdAt,
        created_at: doc.createdAt,
        date: new Date(doc.createdAt).getTime(),
        seller: sellerInfo || null
    };
};

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
