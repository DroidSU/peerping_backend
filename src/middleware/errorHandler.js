const logger = require( '../config/logger' );

const errorHandler = ( err, req, res, next ) => {
    logger.error( err.message || 'Unexpected error', err.stack || 'no stack' );

    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    res.status( status ).json( { message } );
};

module.exports = { errorHandler };
