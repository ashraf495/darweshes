const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  itemType: { type: String, required: true }, // 'Fruit' or 'Vegetable'
  season: { type: String, required: true }, // 'Summer', 'Winter', 'Spring', 'Autumn'
  rarity: { type: String, required: true } // 'Common' or 'Rare'
});

module.exports = mongoose.model('Item', itemSchema);