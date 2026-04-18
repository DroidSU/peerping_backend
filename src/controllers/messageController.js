const { createMessage, fetchMessages, updateMessageStatus } = require( '../services/messageService' );

const sendMessage = async ( req, res, next ) => {
    try {
        const { recipientId, messageId, body, clientTimestamp } = req.body;
        if ( !recipientId || !messageId || !body || !clientTimestamp ) {
            return res.status( 400 ).json( { message: 'recipientId, messageId, body and clientTimestamp are required' } );
        }

        const message = await createMessage( {
            senderId: req.user._id,
            recipientId,
            messageId,
            body,
            clientTimestamp,
        } );

        res.json( { success: true, message } );
    } catch ( error ) {
        next( error );
    }
};

const getMessages = async ( req, res, next ) => {
    try {
        const { conversationId } = req.params;
        const { after } = req.query;
        const messages = await fetchMessages( { userId: req.user._id, conversationId, after } );
        res.json( { conversationId, messages } );
    } catch ( error ) {
        next( error );
    }
};

const setMessageStatus = async ( req, res, next ) => {
    try {
        const { messageId } = req.params;
        const { status } = req.body;
        const allowed = [ 'delivered', 'read' ];
        if ( !allowed.includes( status ) ) {
            return res.status( 400 ).json( { message: 'Invalid status' } );
        }

        const message = await updateMessageStatus( { messageId, status, userId: req.user._id } );
        res.json( { success: true, message } );
    } catch ( error ) {
        next( error );
    }
};

module.exports = { sendMessage, getMessages, setMessageStatus };
