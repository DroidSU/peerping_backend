const admin = require( 'firebase-admin' );

const initFirebase = () => {
    if ( admin.apps.length ) return admin.app();

    const privateKey = process.env.FCM_PRIVATE_KEY
        ? process.env.FCM_PRIVATE_KEY.replace( /\\n/g, '\n' )
        : undefined;

    const credentials = {
        projectId: process.env.FCM_PROJECT_ID,
        clientEmail: process.env.FCM_CLIENT_EMAIL,
        privateKey,
    };

    if ( !credentials.projectId || !credentials.clientEmail || !credentials.privateKey ) {
        throw new Error( 'FCM credentials are required when notifications are enabled' );
    }

    return admin.initializeApp( {
        credential: admin.credential.cert( credentials ),
    } );
};

module.exports = { initFirebase };
