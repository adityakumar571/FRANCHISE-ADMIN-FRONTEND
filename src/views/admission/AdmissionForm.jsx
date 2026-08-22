import React, { useState } from 'react';
import { User, Users, Phone, Mail, GraduationCap, CreditCard, Save, Upload, Calendar, MapPin, FileText } from 'lucide-react';

const AdmissionForm = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    fatherName: '',
    motherName: '',
    expectedClass: '',
    fatherMobile: '',
    formId: '',
    formFee: '',
    paymentMode: 'cash',
    dateOfBirth: '',
    address: '',
    email: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // console.log('Form submitted:', formData);
    alert('Admission application submitted successfully!');
  };

  const handleReset = () => {
    setFormData({
      studentName: '',
      fatherName: '',
      motherName: '',
      expectedClass: '',
      fatherMobile: '',
      formId: '',
      formFee: '',
      paymentMode: 'cash',
      dateOfBirth: '',
      address: '',
      email: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Student Admission Form</h1>
              <p className="text-indigo-100 text-sm mt-1">Franchise Management System - New Enrollment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <span className="font-semibold">Student Information</span>
              </div>
              <div className="hidden sm:flex items-center gap-3 opacity-50">
                <div className="bg-white/30 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <span className="font-semibold">Document Upload</span>
              </div>
              <div className="hidden sm:flex items-center gap-3 opacity-50">
                <div className="bg-white/30 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <span className="font-semibold">Payment</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Student Information Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-3 rounded-xl">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Student Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Admission Application Form No.
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="formId"
                      value={formData.formId}
                      onChange={handleInputChange}
                      placeholder="Enter form number"
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <FileText className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <Calendar className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Student Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      placeholder="Enter student's full name"
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <User className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expected Class *
                  </label>
                  <div className="relative">
                    <select
                      name="expectedClass"
                      value={formData.expectedClass}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white"
                    >
                      <option value="">Select class</option>
                      <option value="Nursery">Nursery</option>
                      <option value="LKG">LKG</option>
                      <option value="UKG">UKG</option>
                      <option value="1">Class 1</option>
                      <option value="2">Class 2</option>
                      <option value="3">Class 3</option>
                      <option value="4">Class 4</option>
                      <option value="5">Class 5</option>
                      <option value="6">Class 6</option>
                      <option value="7">Class 7</option>
                      <option value="8">Class 8</option>
                      <option value="9">Class 9</option>
                      <option value="10">Class 10</option>
                      <option value="11">Class 11</option>
                      <option value="12">Class 12</option>
                    </select>
                    <GraduationCap className="w-5 h-5 text-gray-400 absolute left-4 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="student@example.com"
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter complete address"
                      rows="3"
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <MapPin className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Parents Information Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-3 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Parent's Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Father's Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      placeholder="Enter father's full name"
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <User className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Father's Mobile Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="fatherMobile"
                      value={formData.fatherMobile}
                      onChange={handleInputChange}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <Phone className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mother's Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      placeholder="Enter mother's full name"
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <User className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-3 rounded-xl">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Payment Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Form Fee Amount *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="formFee"
                      value={formData.formFee}
                      onChange={handleInputChange}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                    <span className="text-gray-400 absolute left-4 top-3.5 font-semibold">₹</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Mode *
                  </label>
                  <div className="relative">
                    <select
                      name="paymentMode"
                      value={formData.paymentMode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none bg-white"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Credit/Debit Card</option>
                      <option value="upi">UPI</option>
                      <option value="netbanking">Net Banking</option>
                      <option value="cheque">Cheque</option>
                    </select>
                    <CreditCard className="w-5 h-5 text-gray-400 absolute left-4 top-3.5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-dashed border-indigo-300">
              <div className="flex items-center gap-3 mb-4">
                <Upload className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-800">Upload Documents</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Please upload required documents (Birth Certificate, Previous School Records, Photo, etc.)
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="file"
                  id="documents"
                  multiple
                  className="hidden"
                />
                <label
                  htmlFor="documents"
                  className="flex-1 bg-white border-2 border-indigo-300 rounded-xl px-6 py-4 text-center cursor-pointer hover:bg-indigo-50 transition-all"
                >
                  <Upload className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                  <span className="text-sm font-semibold text-indigo-600">Choose Files</span>
                </label>
                <div className="flex-1 bg-white rounded-xl px-6 py-4 text-center border-2 border-gray-200">
                  <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-500">No files selected</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleReset}
                className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <span>Reset Form</span>
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <Save className="w-5 h-5" />
                <span>Submit Application</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Need help? Contact our admission office at <span className="font-semibold text-indigo-600">admission@school.edu</span> or call <span className="font-semibold text-indigo-600">+91 XXXXX XXXXX</span></p>
        </div>
      </div>
    </div>
  );
};

export default AdmissionForm;
