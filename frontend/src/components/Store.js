import React, { useState, useEffect } from 'react';
import './customers.css';
import Select from 'react-select';
import axios from 'axios';
import DatePicker, { registerLocale } from 'react-datepicker';
import ar from 'date-fns/locale/ar';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

registerLocale('ar', ar);

const Customers = () => {
  const [history, setHistory] = useState(new Date());
  const [customerId, setCustomerId] = useState('');
  const [customer, setCustomer] = useState(null);
  const [distributor, setDistributor] = useState(null);
  const [category, setCategory] = useState(null);
  const [price, setPrice] = useState('');
  const [numBoxes, setNumBoxes] = useState('');
  const [numUnits, setNumUnits] = useState('');
  const [weight, setWeight] = useState('');
  const [message, setMessage] = useState('');
  const [customerOptions, setCustomerOptions] = useState([]);
  const [operations, setOperations] = useState([]);
  const [totalBoxes, setTotalBoxes] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [tobacco, setTobacco] = useState('');
  const [driverTip, setDriverTip] = useState('');
  const [finalAmount, setFinalAmount] = useState(0);
  const [showFinalAmount, setShowFinalAmount] = useState(false);
  const [invoiceMessage, setInvoiceMessage] = useState('');

  const distributorOptions = [
    { value: 'distributor1', label: 'موزع 1' },
    { value: 'distributor2', label: 'موزع 2' },
    { value: 'distributor3', label: 'موزع 3' }
  ];

  const categoryOptions = [
    { value: 'category1', label: 'صنف 1' },
    { value: 'category2', label: 'صنف 2' },
    { value: 'category3', label: 'صنف 3' }
  ];

  useEffect(() => {
    axios.get('http://localhost:5000/api/customers')
      .then((response) => {
        const customerList = response.data.map((customer) => ({
          value: customer.customerId,
          label: customer.customerName
        }));
        setCustomerOptions(customerList);
      })
      .catch((error) => console.error('Error fetching customers:', error));
  }, []);

  useEffect(() => {
    if (customerId) {
      const matchedCustomer = customerOptions.find(option => option.value === customerId);
      setCustomer(matchedCustomer || null);
    }
  }, [customerId, customerOptions]);

  const handleCustomerOperationsSubmit = async (e) => {
    e.preventDefault();

    const currentNumBoxes = parseFloat(numBoxes) || 0;
    const currentWeight = parseFloat(weight) || 0;
    const currentPrice = parseFloat(price) || 0;

    const currentOperation = {
      history,
      customerId,
      distributor: distributor ? distributor.label : '',
      category: category ? category.label : '',
      price: currentPrice,
      numBoxes: currentNumBoxes,
      weight: currentWeight
    };

    setTotalBoxes(prevTotalBoxes => prevTotalBoxes + currentNumBoxes);
    setTotalWeight(prevTotalWeight => prevTotalWeight + currentWeight);
    setTotalPrice(prevTotalPrice => prevTotalPrice + (currentWeight * currentPrice));
    setOperations(prevOps => [...prevOps, currentOperation]);

    try {
      await axios.post(`http://localhost:5000/api/customers/${customerId}/operations`, currentOperation);
      await axios.put(`http://localhost:5000/api/customers/${customerId}/accumulate`, {
        totalWeight: totalWeight + currentWeight,
        totalBoxCount: totalBoxes + currentNumBoxes,
        totalPrice: totalPrice + (currentWeight * currentPrice)
      });
      setMessage('تم إدخال البيانات بنجاح!');
    } catch (error) {
      console.error('Error saving data:', error);
    }

    setDistributor(null);
    setCategory(null);
    setPrice('');
    setNumBoxes('');
    setWeight('');
  };

  const commission = (parseFloat(totalPrice) || 0) * 0.08;

  const handleShowFinalResult = (e) => {
    e.preventDefault();
    const finalValue = (parseFloat(totalPrice) || 0) - (commission + (parseFloat(driverTip) || 0) + (parseFloat(tobacco) || 0));
    setFinalAmount(finalValue);
    setShowFinalAmount(true);
    setInvoiceMessage('تم حساب الناتج النهائي!');
  };

  return (
    <div className="customers-page" id="pdf-content">
      {/* First Panel: عمليات العملاء */}
      <h1 className="header-name">عمليات العملاء</h1>
      <form onSubmit={handleCustomerOperationsSubmit}>
        {/* Form fields */}
        <button type="submit">أدخل البيانات</button>
      </form>

      {/* Second Panel: فاتورة العميل */}
      <h1 className="header-name">فاتورة العميل</h1>
      <form onSubmit={handleShowFinalResult}>
        {/* Invoice form fields */}
        <button type="submit">اعرض الناتج النهائي</button>
      </form>

      {showFinalAmount && <p>المبلغ الخالص: {finalAmount}</p>}
    </div>
  );
};

export default Customers;
