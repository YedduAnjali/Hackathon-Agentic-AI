import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import GoalInput from './pages/GoalInput';
import TaskManager from './pages/TaskManager';
import ExecutionLogs from './pages/ExecutionLogs';
import MemoryInsights from './pages/MemoryInsights';
import TaskExecutionStatus from './pages/TaskExecutionStatus';

function App() {
  return (
    <Routes>
      {/* Auth Routes - No Layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected Routes - With Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/goal" element={<GoalInput />} />
                <Route path="/tasks" element={<TaskManager />} />
                <Route path="/execution" element={<TaskExecutionStatus />} />
                <Route path="/logs" element={<ExecutionLogs />} />
                <Route path="/memory" element={<MemoryInsights />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/goal"
        element={
          <ProtectedRoute>
            <Layout>
              <GoalInput />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Layout>
              <TaskManager />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/execution"
        element={
          <ProtectedRoute>
            <Layout>
              <TaskExecutionStatus />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/logs"
        element={
          <ProtectedRoute>
            <Layout>
              <ExecutionLogs />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/memory"
        element={
          <ProtectedRoute>
            <Layout>
              <MemoryInsights />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
