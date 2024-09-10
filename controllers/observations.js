const verifyToken = require('../middleware/verify-token');
const express = require('express'); 
const isUser = require('../middleware/is-user');
const router = express.Router();
const Observation = require('../models/observation');
const User = require('../models/user');
const Event = require('../models/event');


// router.use(verifyToken, isUser);

// obs create
router.post('/',verifyToken, isUser ,async (req, res) =>{
    try{
        const {eventid, visibility, notes, image} = req.body;
        const event = await Event.findById(eventid);
        const Usser = await User.findById(req.user.id).populate('observations');

        if (Usser.observations.some(obs => obs.eventid.equals(eventid))) {
            return res.status(409).json(`Observations already exist for this event!`);
        }
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


// obs index (all observations made by user NOT by event)
router.get('/', verifyToken, isUser,async (req, res) => {
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

//all observations made in website
router.get('/all', async (req, res, next) => {
    try {
        const observations = await Observation.find({ }).populate('eventid'); 
        // Need to check if actually need to populate eventid or not, for later
        if (!observations.length) {
            return res.status(404).json({ message: 'No observations have been created yet.' });
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
router.put('/:id',verifyToken, isUser, async (req, res) => {
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


// Delete an obs, as well as remove the observation from events array and the observation from user's observations
router.delete('/:id', verifyToken, isUser,async (req, res) => {
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