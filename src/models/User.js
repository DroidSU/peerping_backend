const mongoose = require( 'mongoose' );

const userSchema = new mongoose.Schema(
    {
        phoneNumber: { type: String, required: true, unique: true, trim: true },
        name: { type: String, trim: true },
        fcmToken: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model( 'User', userSchema );
