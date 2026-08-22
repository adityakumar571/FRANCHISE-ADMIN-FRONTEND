import React, { useState } from "react";
import { IndianRupee, Edit, Trash2 } from "lucide-react";
import ToggleSwitch from "../../components/ToggleSwitch";
import AppTable, { Td } from "../../components/AppTable";

const FeeMaster = () => {
  const [fees, setFees] = useState([
    {
      id: 1,
      feeName: "Tuition Fee",
      feeType: "Monthly",
      amount: 1500,
      isActive: true,
    },
    {
      id: 2,
      feeName: "Admission Fee",
      feeType: "One Time",
      amount: 5000,
      isActive: true,
    },
    {
      id: 3,
      feeName: "Exam Fee",
      feeType: "Annual",
      amount: 1200,
      isActive: false,
    },
  ]);

  const toggleStatus = (id) => {
    setFees(
      fees.map((f) =>
        f.id === id ? { ...f, isActive: !f.isActive } : f
      )
    );
  };

  return (
    <div>
      {/* HEADER */}
      <div className="px-4 py-3 bg-white rounded-lg border border-blue-100 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <IndianRupee className="text-[#e24028]" />
            Fee Master
          </h1>
          <p className="text-sm text-gray-500">
            Manage franchise fee structure
          </p>
        </div>

        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          + Add Fee
        </button>
      </div>

      {/* TABLE */}
      <AppTable
        columns={[
          { key: 'sr', label: 'Sr. No.', align: 'center', width: 80 },
          { key: 'feeName', label: 'Fee Name', align: 'left', width: 180 },
          { key: 'feeType', label: 'Fee Type', align: 'left', width: 140 },
          { key: 'amount', label: 'Amount (₹)', align: 'right', width: 120 },
          { key: 'status', label: 'Status', align: 'center', width: 100 },
          { key: 'action', label: 'Action', align: 'center', width: 100, sticky: 'right' },
        ]}
        data={fees}
        emptyText="No Fee Records Found"
      >
        {(f, i) => (
          <>
            <Td align="center">{i + 1}</Td>
            <Td>{f.feeName}</Td>
            <Td>{f.feeType}</Td>
            <Td align="right" className="font-medium">₹ {f.amount}</Td>
            <Td align="center">
              <ToggleSwitch checked={f.isActive} onChange={() => toggleStatus(f.id)} />
            </Td>
            <Td align="center" sticky="right">
              <div className="flex justify-center gap-3">
                <button className="text-blue-600 hover:bg-blue-50 p-1.5 rounded">
                  <Edit size={16} />
                </button>
                <button className="text-red-600 hover:bg-red-50 p-1.5 rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            </Td>
          </>
        )}
      </AppTable>
    </div>
  );
};

export default FeeMaster;
