const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const isAdmin = require('../middleware/is-admin.js');
const Event = require('../models/event.js');
const Meetup = require('../models/meetup.js');
const Observation = require('../models/observation');
const router = express.Router();

//create new event
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

//index events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({}).sort({ dateStarted: 'desc' });
    if (!events.length){
      return res.status(404).json({ message: 'No events have been created yet.' });
    }
    res.status(200).json(events);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

//event show (details) - it also shows details of observations related to each event
router.get('/:eventId', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate({
      path: 'observations',
      populate: {
        path: 'userid'      }
    })
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});


//event edit
router.put('/:eventId', verifyToken, isAdmin, async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.eventId,
      req.body,
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

//event delete, deletes event and deletes the event from the subsequent observations based on that event and meetups based on that event
router.delete('/:eventId', verifyToken, isAdmin, async (req, res) => {
    try {
      const event = await Event.findById(req.params.eventId);
  
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      const deletedEvent = await Event.findByIdAndDelete(req.params.eventId);

      await Observation.deleteMany({ eventid: deletedEvent._id});
      await Meetup.deleteMany({ eventid: deletedEvent._id});
      
      res.status(200).json(deletedEvent);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'An error occurred', error });
    }
  });
  

module.exports = router;
