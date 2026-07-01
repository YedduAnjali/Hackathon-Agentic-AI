# 🤖 Agentic AI Platform

A production-ready Autonomous Agentic AI system that helps users achieve personalized learning or workflow goals through intelligent goal decomposition, task planning, automated execution, and continuous learning.

## 🎯 Features

- **Goal Understanding**: Interprets user goals and breaks them into executable tasks
- **Intelligent Planning**: Creates structured plans with priorities and dependencies
- **Multi-Tool Execution**: Integrates with n8n workflows for automation
- **Persistent Memory**: Stores short-term, long-term, and episodic memories
- **Self-Reflection**: Analyzes outcomes and improves future plans
- **Re-planning**: Dynamically adjusts plans based on execution results
- **Ethical Safeguards**: Built-in safety limits and transparency

## 🏗️ Architecture

### Frontend (React)
- React 18 with Vite
- Tailwind CSS for styling
- Zustand for state management
- React Router for navigation
- Real-time execution logs and memory insights

### Backend (Node.js)
- Express.js REST API
- LangChain.js integration
- Hugging Face Inference API (LLaMA models)
- MongoDB for memory storage
- n8n webhook integration

### Agent Components
- **Planner**: Converts goals → sub-goals → tasks
- **Executor**: Selects tools and executes tasks via n8n
- **Reflector**: Analyzes outcomes and generates insights
- **Memory Manager**: Handles short-term, long-term, and episodic memory

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local or cloud instance)
- n8n instance (local or cloud)
- Hugging Face API key ([Get one here](https://huggingface.co/settings/tokens))

## 🚀 Quick Start

For detailed setup instructions, see [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md).

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your API keys and configuration.

### 3. Start Services

**MongoDB:**
```bash
mongod  # or use MongoDB Atlas
```

**n8n:**
```bash
npm install -g n8n
n8n start
# Import workflow from n8n/workflows/agent-task-executor.json
```

**Backend:**
```bash
npm run dev:backend
# Runs on http://localhost:5000
```

**Frontend:**
```bash
npm run dev:frontend
# Runs on http://localhost:3000
```

## 📖 Usage

### 1. Create a Goal

Navigate to `/goal` and enter your learning or workflow goal:

**Examples:**
- "Learn React by building a todo app"
- "Create a study plan for machine learning fundamentals"
- "Automate weekly progress reports from GitHub activity"
- "Set up reminders for daily workout routine"

You can optionally specify:
- **Start Date**: When you want to begin this goal
- **End Date**: Target completion date (helps schedule tasks)

### 2. Dashboard - Monitor Goals

The enhanced dashboard now shows all your goals organized by status:

- **🔵 Active Goals**: Currently running goals with real-time progress
- **✅ Completed Goals**: Successfully finished goals with full history
- **⏳ Planned Goals**: Upcoming goals scheduled for the future

Each goal card displays:
- Goal title and status badge
- Progress bar (completed vs total tasks)
- Start and end dates
- Task completion summary

Click on any goal to view details, including planning overview, execution results, and reflection insights.

### 3. Interactive Task Management

Navigate to the **Tasks** section (`/tasks`) to manage and track individual tasks:

**Features:**
- **Interactive Checkboxes**: Mark tasks as complete or pending
  - ✅ Green checkmark = Executed/Completed
  - ❌ Red cross = Failed
  - ⏳ Grey = Pending
  
- **Date Scheduling**: Assign specific dates to tasks within the goal's date range
  - Click on a task to reveal the date picker
  - Schedule tasks across your goal timeline
  - View tasks organized by scheduled date

- **Calendar View**: See all tasks grouped by date
  - Switch between List and Calendar views
  - Unscheduled tasks are grouped separately
  - Visual timeline of your planned work

- **Filtering & Sorting**: Control task visibility
  - Filter by status: All, Pending, Executed, Failed
  - Sort by: Scheduled date, Status, Priority
  - Real-time task count summary

### 4. Smart Data Display (No Raw JSON)

All agent outputs are now beautifully formatted:

**Planning Output:**
- Sub-goals displayed as cards with priority indicators
- Success criteria as a formatted list
- Timeline and estimated duration
- Task list with tool and time estimates

**Execution Results:**
- Status cards showing success/failure for each task
- Error messages clearly highlighted
- Success rate visualization with progress indicators
- Task execution summary

**Reflection & Insights:**
- Key insights displayed as bullet points
- Failures analysis with categorization
- Improvement recommendations
- Success patterns identified

**Memory Insights:**
- Organized by memory type (Short-term, Long-term, Episodic)
- Color-coded badges for quick identification
- Expandable memory cards with full context
- Memory statistics and patterns

### 5. Agent Execution Loop

The agent automatically:
1. **Understands** your goal
2. **Decomposes** it into sub-goals and tasks
3. **Plans** execution with priorities and scheduling
4. **Selects** appropriate tools/workflows
5. **Executes** tasks via n8n
6. **Evaluates** results with detailed metrics
7. **Reflects** on outcomes and generates insights
8. **Re-plans** if needed based on failures

### 6. Monitor Execution

- **Dashboard**: View all your goals with progress tracking and statistics
- **Execution Logs**: Detailed timeline and log viewer with filtering
  - Step-by-step execution history
  - Task execution results with success/failure status
  - Visual timeline of the entire execution process
  - Expandable log entries for detailed information
  
- **Memory Insights**: Explore agent memories organized by type
  - Memory statistics and success metrics
  - Expandable memory cards with full details
  - Outcome tracking (success/failure analysis)
  - Contextual information and metadata

## ✨ UI/UX Improvements

### Visual Design
- **Color Coding**: Green (success), Red (failure), Blue (in progress), Yellow (pending)
- **Icons & Emojis**: Visual indicators for quick status recognition
- **Progress Bars**: Visual representation of goal and task completion
- **Cards & Badges**: Clean, modular component design
- **Responsive Layout**: Optimized for desktop, tablet, and mobile

### Components
All new reusable React components:
- `GoalCard`: Display goals with progress and metadata
- `TaskCard`: Interactive task display with checkboxes and scheduling
- `StatusBadge`: Status indicators (Active, Completed, Pending, etc.)
- `ProgressBar`: Visual progress tracking
- `DatePicker`: Date selection for scheduling
- `PlanningPreview`: Formatted display of goals and sub-goals
- `ExecutionSummary`: Results visualization with charts
- `ReflectionInsights`: Formatted reflection and recommendations

### Data Models Enhanced

**Goal Object:**
```javascript
{
  goalId: "unique-id",
  title: "Goal description",
  status: "active | completed | pending",
  startDate: "2024-01-01",
  endDate: "2024-02-01",
  progress: 75,
  tasks: [],
  plan: {},
  executionResults: [],
  summary: {}
}
```

**Task Object:**
```javascript
{
  id: "task-id",
  subGoalId: "sub-goal-id",
  title: "Task title",
  description: "Task description",
  status: "pending | executed | failed",
  scheduledDate: "2024-01-15",
  executedAt: "2024-01-15T10:30:00Z",
  checkboxState: true,
  tool: "tool-name",
  estimatedTime: "2 hours"
}
```

## 🚀 Quick Start

For detailed setup instructions, see [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md).

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your API keys and configuration.

### 3. Start Services

**MongoDB:**
```bash
mongod  # or use MongoDB Atlas
```

**n8n:**
```bash
npm install -g n8n
n8n start
# Import workflow from n8n/workflows/agent-task-executor.json
```

**Backend:**
```bash
npm run dev:backend
# Runs on http://localhost:5000
```

**Frontend:**
```bash
npm run dev:frontend
# Runs on http://localhost:3000
```

## 🔧 API Endpoints

See [docs/API_EXAMPLES.md](docs/API_EXAMPLES.md) for detailed request/response examples.

### Execute Full Agent Loop
```bash
POST /api/agent/execute
Body: { "goal": "Your goal", "userId": "optional-user-id" }
```

### Get Plan Only
```bash
POST /api/agent/plan
Body: { "goal": "Your goal", "userId": "optional-user-id" }
```

### Execute Specific Task
```bash
POST /api/agent/task/execute
Body: { "task": {...}, "userId": "...", "goalId": "..." }
```

### Get Memories
```bash
GET /api/agent/memories/:goalId?type=episodic&limit=50
```

### Get Reflection
```bash
POST /api/agent/reflect/:goalId
Body: { "executionResults": [...] }
```

### Get User Patterns
```bash
GET /api/agent/patterns/:userId
```

### Health Check
```bash
GET /health
```

## 🔗 n8n Integration

The platform triggers n8n workflows via webhooks. Example workflows:

- **task-executor**: Generic task execution
- **study-plan**: Create structured learning plans
- **notification**: Send reminders/notifications
- **scheduler**: Schedule future tasks

### Setting up n8n Workflow

1. Import `n8n/workflows/agent-task-executor.json` into n8n
2. Activate the workflow
3. Ensure webhook URL matches `N8N_WEBHOOK_URL` in `.env`

## 🧠 Memory System

### Memory Types

- **Short-term**: Current task context
- **Long-term**: User goals, preferences, past outcomes
- **Episodic**: Task → action → result sequences

### Memory Storage

Memories are stored in MongoDB with:
- User ID
- Goal ID
- Memory type
- Content (flexible JSON)
- Context and outcomes
- Timestamps

## 🛡️ Ethical Safeguards

- No irreversible actions without user approval
- No financial or system-level actions
- Full transparency of agent decisions
- Human-in-the-loop override capability
- Rate limits and execution boundaries

## 📁 Project Structure

```
agentic-ai-platform/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand state
│   │   ├── services/       # API services
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── agents/             # Agent modules
│   │   ├── planner.js
│   │   ├── executor.js
│   │   ├── reflector.js
│   │   └── memory.js
│   ├── services/           # External services
│   │   ├── llama.service.js
│   │   └── n8n.service.js
│   ├── routes/             # API routes
│   │   └── agent.routes.js
│   ├── server.js
│   └── package.json
├── n8n/
│   └── workflows/          # n8n workflow JSON
└── README.md
```

## 🔍 Example Scenarios

See [docs/EXAMPLE_SCENARIOS.md](docs/EXAMPLE_SCENARIOS.md) for detailed scenarios.

### Quick Examples

**Learning Goal:**
```
Goal: "Learn Python by completing 5 coding challenges"
→ Creates study plan, schedules practice, sets reminders, tracks progress
```

**Workflow Automation:**
```
Goal: "Automate weekly GitHub activity reports"
→ Connects to GitHub API, fetches activity, generates report, emails weekly
```

**Study Planning:**
```
Goal: "Create a study plan for machine learning fundamentals"
→ 3-month structured plan with modules, resources, and milestones
```

For detailed API request examples, see [docs/API_EXAMPLES.md](docs/API_EXAMPLES.md).

## 🐛 Troubleshooting

### Hugging Face API Issues
- Ensure `HF_API_KEY` is set correctly
- Check model availability (some models may require access request)
- Model loading may take time on first request (503 error is normal)

### MongoDB Connection
- Verify MongoDB is running
- Check `MONGODB_URI` format
- Ensure network access if using remote MongoDB

### n8n Integration
- Verify n8n is running on port 5678
- Check webhook URL matches workflow
- Ensure workflow is activated

## 🚧 Development

### Backend Development
```bash
cd backend
npm install
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev  # Vite dev server with HMR
```

### Verify Setup
```bash
# Run verification script to check all services
npm run verify
```

## 📝 Notes

- The platform uses Hugging Face Inference API (not OpenAI)
- LLaMA models may require access approval
- n8n workflows can be customized for specific use cases
- Memory system supports flexible JSON storage
- All agent decisions are logged for transparency

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please ensure:
- Code follows existing patterns
- All modules are documented
- Ethical safeguards are maintained
- Tests are added for new features

---

**Built with ❤️ for autonomous AI agents**
