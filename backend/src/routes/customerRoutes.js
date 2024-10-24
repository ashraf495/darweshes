const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');

// GET a specific customer by customerId
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findOne({ customerId: req.params.id });
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer', error });
  }
});

// GET accumulated data for a specific customer by customerId and date
router.get('/:id/accumulated', async (req, res) => {
  try {
    const customerId = req.params.id;
    const date = req.query.date;
    const customer = await Customer.findOne({ customerId });

    if (customer) {
      const accumulatedData = customer.accumulatedData.find(acc => acc.date === date);
      if (accumulatedData) {
        res.json(accumulatedData);
      } else {
        res.status(404).json({ message: 'No accumulated data found for the specified date' });
      }
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching accumulated data', error });
  }
});

// POST customer data
router.post('/', async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Error creating customer', error });
  }
});

// GET all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers', error });
  }
});

// POST an operation for a specific customer by customerId
router.post('/:id/operations', async (req, res) => {
  try {
    const customer = await Customer.findOne({ customerId: req.params.id });
    if (customer) {
      const { history, customerId, distributorId, category, price, numBoxes, boxType, weight, numUnits,itemType } = req.body;

      // Create new operation object including units
      const newOperation = {
        history,
        customerId,
        distributorId,
        category,
        price,
        numBoxes,
        boxType,
        weight,
        numUnits,
        itemType
      };

      customer.operations.push(newOperation);
      await customer.save();
      res.status(201).json(customer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error adding operation', error });
  }
});

// PUT to accumulate data for a specific customer by customerId and date
router.put('/:id/accumulate', async (req, res) => {
  try {
    const customerId = req.params.id;
    const { date } = req.query;
    
    const customer = await Customer.findOne({ customerId });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const operationsForDate = customer.operations.filter(op => op.history === date);
    const totalBoxCount = operationsForDate.reduce((acc, op) => acc + op.numBoxes, 0);
    const totalWeight = operationsForDate.reduce((acc, op) => acc + op.weight, 0);
    const totalPrice = operationsForDate.reduce((acc, op) => acc + (op.weight * op.price), 0);

    const existingAccumulatedData = customer.accumulatedData.find(acc => acc.date === date);
    if (existingAccumulatedData) {
      existingAccumulatedData.totalBoxCount = totalBoxCount;
      existingAccumulatedData.totalWeight = totalWeight;
      existingAccumulatedData.totalPrice = totalPrice;
    } else {
      customer.accumulatedData.push({ date, totalBoxCount, totalWeight, totalPrice });
    }

    await customer.save();
    res.status(200).json({ message: 'Accumulated data updated successfully' });
  } catch (error) {
    console.error('Error updating accumulated data:', error);
    res.status(500).json({ message: 'Error updating accumulated data', error });
  }
});

// General search route for customers, distributors, and item type with date range filtering
router.get('/search', async (req, res) => {
  const { searchText, dateFrom, dateTo, itemType } = req.query;
  
  const filters = {};

  if (searchText) {
    filters.$or = [
      { customerName: { $regex: searchText, $options: 'i' } },
      { 'operations.distributorId': { $regex: searchText, $options: 'i' } }
    ];
  }

  if (dateFrom || dateTo) {
    filters['operations.history'] = {};
    if (dateFrom) {
      filters['operations.history'].$gte = dateFrom;
    }
    if (dateTo) {
      filters['operations.history'].$lte = dateTo;
    }
  }

  if (itemType) {
    filters['operations.category'] = { $regex: itemType, $options: 'i' };
  }

  try {
    const customers = await Customer.find(filters);
    
    if (customers.length === 0) {
      return res.status(404).json({ message: 'No results found for the given criteria' });
    }

    // Flatten the operations array to return results for each operation
    const results = customers.flatMap(customer =>
      customer.operations.map(operation => ({
        name: customer.customerName,
        itemType: operation.category,
        date: operation.history,
        details: `Boxes: ${operation.numBoxes}, Weight: ${operation.weight}, Price: ${operation.price}`
      }))
    );

    res.json(results);
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ message: 'Error performing search', error });
  }
});


module.exports = router;