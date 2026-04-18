const express = require( 'express' );
const cors = require( 'cors' );
const morgan = require( 'morgan' );
const authRoutes = require( './routes/authRoutes' );
const userRoutes = require( './routes/userRoutes' );
const messageRoutes = require( './routes/messageRoutes' );
const { errorHandler } = require( './middleware/errorHandler' );

const app = express();

app.use( express.json() );
app.use( cors() );
app.use( morgan( 'tiny' ) );

app.get( '/', ( req, res ) => res.json( { status: 'ok', service: 'peerping-backend' } ) );
app.use( '/api/auth', authRoutes );
app.use( '/api/users', userRoutes );
app.use( '/api/messages', messageRoutes );
app.use( errorHandler );

module.exports = app;
