import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListTodo, Calendar, Filter, ArrowUpDown } from 'lucide-react';
import useAgentStore from '../store/agentStore';
import TaskCard from '../components/TaskCard';
import DatePicker from '../components/DatePicker';
import { StaggerContainer, StaggerItem, ExpandableSection } from '../components/animations';

function TaskManager() {
  const { currentGoal, goals, setCurrentGoalId, updateTask } = useAgentStore();
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [sortBy, setSortBy] = useState('scheduled'); // 'scheduled', 'status', 'priority'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'executed', 'failed'
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingDate, setEditingDate] = useState('');

  // Initialize currentGoal if not set
  const displayGoal = currentGoal || (goals.length > 0 ? goals[0] : null);
  
  // Auto-set first goal if currentGoal is not set
  if (!currentGoal && goals.length > 0 && displayGoal) {
    setTimeout(() => setCurrentGoalId(goals[0].goalId), 0);
  }

  if (!displayGoal || !displayGoal.tasks) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl shadow-lg p-12 text-center border border-slate-600 text-white"
      >
        <p className="text-slate-300 text-lg">No tasks available for this goal</p>
      </motion.div>
    );
  }

  // Filter tasks with useMemo
  const filteredTasks = useMemo(() => {
    let tasks = displayGoal.tasks;
    if (filterStatus !== 'all') {
      tasks = tasks.filter(t => t.status === filterStatus);
    }
    return tasks;
  }, [displayGoal.tasks, filterStatus]);

  // Sort tasks with useMemo
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      switch (sortBy) {
        case 'scheduled':
          return new Date(a.scheduledDate || 0) - new Date(b.scheduledDate || 0);
        case 'status':
          const statusOrder = { pending: 0, executed: 1, failed: 2 };
          return (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3);
        case 'priority':
          return (b.priority || 0) - (a.priority || 0);
        default:
          return 0;
      }
    });
  }, [filteredTasks, sortBy]);

  const handleCheckboxChange = (taskId, isChecked) => {
    updateTask(taskId, {
      checkboxState: isChecked,
      status: isChecked ? 'executed' : 'pending',
      executedAt: isChecked ? new Date().toISOString() : null
    });
  };

  const handleDateAssign = (taskId, date) => {
    updateTask(taskId, { scheduledDate: date });
    setEditingTaskId(null);
  };

  // Group by date for calendar view
  const tasksByDate = useMemo(() => {
    const grouped = {};
    sortedTasks.forEach(task => {
      const date = task.scheduledDate ? task.scheduledDate.split('T')[0] : 'unscheduled';
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(task);
    });
    return grouped;
  }, [sortedTasks]);

  // Task stats
  const stats = useMemo(() => ({
    pending: displayGoal.tasks.filter(t => t.status === 'pending').length,
    completed: displayGoal.tasks.filter(t => t.status === 'executed').length,
    failed: displayGoal.tasks.filter(t => t.status === 'failed').length,
  }), [displayGoal.tasks]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h1
          className="text-4xl font-bold text-slate-900 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <ListTodo size={36} className="text-gradient-primary" />
          Tasks
          <span className="text-xl bg-gradient-primary bg-clip-text text-transparent">
            ({filteredTasks.length})
          </span>
        </motion.h1>
        
        {/* View Toggle */}
        <motion.div
          className="flex gap-2 bg-slate-100 p-1 rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {[
            { id: 'list', icon: ListTodo, label: 'List' },
            { id: 'calendar', icon: Calendar, label: 'Calendar' },
          ].map((option) => (
            <motion.button
              key={option.id}
              onClick={() => setView(option.id)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${
                view === option.id
                  ? 'bg-gradient-primary text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <option.icon size={16} />
              {option.label}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Filter & Sort Controls */}
      <motion.div
        className="flex gap-4 flex-wrap items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        {/* Filter */}
        <div className="flex gap-2 items-center">
          <Filter size={18} className="text-slate-600" />
          <label className="text-xs font-bold text-slate-600">Filter:</label>
          <div className="flex gap-2">
            {['all', 'pending', 'executed', 'failed'].map(status => (
              <motion.button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filterStatus === status
                    ? 'bg-gradient-primary text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex gap-2 items-center">
          <ArrowUpDown size={18} className="text-slate-600" />
          <label className="text-xs font-bold text-slate-600">Sort:</label>
          <div className="flex gap-2">
            {['scheduled', 'status', 'priority'].map(sort => (
              <motion.button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  sortBy === sort
                    ? 'bg-gradient-primary text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* List View */}
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {sortedTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-50 rounded-lg p-12 text-center border-2 border-dashed border-slate-300"
              >
                <p className="text-slate-500 text-lg">No tasks match your filter</p>
              </motion.div>
            ) : (
              <StaggerContainer staggerDelay={0.05}>
                {sortedTasks.map(task => (
                  <StaggerItem key={task.id}>
                    <div className="relative">
                      <TaskCard
                        task={task}
                        onCheckboxChange={handleCheckboxChange}
                        onClick={() => {
                          if (editingTaskId !== task.id) {
                            setEditingTaskId(task.id);
                            setEditingDate(task.scheduledDate || '');
                          }
                        }}
                      />
                      {/* Animated Date Editor */}
                      <ExpandableSection isOpen={editingTaskId === task.id} duration={0.2}>
                        <motion.div
                          className="mt-2 p-4 bg-gradient-info/10 rounded-lg border border-blue-200"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex gap-2 items-end flex-wrap">
                            <div className="flex-1 min-w-[200px]">
                              <DatePicker
                                label="Schedule for:"
                                value={editingDate}
                                onChange={setEditingDate}
                                minDate={currentGoal.startDate}
                                maxDate={currentGoal.endDate}
                              />
                            </div>
                            <div className="flex gap-2">
                              <motion.button
                                onClick={() => handleDateAssign(task.id, editingDate)}
                                className="px-4 py-2 bg-gradient-success text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-shadow"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Save
                              </motion.button>
                              <motion.button
                                onClick={() => setEditingTaskId(null)}
                                className="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-400 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Cancel
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      </ExpandableSection>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar View */}
      <AnimatePresence mode="wait">
        {view === 'calendar' && (
          <motion.div
            key="calendar-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {Object.entries(tasksByDate).length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-50 rounded-lg p-12 text-center border-2 border-dashed border-slate-300"
              >
                <p className="text-slate-500">No tasks to display</p>
              </motion.div>
            ) : (
              Object.entries(tasksByDate).map(([date, tasks], idx) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-white rounded-lg shadow-sm p-5 border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <motion.div
                    className="flex items-center gap-3 mb-4"
                    whileHover={{ x: 2 }}
                  >
                    <span className="text-lg">
                      {date === 'unscheduled' ? '📌' : '📅'}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {date === 'unscheduled'
                        ? 'Unscheduled Tasks'
                        : new Date(date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                          })}
                    </span>
                    <motion.span
                      className="ml-auto px-3 py-1 bg-gradient-primary/20 text-blue-700 rounded-full text-xs font-bold border border-blue-200"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.1 }}
                    >
                      {tasks.length}
                    </motion.span>
                  </motion.div>
                  <motion.div
                    className="space-y-2"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.05 },
                      },
                    }}
                    initial="hidden"
                    animate="visible"
                  >
                    {tasks.map(task => (
                      <motion.div
                        key={task.id}
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0 },
                        }}
                      >
                        <TaskCard
                          task={task}
                          onCheckboxChange={handleCheckboxChange}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Stats */}
      <motion.div
        className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {[
          { label: 'Pending', count: stats.pending, icon: '⏳', gradient: 'gradient-info' },
          { label: 'Completed', count: stats.completed, icon: '✅', gradient: 'gradient-success' },
          { label: 'Failed', count: stats.failed, icon: '❌', gradient: 'gradient-error' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            className={`bg-${stat.gradient}/10 rounded-lg p-4 text-center border border-slate-200 hover:shadow-md transition-shadow`}
            whileHover={{ y: -2 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 + idx * 0.05 }}
          >
            <p className="text-xs font-bold text-slate-600 mb-2">{stat.label}</p>
            <motion.div
              className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 + idx * 0.05 }}
            >
              <span>{stat.icon}</span>
              <span>{stat.count}</span>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

export default TaskManager;
