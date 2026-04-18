const fetch = require( 'node-fetch' );

// Example: Get conversations for a user
// This assumes you have a valid JWT token from authentication

async function getUserConversations ( token, limit = 10 ) {
    try {
        const response = await fetch( `http://localhost:3000/api/messages/conversations?limit=${ limit }`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${ token }`,
                'Content-Type': 'application/json'
            }
        } );

        const data = await response.json();

        if ( response.ok ) {
            console.log( 'Conversations retrieved successfully:' );
            console.log( JSON.stringify( data, null, 2 ) );
        } else {
            console.error( 'Error:', data.message );
        }
    } catch ( error ) {
        console.error( 'Network error:', error.message );
    }
}

// Usage example:
// Replace 'YOUR_JWT_TOKEN_HERE' with an actual token from /api/auth/verify-otp
// getUserConversations( 'YOUR_JWT_TOKEN_HERE' );

module.exports = { getUserConversations };</content >
    <parameter name="filePath">d:\Backend_Projects\peerping_backend\test_conversations.js