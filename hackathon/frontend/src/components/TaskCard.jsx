import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

function TaskCard({ task, onCheckboxChange, onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'executed':
        return { icon: '✅', color: 'text-emerald-400', bg: 'bg-emerald-600/20' };
      case 'failed':
        return { icon: '❌', color: 'text-rose-400', bg: 'bg-rose-600/20' };
      case 'pending':
        return { icon: '⏳', color: 'text-blue-400', bg: 'bg-blue-600/20' };
      default:
        return { icon: '⏳', color: 'text-slate-400', bg: 'bg-slate-600/20' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const statusInfo = getStatusColor(task.status);
  const isCompleted = task.checkboxState || task.status === 'executed';
  const isFailed = task.status === 'failed';

  return (
    <motion.div
      onClick={onClick}
      className={`relative rounded-lg p-4 cursor-pointer transition-all border-l-4 group overflow-hidden ${
        statusInfo.bg
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)' }}
      transition={{ duration: 0.2 }}
      style={{
        borderLeftColor: isCompleted ? '#10b981' : isFailed ? '#f43f5e' : '#3b82f6'
      }}
    >
      {/* Background gradient on hover */}
      <div className="absolute -inset-1 bg-gradient-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg -z-10" />

      <div className="relative z-10 flex items-start gap-3">
        {/* Animated Checkbox */}
        <motion.div
          className="pt-1 flex-shrink-0"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(e) => {
              e.stopPropagation();
              onCheckboxChange?.(task.id, e.target.checked);
            }}
            disabled={isFailed}
            className={`w-5 h-5 rounded focus:ring-2 focus:ring-offset-0 cursor-pointer transition-colors ${
              isCompleted
                ? 'bg-gradient-success text-white border-0'
                : 'border-2 border-slate-600 text-blue-400'
            } ${isFailed ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500'}`}
          />
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <motion.h4
              className={`text-sm font-semibold line-clamp-1 transition-colors ${
                isCompleted ? 'text-slate-400 line-through' : 'text-white'
              }`}
              layout
            >
              {task.title}
            </motion.h4>
            <motion.span
              className={`inline-flex items-center text-xs font-bold ${statusInfo.color}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {statusInfo.icon}
            </motion.span>
          </div>

          {task.description && (
            <motion.p
              className="text-sm text-slate-600 mb-2 line-clamp-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              {task.description}
            </motion.p>
          )}

          {/* Metadata */}
          <motion.div
            className="flex flex-wrap gap-2 text-xs text-slate-400"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {task.tool && (
              <motion.span
                className="bg-slate-700/60 px-2.5 py-1 rounded-md border border-slate-600 text-slate-300 font-medium"
                whileHover={{ scale: 1.05 }}
              >
                🔧 {task.tool}
              </motion.span>
            )}
            {task.estimatedTime && (
              <motion.span
                className="bg-purple-600/20 px-2.5 py-1 rounded-md border border-purple-600 text-purple-300 font-medium flex items-center gap-1"
                whileHover={{ scale: 1.05 }}
              >
                <Clock size={12} />
                {task.estimatedTime}
              </motion.span>
            )}
            {task.scheduledDate && (
              <motion.span
                className="bg-gradient-info/10 px-2.5 py-1 rounded-md border border-blue-200 text-blue-700 font-medium"
                whileHover={{ scale: 1.05 }}
              >
                📅 {formatDate(task.scheduledDate)}
              </motion.span>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default TaskCard;

