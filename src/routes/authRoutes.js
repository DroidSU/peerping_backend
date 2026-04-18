const express = require( 'express' );
const { body } = require( 'express-validator' );
const { sendOtpHandler, verifyOtpHandler } = require( '../controllers/authController' );
const { validateRequest } = require( '../middleware/validateRequest' );

const router = express.Router();

router.post(
    '/send-otp',
    [ body( 'phoneNumber' ).isString().trim().notEmpty() ],
    validateRequest,
    sendOtpHandler
);

router.post(
    '/verify-otp',
    [ body( 'phoneNumber' ).isString().trim().notEmpty(), body( 'otp' ).isString().trim().notEmpty() ],
    validateRequest,
    verifyOtpHandler
);

module.exports = router;
