import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Filter } from 'lucide-react';
import useAgentStore from '../store/agentStore';
import StatusBadge from '../components/StatusBadge';
import { StaggerContainer, StaggerItem, ExpandableSection } from '../components/animations';

function ExecutionLogs() {
  const { executionLog, executionResults, currentGoal } = useAgentStore();
  const [filter, setFilter] = useState('all');
  const [expandedLog, setExpandedLog] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Memoized filtering
  const filteredLogs = useMemo(() => {
    if (filter === 'all') return executionLog;
    return executionLog.filter(log => log.step === filter || log.type === filter);
  }, [executionLog, filter]);

  // Find task details by ID
  const getTaskById = (taskId) => {
    if (!currentGoal || !currentGoal.tasks) return null;
    return currentGoal.tasks.find(t => t.id === taskId);
  };

  const getStepIcon = (step) => {
    switch (step) {
      case 'planning': return '📋';
      case 'execution': return '⚙️';
      case 'reflection': return '🧠';
      case 'replanning': return '🔄';
      default: return '📝';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'info':
        return { bg: 'bg-gradient-info/5', border: 'border-blue-200', text: 'text-blue-900' };
      case 'success':
        return { bg: 'bg-gradient-success/5', border: 'border-emerald-200', text: 'text-emerald-900' };
      case 'error':
        return { bg: 'bg-gradient-error/5', border: 'border-rose-200', text: 'text-rose-900' };
      case 'warning':
        return { bg: 'bg-gradient-warning/5', border: 'border-amber-200', text: 'text-amber-900' };
      case 'execution':
        return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900' };
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-900' };
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return null;
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return timestamp;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h1
          className="text-5xl font-bold"
          style={{
            backgroundImage: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          ⏱️ Execution Logs
        </motion.h1>
        <motion.p
          className="mt-3 text-slate-300 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          View detailed execution history and agent decisions
        </motion.p>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-wrap gap-2 items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Filter size={18} className="text-slate-600" />
        <label className="text-xs font-bold text-slate-600">Filter:</label>
        <div className="flex flex-wrap gap-2">
          {['all', 'planning', 'execution', 'reflection', 'replanning', 'info', 'success', 'error'].map((f, idx) => (
            <motion.button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-gradient-primary text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + idx * 0.02 }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Task Execution Results Summary */}
      {executionResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl shadow-lg p-6 border border-slate-600 hover:shadow-2xl transition-shadow text-white"
        >
          <motion.h3
            className="text-lg font-bold text-white mb-4 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            📊 Execution Results Summary
            <span className="text-sm bg-gradient-primary/30 text-blue-300 px-3 py-1 rounded-full border border-blue-600">
              {executionResults.length}
            </span>
          </motion.h3>
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {executionResults.map((result, idx) => {
              const task = getTaskById(result.taskId);
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  onClick={() => setSelectedTaskId(selectedTaskId === result.taskId ? null : result.taskId)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    result.success
                      ? 'bg-gradient-success/10 border-emerald-200 hover:border-emerald-300'
                      : 'bg-gradient-error/10 border-rose-200 hover:border-rose-300'
                  }`}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <motion.span
                          className={`font-bold text-lg ${result.success ? 'text-emerald-700' : 'text-rose-700'}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring' }}
                        >
                          {result.success ? '✅' : '❌'}
                        </motion.span>
                        <span className="font-semibold text-slate-900">
                          Task {result.taskId || idx + 1}
                        </span>
                        {task && <span className="text-sm text-slate-600">{task.title}</span>}
                      </div>
                      {result.tool && (
                        <motion.p
                          className="text-sm text-slate-600 mt-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          🔧 Tool: {result.tool}
                        </motion.p>
                      )}
                      {result.error && (
                        <motion.div
                          className="mt-2 p-3 bg-rose-50 rounded border border-rose-200 text-sm text-rose-700 font-semibold"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                        >
                          ⚠️ {result.error}
                        </motion.div>
                      )}

                      {/* Task Details - Expandable */}
                      <ExpandableSection isOpen={selectedTaskId === result.taskId} duration={0.3}>
                        {task && (
                          <motion.div
                            className="mt-3 p-3 bg-white rounded border border-slate-200"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            <p className="text-sm font-bold text-slate-700 mb-3">📋 Task Details:</p>
                            <div className="text-sm text-slate-600 space-y-2">
                              {task.description && <p><strong>Description:</strong> {task.description}</p>}
                              {task.tool && <p><strong>Tool:</strong> {task.tool}</p>}
                              {task.estimatedTime && <p><strong>Estimated Time:</strong> {task.estimatedTime}</p>}
                              {task.status && <p><strong>Status:</strong> {task.status}</p>}
                              {task.scheduledDate && (
                                <p><strong>Scheduled:</strong> {new Date(task.scheduledDate).toLocaleDateString()}</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </ExpandableSection>
                    </div>
                    <StatusBadge
                      status={result.success ? 'success' : 'failed'}
                      variant="outline"
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      )}

      {/* Detailed Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <motion.div
          className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            📋 Detailed Log
            <span className="text-sm bg-gradient-primary/20 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
              {filteredLogs.length}
            </span>
          </h3>
        </motion.div>

        {filteredLogs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center text-slate-500"
          >
            <p className="text-lg">No logs match your filter</p>
          </motion.div>
        ) : (
          <motion.div
            className="divide-y divide-slate-200"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredLogs.map((log, idx) => {
              const typeColor = getTypeColor(log.type || log.status || 'info');
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className={`p-5 border-l-4 cursor-pointer transition-all hover:shadow-inner ${typeColor.bg}`}
                  style={{ borderLeftColor: ['info', 'success', 'error', 'warning'].includes(log.type) ? (log.type === 'info' ? '#0ea5e9' : log.type === 'success' ? '#10b981' : log.type === 'error' ? '#f43f5e' : '#f59e0b') : '#8b5cf6' }}
                  onClick={() => setExpandedLog(expandedLog === idx ? null : idx)}
                  whileHover={{ x: 2 }}
                >
                  {/* Log Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <motion.span
                        className="text-2xl flex-shrink-0"
                        animate={{ scale: expandedLog === idx ? 1.2 : 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {getStepIcon(log.step || log.type)}
                      </motion.span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-slate-900 capitalize text-base">
                            {log.step || log.type || 'Log'}
                          </span>
                          {log.status && (
                            <motion.span
                              className="text-xs bg-white px-2 py-1 rounded-full border border-slate-200 text-slate-600 font-semibold"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring' }}
                            >
                              {log.status}
                            </motion.span>
                          )}
                        </div>
                        {log.message && (
                          <p className="text-sm text-slate-700">{log.message}</p>
                        )}
                        {log.timestamp && (
                          <p className="text-xs text-slate-500 mt-1">
                            ⏰ {formatTimestamp(log.timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                    <motion.span
                      className="text-slate-400 flex-shrink-0"
                      animate={{ rotate: expandedLog === idx ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={20} />
                    </motion.span>
                  </div>

                  {/* Expanded Details */}
                  <ExpandableSection isOpen={expandedLog === idx} duration={0.3}>
                    <motion.div
                      className="mt-4 pt-4 border-t border-slate-200 space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.05 }}
                    >
                      {log.taskCount && (
                        <div className="flex items-center gap-2 p-3 bg-white rounded border border-slate-200">
                          <span className="text-sm font-semibold text-slate-700">📌 Task Count:</span>
                          <span className="text-sm text-slate-600 font-mono bg-slate-100 px-2 py-1 rounded">
                            {log.taskCount}
                          </span>
                        </div>
                      )}

                      {log.result && (
                        <div>
                          <p className="text-sm font-bold text-slate-700 mb-2">📋 Result:</p>
                          <div className="bg-slate-900 rounded p-3 border border-slate-700 text-xs font-mono text-slate-100 overflow-x-auto max-h-48 overflow-y-auto">
                            <pre>{JSON.stringify(log.result, null, 2)}</pre>
                          </div>
                        </div>
                      )}

                      {log.results && Array.isArray(log.results) && (
                        <div>
                          <p className="text-sm font-bold text-slate-700 mb-2">📊 Execution Results:</p>
                          <div className="space-y-2">
                            {log.results.slice(0, 3).map((r, i) => (
                              <motion.div
                                key={i}
                                className={`text-xs p-3 rounded border ${
                                  r.success
                                    ? 'bg-gradient-success/10 border-emerald-200'
                                    : 'bg-gradient-error/10 border-rose-200'
                                }`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                              >
                                {r.success ? '✅' : '❌'} Task {i + 1}: {r.success ? 'Success' : 'Failed'}
                              </motion.div>
                            ))}
                            {log.results.length > 3 && (
                              <p className="text-xs text-slate-600 p-2">
                                ... and {log.results.length - 3} more
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </ExpandableSection>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      {/* Timeline View */}
      {executionLog.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-slate-200"
        >
          <motion.h3
            className="text-lg font-bold text-slate-900 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            📍 Execution Timeline
          </motion.h3>
          <div className="space-y-4">
            {executionLog.map((log, idx) => (
              <motion.div
                key={idx}
                className="flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
              >
                <div className="flex flex-col items-center">
                  <motion.div
                    className="w-4 h-4 rounded-full bg-gradient-primary"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.4 + idx * 0.05 }}
                  />
                  {idx < executionLog.length - 1 && (
                    <motion.div
                      className="w-1 h-16 bg-gradient-primary/20"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.4 + idx * 0.05 + 0.1 }}
                      style={{ transformOrigin: 'top' }}
                    />
                  )}
                </div>
                <motion.div
                  className="pb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 + idx * 0.05 }}
                >
                  <p className="font-bold text-slate-900 capitalize flex items-center gap-2">
                    {getStepIcon(log.step || log.type)}
                    {log.step || log.type || 'Step'}
                  </p>
                  {(log.status || log.message) && (
                    <p className="text-sm text-slate-600 mt-1">
                      {log.status && `Status: ${log.status}`}
                      {log.message && ` - ${log.message}`}
                    </p>
                  )}
                  {log.timestamp && (
                    <p className="text-xs text-slate-500 mt-1">
                      ⏰ {formatTimestamp(log.timestamp)}
                    </p>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default ExecutionLogs;

