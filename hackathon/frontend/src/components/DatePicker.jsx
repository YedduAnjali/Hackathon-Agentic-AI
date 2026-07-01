import { useState } from 'react';

function DatePicker({ label, value, onChange, disabled = false, minDate = null, maxDate = null }) {
  const formatDateForInput = (date) => {
    if (!date) return '';
    if (typeof date === 'string') {
      // Convert ISO string to YYYY-MM-DD format
      return date.split('T')[0];
    }
    return date.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type="date"
        value={formatDateForInput(value)}
        onChange={handleChange}
        disabled={disabled}
        min={minDate ? formatDateForInput(minDate) : undefined}
        max={maxDate ? formatDateForInput(maxDate) : undefined}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-slate-900 bg-white"
      />
    </div>
  );
}

export default DatePicker;
