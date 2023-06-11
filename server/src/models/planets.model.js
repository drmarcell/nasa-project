const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const planets = require('./planets.mongo');

// Earth is the benchmark
const minSolarLevel = 0.36;
const maxSolarLevel = 1.11;
const maxRadius = 1.6;

const isHabitablePlanet = planet => {
	return planet['koi_disposition'] == 'CONFIRMED'
		&& planet['koi_insol'] > minSolarLevel
		&& planet['koi_insol'] < maxSolarLevel
		&& planet['koi_prad'] < maxRadius;
}

function loadPlanetsData() {
	return new Promise((resolve, reject) => {
		// createReadStream give us eventemitter, needs to finish before called, so put inside async or promise function
		fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
			// connecting the stream and parse together with pipe
			.pipe(parse({
				comment: '#',
				columns: true
			}))
			.on('data', async (planetData) => {
				if (isHabitablePlanet(planetData)) {
					// habitablePlanets.push(planetData);
					savePlanet(planetData);
				}
			})
			.on('error', err => {
				console.error('error occured: ', err);
				reject('rejected with error: ', err);
			})
			.on('end', async () => {
				// console.log('habitablePlanets are: ', habitablePlanets);
				console.log('done processing');
				const countPlanetsFound = (await getAllPlanets()).length;
				console.log(`'${countPlanetsFound}' habitable planets found!`);
				resolve();
			});
	});
};

async function getAllPlanets() {
	// first argument filters the criteria, second argument is the 'projection', which means
	// which fields are excluded from the response
	return await planets.find({}, {
		'_id': 0,
		'__v': 0
	});
}

async function savePlanet(planet) {
	// mongoose 'upsert' operation: insert + update = upsert !!
	// upsert basically insert, but update part allows insert only when object already exist
	// TODO: Replace below create with upsert

	// upsert = insert when doc not exists, update when doc exists
	// upsert is updateOne = updateOne first param is insert, if it exist updates with the second param
	// but need upsert: true for third param!!!
	// by default, updateOne function only updates
	try {
		await planets.updateOne({
			keplerName: planet.kepler_name
		}, {
			keplerName: planet.kepler_name
		}, {
			upsert: true
		});
	} catch (err) {
		console.error('Could not save planet: ', err);
	}
}

module.exports = {
	loadPlanetsData,
	getAllPlanets
}
