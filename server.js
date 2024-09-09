const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');

dotenv.config();

require('./config/database');
const express = require('express');

//contorllers
const usersRouter = require('./controllers/users');
const meetups = require('./controllers/meetups');
const observationsRouter = require('./controllers/observations');
const eventsRouter = require('./controllers/events.js');
const bookingsRouter = require ('./controllers/bookings')



const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());


// Routes
app.use('/users', usersRouter);
app.use('/meetups', meetups);
app.use('/observations', observationsRouter);
app.use('/events', eventsRouter);
app.use('/bookings',bookingsRouter)

app.listen(PORT, () => {
  console.log('The express app is ready!');
});




