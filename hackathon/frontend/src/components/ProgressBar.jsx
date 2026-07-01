function ProgressBar({ current, total, percentage, label }) {
  const actualPercentage = percentage !== undefined ? percentage : (total > 0 ? (current / total) * 100 : 0);

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-semibold text-primary-600">
            {current}/{total} ({Math.round(actualPercentage)}%)
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${actualPercentage}%` }}
        ></div>
      </div>
    </div>
  );
}

export default ProgressBar;
