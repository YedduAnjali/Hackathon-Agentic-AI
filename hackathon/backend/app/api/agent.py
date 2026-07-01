"""Agent API routes."""
from fastapi import APIRouter
from typing import Optional
import uuid
from datetime import datetime
from fastapi.responses import JSONResponse
from app.agents.planner import planner
from app.agents.executor import executor
from app.agents.reflector import reflector
from app.agents.memory import memory_manager
from app.models.schemas import (
    ExecuteRequest,
    PlanRequest,
    TaskExecuteRequest,
    ReflectRequest
)
from app.core.config import settings

router = APIRouter()


@router.post("/agent/execute")
async def execute_agent(request: ExecuteRequest):
    """
    Agent execution loop endpoint.
    Executes full cycle: planning, execution, reflection, and re-planning.
    """
    try:
        if not request.goal:
            return JSONResponse(
                status_code=400,
                content={"error": "Goal is required"}
            )
        
        goal_id = str(uuid.uuid4())
        execution_log = []
        
        # 1. Goal Understanding & Task Decomposition
        execution_log.append({
            "step": "planning",
            "status": "started",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        })
        plan_result = await planner.create_plan(request.goal, request.userId, goal_id)
        execution_log.append({
            "step": "planning",
            "status": "completed",
            "result": plan_result
        })
        
        # 2. Plan Creation & Task Prioritization
        prioritized_tasks = planner.prioritize_tasks(plan_result["plan"].get("tasks", []))
        
        # 3. Tool Selection & Action Execution
        execution_log.append({
            "step": "execution",
            "status": "started",
            "taskCount": len(prioritized_tasks)
        })
        execution_results = await executor.execute_batch(prioritized_tasks, request.userId, goal_id)
        execution_log.append({
            "step": "execution",
            "status": "completed",
            "results": execution_results
        })
        
        # 4. Result Evaluation
        success_count = sum(1 for r in execution_results if r.get("success"))
        failure_count = len(execution_results) - success_count
        
        # 5. Memory Update (already done in executor)
        
        # 6. Self-Reflection
        execution_log.append({
            "step": "reflection",
            "status": "started"
        })
        reflection = await reflector.reflect(goal_id, execution_results, request.userId)
        execution_log.append({
            "step": "reflection",
            "status": "completed",
            "result": reflection
        })
        
        # 7. Re-planning (if needed)
        replan = None
        if failure_count > 0:
            failed_tasks = [
                prioritized_tasks[i]
                for i, r in enumerate(execution_results)
                if not r.get("success")
            ]
            completed_tasks = [
                prioritized_tasks[i]
                for i, r in enumerate(execution_results)
                if r.get("success")
            ]
            
            execution_log.append({
                "step": "replanning",
                "status": "started"
            })
            replan = await planner.replan(
                goal_id,
                completed_tasks,
                failed_tasks,
                {
                    "successCount": success_count,
                    "failureCount": failure_count,
                    "executionResults": execution_results
                },
                request.userId
            )
            execution_log.append({
                "step": "replanning",
                "status": "completed",
                "result": replan
            })
        
        return {
            "goalId": goal_id,
            "goal": request.goal,
            "plan": plan_result,
            "executionResults": execution_results,
            "reflection": reflection,
            "replan": replan,
            "executionLog": execution_log,
            "summary": {
                "totalTasks": len(prioritized_tasks),
                "successCount": success_count,
                "failureCount": failure_count,
                "successRate": f"{(success_count / len(prioritized_tasks) * 100):.1f}%" if prioritized_tasks else "0%"
            }
        }
    except Exception as error:
        import traceback
        return JSONResponse(
            status_code=500,
            content={
                "error": str(error),
                "stack": traceback.format_exc() if settings.NODE_ENV == "development" else None
            }
        )


@router.post("/agent/plan")
async def get_plan(request: PlanRequest):
    """
    Get plan for a goal (without execution).
    """
    try:
        goal_id = str(uuid.uuid4())
        plan_result = await planner.create_plan(request.goal, request.userId, goal_id)
        
        return {
            "goalId": goal_id,
            "plan": plan_result
        }
    except Exception as error:
        return JSONResponse(
            status_code=500,
            content={"error": str(error)}
        )


@router.post("/agent/task/execute")
async def execute_task(request: TaskExecuteRequest):
    """
    Execute specific task.
    """
    try:
        if not request.task:
            return JSONResponse(
                status_code=400,
                content={"error": "Task is required"}
            )
        
        result = await executor.execute_task(request.task, request.userId, request.goalId)
        return result
    except Exception as error:
        return JSONResponse(
            status_code=500,
            content={"error": str(error)}
        )


@router.get("/agent/memories/{goal_id}")
async def get_memories(
    goal_id: str,
    type: Optional[str] = None,
    limit: int = 50
):
    """
    Get memories for a goal.
    """
    try:
        memories = await memory_manager.get_memories(None, goal_id, type, limit)
        
        return {
            "goalId": goal_id,
            "memories": memories,
            "count": len(memories)
        }
    except Exception as error:
        return JSONResponse(
            status_code=500,
            content={"error": str(error)}
        )


@router.post("/agent/reflect/{goal_id}")
async def get_reflection(goal_id: str, request: ReflectRequest):
    """
    Get reflection for a goal.
    Note: This endpoint uses POST method to match the API examples, even though
    it's defined as GET in the original routes (which was likely a bug).
    """
    try:
        if not request.executionResults:
            return JSONResponse(
                status_code=400,
                content={"error": "Execution results are required"}
            )
        
        reflection = await reflector.reflect(goal_id, request.executionResults, request.userId)
        return reflection
    except Exception as error:
        return JSONResponse(
            status_code=500,
            content={"error": str(error)}
        )


@router.get("/agent/patterns/{user_id}")
async def get_patterns(user_id: str):
    """
    Get user patterns.
    """
    try:
        analysis = await reflector.analyze_patterns(user_id)
        return analysis
    except Exception as error:
        return JSONResponse(
            status_code=500,
            content={"error": str(error)}
        )
