const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');
const Distributor = require('../models/distributor');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path')
const XLSX = require('xlsx');

// GET all distributors for use in the Customers page
router.get('/', async (req, res) => {
  try {
    const distributors = await Distributor.find({}); // Retrieve all distributors from the database
    res.json(distributors); // Send the list of distributors as the response
  } catch (error) {
    console.error('Error fetching distributors:', error);
    res.status(500).json({ message: 'Error fetching distributors', error });
  }
});

// GET operations for a specific distributor on a specific history date
router.get('/:distributorId/operations', async (req, res) => {
  const { distributorId } = req.params;
  const { history } = req.query; // Use 'history' as the query parameter

  try {
    // Find all customers with operations that match the distributorId and history date
    const customers = await Customer.find({
      'operations.distributorId': distributorId,
      'operations.history': history // Filter by the 'history' field
    });

    // Collect the matching operations
    const operations = customers.flatMap(customer =>
      customer.operations.filter(operation =>
        operation.distributorId === distributorId && operation.history === history
      )
    );

    // Send back the operations or a 404 if none are found
    if (operations.length > 0) {
      res.json(operations);
    } else {
      res.status(404).json({ message: 'No operations found for the specified distributor and history' });
    }
  } catch (error) {
    console.error('Error fetching operations:', error);
    res.status(500).json({ message: 'Error fetching operations', error });
  }
});

// POST distributor data
router.post('/', async (req, res) => {
  try {
    const newDistributor = new Distributor(req.body);
    const savedDistributor = await newDistributor.save();
    res.status(201).json(savedDistributor);
  } catch (error) {
    res.status(500).json({ message: 'Error creating distributor', error });
  }
});


// Route to generate XLSX for a specific distributor's sales operations
router.post('/generate-xlsx', async (req, res) => {
  const {
    distributorId,
    history,
    salesData,
    currentBoxes,
    boxDeposit,
    discount,
    paidAmount,
    finalResult,
    remainingForAgency,
    remainingForReseller,
    remainingBoxes
  } = req.body;

  try {
    if (!salesData || salesData.length === 0) {
      return res.status(404).json({ message: 'No operations found for the specified distributor and history' });
    }

    // Fetch distributor name based on ID
    const distributorName = await getDistributorName(distributorId);

    // Prepare the data for the first panel table (sales operations)
    const headers1 = ['الناتج', 'عدد الصناديق', 'نوع الصناديق', 'عدد الوحدات', 'سعر الصنف', 'الوزن', 'الصنف', 'التاريخ'];
    const rows1 = salesData.map(operation => [
      operation.price * operation.weight,
      operation.numBoxes,
      operation.boxType === 'small' ? 'صناديق صغيرة' : 'صناديق كبيرة',
      operation.numUnits,
      operation.price,
      operation.weight,
      operation.category,
      operation.history
    ]);

    const wsData1 = [headers1, ...rows1]; // Combine headers with rows for the first table

    // Prepare the data for the second panel (payment and remaining data)
    const headers2 = ['عدد الصناديق الحالية', 'رهن الصناديق', 'الخصم', 'المدفوع', 'الناتج النهائي', 'المتبقي للوكالة', 'المتبقي للموزع', 'عدد الصناديق المتبقية'];
    const rows2 = [
      [currentBoxes, boxDeposit, discount, paidAmount, finalResult, remainingForAgency, remainingForReseller, remainingBoxes]
    ];

    const wsData2 = [headers2, ...rows2]; // Combine headers with rows for the second table

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]); // Start with an empty sheet

    // Add the distributor's name as a header in column E (shifted to the right)
    XLSX.utils.sheet_add_aoa(ws, [[`تقرير للموزع: ${distributorName}`]], { origin: 'E1' });
    XLSX.utils.sheet_add_aoa(ws, [['']], { origin: 'E2' }); // Empty row for padding

    // Add the first table (sales operations) starting from column E
    XLSX.utils.sheet_add_aoa(ws, wsData1, { origin: 'E4' }); // Start at row 4, column E after padding

    // Add an empty row between the tables
    XLSX.utils.sheet_add_aoa(ws, [['']], { origin: -1 });

    // Add the second table (payment and remaining data) starting from column E
    XLSX.utils.sheet_add_aoa(ws, wsData2, { origin: 'E7' }); // Start after the first table

    XLSX.utils.book_append_sheet(wb, ws, 'Sales and Payment Report'); // Add the sheet to the workbook

    // Generate the Excel file and send it as response
    const xlsxBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    res.setHeader('Content-Disposition', `attachment; filename=sales_payment_report_${distributorId}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(xlsxBuffer);

  } catch (error) {
    console.error('Error generating XLSX:', error);
    res.status(500).json({ message: 'Error generating XLSX', error });
  }
});

// Helper function to get distributor name by ID (assuming you have a Distributor model)
const getDistributorName = async (distributorId) => {
  const distributor = await Distributor.findOne({ distributorId });
  return distributor ? distributor.distributorName : 'Unknown Distributor';
};


module.exports = router;
