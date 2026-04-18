const path = require( 'path' );
require( 'dotenv' ).config( { path: path.resolve( process.cwd(), '.env' ) } );
const mongoose = require( 'mongoose' );
const fetch = global.fetch;

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const baseUrl = 'http://127.0.0.1:3000';
const phoneA = '+15550000001';
const phoneB = '+15550000002';

const doFetch = async ( url, opts = {} ) => {
    const res = await fetch( url, opts );
    const body = await res.text();
    let data;
    try { data = JSON.parse( body ); } catch ( e ) { data = body; }
    return { status: res.status, data };
};

( async () => {
    console.log( 'Testing root...' );
    console.log( await doFetch( `${ baseUrl }/` ) );

    console.log( 'Sending OTP to user A' );
    console.log( await doFetch( `${ baseUrl }/api/auth/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify( { phoneNumber: phoneA } )
    } ) );

    console.log( 'Sending OTP to user B' );
    console.log( await doFetch( `${ baseUrl }/api/auth/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify( { phoneNumber: phoneB } )
    } ) );

    await mongoose.connect( MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true } );
    const otpSchema = new mongoose.Schema( { phoneNumber: String, code: String, expiresAt: Date }, { timestamps: true } );
    const Otp = mongoose.model( 'OtpTest', otpSchema, 'otps' );

    const otpA = await Otp.findOne( { phoneNumber: phoneA } ).sort( { createdAt: -1 } ).lean();
    const otpB = await Otp.findOne( { phoneNumber: phoneB } ).sort( { createdAt: -1 } ).lean();
    console.log( 'OTP A record', otpA ? otpA.code : null );
    console.log( 'OTP B record', otpB ? otpB.code : null );
    if ( !otpA || !otpB ) {
        console.error( 'Missing OTP records' );
        process.exit( 1 );
    }

    console.log( 'Verify OTP A' );
    const vrA = await doFetch( `${ baseUrl }/api/auth/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify( { phoneNumber: phoneA, otp: otpA.code } )
    } );
    console.log( vrA );
    const jwtA = vrA.data.token;

    console.log( 'Verify OTP B' );
    const vrB = await doFetch( `${ baseUrl }/api/auth/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify( { phoneNumber: phoneB, otp: otpB.code } )
    } );
    console.log( vrB );
    const jwtB = vrB.data.token;

    console.log( 'Search users from A' );
    console.log( await doFetch( `${ baseUrl }/api/users/search?phoneNumber=%2B1555000000`, {
        headers: { Authorization: `Bearer ${ jwtA }` }
    } ) );

    console.log( 'Update device token for B' );
    console.log( await doFetch( `${ baseUrl }/api/users/device-token`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ jwtB }` },
        body: JSON.stringify( { fcmToken: 'test-token-123' } )
    } ) );

    const usersResponse = await doFetch( `${ baseUrl }/api/users/search?phoneNumber=%2B1555000000`, { headers: { Authorization: `Bearer ${ jwtA }` } } );
    const recipient = usersResponse.data.users.find( u => u.phoneNumber === phoneB );
    console.log( 'Search returned recipient', recipient ? recipient._id : null );
    if ( !recipient ) {
        console.error( 'Could not find recipient B via search' );
        process.exit( 1 );
    }

    console.log( 'Send message from A to B' );
    const sendResp = await doFetch( `${ baseUrl }/api/messages/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ jwtA }` },
        body: JSON.stringify( { recipientId: recipient._id, messageId: `msg-${ Date.now() }`, body: 'Hello B', clientTimestamp: new Date().toISOString() } )
    } );
    console.log( sendResp );
    const message = sendResp.data.message;
    if ( !message || !message.conversationId ) {
        console.error( 'Message send failed' );
        process.exit( 1 );
    }

    console.log( 'Fetch messages for conversation' );
    console.log( await doFetch( `${ baseUrl }/api/messages/${ message.conversationId }`, {
        headers: { Authorization: `Bearer ${ jwtA }` }
    } ) );

    console.log( 'Update message status to read' );
    console.log( await doFetch( `${ baseUrl }/api/messages/${ message.messageId }/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ jwtB }` },
        body: JSON.stringify( { status: 'read' } )
    } ) );

    await mongoose.disconnect();
    console.log( 'Done' );
} )().catch( err => {
    console.error( err );
    process.exit( 1 );
} );
