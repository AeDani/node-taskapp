const express = require('express');
const multer = require('multer');
const User = require('../models/user');
const auth = require('../middleware/auth');
const router = express.Router();

// Sign up route
router.post('/users', async (req, res) => {
	const user = User(req.body);
	try {
		await user.save();
		const token = await user.generateAuthToken();
		res.status(201).send({ user, token });
	} catch (error) {
		res.status(400).send(error);
	}
});

// Login route
router.post('/users/login', async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findByCredentials(email, password);
		const token = await user.generateAuthToken();
		res.send({ user, token });
	} catch (error) {
		res.status(400).send();
	}
});

// Log out route
router.post('/users/logout', auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter(
			token => token.token !== req.token
		);
		await req.user.save();
		res.send('Loged out');
	} catch (error) {
		res.status(500).send();
	}
});

// Log out all sessions
router.post('/users/logoutall', auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.send('Loged out of all sessions');
	} catch (error) {
		res.status(500).send();
	}
});

// get all user out of DB - no auth requirede
router.get('/users', async (req, res) => {
	try {
		const users = await User.find({});
		res.send(users);
	} catch (error) {
		res.status(500).send();
	}
});

// Get user profil of authenticated user
router.get('/users/me', auth, async (req, res) => {
	res.send(req.user);
});

// router.get('/users/:id', async (req, res) => {
// 	const _id = req.params.id;
// 	try {
// 		const user = await User.findById(_id);
// 		if (!user) {
// 			return res.status(404).send('No User found');
// 		}
// 		res.send(user);
// 	} catch (error) {
// 		res.status(500).send();
// 	}
// });

router.patch('/users/me', auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ['name', 'age', 'email', 'password'];
	const isAllowedUpdate = updates.every(update =>
		allowedUpdates.includes(update)
	);

	if (!isAllowedUpdate) {
		res.status(400).send('Property not allowed to update');
	}

	try {
		updates.forEach(update => (req.user[update] = req.body[update]));
		await req.user.save();

		res.send(req.user);
	} catch (error) {
		res.status(500).send();
	}
});

router.delete('/users/me', auth, async (req, res) => {
	try {
		await req.user.remove();
		res.send(req.user);
	} catch (error) {
		res.status(500).send();
	}
});

// Multer Middelware
const upload = multer({
	limits: { fileSize: 1000000 },
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
			return cb(new Error('Please upload a jpg, jpeg or png file'));
		}
		cb(undefined, true);
	}
});

router.post(
	'/users/me/avatar',
	auth,
	upload.single('avatar'),
	async (req, res) => {
		req.user.avatar = req.file.buffer;
		await req.user.save();
		res.send();
	},
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	}
);

router.delete('/users/me/avatar', auth, async (req, res) => {
	try {
		req.user.avatar = undefined;
		await req.user.save();
		res.send('avatar deleted');
	} catch (error) {
		res.status(500).send();
	}
});

router.get('/users/:id/avatar', async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user || !user.avatar) {
			throw new Error();
		}
		res.set('Content-Type', 'image/jpg');
		res.send(user.avatar);
	} catch (error) {
		res.status(404).send();
	}
});

module.exports = router;
