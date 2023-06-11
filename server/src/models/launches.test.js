const superTestRequest = require('supertest');
const app = require('../app');
const { mongoConnect, mongoDisconnect } = require('../services/mongo');

describe('Launches API', () => {
	beforeAll(async () => {
		await mongoConnect();
	});

	afterAll(async () => {
		await mongoDisconnect();
	});

	describe('Test GET /launches', () => {
		test('It should respond with 200 success', async () => {
			const response = await superTestRequest(app)
				.get('/v1/launches')
				.expect('content-type', /json/)
				.expect(200);
			// expect(response.statusCode).toBe(200);
		});
	});

	describe('Test POST /launches', () => {
		const completeLaunchData = {
			mission: 'Kepler Exploration X',
			rocket: 'Explorer IS4',
			target: 'Kepler-442 b',
			launchDate: 'December 27, 2030',
		}

		const launchDataWithoutDate = {
			mission: 'Kepler Exploration X',
			rocket: 'Explorer IS4',
			target: 'Kepler-442 b',
		}

		const launchDataWithInvalidDate = {
			mission: 'Kepler Exploration X',
			rocket: 'Explorer IS4',
			target: 'Kepler-62 f',
			launchDate: 'hellooooooooooo',
		}

		test('It should respond with 201 success', async () => {
			const response = await superTestRequest(app)
				.post('/v1/launches')
				.send(completeLaunchData)
				.expect('content-type', /json/)
				.expect(201);

			const requestDate = new Date(completeLaunchData.launchDate).valueOf();
			const responseDate = new Date(response.body.launchDate).valueOf();

			expect(responseDate).toBe(requestDate);

			expect(response.body).toMatchObject(launchDataWithoutDate);
		});

		test('It should catch missing required properties', async () => {
			const response = await superTestRequest(app)
				.post('/v1/launches')
				.send(launchDataWithoutDate)
				.expect(400);

			expect(response.body).toStrictEqual({
				error: 'Missing required launch property'
			})
		});

		test('It should catch invalid dates', async () => {
			const response = await superTestRequest(app)
				.post('/v1/launches')
				.send(launchDataWithInvalidDate)
				.expect(400);

			expect(response.body).toStrictEqual({
				error: 'Invalid launch date'
			})
		});
	});
});


