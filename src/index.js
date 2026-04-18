const path = require( 'path' );
require( 'dotenv' ).config( { path: path.resolve( __dirname, '..', '.env' ) } );
const http = require( 'http' );
const app = require( './app' );
const { initSocketServer } = require( './socket' );
const { connectDatabase } = require( './config/db' );
const logger = require( './config/logger' );

const PORT = process.env.PORT || 4000;

async function start () {
    await connectDatabase();

    const server = http.createServer( app );
    initSocketServer( server );

    server.listen( PORT, () => {
        logger.info( `Server listening on http://localhost:${ PORT }` );
    } );
}

start().catch( ( error ) => {
    logger.error( 'Startup failed', error );
    process.exit( 1 );
} );
