import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['order', 'delivery', 'rental', 'alert', 'system'],
            default: 'order'
        },
        orderId: {
            type: String,
            default: null
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    {
        timestamps: true,
        minimize: false
    }
);

notificationSchema.methods.toClientJSON = function () {
    const doc = this.toObject();
    delete doc.__v;

    const idStr = doc._id.toString();

    return {
        ...doc,
        _id: idStr,
        id: idStr,
        userId: doc.userId?.toString(),
        user_id: doc.userId?.toString(),
        isRead: Boolean(doc.isRead),
        is_read: doc.isRead ? 1 : 0,
        createdAt: doc.createdAt,
        created_at: doc.createdAt
    };
};

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;
