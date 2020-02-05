const mongoose = require('mongoose');
const validator = require('validator');

mongoose.connect('mongodb://localhost:27017/task-manager-api', {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
});

const User = mongoose.model('User', {
	name: {
		type: String,
		required: true,
		trim: true
	},
	email: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error('Email is not valid');
			}
		}
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minlength: 7,
		validate(value) {
			if (value.toLowerCase().includes('password')) {
				throw new Error('Password can not contain "password"');
			}
		}
	},
	age: {
		type: Number,
		default: 0,
		validate(value) {
			if (value < 0) {
				throw new Error('Age must be positive.');
			}
		}
	}
});

const user = new User({
	name: 'Daniel',
	email: 'danie@ASDKF.COM',
	password: 'passwdpdppd    '
});
user
	.save()
	.then(() => {
		console.log(user);
	})
	.catch(err => {
		console.log(err);
	});

const Task = mongoose.model('Task', {
	descrition: {
		type: String,
		required: true,
		trim: true
	},
	completed: {
		type: Boolean,
		default: false
	}
});

const task = new Task({ descrition: 'my First Task', completed: false });

task
	.save()
	.then(data => {
		console.log(data);
	})
	.catch(err => {
		console.log(err);
	});
