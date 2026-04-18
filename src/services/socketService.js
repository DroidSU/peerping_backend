const { Server } = require( 'socket.io' );
const jwt = require( 'jsonwebtoken' );
const User = require( '../models/User' );
const logger = require( '../config/logger' );

const userSocketMap = new Map();
let io;

const initSocketServer = ( server ) => {
    io = new Server( server, {
        cors: { origin: '*' },
    } );

    io.use( async ( socket, next ) => {
        try {
            const auth = socket.handshake.auth;
            const token = auth?.token?.replace( /^Bearer\s+/i, '' );
            if ( !token ) return next( new Error( 'Authentication required' ) );

            const payload = jwt.verify( token, process.env.JWT_SECRET );
            const user = await User.findById( payload.userId );
            if ( !user ) return next( new Error( 'User not found' ) );

            socket.user = user;
            next();
        } catch ( err ) {
            next( new Error( 'Unauthorized' ) );
        }
    } );

    io.on( 'connection', ( socket ) => {
        const userId = socket.user._id.toString();
        logger.info( `Socket connected: ${ userId } -> ${ socket.id }` );
        userSocketMap.set( userId, socket.id );

        socket.on( 'disconnect', () => {
            logger.info( `Socket disconnected: ${ userId } -> ${ socket.id }` );
            userSocketMap.delete( userId );
        } );
    } );
};

const getSocketIdForUser = ( userId ) => userSocketMap.get( userId.toString() );

const emitToUser = ( userId, event, payload ) => {
    const socketId = getSocketIdForUser( userId );
    if ( !io || !socketId ) return false;

    const socket = io.sockets.sockets.get( socketId );
    if ( !socket ) return false;

    socket.emit( event, payload );
    return true;
};

const broadcastMessageDelivered = ( delivery ) => {
    emitToUser( delivery.sender, 'MESSAGE_DELIVERED', delivery );
};

module.exports = { initSocketServer, emitToUser, broadcastMessageDelivered, userSocketMap };
