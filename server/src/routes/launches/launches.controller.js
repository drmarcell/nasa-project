const { getAllLaunches, scheduleNewLaunch } = require('../../models/launches.model');
const { existsLaunchWithId, abortLaunchById } = require('../../models/launches.model');
const { getPagination } = require('../../services/query');

async function httpGetAllLaunches(req, res) {
	const { skip, limit } = getPagination(req.query);
	const launches = await getAllLaunches(skip, limit);
	return res.status(200).json(launches);
};

async function httpAddNewLaunch(req, res) {
	const launch = req.body;

	if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.target) {
		return res.status(400).json({
			error: 'Missing required launch property'
		});
	}

	launch.launchDate = new Date(launch.launchDate);

	// check the date with isNaN. It converts the date to number, if number exists the param is a date
	// isNaN calls the params - if param is an object - .valueOf() method to check for example launch.launchDate.valueOf()
	if (isNaN(launch.launchDate)) {
		return res.status(400).json({
			error: 'Invalid launch date'
		});
	}

	await scheduleNewLaunch(launch);
	return res.status(201).json(launch);
};

async function httpAbortLaunch(req, res) {
	// convert id to number!
	const launchId = +req.params.id;
	const existsLaunch = await existsLaunchWithId(launchId);

	// if launch doesn't exist
	if (!existsLaunch) {
		return res.status(404).json({
			error: 'launch not found'
		});
	}

	// if launch does exist
	const isAborted = await abortLaunchById(launchId);
	if (isAborted) {
		return res.status(400).json({
			error: 'Launch not aborted'
		})
	};

	return res.status(200).json({
		ok: true
	});
}

module.exports = {
	httpGetAllLaunches,
	httpAddNewLaunch,
	httpAbortLaunch
}
