const express = require('express');
const router = express.Router();
const Item = require('../models/item');

// POST item data
router.post('/', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: 'Error creating item', error });
  }
});


// GET all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find({});
    res.json(items); // This should return an array of item objects
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items', error });
  }
});

module.exports = router;