const express = require( 'express' );
const { body } = require( 'express-validator' );
const { authenticate } = require( '../middleware/authMiddleware' );
const { validateRequest } = require( '../middleware/validateRequest' );
const { searchUsers, updateDeviceToken } = require( '../controllers/userController' );

const router = express.Router();

router.get( '/search', authenticate, searchUsers );

router.post(
    '/device-token',
    authenticate,
    [ body( 'fcmToken' ).isString().trim().notEmpty() ],
    validateRequest,
    updateDeviceToken
);

module.exports = router;
