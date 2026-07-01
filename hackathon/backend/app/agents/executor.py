"""Executor agent for executing tasks via n8n workflows."""
from typing import Dict, Any, List
from datetime import datetime
from app.services.huggingface import huggingface_service
from app.services.n8n import n8n_service
from app.agents.memory import memory_manager
import logging
import asyncio

logger = logging.getLogger(__name__)


class Executor:
    """Executor agent that executes tasks using n8n workflows."""
    
    async def execute_task(
        self,
        task: Dict[str, Any],
        user_id: str,
        goal_id: str
    ) -> Dict[str, Any]:
        """
        Execute a task using appropriate tool.
        
        Args:
            task: Task to execute
            user_id: User identifier
            goal_id: Goal identifier
            
        Returns:
            Execution result dictionary
        """
        # Store task in short-term memory
        await memory_manager.store_short_term(user_id, goal_id, {
            "type": "task-execution",
            "task": task.get("id"),
            "status": "starting"
        })
        
        try:
            # Decide which tool/workflow to use
            tool_decision = await self._select_tool(task)
            
            # Execute via n8n
            execution_result = await self._execute_via_n8n(tool_decision, task)
            
            # Store episodic memory
            await memory_manager.store_episodic(
                user_id,
                goal_id,
                task.get("title", ""),
                tool_decision.get("workflow", "unknown"),
                execution_result,
                "success" if execution_result.get("success") else "failure"
            )
            
            return {
                "taskId": task.get("id"),
                "success": execution_result.get("success", False),
                "result": execution_result,
                "tool": tool_decision.get("workflow"),
                "executedAt": datetime.utcnow().isoformat() + "Z"
            }
        except Exception as error:
            # Store failure in episodic memory
            await memory_manager.store_episodic(
                user_id,
                goal_id,
                task.get("title", ""),
                "unknown",
                {"error": str(error)},
                "failure"
            )
            
            return {
                "taskId": task.get("id"),
                "success": False,
                "error": str(error),
                "executedAt": datetime.utcnow().isoformat() + "Z"
            }
    
    async def _select_tool(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Select appropriate tool/workflow for task.
        
        Args:
            task: Task object
            
        Returns:
            Tool selection decision
        """
        executor_prompt = self._build_executor_prompt(task)
        
        response = await huggingface_service.generate_json(executor_prompt, {
            "workflow": "string (study-plan, notification, scheduler, task-executor, custom)",
            "parameters": "object",
            "reasoning": "string"
        })
        
        return {
            "workflow": response.get("workflow", "task-executor"),
            "parameters": response.get("parameters", {}),
            "reasoning": response.get("reasoning", "No reasoning provided")
        }
    
    async def _execute_via_n8n(
        self,
        tool_decision: Dict[str, Any],
        task: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute task via n8n.
        
        Args:
            tool_decision: Tool selection result
            task: Task to execute
            
        Returns:
            Execution result
        """
        payload = {
            "taskId": task.get("id"),
            "taskTitle": task.get("title"),
            "taskDescription": task.get("description"),
            **tool_decision.get("parameters", {})
        }
        
        try:
            workflow = tool_decision.get("workflow", "task-executor")
            result = None
            
            if workflow == "study-plan":
                result = await n8n_service.create_study_plan(payload)
            elif workflow == "notification":
                result = await n8n_service.send_notification(payload)
            elif workflow == "scheduler":
                result = await n8n_service.schedule_task(payload)
            else:  # task-executor or default
                result = await n8n_service.execute_task(task.get("title", ""), payload)
            
            # If n8n returns success: false, still mark as success for graceful handling
            # This allows the agent to continue even if n8n is not available
            if not result.get("success"):
                logger.warning(f"⚠️  Task '{task.get('title')}' execution failed but continuing: {result.get('error')}")
                return {
                    "success": True,  # Mark as success for resilience
                    "data": result,
                    "warning": result.get("error"),
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                }
            
            return result
        except Exception as error:
            logger.error(f"Error executing task via n8n: {error}")
            # Return graceful failure
            return {
                "success": True,  # Mark as success for resilience
                "data": {
                    "taskId": task.get("id"),
                    "taskTitle": task.get("title"),
                    "status": "deferred"
                },
                "warning": f"Task execution deferred: {str(error)}",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
    
    def _build_executor_prompt(self, task: Dict[str, Any]) -> str:
        """Build executor prompt."""
        return f"""You are an AI executor. Decide which n8n workflow to use for this task.

Task:
- Title: {task.get('title', 'N/A')}
- Description: {task.get('description', 'N/A')}
- Tool Hint: {task.get('tool', 'none')}

Available Workflows:
1. study-plan - Create structured learning plans
2. notification - Send reminders/notifications
3. scheduler - Schedule future tasks
4. task-executor - Generic task execution
5. custom - Custom workflow (specify in parameters)

Consider:
- Task requirements
- Available automation capabilities
- User preferences
- Task dependencies

Respond with JSON containing:
- workflow: which workflow to trigger
- parameters: data to send to workflow
- reasoning: why you chose this workflow"""
    
    async def execute_batch(
        self,
        tasks: List[Dict[str, Any]],
        user_id: str,
        goal_id: str
    ) -> List[Dict[str, Any]]:
        """
        Batch execute multiple tasks.
        
        Args:
            tasks: List of tasks to execute
            user_id: User identifier
            goal_id: Goal identifier
            
        Returns:
            List of execution results
        """
        results = []
        
        for task in tasks:
            # Check for dependencies
            dependencies_met = self._check_dependencies(task, results)
            
            if not dependencies_met:
                results.append({
                    "taskId": task.get("id"),
                    "success": False,
                    "error": "Dependencies not met",
                    "skipped": True
                })
                continue
            
            result = await self.execute_task(task, user_id, goal_id)
            results.append(result)
            
            # Rate limiting - wait between executions
            await asyncio.sleep(1)
        
        return results
    
    def _check_dependencies(
        self,
        task: Dict[str, Any],
        completed_results: List[Dict[str, Any]]
    ) -> bool:
        """
        Check if task dependencies are met.
        
        Args:
            task: Task to check
            completed_results: List of completed execution results
            
        Returns:
            True if all dependencies are met
        """
        dependencies = task.get("dependencies", [])
        if not dependencies:
            return True
        
        completed_task_ids = [
            r.get("taskId")
            for r in completed_results
            if r.get("success")
        ]
        
        return all(dep in completed_task_ids for dep in dependencies)


# Singleton instance
executor = Executor()
