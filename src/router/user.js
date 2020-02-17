const express = require('express');
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

module.exports = router;
