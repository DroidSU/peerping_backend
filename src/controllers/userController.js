const User = require( '../models/User' );

const searchUsers = async ( req, res, next ) => {
    try {
        const phoneNumber = req.query.phoneNumber;
        if ( !phoneNumber ) {
            return res.status( 400 ).json( { message: 'phoneNumber is required' } );
        }

        const escapeRegex = ( value ) => value.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
        const safeQuery = escapeRegex( phoneNumber );

        const users = await User.find( { phoneNumber: { $regex: safeQuery, $options: 'i' } } )
            .select( '_id phoneNumber name' )
            .limit( 20 );

        res.json( { users } );
    } catch ( error ) {
        next( error );
    }
};

const updateDeviceToken = async ( req, res, next ) => {
    try {
        const { fcmToken } = req.body;
        if ( !fcmToken ) {
            return res.status( 400 ).json( { message: 'fcmToken is required' } );
        }

        req.user.fcmToken = fcmToken;
        await req.user.save();
        res.json( { success: true, fcmToken } );
    } catch ( error ) {
        next( error );
    }
};

module.exports = { searchUsers, updateDeviceToken };
