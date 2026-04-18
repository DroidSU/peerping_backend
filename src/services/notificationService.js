const { initFirebase } = require( '../config/firebase' );
const logger = require( '../config/logger' );

const sendPushNotification = async ( { token, title, body, data } ) => {
    if ( !token ) return null;

    try {
        const app = initFirebase();
        const message = {
            token,
            notification: { title, body },
            data: data || {},
            android: { priority: 'high' },
            apns: { headers: { 'apns-priority': '10' } },
        };

        const response = await app.messaging().send( message );
        logger.info( 'FCM sent', response );
        return response;
    } catch ( error ) {
        logger.error( 'FCM error', error.message );
        return null;
    }
};

module.exports = { sendPushNotification };
