import { motion } from 'framer-motion';
import { AnimatedProgressBar, HoverCard } from './animations';

function GoalCard({ goal, onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-gradient-info', text: 'text-white', border: 'border-blue-300' };
      case 'completed':
        return { bg: 'bg-gradient-success', text: 'text-white', border: 'border-emerald-300' };
      case 'pending':
        return { bg: 'bg-gradient-warning', text: 'text-white', border: 'border-amber-300' };
      default:
        return { bg: 'bg-gray-500', text: 'text-white', border: 'border-gray-300' };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return '🔵 Active';
      case 'completed':
        return '✅ Completed';
      case 'pending':
        return '⏳ Pending';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const taskCount = goal.tasks ? goal.tasks.length : 0;
  const completedCount = goal.tasks ? goal.tasks.filter(t => t.checkboxState || t.status === 'executed').length : 0;
  const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;
  
  const statusColors = getStatusColor(goal.status);

  return (
    <HoverCard className="cursor-pointer">
      <motion.div
        onClick={onClick}
        className="h-full bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl shadow-lg hover:shadow-2xl transition-shadow p-6 border-l-4 border-gradient-primary overflow-hidden relative text-white"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        layout
      >
        {/* Gradient background accent */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-primary/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <motion.h3
              className="text-lg font-semibold text-white flex-1 pr-2 line-clamp-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {goal.title}
            </motion.h3>
            <motion.span
              className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors.bg} ${statusColors.text} whitespace-nowrap ml-2 shadow-sm`}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {getStatusLabel(goal.status)}
            </motion.span>
          </div>

          {/* Dates */}
          {(goal.startDate || goal.endDate) && (
            <div className="flex flex-col gap-2 text-sm text-slate-200 mb-4">
              {goal.startDate && (
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <span className="text-slate-300 mr-2">📅</span>
                  <span>Start: {formatDate(goal.startDate)}</span>
                </motion.div>
              )}
              {goal.endDate && (
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                >
                  <span className="text-slate-300 mr-2">🎯</span>
                  <span>End: {formatDate(goal.endDate)}</span>
                </motion.div>
              )}
            </div>
          )}

          {/* Progress Bar */}
          {taskCount > 0 && (
            <motion.div
              className="mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-100">
                  Progress: {completedCount}/{taskCount} tasks
                </span>
                <motion.span
                  className="text-sm font-bold bg-gradient-primary bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  {progress}%
                </motion.span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2.5 overflow-hidden">
                <AnimatedProgressBar progress={progress} duration={0.8} />
              </div>
            </motion.div>
          )}

          {/* Task Summary */}
          {taskCount > 0 && (
            <motion.div
              className="flex gap-2 text-xs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <motion.span
                className="bg-gradient-success/20 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-600 font-semibold"
                whileHover={{ scale: 1.05 }}
              >
                ✅ {completedCount} completed
              </motion.span>
              <motion.span
                className="bg-gradient-info/20 text-blue-300 px-3 py-1.5 rounded-lg border border-blue-600 font-semibold"
                whileHover={{ scale: 1.05 }}
              >
                ⏳ {taskCount - completedCount} remaining
              </motion.span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </HoverCard>
  );
}

export default GoalCard;
