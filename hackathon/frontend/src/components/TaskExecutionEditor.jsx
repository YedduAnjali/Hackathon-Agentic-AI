import { useState } from 'react';
import StatusBadge from './StatusBadge';

function TaskExecutionEditor({ task, onUpdateResult, isOpen, onClose }) {
  const [success, setSuccess] = useState(task?.success ?? false);
  const [error, setError] = useState(task?.error ?? '');
  const [tool, setTool] = useState(task?.tool ?? 'scheduler');

  const handleSubmit = () => {
    onUpdateResult({
      taskId: task?.taskId || task?.id,
      success,
      error: error || null,
      tool
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Update Task Result
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Task ID */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-600">Task ID</p>
          <p className="text-sm font-mono text-gray-900 mt-1">
            {task?.taskId || task?.id}
          </p>
        </div>

        {/* Tool Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tool Used
          </label>
          <select
            value={tool}
            onChange={(e) => setTool(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="scheduler">scheduler</option>
            <option value="custom">custom</option>
            <option value="webhook">webhook</option>
            <option value="api">api</option>
            <option value="other">other</option>
          </select>
        </div>

        {/* Status Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Execution Result
          </label>
          <div className="space-y-2">
            <button
              onClick={() => {
                setSuccess(true);
                setError('');
              }}
              className={`w-full p-3 rounded-lg border-2 transition-colors ${
                success
                  ? 'bg-green-50 border-green-500'
                  : 'bg-white border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">✅</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Success</p>
                  <p className="text-xs text-gray-600">Task completed successfully</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSuccess(false)}
              className={`w-full p-3 rounded-lg border-2 transition-colors ${
                !success
                  ? 'bg-red-50 border-red-500'
                  : 'bg-white border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">❌</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Failed</p>
                  <p className="text-xs text-gray-600">Task did not complete</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Error Message (if failed) */}
        {!success && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Error Message (optional)
            </label>
            <textarea
              value={error}
              onChange={(e) => setError(e.target.value)}
              placeholder="Describe what went wrong..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
          >
            Update Result
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskExecutionEditor;
