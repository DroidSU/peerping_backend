const express = require( 'express' );
const { body, param, query } = require( 'express-validator' );
const { authenticate } = require( '../middleware/authMiddleware' );
const { validateRequest } = require( '../middleware/validateRequest' );
const { sendMessage, getMessages, setMessageStatus, getUserConversations } = require( '../controllers/messageController' );

const router = express.Router();

router.get(
    '/conversations',
    authenticate,
    [ query( 'limit' ).optional().isInt( { min: 1, max: 100 } ) ],
    validateRequest,
    getUserConversations
);

router.post(
    '/send',
    authenticate,
    [
        body( 'recipientId' ).isString().trim().notEmpty(),
        body( 'messageId' ).isString().trim().notEmpty(),
        body( 'body' ).isString().trim().notEmpty(),
        body( 'clientTimestamp' ).isISO8601().toDate(),
    ],
    validateRequest,
    sendMessage
);

router.get(
    '/:conversationId',
    authenticate,
    [ param( 'conversationId' ).isString().trim().notEmpty(), query( 'after' ).optional().isISO8601() ],
    validateRequest,
    getMessages
);

router.patch(
    '/:messageId/status',
    authenticate,
    [ param( 'messageId' ).isString().trim().notEmpty(), body( 'status' ).isIn( [ 'delivered', 'read' ] ) ],
    validateRequest,
    setMessageStatus
);

module.exports = router;
