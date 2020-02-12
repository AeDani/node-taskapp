const express = require('express');
const Task = require('../models/task');
const router = express.Router();

router.post('/tasks', async (req, res) => {
	const task = Task(req.body);
	try {
		await task.save();
		res.status(201).send(task);
	} catch (error) {
		res.status(400).send(error);
	}
});

router.get('/tasks', async (req, res) => {
	try {
		const tasks = await Task.find({});
		res.send(tasks);
	} catch (error) {
		res.status(500).send();
	}
});

router.get('/tasks/:id', async (req, res) => {
	const _id = req.params.id;
	try {
		const task = await Task.findById(_id);
		if (!task) {
			return res.status(404).send('No Task found');
		}
		res.send(task);
	} catch (error) {
		res.status(500).send();
	}
});

router.patch('/tasks/:id', async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ['description', 'completed'];
	const isAllowedUpdate = updates.every(update =>
		allowedUpdates.includes(update)
	);
	if (!isAllowedUpdate) {
		res.status(400).send('Property not allowed to update');
	}
	try {
		/* 		const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		}); */

		const task = await Task.findById(req.params.id);
		updates.forEach(update => (task[update] = req.body[update]));
		await task.save();

		if (!task) {
			return res.status(404).send('No task found');
		}
		res.send(task);
	} catch (error) {
		res.status(500).send(error);
	}
});

router.delete('/tasks/:id', async (req, res) => {
	try {
		const task = await Task.findByIdAndDelete(req.params.id);
		if (!task) {
			return res.status(404).send('No Task found');
		}
		res.send(task);
	} catch (error) {
		res.status(500).send();
	}
});

module.exports = router;
