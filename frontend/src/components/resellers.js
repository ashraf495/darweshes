import React, { useState, useEffect } from 'react';
import './resellers.css';
import axios from 'axios';
import Select from 'react-select';
import DatePicker, { registerLocale } from 'react-datepicker';
import ar from 'date-fns/locale/ar';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Register Arabic locale for date picker
registerLocale('ar', ar);

const Resellers = () => {
  const [distributorId, setDistributorId] = useState('');
  const [resellerName, setResellerName] = useState('');
  const [history, setHistory] = useState(new Date()); // Single date for sales operations
  const [salesData, setSalesData] = useState([]); // Sales data fetched from the backend
  const [message, setMessage] = useState('');
  const [distributors, setDistributors] = useState([]);

  // State for the second panel (عمليات الدفع والباقي)
  const [currentBoxes, setCurrentBoxes] = useState('');
  const [boxDeposit, setBoxDeposit] = useState('');
  const [discount, setDiscount] = useState('');
  const [paidAmount, setPaidAmount] = useState(''); // New: المدفوع field
  const [finalResult, setFinalResult] = useState('');
  const [remainingForAgency, setRemainingForAgency] = useState('');
  const [remainingForReseller, setRemainingForReseller] = useState('');
  const [remainingBoxes, setRemainingBoxes] = useState('');
  const [historyPayment, setHistoryPayment] = useState(new Date()); // Single date for payment

  // Fetch distributor list from backend on component mount
  useEffect(() => {
    axios.get('http://192.168.10.61:5000/api/distributors')
      .then(response => {
        const distributorOptions = response.data.map(distributor => ({
          value: distributor.distributorId,
          label: distributor.distributorName
        }));
        setDistributors(distributorOptions);
      })
      .catch(error => {
        console.error('Error fetching distributors:', error);
        setMessage('Failed to load distributors');
      });
  }, []);

  // Handle Distributor ID Change
  const handleDistributorIdChange = (e) => {
    const enteredId = e.target.value;
    setDistributorId(enteredId);
    const matchingDistributor = distributors.find(distributor => distributor.value === enteredId);
    if (matchingDistributor) {
      setResellerName(matchingDistributor.label);
    } else {
      setResellerName('');
    }
  };

  // Handle Distributor Name Change
  const handleDistributorChange = (selectedValue) => {
    setResellerName(selectedValue);
    const selectedDistributor = distributors.find(distributor => distributor.label === selectedValue);
    if (selectedDistributor) {
      setDistributorId(selectedDistributor.value);
    } else {
      setDistributorId('');
    }
  };

  // Fetch sales data based on reseller and single date
  const handleShowSales = async (e) => {
    e.preventDefault();
    if (distributorId) {
      const formattedDate = format(history, 'yyyy-MM-dd');
      try {
        const response = await axios.get(`http://192.168.10.61:5000/api/distributors/${distributorId}/operations?history=${formattedDate}`);
        setSalesData(response.data);
        setMessage('');
      } catch (error) {
        console.error('Error fetching operations:', error);
        setMessage('حدث خطأ في جلب عمليات البيع');
      }
    } else {
      setMessage('يرجى اختيار اسم الموزع');
    }
  };

  // Function to generate Excel with both first and second panel data
  const handleGenerateExcel = async () => {
    if (distributorId && history) {
      const formattedDate = format(history, 'yyyy-MM-dd');
      try {
        const response = await axios.post('http://192.168.10.61:5000/api/distributors/generate-xlsx', {
          distributorId,
          history: formattedDate,
          salesData,
          currentBoxes,
          boxDeposit,
          discount,
          paidAmount,
          finalResult,
          remainingForAgency,
          remainingForReseller,
          remainingBoxes
        }, {
          responseType: 'blob', // Important for downloading files
        });

        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `sales_payment_report_${distributorId}.xlsx`;
        link.click();
      } catch (error) {
        console.error('Error generating Excel file:', error);
        setMessage('حدث خطأ في توليد الملف');
      }
    } else {
      setMessage('يرجى اختيار اسم الموزع والتاريخ');
    }
  };
// Generate PDF from the tables
  const handleGeneratePDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4'); // Use A4 size

    const salesTable = document.querySelector('.sales-table');
    const resultsTable = document.querySelector('.results-table');

    let yPosition = 10; // Initial Y position

    // Capture the first table (Sales Data)
    if (salesTable) {
        const canvasSales = await html2canvas(salesTable);
        const imgDataSales = canvasSales.toDataURL('image/png');
        const imgWidth = 190; // A4 width minus margins
        const imgHeightSales = (canvasSales.height * imgWidth) / canvasSales.width;

        if (imgHeightSales + yPosition > 297) { // If the table height exceeds the page
            pdf.addPage(); // Add a new page
            yPosition = 10; // Reset Y position for new page
        }

        pdf.addImage(imgDataSales, 'PNG', 10, yPosition, imgWidth, imgHeightSales);
        yPosition += imgHeightSales + 20; // Add padding between tables
    }

    // Capture the second table (Payment Details)
    if (resultsTable) {
        const canvasResults = await html2canvas(resultsTable);
        const imgDataResults = canvasResults.toDataURL('image/png');
        const imgHeightResults = (canvasResults.height * 190) / canvasResults.width;

        if (imgHeightResults + yPosition > 297) { // If the table height exceeds the page
            pdf.addPage(); // Add a new page
            yPosition = 10; // Reset Y position for new page
        }

        pdf.addImage(imgDataResults, 'PNG', 10, yPosition, 190, imgHeightResults);
    }

    // Save the PDF
    pdf.save('sales_and_payment_report.pdf');
  };

  // Calculate Final Results for Payment Panel
  const handleCalculateFinalResult = (e) => {
    e.preventDefault();
    const totalDiscount = parseFloat(discount) || 0;
    const totalPaid = parseFloat(paidAmount) || 0;

    // Calculate total boxes from the sales data
    const totalBoxesFromOperations = salesData.reduce((acc, operation) => acc + operation.numBoxes, 0);

    // Calculate box deposit based on box type (small or large)
    const totalBoxDeposit = salesData.reduce((acc, operation) => {
      const depositRate = operation.boxType === 'small' ? 50 : 100;
      return acc + (operation.numBoxes * depositRate);
    }, 0) - (parseFloat(currentBoxes) || 0) * (currentBoxes <= totalBoxesFromOperations ? 50 : 100);

    setBoxDeposit(totalBoxDeposit);

    // Calculate final result: (Accumulated Sales Result + Box Deposit) - Discount
    const totalSalesResult = salesData.reduce((acc, operation) => acc + (operation.price * operation.weight), 0);
    const finalResultValue = (totalSalesResult + totalBoxDeposit) - totalDiscount;

    setFinalResult(finalResultValue);

    // Calculate remaining for the agency and reseller
    const remainingForAgencyValue = finalResultValue - totalPaid;
    const remainingForResellerValue = totalPaid - finalResultValue;

    setRemainingForAgency(remainingForAgencyValue);
    setRemainingForReseller(remainingForResellerValue);
    setRemainingBoxes(totalBoxesFromOperations - (parseFloat(currentBoxes) || 0));
  };

  return (
  <div className="resellers-page">
    <h1 className="reseller-name">الموزعين</h1>

    {/* First Panel: عرض عمليات البيع */}
    <div className="panel fady-square">
      <h2 className="panel-header">عرض عمليات البيع</h2>
      <form onSubmit={handleShowSales}>
        {/* First Row with Distributor ID, Name, and History */}
        <div className="row full-width">
          <div className="form-group">
            <label>الرقم التعريفي</label>
            <input
              type="number"
              value={distributorId}
              placeholder="رقم التعريفي"
              onChange={handleDistributorIdChange}
              required
            />
          </div>
          <div className="form-group">
            <label>اسم الموزع</label>
            <select
              value={resellerName}
              onChange={(e) => handleDistributorChange(e.target.value)}
              required
            >
              <option value="">اختر اسم الموزع</option>
              {distributors.map((distributor) => (
                <option key={distributor.value} value={distributor.label}>
                  {distributor.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>التاريخ</label>
            <DatePicker
              selected={history}
              onChange={(date) => setHistory(date)}
              locale="ar"
              placeholderText="اختر التاريخ"
              dateFormat="dd/MM/yyyy"
              calendarStartDay={6}
              className="date-picker"
            />
          </div>
        </div>

        {/* Second Row */}
        <div className="row full-width">
          <div className="form-group">
            <label>عدد الصناديق الحالية</label>
            <input
              type="number"
              value={currentBoxes}
              onChange={(e) => setCurrentBoxes(e.target.value)}
              placeholder="ادخل عدد الصناديق الحالية"
              required
            />
          </div>
          <div className="form-group">
            <label>رهن الصناديق</label>
            <input
              type="number"
              value={boxDeposit}
              placeholder="رهن الصناديق محسوب تلقائيًا"
              readOnly
            />
          </div>
        </div>

        {/* Third Row */}
        <div className="row full-width">
          <div className="form-group">
            <label>الخصم</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="ادخل الخصم"
              required
            />
          </div>
          <div className="form-group">
            <label>المدفوع</label>
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder="ادخل المبلغ المدفوع"
            />
          </div>
        </div>

        <button type="submit">اعرض عمليات البيع</button>
      </form>

      {message && <p className="message">{message}</p>}

      {salesData.length > 0 && (
        <div>
          <table className="sales-table">
            <thead>
              <tr>
                <th colSpan="8" style={{ textAlign: 'center', fontSize: '18px' }}>
                  {`اسم الموزع: ${resellerName || 'غير محدد'} - التاريخ: ${format(history, 'yyyy-MM-dd')} - سوق الدراويش`}
                </th>
              </tr>
              <tr>
                <th>الناتج</th>
                <th>عدد الصناديق</th>
                <th>نوع الصناديق</th> {/* Automatically fetch and display box type */}
                <th>عدد الوحدات</th>
                <th>سعر الصنف</th>
                <th>الوزن</th>
                <th>الصنف</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((operation, index) => (
                <tr key={index}>
                  <td>{operation.price * operation.weight}</td>
                  <td>{operation.numBoxes}</td>
                  <td>{operation.boxType === 'small' ? 'صناديق صغيرة' : 'صناديق كبيرة'}</td> {/* Fetch boxType */}
                  <td>{operation.numUnits}</td>
                  <td>{operation.price}</td>
                  <td>{operation.weight}</td>
                  <td>{operation.category}</td>
                  <td>{operation.history}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {/* Second Panel: عمليات الدفع والباقي */}
    <div className="panel fady-square">
      <h2 className="panel-header">عمليات الدفع والباقي</h2>
      <form onSubmit={handleCalculateFinalResult}>
        <div className="row full-width">
          <div className="form-group">
            <label>عدد الصناديق الحالية</label>
            <input
              type="number"
              value={currentBoxes}
              onChange={(e) => setCurrentBoxes(e.target.value)}
              placeholder="ادخل عدد الصناديق الحالية"
              required
            />
          </div>
          <div className="form-group">
            <label>رهن الصناديق</label>
            <input
              type="number"
              value={boxDeposit}
              placeholder="رهن الصناديق محسوب تلقائيًا"
              readOnly
            />
          </div>
        </div>

        <div className="row full-width">
          <div className="form-group">
            <label>الخصم</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="ادخل الخصم"
              required
            />
          </div>
          <div className="form-group">
            <label>المدفوع</label>
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder="ادخل المبلغ المدفوع"
            />
          </div>
        </div>
        <button type="submit">اعرض التفاصيل</button>
      </form>

      {finalResult && (
        <table className="results-table">
          <thead>
            <tr>
              <th>الناتج النهائي</th>
              <th>المتبقي للوكالة</th>
              <th>المتبقي للموزع</th>
              <th>عدد الصناديق المتبقية</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{finalResult}</td>
              <td>{remainingForAgency}</td>
              <td>{remainingForReseller}</td>
              <td>{remainingBoxes}</td>
            </tr>
          </tbody>
        </table>
      )}
      <button onClick={handleGenerateExcel}>توليد ملف XLSX</button> {/* Button to generate Excel */}
      <button onClick={handleGeneratePDF}>توليد ملف PDF</button> {/* Button to generate PDF */}
    </div>
  </div>
  );
};

export default Resellers;
