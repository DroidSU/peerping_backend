const mongoose = require( 'mongoose' );

const conversationSchema = new mongoose.Schema(
    {
        participants: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } ],
        participantKey: { type: String, required: true, unique: true, index: true },
        lastMessage: { type: String, trim: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model( 'Conversation', conversationSchema );
