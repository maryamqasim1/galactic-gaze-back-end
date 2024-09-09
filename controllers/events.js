const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const isAdmin = require('../middleware/is-admin.js');
const Event = require('../models/event.js');
const router = express.Router();

//create new
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
    res.status(200).json(events);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

//event show (details)
router.get('/:eventId', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
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

//event delete
router.delete('/:eventId', verifyToken, isAdmin, async (req, res) => {
    try {
      const event = await Event.findById(req.params.eventId);
  
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      const deletedEvent = await Event.findByIdAndDelete(req.params.eventId);
      res.status(200).json(deletedEvent);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'An error occurred', error });
    }
  });
  

module.exports = router;
