const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios');
const launchesDatabase = require('./launches.mongo');
const planetsDatabase = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = process.env.SPACEX_API_URL;

async function populateLaunches() {
	console.log('Downloading launch data...');
	const response = await axios.post(SPACEX_API_URL, {
		query: {},
		options: {
			pagination: false,
			populate: [
				{
					path: 'rocket',
					select: {
						name: 1
					}
				},
				{
					path: 'payloads',
					select: {
						'customers': 1
					}
				}
			]
		}
	});

	if (response.status !== 200) {
		console.log('Problem downloading launch data');
		throw new Error('Launch data download failed!');
	}

	const launchDocs = response.data.docs;
	for (const launchDoc of launchDocs) {
		const payloads = launchDoc['payloads'];
		const customers = payloads.flatMap(payload => {
			return payload['customers'];
		});

		const launch = {
			flightNumber: launchDoc['flight_number'],
			mission: launchDoc['name'],
			rocket: launchDoc['rocket']['name'],
			launchDate: launchDoc['date_local'],
			upcoming: launchDoc['upcoming'],
			success: launchDoc['success'],
			customers
		};

		console.log(`${launch.flightNumber} ${launch.mission}`);

		// populate launches collection
		await saveLaunch(launch);
	};
}

async function loadLaunchData() {
	const firstLaunch = await findLaunch({
		flightNumber: 1,
		rocket: 'Falcon 1',
		mission: 'FalconSat'
	});
	if (firstLaunch) {
		console.log('Launch data already loaded.');
	} else {
		await populateLaunches();
	}
}

async function findLaunch(filter) {
	return launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId) {
	return await findLaunch({
		flightNumber: launchId
	})
};

async function getLatestFlightNumber() {
	// sort sorts parameter in ascent order, to descent the order need a minus sign before
	const latestLaunch = await launchesDatabase
		.findOne()
		.sort('-flightNumber');

	return latestLaunch ? latestLaunch.flightNumber : DEFAULT_FLIGHT_NUMBER;
};

async function getAllLaunches(skip, limit) {
	// exclude the _id and __v in response
	// sort minus -> decending, plus -> ascending
	return await launchesDatabase.find({}, {
		'_id': 0,
		'__v': 0
	})
		.sort({ flightNumber: 1 })
		.skip(skip)
		.limit(limit);
};

async function saveLaunch(launch) {
	// if flightNumber doesn't exists, it gets created with the second param
	// if exists and upsert: true is given in the third param, it updates based on the second param
	// instead of updateOne, good to use findOneAndUpdate, it doesn't includes for example $setOnInsert etc.
	await launchesDatabase.findOneAndUpdate({
		flightNumber: launch.flightNumber
	},
		launch,
		{
			upsert: true
		});
};

async function scheduleNewLaunch(launch) {
	const planet = await planetsDatabase.findOne({
		keplerName: launch.target
	})
	if (!planet) {
		throw new Error('No matching planet found!');
	}

	const newFlightNumber = await getLatestFlightNumber() + 1;
	const newLaunch = Object.assign(launch, {
		success: true,
		upcoming: true,
		customers: ['You'],
		flightNumber: newFlightNumber
	});

	await saveLaunch(newLaunch);
};

async function abortLaunchById(launchId) {
	// not upsert operation
	const aborted = await launchesDatabase.updateOne({
		flightNumber: launchId
	}, {
		upcoming: false,
		success: false
	});

	return aborted.modifiedCount === 1;
};

module.exports = {
	loadLaunchData,
	getAllLaunches,
	scheduleNewLaunch,
	existsLaunchWithId,
	abortLaunchById
}
