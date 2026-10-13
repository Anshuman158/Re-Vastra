import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        phone: {
            type: String,
            default: ''
        },
        address: {
            type: Object,
            default: {}
        },
        cartData: {
            type: Object,
            default: {}
        },
        isSeller: {
            type: Boolean,
            default: false
        },
        sellerProfile: {
            shopName: { type: String, default: '' },
            shopDescription: { type: String, default: '' },
            bankingInfo: { type: Object, default: {} },
            address: { type: Object, default: {} },
            isVerified: { type: Boolean, default: false },
            verificationDate: { type: Date, default: null },
            totalRentals: { type: Number, default: 0 },
            avgResponseTime: { type: Number, default: 0 },
            memberSince: { type: Date, default: Date.now },
            rating: {
                average: { type: Number, default: 0 },
                count: { type: Number, default: 0 }
            }
        },
        isBanned: {
            type: Boolean,
            default: false
        },
        banReason: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true,
        minimize: false
    }
);

// Format user payload for frontend compatibility (provides camelCase and snake_case aliases)
userSchema.methods.toClientJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.__v;

    const idStr = user._id.toString();

    return {
        ...user,
        _id: idStr,
        id: idStr,
        isSeller: Boolean(user.isSeller),
        is_seller: Boolean(user.isSeller),
        isBanned: Boolean(user.isBanned),
        is_banned: Boolean(user.isBanned),
        sellerProfile: user.sellerProfile || {},
        seller_profile: user.sellerProfile || {},
        cartData: user.cartData || {},
        cart_data: user.cartData || {},
        banReason: user.banReason || '',
        ban_reason: user.banReason || '',
        createdAt: user.createdAt,
        created_at: user.createdAt
    };
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
