const http = require('http');
const dotenv = require('dotenv');
dotenv.config();
const app = require('./app');
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchData } = require('./models/launches.model');
const { mongoConnect } = require('./services/mongo');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

// common pattern
async function startServer() {
	// connect to database
	await mongoConnect();
	// waiting the planetsData before server listens
	await loadPlanetsData();
	await loadLaunchData();

	server.listen(PORT, () => {
		console.log(`Server listen on port ${PORT}`);
	});
}

startServer();
