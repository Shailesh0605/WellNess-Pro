require('dotenv').config();

if (process.env.NODE_ENV === 'production') {
	const requiredSecrets = ['JWT_SECRET', 'REFRESH_TOKEN_SECRET'];
	const invalidSecrets = requiredSecrets.filter(name => {
		const value = process.env[name];
		return !value || value.length < 32 || value.startsWith('replace_');
	});

	if (invalidSecrets.length) {
		throw new Error(`Set strong production secrets (at least 32 characters): ${invalidSecrets.join(', ')}`);
	}
}

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'
console.log(`Configured FRONTEND_URL: ${FRONTEND_URL}`)

// Allow requests from the configured FRONTEND_URL, and during local development
// allow any http://localhost:<port> origin so Next.js dev picking 3001/3002 won't break CORS.
const corsOptions = {
	origin: (origin, callback) => {
		// allow non-browser requests like curl/postman (no origin)
		if (!origin) return callback(null, true)
		try {
			const o = origin.toString()
			if (o === FRONTEND_URL) return callback(null, true)
			if (o.startsWith('http://localhost:')) return callback(null, true)
			if (o.startsWith('http://127.0.0.1:')) return callback(null, true)
		} catch (e) {
			// fallthrough to deny
		}
		return callback(new Error('Not allowed by CORS'), false)
	},
	credentials: true,
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Root: show a small friendly message so visiting http://localhost:4000/ isn't a 404
app.get('/', (req, res) => res.send('Fitness app backend running. See /health for JSON status'))

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routers
const authRouter = require('./routes/auth');
const workoutsRouter = require('./routes/workouts');
const userRouter = require('./routes/user');
// youtube routes are located in the sibling `../routes` folder (not ./routes)
const youtubeRoutes = require('../routes/youtube');
const adminRoutes = require('./routes/admin');
const progressRoutes = require('./routes/progress');
const nutritionRoutes = require('./routes/nutrition');
const customFoodsRoutes = require('./routes/customFoods');
app.use('/auth', authRouter);
app.use('/workouts', workoutsRouter);
app.use('/user', userRouter);
app.use('/api/youtube', youtubeRoutes);
app.use('/admin', adminRoutes);
app.use('/progress', progressRoutes);
app.use('/nutrition', nutritionRoutes);
app.use('/custom-foods', customFoodsRoutes);

// simple health check for mounted user routes
app.get('/user/ok', (req, res) => res.json({ ok: true, msg: 'user routes mounted' }));

// refresh endpoint handled in auth router

const PORT = process.env.PORT || 4000;
// Improve observability: bind explicitly to 0.0.0.0 so both IPv4 and IPv6/localhost variants reach it
app.listen(PORT, '0.0.0.0', () => console.log(`Backend running on http://0.0.0.0:${PORT} (accessible via localhost or 127.0.0.1)`));

process.on('uncaughtException', err => {
	console.error('Uncaught exception:', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason) => {
	console.error('Unhandled promise rejection:', reason && reason.stack ? reason.stack : reason);
});
