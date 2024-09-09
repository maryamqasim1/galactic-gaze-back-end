const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verify-token.js');
const isUser = require ('../middleware/is-user.js');
const Event = require ('../models/event.js');
const User = require ('../models/user.js');
const Meetup = require ('../models/meetup.js');
const Booking = require ('../models/booking.js');

router.use(verifyToken, isUser);

//create a new booking
router.post('/', async (req, res, next) => {
    try{
        const {meetupid} = req.body;
        const meetup = await Meetup.findById(meetupid);
        const Usser = await User.findById(req.user.id);
        const booking = await Booking.create({
            userid: req.user.id,
            meetupid: meetupid
        })

        meetup.bookings.push(booking._id);
        await meetup.save();
        Usser.bookings.push(booking._id);
        await Usser.save();

        res.status(201).json(booking);
    }catch (error) {
        res.status(500).json(error);
    }
})

//see all bookings of user, plus send the details of each meetup with it as well
router.get('/', async (req, res, next) => {
    try {
        const bookings = await Booking.find({ userid: req.user.id }).populate('meetupid');
        res.json(bookings);
    } catch (error) {
        res.status(500).json(error);
    }
})

//see details of a specific booking
router.get('/:bookingID', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingID).populate('meetupid');
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json(error);
    }
});

//delete a booking
router.delete('/:bookingID', async (req, res) => {
    try {
        
        const {meetupid} = req.body;
        const booking = await Booking.findByIdAndDelete(req.params.bookingID);
        const meetup = await Meetup.findById(meetupid);
        const user = await User.findById(req.user.id);
        user.bookings.pull(booking._id);
        await user.save();
        meetup.bookings.pull(booking._id);
        await meetup.save();
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = router;