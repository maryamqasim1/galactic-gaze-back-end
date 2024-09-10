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
        const Usser = await User.findById(req.user.id).populate('bookings');
        if (Usser.bookings.some(booking => booking.meetupid.equals(meetupid))){
            return res.status(409).json(`A booking for this meetup already exists!`);
        }
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
        if (!bookings.length) {
            return res.status(404).json({ message: 'No bookings have been created yet.' });
          }
        res.json(bookings);
    } catch (error) {
        res.status(500).json(error);
    }
})

//see details of a specific booking
router.get('/:bookingID', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingID).populate('meetupid');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
          }
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json(error);
    }
});


//delete a booking
router.delete('/:bookingID', async (req, res) => {
    try {
        
        const booking = await Booking.findById(req.params.bookingID);
        const meetup = await Meetup.findById(booking.meetupid);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (!meetup) {
            return res.status(404).json({ message: 'Meetup not found' });
        }
        
        
        const deletedBooking = await Booking.findByIdAndDelete(booking);
        
        const user = await User.findById(req.user.id);
        user.bookings.pull(deletedBooking._id);
        await user.save();
        meetup.bookings.pull(deletedBooking._id);
        console.log(meetup.bookings)
        await meetup.save();
        res.status(200).json(deletedBooking);
        
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = router;