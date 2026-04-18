const Conversation = require( '../models/Conversation' );
const Message = require( '../models/Message' );
const User = require( '../models/User' );
const { emitToUser, broadcastMessageDelivered } = require( './socketService' );
const { sendPushNotification } = require( './notificationService' );

const findOrCreateConversation = async ( senderId, recipientId ) => {
    const participants = [ senderId.toString(), recipientId.toString() ].sort();
    const participantKey = participants.join( '|' );
    let conversation = await Conversation.findOne( { participantKey } );
    if ( !conversation ) {
        conversation = await Conversation.create( { participants, participantKey, lastMessage: '' } );
    }
    return conversation;
};

const createMessage = async ( { senderId, recipientId, messageId, body, clientTimestamp } ) => {
    const existing = await Message.findOne( { messageId } );
    if ( existing ) return existing;

    const conversation = await findOrCreateConversation( senderId, recipientId );
    const message = await Message.create( {
        conversationId: conversation._id,
        sender: senderId,
        recipient: recipientId,
        messageId,
        body,
        clientTimestamp: new Date( clientTimestamp ),
        serverTimestamp: new Date(),
        status: 'sent',
    } );

    conversation.lastMessage = body;
    await conversation.save();

    const delivered = emitToUser( recipientId, 'NEW_MESSAGE', message );
    if ( delivered ) {
        message.status = 'delivered';
        message.deliveredAt = new Date();
        await message.save();

        broadcastMessageDelivered( {
            sender: senderId,
            recipient: recipientId,
            messageId,
            conversationId: conversation._id,
            timestamp: message.deliveredAt,
        } );
    } else {
        const recipient = await User.findById( recipientId );
        if ( recipient?.fcmToken ) {
            await sendPushNotification( {
                token: recipient.fcmToken,
                title: 'New message',
                body: body.slice( 0, 120 ),
                data: {
                    conversationId: conversation._id.toString(),
                    messageId,
                },
            } );
        }
    }

    return message;
};

const fetchMessages = async ( { userId, conversationId, after, limit = 100 } ) => {
    const conversation = await Conversation.findById( conversationId );
    if ( !conversation ) throw new Error( 'Conversation not found' );
    if ( !conversation.participants.map( String ).includes( userId.toString() ) ) {
        throw new Error( 'Access denied to conversation' );
    }

    const query = { conversationId };
    if ( after ) query.clientTimestamp = { $gt: new Date( after ) };

    return Message.find( query )
        .sort( { clientTimestamp: 1 } )
        .limit( limit )
        .lean();
};

const updateMessageStatus = async ( { messageId, status, userId } ) => {
    const message = await Message.findOne( { messageId } );
    if ( !message ) throw new Error( 'Message not found' );

    const isParticipant = [ message.sender.toString(), message.recipient.toString() ].includes( userId.toString() );
    if ( !isParticipant ) throw new Error( 'Access denied' );

    if ( status === 'delivered' && message.status === 'sent' ) {
        message.status = 'delivered';
        message.deliveredAt = new Date();
    }

    if ( status === 'read' ) {
        message.status = 'read';
        message.readAt = new Date();
    }

    await message.save();
    return message;
};

module.exports = { createMessage, fetchMessages, updateMessageStatus };
