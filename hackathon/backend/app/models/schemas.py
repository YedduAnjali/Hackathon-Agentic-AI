"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime


# Request Schemas
class ExecuteRequest(BaseModel):
    """Request schema for /agent/execute endpoint."""
    goal: str
    userId: Optional[str] = "default-user"


class PlanRequest(BaseModel):
    """Request schema for /agent/plan endpoint."""
    goal: str
    userId: Optional[str] = "default-user"


class TaskExecuteRequest(BaseModel):
    """Request schema for /agent/task/execute endpoint."""
    task: Dict[str, Any]
    userId: Optional[str] = "default-user"
    goalId: Optional[str] = None


class ReflectRequest(BaseModel):
    """Request schema for /agent/reflect endpoint."""
    executionResults: List[Dict[str, Any]]
    userId: Optional[str] = "default-user"


# Response Schemas
class SubGoal(BaseModel):
    """Sub-goal schema."""
    id: str
    title: str
    description: str
    priority: int


class Task(BaseModel):
    """Task schema."""
    id: str
    subGoalId: str
    title: str
    description: str
    dependencies: List[str] = []
    estimatedTime: str
    tool: str
    status: str = "pending"  # pending, executed, failed
    scheduledDate: Optional[str] = None
    executedAt: Optional[str] = None
    checkboxState: bool = False


class Plan(BaseModel):
    """Plan schema."""
    goal: str
    subGoals: List[SubGoal]
    tasks: List[Task]
    timeline: str
    successCriteria: List[str]
    startDate: Optional[str] = None
    endDate: Optional[str] = None


class PlanResponse(BaseModel):
    """Response schema for plan creation."""
    goalId: str
    goal: str
    plan: Plan
    createdAt: str
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    status: str = "pending"  # pending, active, completed


class ExecutionResult(BaseModel):
    """Execution result schema."""
    taskId: str
    success: bool
    result: Optional[Dict[str, Any]] = None
    tool: Optional[str] = None
    error: Optional[str] = None
    executedAt: str
    skipped: Optional[bool] = False


class ReflectionInsight(BaseModel):
    """Reflection insight schema."""
    overallSuccess: bool
    successRate: float
    keyInsights: List[str]
    failures: List[Dict[str, Any]]
    improvements: List[str]
    recommendations: List[str]


class ReflectionResponse(BaseModel):
    """Response schema for reflection."""
    goalId: str
    reflection: ReflectionInsight
    reflectedAt: str


class ExecuteResponse(BaseModel):
    """Response schema for /agent/execute endpoint."""
    goalId: str
    goal: str
    plan: Dict[str, Any]
    executionResults: List[Dict[str, Any]]
    reflection: Optional[Dict[str, Any]] = None
    replan: Optional[Dict[str, Any]] = None
    executionLog: List[Dict[str, Any]]
    summary: Dict[str, Any]
    status: str = "active"  # active, completed, failed
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    progress: float = 0.0


class MemoryResponse(BaseModel):
    """Response schema for memory retrieval."""
    goalId: str
    memories: List[Dict[str, Any]]
    count: int


class PatternAnalysis(BaseModel):
    """Pattern analysis schema."""
    commonFailures: List[str]
    successfulPatterns: List[str]
    userPreferences: List[str]
    recommendations: List[str]


class PatternResponse(BaseModel):
    """Response schema for pattern analysis."""
    userId: str
    analysis: PatternAnalysis
    analyzedAt: str


class HealthResponse(BaseModel):
    """Response schema for health check."""
    status: str
    timestamp: str


class ErrorResponse(BaseModel):
    """Error response schema."""
    error: str
    stack: Optional[str] = None
