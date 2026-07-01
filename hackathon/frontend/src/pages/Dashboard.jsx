import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Zap, Brain, FileText } from 'lucide-react';
import useAgentStore from '../store/agentStore';
import GoalCard from '../components/GoalCard';
import PlanningPreview from '../components/PlanningPreview';
import ExecutionSummary from '../components/ExecutionSummary';
import ReflectionInsights from '../components/ReflectionInsights';
import { StaggerContainer, StaggerItem } from '../components/animations';

function Dashboard() {
  const { 
    goals, 
    currentGoalId, 
    setCurrentGoalId, 
    currentPlan, 
    executionResults, 
    reflection,
    getGoalsByStatus 
  } = useAgentStore();
  
  const navigate = useNavigate();
  const [selectedGoalId, setSelectedGoalId] = useState(null);

  // Memoize goal categorization to prevent unnecessary re-renders
  const { activeGoals, completedGoals, pendingGoals } = useMemo(() => ({
    activeGoals: getGoalsByStatus('active'),
    completedGoals: getGoalsByStatus('completed'),
    pendingGoals: getGoalsByStatus('pending'),
  }), [goals]);

  const selectedGoal = goals.find(g => g.goalId === (selectedGoalId || currentGoalId));

  const handleGoalClick = (goalId) => {
    setCurrentGoalId(goalId);
    setSelectedGoalId(goalId);
  };

  const handleCreateNewGoal = () => {
    navigate('/goal');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-between items-start"
      >
        <div>
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
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Dashboard
          </motion.h1>
          <motion.p
            className="mt-3 text-slate-300 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Monitor your AI agent goals and executions
          </motion.p>
        </div>
        <motion.button
          onClick={handleCreateNewGoal}
          className="px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-lg font-semibold transition-shadow flex items-center gap-2 shadow-md"
          whileHover={{ scale: 1.05, boxShadow: '0 20px 25px -5px rgba(79, 70, 229, 0.2)' }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Plus size={20} />
          New Goal
        </motion.button>
      </motion.div>

      {/* Empty State */}
      {goals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl shadow-lg p-12 text-center border border-slate-600"
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎯
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-2">
            No goals yet
          </h3>
          <p className="text-slate-300 mb-8 max-w-md mx-auto">
            Create your first goal to get started with the AI agent. It's fast, intelligent, and automated.
          </p>
          <motion.button
            onClick={handleCreateNewGoal}
            className="inline-flex items-center px-8 py-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-primary hover:shadow-xl transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="mr-2" size={20} />
            Create Your First Goal
          </motion.button>
        </motion.div>
      ) : (
        <>
          {/* Active Goals Section */}
          {activeGoals.length > 0 && (
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="flex items-center gap-3 mb-6"
                variants={itemVariants}
              >
                <motion.h2
                  className="text-3xl font-bold text-white"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  🔵 Active Goals
                </motion.h2>
                <motion.span
                  className="px-4 py-2 bg-gradient-info/20 text-blue-700 rounded-full text-sm font-bold border border-blue-200"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                >
                  {activeGoals.length}
                </motion.span>
              </motion.div>
              <motion.div
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                variants={containerVariants}
              >
                {activeGoals.map((goal, idx) => (
                  <motion.div
                    key={goal.goalId}
                    variants={itemVariants}
                    onClick={() => handleGoalClick(goal.goalId)}
                  >
                    <GoalCard goal={goal} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          )}

          {/* Completed Goals Section */}
          {completedGoals.length > 0 && (
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              transition={{ delayChildren: 0.3 }}
            >
              <motion.div
                className="flex items-center gap-3 mb-6"
                variants={itemVariants}
              >
                <motion.h2
                  className="text-3xl font-bold text-slate-900"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  ✅ Completed Goals
                </motion.h2>
                <motion.span
                  className="px-4 py-2 bg-gradient-success/20 text-emerald-700 rounded-full text-sm font-bold border border-emerald-200"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                >
                  {completedGoals.length}
                </motion.span>
              </motion.div>
              <motion.div
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                variants={containerVariants}
              >
                {completedGoals.map((goal) => (
                  <motion.div
                    key={goal.goalId}
                    variants={itemVariants}
                    onClick={() => handleGoalClick(goal.goalId)}
                  >
                    <GoalCard goal={goal} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          )}

          {/* Pending Goals Section */}
          {pendingGoals.length > 0 && (
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              transition={{ delayChildren: 0.5 }}
            >
              <motion.div
                className="flex items-center gap-3 mb-6"
                variants={itemVariants}
              >
                <motion.h2
                  className="text-3xl font-bold text-slate-900"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  ⏳ Planned Goals
                </motion.h2>
                <motion.span
                  className="px-4 py-2 bg-gradient-warning/20 text-amber-700 rounded-full text-sm font-bold border border-amber-200"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                >
                  {pendingGoals.length}
                </motion.span>
              </motion.div>
              <motion.div
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                variants={containerVariants}
              >
                {pendingGoals.map((goal) => (
                  <motion.div
                    key={goal.goalId}
                    variants={itemVariants}
                    onClick={() => handleGoalClick(goal.goalId)}
                  >
                    <GoalCard goal={goal} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          )}

          {/* Selected Goal Details */}
          {selectedGoal && (
            <motion.section
              className="border-t border-slate-200 pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.h3
                className="text-3xl font-bold text-white mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                📌 Selected Goal: <span className="text-white">{selectedGoal.title}</span>
              </motion.h3>

              <motion.div
                className="space-y-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 },
                  },
                }}
              >
                {/* Planning Preview */}
                {currentPlan && (
                  <motion.div variants={itemVariants}>
                    <PlanningPreview plan={currentPlan} />
                  </motion.div>
                )}

                {/* Execution Summary */}
                {executionResults.length > 0 && (
                  <motion.div variants={itemVariants}>
                    <ExecutionSummary
                      executionResults={executionResults}
                      summary={selectedGoal.summary}
                    />
                  </motion.div>
                )}

                {/* Reflection Insights */}
                {reflection && (
                  <motion.div variants={itemVariants}>
                    <ReflectionInsights reflection={reflection} />
                  </motion.div>
                )}

                {/* Action Buttons */}
                {(executionResults.length > 0 || selectedGoal.tasks?.length > 0) && (
                  <motion.div
                    className="flex gap-3 pt-4 flex-wrap"
                    variants={itemVariants}
                  >
                    <Link
                      to="/logs"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:shadow-md font-semibold transition-shadow"
                    >
                      <FileText size={18} />
                      View Logs
                    </Link>
                    <Link
                      to="/memory"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:shadow-md font-semibold transition-shadow"
                    >
                      <Brain size={18} />
                      View Memory
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </motion.section>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
