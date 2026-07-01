import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Calendar, User } from 'lucide-react';
import useAgentStore from '../store/agentStore';
import { agentAPI } from '../services/api';
import DatePicker from '../components/DatePicker';

function GoalInput() {
  const [goal, setGoal] = useState('');
  const [userId, setUserId] = useState('default-user');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { addGoal, setGoal: setStoreGoal, setExecutionState, setExecutionResults, addExecutionLog, setReflection } = useAgentStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!goal.trim()) {
      setError('Please enter a goal');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      addExecutionLog({ 
        type: 'info', 
        message: 'Starting agent execution...', 
        timestamp: new Date().toISOString() 
      });

      setExecutionState(true);
      
      // Execute full agent loop
      const result = await agentAPI.execute(goal, userId);
      
      // Create goal object with metadata
      const goalObject = {
        goalId: result.goalId,
        title: goal,
        status: 'active',
        startDate: startDate || new Date().toISOString(),
        endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days by default
        progress: 0,
        tasks: result.plan?.plan?.tasks || [],
        plan: result.plan,
        executionResults: result.executionResults || [],
        reflection: result.reflection,
        summary: result.summary
      };
      
      // Add goal to store
      addGoal(goalObject);
      
      // Update store
      setStoreGoal(goal, result.plan, result.goalId);
      setExecutionResults(result.executionResults || []);
      setReflection(result.reflection);
      
      // Add logs
      result.executionLog?.forEach(log => {
        addExecutionLog({
          type: 'execution',
          ...log,
          timestamp: log.timestamp || new Date().toISOString()
        });
      });

      setExecutionState(false);
      
      // Navigate to dashboard
      navigate('/');
    } catch (err) {
      console.error('Execution error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to execute goal');
      setExecutionState(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
          <motion.h1
            className="text-5xl font-bold text-white flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Sparkles size={40} className="text-gradient-primary" />
            Create New Goal
          </motion.h1>
          <motion.p
            className="mt-3 text-slate-300 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Describe your learning or workflow goal. The AI agent will break it down into tasks and execute them autonomously.
          </motion.p>
        </motion.div>

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl shadow-lg p-8 space-y-6 border border-slate-600 text-white">
          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-gradient-error/10 border border-rose-200 rounded-lg"
            >
              <p className="text-sm font-semibold text-rose-700">⚠️ {error}</p>
            </motion.div>
          )}

          {/* User ID */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label htmlFor="userId" className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <User size={16} />
              User ID (optional)
            </label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 bg-white"
              placeholder="default-user"
            />
          </motion.div>

          {/* Goal Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <label htmlFor="goal" className="block text-sm font-bold text-slate-700 mb-2">
              Your Goal *
            </label>
            <textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-slate-900 bg-white"
              placeholder="Example: Learn React by building a todo app, or Automate my daily email summaries"
              required
            />
            <p className="mt-2 text-sm text-slate-500">
              Be specific about what you want to achieve. The agent will create a detailed plan.
            </p>
          </motion.div>

          {/* Date Range */}
          <motion.div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DatePicker
              label="Start Date (optional)"
              value={startDate}
              onChange={setStartDate}
            />
            <DatePicker
              label="End Date (optional)"
              value={endDate}
              onChange={setEndDate}
              minDate={startDate || undefined}
            />
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex items-center justify-between pt-6 border-t border-slate-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <motion.button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-slate-300 text-sm font-bold rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={isLoading}
              className={`px-8 py-3 border border-transparent text-sm font-bold rounded-lg text-white bg-gradient-primary hover:shadow-lg transition-all flex items-center gap-2 ${
                isLoading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              whileHover={!isLoading ? { scale: 1.02, boxShadow: '0 20px 25px -5px rgba(79, 70, 229, 0.2)' } : {}}
              whileTap={!isLoading ? { scale: 0.95 } : {}}
            >
              {isLoading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ⏳
                </motion.div>
              )}
              {isLoading ? 'Executing...' : (
                <>
                  <Sparkles size={18} />
                  Execute Goal
                </>
              )}
            </motion.button>
          </motion.div>
        </form>

        {/* Example Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-xl p-6 border border-blue-200"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            💡 Example Goals to Inspire You
          </h3>
          <motion.ul
            className="space-y-3 text-sm text-slate-700"
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
            {[
              'Learn Python by completing 5 coding challenges',
              'Create a study plan for machine learning fundamentals',
              'Automate weekly progress reports from my GitHub activity',
              'Set up reminders for my daily workout routine',
            ].map((example, idx) => (
              <motion.li
                key={idx}
                className="flex gap-2 p-2 rounded-lg hover:bg-white/50 transition-colors"
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <span className="text-blue-600 flex-shrink-0 font-bold">✓</span>
                <span>{example}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default GoalInput;
