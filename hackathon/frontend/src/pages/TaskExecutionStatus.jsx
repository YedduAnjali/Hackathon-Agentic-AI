import { useState } from 'react';
import useAgentStore from '../store/agentStore';
import StatusBadge from '../components/StatusBadge';
import TaskExecutionEditor from '../components/TaskExecutionEditor';

function TaskExecutionStatus() {
  const { 
    executionResults, 
    updateTaskExecutionResult,
    currentGoal,
    goals 
  } = useAgentStore();

  const [editingTask, setEditingTask] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // all, success, failed
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and search results
  const filteredResults = executionResults.filter(result => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'success' && result.success) ||
      (filterStatus === 'failed' && !result.success);
    
    const matchesSearch = !searchTerm || 
      result.taskId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.tool?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const successCount = executionResults.filter(r => r.success).length;
  const failureCount = executionResults.filter(r => !r.success).length;
  const totalCount = executionResults.length;
  const successRate = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : 0;

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsEditorOpen(true);
  };

  const handleUpdateResult = (result) => {
    updateTaskExecutionResult(result.taskId, result.success, result.error);
  };

  const toggleTaskStatus = (task) => {
    updateTaskExecutionResult(task.taskId, !task.success, null);
  };

  if (totalCount === 0) {
    return (
      <div className="px-4 py-6">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Task Execution Results
          </h3>
          <p className="text-gray-600">
            Execute a goal to see task results here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-bold text-white">Task Execution Status</h2>
        <p className="mt-2 text-gray-600">
          Manage and update the execution status of your tasks
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="text-3xl">📊</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="text-3xl">✅</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Successful</p>
              <p className="text-2xl font-bold text-green-600">{successCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="text-3xl">❌</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{failureCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-primary-500">
          <div className="flex items-center">
            <div className="text-3xl">📈</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-primary-600">{successRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by task ID or tool..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilterStatus('success')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Successful ({successCount})
          </button>
          <button
            onClick={() => setFilterStatus('failed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'failed'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Failed ({failureCount})
          </button>
        </div>
      </div>

      {/* Task Results List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredResults.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No tasks match your search criteria</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredResults.map((result, idx) => (
              <div
                key={idx}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  result.success ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Task Info */}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{result.taskId || `Task ${idx + 1}`}</p>
                    {result.tool && (
                      <p className="text-xs text-gray-600 mt-1">🔧 {result.tool}</p>
                    )}
                    {result.executedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(result.executedAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Error Message if exists */}
                  {result.error && (
                    <div className="md:col-span-1">
                      <p className="text-xs text-red-600 p-2 bg-red-50 rounded border border-red-200">
                        ⚠️ {result.error}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 items-center justify-end md:justify-start">
                    <button
                      onClick={() => toggleTaskStatus(result)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        result.success
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {result.success ? '✅ Success' : '❌ Failed'}
                    </button>
                    <button
                      onClick={() => handleEditTask(result)}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

export default TaskExecutionStatus;
