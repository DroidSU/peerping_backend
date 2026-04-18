const { sendOtp, verifyOtp } = require( '../services/authService' );

const sendOtpHandler = async ( req, res, next ) => {
    try {
        const { phoneNumber } = req.body;
        const result = await sendOtp( phoneNumber );
        res.json( { success: true, phoneNumber: result.phoneNumber, message: 'OTP sent' } );
    } catch ( error ) {
        next( error );
    }
};

const verifyOtpHandler = async ( req, res, next ) => {
    try {
        const { phoneNumber, otp } = req.body;
        const result = await verifyOtp( phoneNumber, otp );
        res.json( { success: true, token: result.token, user: result.user } );
    } catch ( error ) {
        next( error );
    }
};

module.exports = { sendOtpHandler, verifyOtpHandler };
