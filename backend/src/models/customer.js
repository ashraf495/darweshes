const mongoose = require('mongoose');

// Define schema for accumulated data with a date field
const accumulatedDataSchema = new mongoose.Schema({
  date: { type: String, required: true }, 
  totalWeight: { type: Number, default: 0 },
  totalBoxCount: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 }
});

// Define main customer schema
const customerSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerId: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  carNumber: { type: String, required: true },
  operations: [{
    history: String,
    customerId: String,
    distributorId: String,
    category: String,
    price: Number,
    numBoxes: Number,
    boxType: String, // Add boxType field
    weight: Number,
    numUnits: Number
  }],
  accumulatedData: [accumulatedDataSchema]
});

module.exports = mongoose.model('Customer', customerSchema);
