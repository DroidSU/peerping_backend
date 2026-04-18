const mongoose = require( 'mongoose' );
const logger = require( './logger' );

const connectDatabase = async () => {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if ( !uri ) throw new Error( 'MONGODB_URI or MONGO_URI must be defined' );

    await mongoose.connect( uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } );

    logger.info( 'Connected to MongoDB' );
};

module.exports = { connectDatabase };
