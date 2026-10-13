import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
            index: true
        },
        reviewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        subRatings: {
            cleanliness: { type: Number, min: 1, max: 5 },
            fitting: { type: Number, min: 1, max: 5 },
            communication: { type: Number, min: 1, max: 5 }
        },
        comment: {
            type: String,
            default: '',
            maxlength: [2000, 'Comment cannot exceed 2000 characters']
        },
        isAnonymous: {
            type: Boolean,
            default: false
        },
        helpfulCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
        minimize: false
    }
);

// Ensure unique review per user per order
reviewSchema.index({ orderId: 1, reviewerId: 1 }, { unique: true });

reviewSchema.methods.toClientJSON = function (reviewerName = 'User') {
    const doc = this.toObject();
    delete doc.__v;

    const idStr = doc._id.toString();

    return {
        ...doc,
        _id: idStr,
        id: idStr,
        orderId: doc.orderId?.toString(),
        order_id: doc.orderId?.toString(),
        reviewerId: doc.reviewerId?.toString(),
        reviewer_id: doc.reviewerId?.toString(),
        sellerId: doc.sellerId?.toString(),
        seller_id: doc.sellerId?.toString(),
        sub_ratings: doc.subRatings || {},
        subRatings: doc.subRatings || {},
        is_anonymous: Boolean(doc.isAnonymous),
        isAnonymous: Boolean(doc.isAnonymous),
        reviewerName: doc.isAnonymous ? 'Anonymous' : reviewerName
    };
};

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;
