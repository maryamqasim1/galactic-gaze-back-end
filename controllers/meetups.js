const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/verify-token.js');
const isClub = require('../middleware/is-club')
const Meetup = require('../models/meetup.js')
const Event = require('../models/event.js')

// DELETE LATER
// async function insertMockEvent() {
//     try {
//         const event = new Event({
//             name: 'New Event',
//             description: 'This is a description of the sample event.',
//             datetime: new Date('2024-11-01T10:00:00Z'),
//             location: '123 Sample Street',
//             coordinates: '40.7128,-74.0060',
//             image: 'http://example.com/sample-image.jpg',

//         });
//         await event.save();
//         console.log('Mock event inserted successfully.');
//     } catch (error) {
//         console.error('Error inserting mock event:', error);
//     }
// }
// insertMockEvent();

router.get('/', async (req, res) => {
    try {
        const meetups = await Meetup.find().populate('eventid').populate('userid');
        res.status(200).json(meetups);
    } catch (error) {
        res.status(500).json(error);
    }
})

router.get('/:meetupID', async (req, res) => {
    try {
        const meetup = await Meetup.findById(req.params.meetupID).populate('eventid').populate('userid');
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
        // if (!event) {
        //     return res.status(404).json({ error: 'Event not found' });
        // }

        // // Ensure user is authenticated
        // if (!req.user || !req.user.id) {
        //     return res.status(401).json({ error: 'Unauthorized' });
        // }

        // Create the meetup
        const meetup = await Meetup.create({
            userid: req.user.id,
            eventid,
            location,
            image: event.image
        });

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
        if (!meetup.userid.equals(req.user.id))
            return res.status(403).json(`You're not allowed to do that!`)

        const DeleteMeetup = await Meetup.findByIdAndDelete(req.params.meetupID)
        res.status(200).json(DeleteMeetup);
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = router;