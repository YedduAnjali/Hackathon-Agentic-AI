# Agentic AI Backend - Python FastAPI

This is the Python FastAPI backend for the Agentic AI Platform, migrated from Node.js + Express.

## Overview

The backend provides a REST API for an agentic AI system that:
- Understands user goals
- Breaks them into structured tasks
- Executes tasks using n8n workflows
- Stores and retrieves memories (short-term, long-term, episodic)
- Reflects on execution results and improves over time

## Tech Stack

- **Python 3.10+**
- **FastAPI** - Modern, fast web framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **httpx** - Async HTTP client
- **Hugging Face Inference API** - LLM integration

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── api/
│   │   ├── agent.py           # Agent API routes
│   │   └── health.py          # Health check endpoint
│   ├── agents/
│   │   ├── planner.py         # Goal → Plan conversion
│   │   ├── executor.py        # Task execution via n8n
│   │   ├── reflector.py      # Execution analysis & improvement
│   │   └── memory.py          # Memory management
│   ├── core/
│   │   ├── config.py          # Configuration management
│   │   └── database.py        # MongoDB connection
│   ├── models/
│   │   └── schemas.py         # Pydantic schemas
│   └── services/
│       ├── huggingface.py     # Hugging Face LLM service
│       └── n8n.py             # n8n webhook service
├── requirements.txt
├── .env.example
└── README.md
```

## Setup

### Prerequisites

- Python 3.10 or higher
- MongoDB (local or remote)
- n8n instance (optional, for task execution)
- Hugging Face API key

### Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment (recommended):**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   - `HF_API_KEY` or `HUGGINGFACE_API_KEY` - Your Hugging Face API key
   - `MONGODB_URI` - MongoDB connection string
   - `N8N_WEBHOOK_URL` - n8n webhook URL (default: http://localhost:5678/webhook/agent)
   - `PORT` - Server port (default: 5000)

### Running the Server

**Development mode:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

**Production mode:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 5000
```

Or using Python directly:
```bash
python -m app.main
```

The server will start at `http://localhost:5000`

## API Endpoints

### Base URL
```
http://localhost:5000/api
```

### 1. Health Check

**GET** `/health`

Check if the backend is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### 2. Execute Full Agent Loop

**POST** `/agent/execute`

Execute a complete agent cycle: planning, execution, reflection, and re-planning.

**Request:**
```json
{
  "goal": "Learn React by building a todo app",
  "userId": "user-123"
}
```

**Response:**
```json
{
  "goalId": "550e8400-e29b-41d4-a716-446655440000",
  "goal": "Learn React by building a todo app",
  "plan": {
    "goalId": "...",
    "goal": "...",
    "plan": {
      "goal": "...",
      "subGoals": [...],
      "tasks": [...],
      "timeline": "...",
      "successCriteria": [...]
    },
    "createdAt": "..."
  },
  "executionResults": [
    {
      "taskId": "task-1",
      "success": true,
      "result": {...},
      "tool": "task-executor",
      "executedAt": "..."
    }
  ],
  "reflection": {
    "goalId": "...",
    "reflection": {
      "overallSuccess": true,
      "successRate": 85.5,
      "keyInsights": [...],
      "failures": [],
      "improvements": [...],
      "recommendations": [...]
    },
    "reflectedAt": "..."
  },
  "replan": null,
  "executionLog": [...],
  "summary": {
    "totalTasks": 8,
    "successCount": 7,
    "failureCount": 1,
    "successRate": "87.5%"
  }
}
```

### 3. Get Plan Only

**POST** `/agent/plan`

Generate a plan without executing tasks.

**Request:**
```json
{
  "goal": "Create a study plan for machine learning fundamentals",
  "userId": "user-123"
}
```

**Response:**
```json
{
  "goalId": "660e8400-e29b-41d4-a716-446655440001",
  "plan": {
    "goalId": "...",
    "goal": "...",
    "plan": {
      "goal": "...",
      "subGoals": [...],
      "tasks": [...],
      "timeline": "...",
      "successCriteria": [...]
    },
    "createdAt": "..."
  }
}
```

### 4. Execute Specific Task

**POST** `/agent/task/execute`

Execute a single task with custom parameters.

**Request:**
```json
{
  "task": {
    "id": "task-123",
    "title": "Send daily reminder",
    "description": "Send reminder for workout",
    "tool": "notification"
  },
  "userId": "user-123",
  "goalId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "taskId": "task-123",
  "success": true,
  "result": {
    "success": true,
    "data": {...}
  },
  "tool": "notification",
  "executedAt": "2024-01-15T18:00:05Z"
}
```

### 5. Get Memories

**GET** `/agent/memories/{goalId}`

Retrieve stored memories for a goal.

**Query Parameters:**
- `type` (optional): Filter by memory type (`short-term`, `long-term`, `episodic`)
- `limit` (optional): Maximum number of memories (default: 50)

**Example:**
```
GET /api/agent/memories/550e8400-e29b-41d4-a716-446655440000?type=episodic&limit=20
```

**Response:**
```json
{
  "goalId": "550e8400-e29b-41d4-a716-446655440000",
  "memories": [
    {
      "_id": "mem-123",
      "userId": "user-123",
      "goalId": "550e8400-e29b-41d4-a716-446655440000",
      "memoryType": "episodic",
      "content": {
        "task": "Install Node.js and npm",
        "action": "task-executor",
        "result": {...}
      },
      "outcome": "success",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

### 6. Get Reflection

**POST** `/agent/reflect/{goalId}`

Analyze execution results and get insights.

**Request:**
```json
{
  "executionResults": [
    {
      "taskId": "task-1",
      "success": true,
      "result": {...}
    },
    {
      "taskId": "task-2",
      "success": false,
      "error": "Dependency not met"
    }
  ],
  "userId": "user-123"
}
```

**Response:**
```json
{
  "goalId": "550e8400-e29b-41d4-a716-446655440000",
  "reflection": {
    "overallSuccess": false,
    "successRate": 50.0,
    "keyInsights": [...],
    "failures": [
      {
        "task": "task-2",
        "reason": "Dependency not met",
        "suggestion": "..."
      }
    ],
    "improvements": [...],
    "recommendations": [...]
  },
  "reflectedAt": "2024-01-15T11:00:00Z"
}
```

### 7. Get User Patterns

**GET** `/agent/patterns/{userId}`

Analyze patterns across multiple goal executions for a user.

**Response:**
```json
{
  "userId": "user-123",
  "analysis": {
    "commonFailures": [...],
    "successfulPatterns": [...],
    "userPreferences": [...],
    "recommendations": [...]
  },
  "analyzedAt": "2024-01-15T12:00:00Z"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Goal is required"
}
```

### 500 Internal Server Error
```json
{
  "error": "LLM generation failed: Model is loading",
  "stack": "..."
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `HOST` | Server host | `0.0.0.0` |
| `NODE_ENV` | Environment mode | `development` |
| `HF_API_KEY` | Hugging Face API key | Required |
| `HUGGINGFACE_API_KEY` | Alternative name for HF_API_KEY | Required |
| `HF_MODEL` | Hugging Face model name | `meta-llama/Meta-Llama-3-8B-Instruct` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/agentic_ai` |
| `N8N_WEBHOOK_URL` | n8n webhook URL | `http://localhost:5678/webhook/agent` |
| `N8N_WEBHOOK_BASE_URL` | Alternative name for N8N_WEBHOOK_URL | Same as above |

## Development

### Code Structure

- **Async/Await**: All database and HTTP operations use async/await
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Logging**: Structured logging throughout the application
- **Type Hints**: Full type hints for better code quality

### Testing API Endpoints

You can test the API using curl, Postman, or the frontend application.

**Example with curl:**
```bash
# Health check
curl http://localhost:5000/health

# Execute agent
curl -X POST http://localhost:5000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Learn React by building a todo app",
    "userId": "user-123"
  }'
```

**Example with Python:**
```python
import requests

response = requests.post(
    'http://localhost:5000/api/agent/execute',
    json={
        'goal': 'Learn React by building a todo app',
        'userId': 'user-123'
    }
)
print(response.json())
```

## Migration Notes

This backend is a direct migration from Node.js + Express to Python + FastAPI:

- ✅ All API endpoints match exactly
- ✅ Request/response formats are identical
- ✅ Same environment variable names
- ✅ Same MongoDB schema
- ✅ Same n8n webhook integration
- ✅ Same error handling behavior

The frontend should work without any modifications.

## Troubleshooting

### MongoDB Connection Issues

If MongoDB connection fails:
1. Ensure MongoDB is running
2. Check `MONGODB_URI` in `.env`
3. Verify network connectivity

### Hugging Face API Errors

If LLM calls fail:
1. Verify `HF_API_KEY` is set correctly
2. Check API quota/limits
3. Ensure model name is correct

### n8n Webhook Errors

If n8n webhooks fail:
1. Ensure n8n is running
2. Verify webhook URL is correct
3. Check that workflow is activated in n8n
4. See n8n logs for details

## License

Same as the main project.
