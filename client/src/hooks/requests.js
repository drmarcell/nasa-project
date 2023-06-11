const API_URL = 'https://nasa-spacex.onrender.com/v1';

// Load planets and return as JSON.
async function httpGetPlanets() {
	try {
		const response = await fetch(`${API_URL}/planets`);
		const planets = await response.json();
		// console.log('planets are: ', planets);
		return planets;
	} catch (err) {
		console.error('error while getting planets: ', err);
	}
}

// Load launches, sort by flight number, and return as JSON.
async function httpGetLaunches() {
	try {
		const response = await fetch(`${API_URL}/launches`);
		const launches = await response.json();
		const sortedLaunches = launches.sort((a, b) => {
			return a.flightNumber - b.flightNumber;
		})
		// console.log('sorted launches: ', sortedLaunches);
		return sortedLaunches;
	} catch (err) {
		console.error('error while getting launches: ', err);
	}
}

// Submit given launch data to launch system.
async function httpSubmitLaunch(launch) {
	try {
		return await fetch(`${API_URL}/launches`, {
			method: 'POST',
			headers: {'content-type': 'application/json'},
			body: JSON.stringify(launch)
		});
	} catch (err) {
		console.error('error while submit launch data: ', err);
		return { ok: false }
	}
}

// Delete launch with given ID.
async function httpAbortLaunch(id) {
	try {
		return await fetch(`${API_URL}/launches/${id}`, {
			method: 'DELETE'
		})
	} catch (err) {
		console.error('error while aborting launch', err);
		return { ok: false }
	}
}

export {
	httpGetPlanets,
	httpGetLaunches,
	httpSubmitLaunch,
	httpAbortLaunch,
};
