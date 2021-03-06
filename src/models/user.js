const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Task = require('./task');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true
		},
		email: {
			type: String,
			required: true,
			unique: true,
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
		},
		tokens: [
			{
				token: {
					type: String,
					required: true
				}
			}
		],
		avatar: {
			type: Buffer
		}
	},
	{
		timestamps: true
	}
);

// Generate jwt
userSchema.methods.generateAuthToken = async function() {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
	console.log(user.tokens);
	user.tokens.push({ token });
	console.log(user.tokens);
	await user.save();
	return token;
};

// Delete some data from the returned data
userSchema.methods.toJSON = function() {
	const user = this;
	const userObject = user.toObject();

	delete userObject.password;
	delete userObject.tokens;
	delete userObject.avatar;

	return userObject;
};

// Login user by email and password
userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email });
	if (!user) {
		throw new Error('Unable to login - User not found');
	}
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw new Error('Unable to login - Password dont match');
	}
	return user;
};

// Virtual - Reference from user to their tasks
userSchema.virtual('tasks', {
	ref: 'Task',
	localField: '_id',
	foreignField: 'owner'
});

// Hashing password as a middleware
userSchema.pre('save', async function(next) {
	const user = this;
	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8);
	}
	next();
});

// Remove all tasks of a delete user as a middleware
userSchema.pre('remove', async function(next) {
	const user = this;
	await Task.deleteMany({ owner: user._id });
	next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
