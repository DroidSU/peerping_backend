const express = require( 'express' );
const cors = require( 'cors' );
const helmet = require( 'helmet' );
const rateLimit = require( 'express-rate-limit' );
const morgan = require( 'morgan' );
const authRoutes = require( './routes/authRoutes' );
const userRoutes = require( './routes/userRoutes' );
const messageRoutes = require( './routes/messageRoutes' );
const { errorHandler } = require( './middleware/errorHandler' );
const logger = require( './config/logger' );

const app = express();

const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split( ',' ).map( ( origin ) => origin.trim() ).filter( Boolean )
    : [ 'http://localhost:3000' ];

const corsOptions = {
    origin: ( origin, callback ) => {
        if ( !origin ) return callback( null, true );
        if ( corsOrigins.includes( origin ) ) return callback( null, true );
        callback( new Error( 'Not allowed by CORS' ) );
    },
    credentials: true,
};

const authLimiter = rateLimit( {
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests from this IP, please try again later' },
} );

app.use( helmet() );
app.use( express.json( { limit: '100kb' } ) );
app.use( cors( corsOptions ) );
app.use( morgan( 'combined' ) );

app.get( '/amidead', ( req, res ) => res.json( { status: 'ok', service: 'peerping-backend', endpoint: 'amidead', alive: true } ) );
app.use( '/api/auth', authLimiter, authRoutes );
app.use( '/api/users', userRoutes );
app.use( '/api/messages', messageRoutes );

// Response logging middleware
app.use( ( req, res, next ) => {
    res.on( 'finish', () => {
        logger.info( `Response: ${ req.method } ${ req.url } ${ res.statusCode }` );
    } );
    next();
} );

app.use( errorHandler );

module.exports = app;
