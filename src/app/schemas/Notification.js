// Representação de um schema dentro do mongo

import mongoose from 'mongoose';

// Campos do schema
// timestamps: true | Define por padrão os campos created_at e updated_at
const NotificationSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
        },
        user: {
            type: Number,
            required: true,
        },
        read: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Notification', NotificationSchema);
