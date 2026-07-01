import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAgentStore = create(
  persist(
    (set, get) => ({
  // Goals management
  goals: [], // Array of goal objects
  currentGoalId: null,
  
  // Current goal and plan
  currentGoal: null,
  currentPlan: null,
  goalId: null,
  
  // Execution state
  executionResults: [],
  executionLog: [],
  isExecuting: false,
  
  // Reflection and memory
  reflection: null,
  memories: [],
  
  // Actions
  
  // Add or update a goal
  addGoal: (goal) => set((state) => {
    const existingIndex = state.goals.findIndex(g => g.goalId === goal.goalId);
    if (existingIndex >= 0) {
      const updatedGoals = [...state.goals];
      updatedGoals[existingIndex] = goal;
      return { goals: updatedGoals };
    }
    return { goals: [...state.goals, goal] };
  }),
  
  // Get all goals
  getGoals: () => get().goals,
  
  // Get goals by status
  getGoalsByStatus: (status) => get().goals.filter(g => g.status === status),
  
  // Set current goal
  setGoal: (goal, plan, goalId) => set({ 
    currentGoal: goal, 
    currentPlan: plan, 
    goalId,
    currentGoalId: goalId
  }),
  
  // Set current goal by ID
  setCurrentGoalId: (goalId) => {
    const state = get();
    const goal = state.goals.find(g => g.goalId === goalId);
    if (goal) {
      set({ currentGoalId: goalId, currentGoal: goal });
    }
  },
  
  // Update task in current goal
  updateTask: (taskId, updates) => set((state) => {
    if (!state.currentGoal || !state.currentGoal.tasks) return state;
    
    const updatedTasks = state.currentGoal.tasks.map(t =>
      t.id === taskId ? { ...t, ...updates } : t
    );
    
    const updatedGoal = {
      ...state.currentGoal,
      tasks: updatedTasks
    };
    
    // Also update in goals array
    const updatedGoals = state.goals.map(g =>
      g.goalId === state.goalId ? updatedGoal : g
    );
    
    return {
      currentGoal: updatedGoal,
      goals: updatedGoals
    };
  }),
  
  // Update goal status
  updateGoalStatus: (goalId, status, progress = null) => set((state) => {
    const updatedGoals = state.goals.map(g => {
      if (g.goalId === goalId) {
        const updated = { ...g, status };
        if (progress !== null) updated.progress = progress;
        return updated;
      }
      return g;
    });
    
    if (state.goalId === goalId) {
      return {
        goals: updatedGoals,
        currentGoal: updatedGoals.find(g => g.goalId === goalId)
      };
    }
    
    return { goals: updatedGoals };
  }),
  
  setExecutionState: (isExecuting) => set({ isExecuting }),
  
  setExecutionResults: (results) => set({ executionResults: results }),
  
  // Update individual task execution result
  updateTaskExecutionResult: (taskId, success, error = null) => set((state) => {
    const existingIndex = state.executionResults.findIndex(r => r.taskId === taskId);
    let updatedResults;
    
    if (existingIndex >= 0) {
      updatedResults = [...state.executionResults];
      updatedResults[existingIndex] = {
        ...updatedResults[existingIndex],
        success,
        error,
        executedAt: new Date().toISOString()
      };
    } else {
      updatedResults = [
        ...state.executionResults,
        {
          taskId,
          success,
          error,
          executedAt: new Date().toISOString()
        }
      ];
    }
    
    return { executionResults: updatedResults };
  }),
  
  addExecutionLog: (logEntry) => set((state) => ({
    executionLog: [...state.executionLog, logEntry]
  })),
  
  setReflection: (reflection) => set({ reflection }),
  
  setMemories: (memories) => set({ memories }),
  
  clearExecutionLogs: () => set({ executionLog: [] }),
  
  reset: () => set({
    goals: [],
    currentGoalId: null,
    currentGoal: null,
    currentPlan: null,
    goalId: null,
    executionResults: [],
    executionLog: [],
    isExecuting: false,
    reflection: null,
    memories: []
  })
    }),
    {
      name: 'agent-store',
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        }
      }
    }
  )
);

export default useAgentStore;
