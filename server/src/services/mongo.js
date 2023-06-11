const mongoose = require('mongoose');

// TODO: Make a test database for integration testing !
const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once('open', () => {
	console.log('MongoDB connection ready!')
});

mongoose.connection.on('error', (err) => {
	console.error('Error while connecting database: ', err);
});

async function mongoConnect() {
	await mongoose.connect(MONGO_URL);
};

async function mongoDisconnect() {
	// await mongoose.connection.close();
	await mongoose.disconnect();
};

module.exports = {
	mongoConnect,
	mongoDisconnect
}

