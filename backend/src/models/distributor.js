const mongoose = require('mongoose');

// Define schema for accumulated data with a date field (optional)
const accumulatedDataSchema = new mongoose.Schema({
  date: { type: String, required: true },
  totalWeight: { type: Number, default: 0 },
  totalBoxCount: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 }
});

// Define main distributor schema
const distributorSchema = new mongoose.Schema({
  distributorName: { type: String, required: true },
  distributorId: { type: String, required: true },
  distributorPhone: { type: String, required: true },
  address: { type: String, required: true },
  distributionLocation: { type: String, required: true },
  accumulatedData: [accumulatedDataSchema] // Optional accumulated data
});

module.exports = mongoose.model('Distributor', distributorSchema);
