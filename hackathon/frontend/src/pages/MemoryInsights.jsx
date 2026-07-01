import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Brain, Zap, HardDrive, BookOpen, TrendingUp } from 'lucide-react';
import useAgentStore from '../store/agentStore';
import { agentAPI } from '../services/api';
import { StaggerContainer, StaggerItem, ExpandableSection } from '../components/animations';

// Parse JSON content into readable format
const parseMemoryContent = (content) => {
  if (!content) return '';

  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      return typeof parsed === 'object' ? parsed : content;
    } catch {
      return content;
    }
  }

  return content;
};

// Render different content types
const ContentRenderer = ({ content, title }) => {
  if (!content) return null;

  // Handle arrays of items
  if (Array.isArray(content)) {
    return (
      <div className="space-y-2">
        {content.map((item, idx) => (
          <motion.div
            key={idx}
            className="flex items-start gap-2 p-2 bg-slate-50 rounded border border-slate-200"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <span className="text-slate-400 flex-shrink-0">•</span>
            <span className="text-sm text-slate-700">
              {typeof item === 'object' ? JSON.stringify(item) : String(item)}
            </span>
          </motion.div>
        ))}
      </div>
    );
  }

  // Handle objects
  if (typeof content === 'object') {
    return (
      <div className="space-y-2">
        {Object.entries(content).map(([key, value], idx) => (
          <motion.div
            key={key}
            className="p-2 bg-slate-50 rounded border border-slate-200"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <p className="text-xs font-bold text-slate-700">{key}:</p>
            <p className="text-sm text-slate-600 ml-2">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </p>
          </motion.div>
        ))}
      </div>
    );
  }

  // Plain text
  return (
    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{String(content)}</p>
  );
};

function MemoryInsights() {
  const { goalId, memories, setMemories } = useAgentStore();
  const [loading, setLoading] = useState(false);
  const [memoryType, setMemoryType] = useState('all');
  const [expandedMemory, setExpandedMemory] = useState(null);

  useEffect(() => {
    if (goalId) {
      loadMemories();
    }
  }, [goalId, memoryType]);

  const loadMemories = async () => {
    if (!goalId) return;

    setLoading(true);
    try {
      const type = memoryType === 'all' ? null : memoryType;
      const data = await agentAPI.getMemories(goalId, type);
      setMemories(data.memories || []);
    } catch (error) {
      console.error('Failed to load memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMemoryTypeConfig = (type) => {
    switch (type) {
      case 'short-term':
        return { bg: 'bg-gradient-info/10', border: 'border-blue-200', text: 'text-blue-700', icon: Zap };
      case 'long-term':
        return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: HardDrive };
      case 'episodic':
        return { bg: 'bg-gradient-success/10', border: 'border-emerald-200', text: 'text-emerald-700', icon: BookOpen };
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: Brain };
    }
  };

  const getMemoryTypeIcon = (type) => {
    switch (type) {
      case 'short-term': return '⚡';
      case 'long-term': return '💾';
      case 'episodic': return '📖';
      default: return '🧠';
    }
  };

  const getOutcomeConfig = (outcome) => {
    switch (outcome) {
      case 'success':
        return { bg: 'bg-gradient-success/10', border: 'border-emerald-200', text: 'text-emerald-700', icon: '✅' };
      case 'failure':
        return { bg: 'bg-gradient-error/10', border: 'border-rose-200', text: 'text-rose-700', icon: '❌' };
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: '⏳' };
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

  // Memoized grouping
  const memoriesByType = useMemo(() => ({
    'short-term': memories.filter(m => m.memoryType === 'short-term'),
    'long-term': memories.filter(m => m.memoryType === 'long-term'),
    'episodic': memories.filter(m => m.memoryType === 'episodic'),
    'other': memories.filter(m => !['short-term', 'long-term', 'episodic'].includes(m.memoryType))
  }), [memories]);

  // Memoized stats
  const stats = useMemo(() => ({
    total: memories.length,
    successCount: memories.filter(m => m.outcome === 'success').length,
    successRate: memories.filter(m => m.outcome === 'success').length > 0
      ? Math.round((memories.filter(m => m.outcome === 'success').length / memories.filter(m => m.outcome).length) * 100)
      : 0,
    recentDate: memories.length > 0 ? new Date(memories[0].timestamp).toLocaleDateString() : 'N/A',
  }), [memories]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
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
          className="text-5xl font-bold text-white flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Brain size={40} className="text-gradient-primary" />
          <span style={{
            backgroundImage: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Memory Insights</span>
        </motion.h1>
        <motion.p
          className="mt-3 text-slate-300 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Explore agent memory: goals, preferences, and past experiences
        </motion.p>
      </motion.div>

      {!goalId ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-200"
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🧠
          </motion.div>
          <p className="text-slate-500 text-lg">
            No active goal. Create a goal to see memory insights.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Filters */}
          <motion.div
            className="flex flex-wrap gap-2 items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Brain size={18} className="text-slate-600" />
            <label className="text-xs font-bold text-slate-600">Memory Type:</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'short-term', 'long-term', 'episodic'].map((type, idx) => (
                <motion.button
                  key={type}
                  onClick={() => setMemoryType(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    memoryType === type
                      ? 'bg-gradient-primary text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + idx * 0.05 }}
                >
                  {type === 'all' ? 'All' : type.replace('-', ' ')}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Memory Count Summary */}
          {memories.length > 0 && (
            <motion.div
              className="grid grid-cols-1 gap-4 sm:grid-cols-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {[
                { label: 'Short-term', count: memoriesByType['short-term'].length, icon: Zap, color: 'info' },
                { label: 'Long-term', count: memoriesByType['long-term'].length, icon: HardDrive, color: 'purple' },
                { label: 'Episodic', count: memoriesByType['episodic'].length, icon: BookOpen, color: 'success' },
                { label: 'Total', count: memories.length, icon: Brain, color: 'primary' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    className={`rounded-lg p-4 border
                      ${item.color === 'info' ? 'bg-gradient-info/10 border-blue-200' :
                        item.color === 'purple' ? 'bg-purple-50 border-purple-200' :
                        item.color === 'success' ? 'bg-gradient-success/10 border-emerald-200' :
                        'bg-gradient-primary/10 border-blue-200'}`}
                    variants={itemVariants}
                    whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={16} className={
                        item.color === 'info' ? 'text-blue-600' :
                        item.color === 'purple' ? 'text-purple-600' :
                        item.color === 'success' ? 'text-emerald-600' :
                        'text-blue-600'
                      } />
                      <p className={`text-xs font-bold ${
                        item.color === 'info' ? 'text-blue-600' :
                        item.color === 'purple' ? 'text-purple-600' :
                        item.color === 'success' ? 'text-emerald-600' :
                        'text-blue-600'
                      }`}>
                        {item.label}
                      </p>
                    </div>
                    <motion.p
                      className="text-3xl font-bold text-slate-900"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 + idx * 0.05 }}
                    >
                      {item.count}
                    </motion.p>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Memories */}
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <motion.p
                className="text-slate-500 text-lg"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⏳ Loading memories...
              </motion.p>
            </motion.div>
          ) : memories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-50 rounded-lg p-12 text-center border-2 border-dashed border-slate-300"
            >
              <p className="text-slate-500 text-lg">No memories found for this goal yet.</p>
            </motion.div>
          ) : (
            <motion.div
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {memories.map((memory, idx) => {
                const typeConfig = getMemoryTypeConfig(memory.memoryType);
                const outcomeConfig = getOutcomeConfig(memory.outcome);
                return (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className={`bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow border-l-4 border-gradient-primary cursor-pointer overflow-hidden`}
                    onClick={() => setExpandedMemory(expandedMemory === idx ? null : idx)}
                    whileHover={{ y: -2 }}
                  >
                    {/* Memory Header */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <motion.span
                            className="text-2xl flex-shrink-0"
                            animate={{ scale: expandedMemory === idx ? 1.15 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {getMemoryTypeIcon(memory.memoryType)}
                          </motion.span>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <motion.span
                                className={`px-3 py-1 rounded-full text-xs font-bold border ${typeConfig.bg} ${typeConfig.text} ${typeConfig.border}`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring' }}
                              >
                                {(memory.memoryType || 'Unknown').replace('-', ' ')}
                              </motion.span>
                              {memory.outcome && (
                                <motion.span
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${outcomeConfig.bg} ${outcomeConfig.text} ${outcomeConfig.border}`}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', delay: 0.05 }}
                                >
                                  {outcomeConfig.icon} {memory.outcome}
                                </motion.span>
                              )}
                            </div>
                            {memory.context && (
                              <motion.p
                                className="text-sm text-slate-700 font-medium mb-1 line-clamp-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                              >
                                {memory.context}
                              </motion.p>
                            )}
                            {memory.timestamp && (
                              <p className="text-xs text-slate-500">
                                📅 {formatTimestamp(memory.timestamp)}
                              </p>
                            )}
                          </div>
                        </div>
                        <motion.span
                          className="text-slate-400 flex-shrink-0 ml-2"
                          animate={{ rotate: expandedMemory === idx ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={20} />
                        </motion.span>
                      </div>

                      {/* Expanded Details */}
                      <ExpandableSection isOpen={expandedMemory === idx} duration={0.3}>
                        <motion.div
                          className="mt-4 pt-4 border-t border-slate-200 space-y-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.05 }}
                        >
                          {memory.content && (
                            <div>
                              <p className="text-sm font-bold text-slate-700 mb-3">📌 Content</p>
                              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <ContentRenderer content={parseMemoryContent(memory.content)} />
                              </div>
                            </div>
                          )}

                          {memory.metadata && Object.keys(memory.metadata).length > 0 && (
                            <div>
                              <p className="text-sm font-bold text-slate-700 mb-3">🏷️ Metadata</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {Object.entries(memory.metadata).map(([key, value], midx) => (
                                  <motion.div
                                    key={key}
                                    className="bg-slate-50 rounded-lg p-3 border border-slate-200"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: midx * 0.05 }}
                                  >
                                    <p className="text-xs font-bold text-slate-700 mb-1">{key}:</p>
                                    <p className="text-xs text-slate-600">
                                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </p>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </ExpandableSection>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Memory Statistics */}
          {memories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-lg transition-shadow"
            >
              <motion.h3
                className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                <TrendingUp size={24} className="text-gradient-primary" />
                📊 Memory Statistics
              </motion.h3>
              <motion.div
                className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  variants={itemVariants}
                  className="p-4 bg-gradient-primary/5 rounded-lg border border-blue-200"
                >
                  <p className="text-xs font-bold text-blue-600 mb-2">Total Memories</p>
                  <motion.p
                    className="text-3xl font-bold text-slate-900"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    {stats.total}
                  </motion.p>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  className="p-4 bg-gradient-success/5 rounded-lg border border-emerald-200"
                >
                  <p className="text-xs font-bold text-emerald-600 mb-2">Success Rate</p>
                  <motion.p
                    className="text-3xl font-bold text-emerald-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.35 }}
                  >
                    {stats.successRate}%
                  </motion.p>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  className="p-4 bg-gradient-info/5 rounded-lg border border-blue-200"
                >
                  <p className="text-xs font-bold text-blue-600 mb-2">Most Recent</p>
                  <p className="text-sm text-slate-900 font-semibold">{stats.recentDate}</p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}

export default MemoryInsights;
