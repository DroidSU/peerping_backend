const mongoose = require( 'mongoose' );

const messageSchema = new mongoose.Schema(
    {
        conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        messageId: { type: String, required: true, unique: true },
        body: { type: String, required: true },
        clientTimestamp: { type: Date, required: true },
        serverTimestamp: { type: Date, required: true, default: Date.now },
        status: { type: String, enum: [ 'sent', 'delivered', 'read' ], default: 'sent' },
        deliveredAt: { type: Date },
        readAt: { type: Date },
    },
    { timestamps: true }
);

module.exports = mongoose.model( 'Message', messageSchema );
