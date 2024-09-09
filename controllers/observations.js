const verifyToken = require('../middleware/verify-token');
const express = require('express'); 
const isUser = require('../middleware/is-user');
const router = express.Router();
const Observation = require('../models/observation');
const User = require('../models/user');
const Event = require('../models/event');


// DELETE LATER
// const Event = require('../models/event.js')
// async function insertMockEvent() {
//     try {
//         const event = new Event({
//             name: 'Sample Event',
//             description: 'This is a description of the sample event.',
//             datetime: new Date('2024-10-01T10:00:00Z'),
//             location: '123 Sample Street, Sample City, SC',
//             coordinates: '40.7128,-74.0060',
//             image: 'http://example.com/sample-image.jpg',
//             observations: [],

//         });
//         await event.save();
//         console.log('Mock event inserted successfully.');
//     } catch (error) {
//         console.error('Error inserting mock event:', error);
//     }
// }
// insertMockEvent();


router.use(verifyToken, isUser);

// obs create
router.post('/', async (req, res) =>{
    try{
        const {eventid, visibility, notes, image} = req.body;
        const event = await Event.findById(eventid);
        const Usser = await User.findById(req.user.id);
        const observation= await Observation.create({
            userid: req.user.id,
            eventid: eventid,
            visibility: visibility,
            notes: notes,
            image: image
        });
        event.observations.push(observation._id);
        await event.save();
        Usser.observations.push(observation._id);
        await Usser.save();

        res.status(201).json(observation);
    }catch(error){
        res.status(500).json({message: error.message});
    }
})


// // obs index for an event
// router.get('/event/:eventId', async (req, res) => {
//     try {
//         const eventId = req.params.eventId;
//         const foundObservations = await Observation.find({ eventid: eventId })
//             .populate('userid')
//             .populate('eventid');
//         res.status(200).json(foundObservations);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });


// obs index (all observations made by user NOT by event)
router.get('/', async (req, res) => {
    try {
        const observations = await Observation.find({ userid: req.user.id }).populate('eventid'); 
        //need to check if actually need to populate eventid or not, for later
        if (!observations.length) {
            return res.status(404).json({ message: 'No observations found for this user.' });
        }
        res.json(observations);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Obs details
router.get('/:id', async (req, res) => {
    try {
        const observationId = req.params.id;
        const foundObservation = await Observation.findById(observationId).populate('eventid');
       
        if (!foundObservation) {
            res.status(404);
            throw new Error('Observation not found.');
        }

        res.status(200).json(foundObservation);
    } catch (error) {
        if (res.statusCode === 404) {
            res.json({ error: error.message });
        } else {
            res.status(500).json({message: error.message});
        }
    }
});

// Update an obs
router.put('/:id', async (req, res) => {
    try {
        const observationId = req.params.id;
        const updatedObservation = await Observation.findByIdAndUpdate(observationId, req.body, {
            new: true,
        }).populate('eventid');

        if (!updatedObservation) {
            res.status(404);
            throw new Error('Observation not found.');
        }

        res.status(200).json(updatedObservation);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});


// Delete an obs
router.delete('/:id', async (req, res) => {
    try {
        const observationId = req.params.id;
        const deleteObservation = await Observation.findByIdAndDelete(observationId);

        if (!deleteObservation) {
            res.status(404);
            throw new Error('Observation not found.');
        }

        const event = await Event.findById(deleteObservation.eventid);
        event.observations = event.observations.filter(id => id.toString() !== observationId.toString());
        await event.save();

        const user = await User.findById(deleteObservation.userid);
        user.observations = user.observations.filter(id => id.toString() !== observationId.toString());
        await user.save();

        res.status(200).json(deleteObservation);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});


module.exports = router;