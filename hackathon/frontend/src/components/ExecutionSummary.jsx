import { useState } from 'react';
import StatusBadge from './StatusBadge';
import TaskExecutionEditor from './TaskExecutionEditor';
import useAgentStore from '../store/agentStore';

function ExecutionSummary({ executionResults, summary, onTaskResultUpdate }) {
  const [editingTask, setEditingTask] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const updateTaskExecutionResult = useAgentStore((state) => state.updateTaskExecutionResult);

  if (!executionResults || executionResults.length === 0) return null;

  const successCount = executionResults.filter(r => r.success).length;
  const failureCount = executionResults.filter(r => !r.success).length;
  const successRate = executionResults.length > 0 ? ((successCount / executionResults.length) * 100).toFixed(1) : 0;

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsEditorOpen(true);
  };

  const handleUpdateResult = (result) => {
    updateTaskExecutionResult(result.taskId, result.success, result.error);
    if (onTaskResultUpdate) {
      onTaskResultUpdate(result);
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg shadow-lg p-4 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="text-3xl">📊</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-700">Total Tasks</p>
              <p className="text-2xl font-bold text-slate-900">{executionResults.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg shadow-lg p-4 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="text-3xl">✅</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-700">Successful</p>
              <p className="text-2xl font-bold text-green-700">{successCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg shadow-lg p-4 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="text-3xl">❌</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-700">Failed</p>
              <p className="text-2xl font-bold text-red-700">{failureCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Rate */}
      <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg shadow-lg p-4 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Success Rate</p>
            <p className="text-3xl font-bold text-blue-700">{successRate}%</p>
          </div>
          <div className="w-20 h-20 flex items-center justify-center">
            <div className="relative w-full h-full">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  strokeDasharray={`${(successRate / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900">
                {successRate}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Results Details */}
      <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg shadow-lg p-4">
        <h4 className="text-sm font-medium text-slate-900 mb-3">Detailed Results</h4>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {executionResults.map((result, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-md border ${
                result.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {result.taskId || `Task ${idx + 1}`}
                  </p>
                  {result.tool && (
                    <p className="text-xs text-gray-600 mt-1">🔧 {result.tool}</p>
                  )}
                </div>
                <div className="flex gap-2 items-center ml-2">
                  <StatusBadge
                    status={result.success ? 'success' : 'failed'}
                    variant="outline"
                  />
                  <button
                    onClick={() => handleEditTask(result)}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                    title="Edit task result"
                  >
                    ✏️ Edit
                  </button>
                </div>
              </div>
              {result.error && (
                <p className="text-xs text-red-600 mt-2 p-2 bg-red-100 rounded">
                  ⚠️ {result.error}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Task Execution Editor Modal */}
      <TaskExecutionEditor
        task={editingTask}
        onUpdateResult={handleUpdateResult}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingTask(null);
        }}
      />
    </div>
  );
}

export default ExecutionSummary;
