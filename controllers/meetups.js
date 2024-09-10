const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/verify-token.js');
const isClub = require('../middleware/is-club')
const Meetup = require('../models/meetup.js')
const Event = require('../models/event.js')
const User = require('../models/user');
const Booking = require ('../models/booking.js');


router.get('/', async (req, res) => {
    try {
        const meetups = await Meetup.find().populate('eventid').populate('userid');
        if (!meetups.length){
            return res.status(404).json({ message: 'No meetups have been created yet.' });
          }
        res.status(200).json(meetups);
    } catch (error) {
        res.status(500).json(error);
    }
})

router.get('/:meetupID', async (req, res) => {
    try {
        const meetup = await Meetup.findById(req.params.meetupID).populate('eventid').populate('userid');
        if (!meetup) {
            return res.status(404).json({ message: 'Meetup not found' });
          }
        res.status(200).json(meetup);
    } catch (error) {
        res.status(500).json(error);
    }
})

router.use(verifyToken, isClub);

// router.post('/', async (req, res) => {
//     try {
//         const { eventid, location } = req.body
//         const event = await Event.findById(eventid);
//         const meetup = await Meetup.create({
//             userid: req.user.id,
//             eventid,
//             location,
//             image: event.image
//         })
//         console.log(meetup)
//         res.status(201).json(meetup);
//     } catch (error) {
//         res.status(500).json(error);
//     }
// })

router.post('/', async (req, res) => {
    try {
        const { eventid, location } = req.body;

        // Validate input
        // if (!eventid || !location) {
        //     return res.status(400).json({ error: 'Event ID and location are required' });
        // }

        // // Check if event exists
        const event = await Event.findById(eventid);
        const Usser = await User.findById(req.user.id).populate('meetups');
        if (Usser.meetups.some(meet => meet.eventid.equals(eventid))){
            return res.status(409).json(`A meetup already exist for this event!`);
        }
        const meetup = await Meetup.create({
            userid: req.user.id,
            eventid,
            location,
            image: event.image
        })
        event.meetups.push(meetup._id);
        await event.save();
        Usser.meetups.push(meetup._id);
        await Usser.save();
        res.status(201).json(meetup);
    } catch (error) {
        console.error('Error creating meetup:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
});



router.put('/:meetupID', async (req, res) => {
    try {
        const meetup = await Meetup.findById(req.params.meetupID);
        if (!meetup.userid.equals(req.user.id))
            return res.status(403).json(`You're not allowed to do that!`)
        
        if (!meetup) {
            return res.status(404).json({ message: 'Meetup not found' });
          }
        const UpdateMeetup = await Meetup.findByIdAndUpdate(
            req.params.meetupID,
            req.body,
            { new: true }
        )
        res.status(200).json(UpdateMeetup);
    } catch (error) {
        res.status(500).json(error);
    }
})

router.delete('/:meetupID', async (req, res) => {
    try {

        const meetup = await Meetup.findById(req.params.meetupID);
        if (!meetup) {
            return res.status(404).json({ message: 'Meetup not found' });
          }
        const user = await User.findById(req.user.id);
        const eventId = meetup.eventid;
        if (!meetup.userid.equals(req.user.id))
            return res.status(403).json(`You're not allowed to do that!`)

        const DeleteMeetup = await Meetup.findByIdAndDelete(req.params.meetupID)
        await Booking.deleteMany({ eventid: DeleteMeetup._id});
        user.meetups.pull(DeleteMeetup._id);
        await user.save();
        await Event.findByIdAndUpdate(eventId, { $pull: { meetups: meetup._id } });

        res.status(200).json(DeleteMeetup);
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = router;