import React, { useState } from 'react';
import './control.css'; // Ensure the CSS file is linked
import axios from 'axios'; // Import axios for API requests

const Control = () => {
  // State for admin inputs for the first panel (ادخال معلومات العملاء)
  const [customerName, setCustomerName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerAddress, setCustomerAddress] = useState(''); // Changed to customerAddress
  const [carNumber, setCarNumber] = useState('');
  const [message1, setMessage1] = useState('');

  // State for admin inputs for the second panel (ادخال معلومات الموزعين)
  const [distributorName, setDistributorName] = useState('');
  const [distributorId, setDistributorId] = useState('');
  const [distributorPhone, setDistributorPhone] = useState('');
  const [distributorAddress, setDistributorAddress] = useState(''); // New state for distributor's address
  const [distributionLocation, setDistributionLocation] = useState('');
  const [message2, setMessage2] = useState('');

  // State for the third panel (أصناف الفواكه والخضراوت)
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState(''); // Empty to show placeholder
  const [season, setSeason] = useState(''); // Empty to show placeholder
  const [rarity, setRarity] = useState(''); // Empty to show placeholder
  const [message3, setMessage3] = useState('');

  // Handle customer data submission for the first panel
  const handleCustomerSubmit = async (e) => {
    e.preventDefault();

    const customerData = {
      customerName,
      customerId,
      phoneNumber,
      address: customerAddress, // Send customerAddress instead of address
      carNumber,
    };

    try {
      const response = await axios.post('http://192.168.10.61:5000/api/customers', customerData);
      setMessage1('تم إدخال بيانات العميل بنجاح!');
      console.log('Customer added:', response.data);

      // Reset form fields
      setCustomerName('');
      setCustomerId('');
      setPhoneNumber('');
      setCustomerAddress(''); // Reset customerAddress
      setCarNumber('');
    } catch (error) {
      console.error('Error adding customer:', error);
      setMessage1('حدث خطأ أثناء إدخال بيانات العميل');
    }
  };

  // Handle distributor data submission for the second panel
  const handleDistributorSubmit = async (e) => {
    e.preventDefault();

    const distributorData = {
      distributorName,
      distributorId,
      distributorPhone,
      address: distributorAddress, // Use distributorAddress
      distributionLocation,
    };

    try {
      const response = await axios.post('http://192.168.10.61:5000/api/distributors', distributorData);
      setMessage2('تم إدخال بيانات الموزع بنجاح!');
      console.log('Distributor added:', response.data);

      // Reset form fields
      setDistributorName('');
      setDistributorId('');
      setDistributorPhone('');
      setDistributorAddress(''); // Reset distributorAddress
      setDistributionLocation('');
    } catch (error) {
      console.error('Error adding distributor:', error);
      setMessage2('حدث خطأ أثناء إدخال بيانات الموزع');
    }
  };

  // Handle item data submission for the third panel
  const handleItemSubmit = async (e) => {
    e.preventDefault();

    const itemData = {
      itemName,
      itemType,
      season,
      rarity,
    };

    try {
      const response = await axios.post('http://192.168.10.61:5000/api/items', itemData);
      setMessage3('تم إدخال بيانات الصنف بنجاح!');
      console.log('Item added:', response.data);

      // Reset form fields
      setItemName('');
      setItemType('');
      setSeason('');
      setRarity('');
    } catch (error) {
      console.error('Error adding item:', error);
      setMessage3('حدث خطأ أثناء إدخال بيانات الصنف');
    }
  };

  return (
    <div className="control-page">
      <h1 className="control-name">لوحة التحكم</h1>

      {/* First Panel: ادخال معلومات العملاء */}
      <div className="panel fady-square">
        <h2 className="panel-header">ادخال معلومات العملاء</h2>
        <form onSubmit={handleCustomerSubmit}>
          <div className="row full-width">
            <div className="form-group">
              <label>رقم السيارة</label>
              <input
                type="text"
                value={carNumber}
                onChange={(e) => setCarNumber(e.target.value)}
                placeholder="ادخل رقم السيارة"
                required
              />
            </div>
            <div className="form-group">
              <label>العنوان</label>
              <input
                type="text"
                value={customerAddress} // Use customerAddress for customer panel
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="ادخل العنوان"
                required
              />
            </div>
            <div className="form-group">
              <label>رقم التليفون</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="ادخل رقم التليفون"
                required
              />
            </div>
            <div className="form-group">
              <label>رقم العميل التعريفي</label>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="ادخل رقم العميل التعريفي"
                required
              />
            </div>
            <div className="form-group">
              <label>اسم العميل</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="ادخل اسم العميل"
                required
              />
            </div>
          </div>
          <button type="submit">أدخل البيانات</button>
        </form>
        {message1 && <p className="message">{message1}</p>}
      </div>

      {/* Second Panel: ادخال معلومات الموزعين */}
      <div className="panel fady-square">
        <h2 className="panel-header">ادخال معلومات الموزعين</h2>
        <form onSubmit={handleDistributorSubmit}>
          <div className="row full-width">
            <div className="form-group">
              <label>مكان التوزيع</label>
              <input
                type="text"
                value={distributionLocation}
                onChange={(e) => setDistributionLocation(e.target.value)}
                placeholder="ادخل مكان التوزيع"
                required
              />
            </div>
            <div className="form-group">
              <label>العنوان</label>
              <input
                type="text"
                value={distributorAddress} // Use distributorAddress for distributor panel
                onChange={(e) => setDistributorAddress(e.target.value)}
                placeholder="ادخل العنوان"
                required
              />
            </div>
            <div className="form-group">
              <label>رقم التليفون</label>
              <input
                type="tel"
                value={distributorPhone}
                onChange={(e) => setDistributorPhone(e.target.value)}
                placeholder="ادخل رقم التليفون"
                required
              />
            </div>
            <div className="form-group">
              <label>رقم الموزع التعريفي</label>
              <input
                type="text"
                value={distributorId}
                onChange={(e) => setDistributorId(e.target.value)}
                placeholder="ادخل رقم الموزع التعريفي"
                required
              />
            </div>
            <div className="form-group">
              <label>اسم الموزع</label>
              <input
                type="text"
                value={distributorName}
                onChange={(e) => setDistributorName(e.target.value)}
                placeholder="ادخل اسم الموزع"
                required
              />
            </div>
          </div>
          <button type="submit">أدخل البيانات</button>
        </form>
        {message2 && <p className="message">{message2}</p>}
      </div>

      {/* Third Panel: أصناف الفواكه والخضراوت */}
      <div className="panel fady-square">
        <h2 className="panel-header">أصناف الفواكه والخضراوت</h2>
        <form onSubmit={handleItemSubmit}>
          <div className="row full-width">
            <div className="form-group">
              <label>نسبة الشيوع</label>
              <select
                value={rarity}
                onChange={(e) => setRarity(e.target.value)}
                required
              >
                <option value="" disabled>اختر نسبة الشيوع</option>
                <option value="دارج">دارج</option>
                <option value="نادر">نادر</option>
              </select>
            </div>

            <div className="form-group">
              <label>الموسم</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                required
              >
                <option value="" disabled>اختر الموسم</option>
                <option value="صيفي">صيفي</option>
                <option value="شتائي">شتائي</option>
                <option value="خريفي">خريفي</option>
                <option value="ربيعي">ربيعي</option>
              </select>
            </div>

            <div className="form-group">
              <label>نوع الصنف</label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                required
              >
                <option value="" disabled>اختر نوع الصنف</option>
                <option value="فاكهة">فاكهة</option>
                <option value="خضار">خضار</option>
              </select>
            </div>

            <div className="form-group">
              <label>اسم الصنف</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="ادخل اسم الصنف"
                required
              />
            </div>
          </div>
          <button type="submit">أدخل البيانات</button>
        </form>
        {message3 && <p className="message">{message3}</p>}
      </div>
    </div>
  );
};

export default Control;