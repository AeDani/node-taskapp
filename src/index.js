const express = require('express');
require('./db/mongoose');
const userRouter = require('./router/user');
const taskRouter = require('./router/task');

const app = express();
const port = process.env.PORT || 3000;

app.use(userRouter);
app.use(taskRouter);
app.use(express.json());

app.listen(port, () => {
	console.log(`Express server started on port ${port}`);
});
