const jwt = require( 'jsonwebtoken' );
const User = require( '../models/User' );
const Otp = require( '../models/OTP' );

const buildToken = ( user ) => {
    return jwt.sign( { userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    } );
};

const sendOtp = async ( phoneNumber ) => {
    const code = Math.floor( 100000 + Math.random() * 900000 ).toString();
    const expiresAt = new Date( Date.now() + ( parseInt( process.env.OTP_EXPIRATION_MINUTES, 10 ) || 5 ) * 60000 );

    await Otp.findOneAndUpdate(
        { phoneNumber },
        { code, expiresAt },
        { upsert: true, new: true }
    );

    const user = await User.findOneAndUpdate(
        { phoneNumber },
        { phoneNumber },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return { phoneNumber: user.phoneNumber, otp: code };
};

const verifyOtp = async ( phoneNumber, code ) => {
    const record = await Otp.findOne( { phoneNumber, code } );
    if ( !record || record.expiresAt < new Date() ) {
        throw new Error( 'OTP invalid or expired' );
    }

    await Otp.deleteMany( { phoneNumber } );

    const user = await User.findOneAndUpdate(
        { phoneNumber },
        { phoneNumber },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return { user, token: buildToken( user ) };
};

module.exports = { sendOtp, verifyOtp };
