"""Planner agent for converting goals into structured plans."""
from typing import Dict, Any, List
from datetime import datetime
from app.services.huggingface import huggingface_service
from app.agents.memory import memory_manager
import logging

logger = logging.getLogger(__name__)


class Planner:
    """Planner agent that converts user goals into structured task plans."""
    
    async def create_plan(
        self,
        goal: str,
        user_id: str,
        goal_id: str
    ) -> Dict[str, Any]:
        """
        Convert user goal into structured plan.
        
        Args:
            goal: User's goal description
            user_id: User identifier
            goal_id: Goal identifier
            
        Returns:
            Structured plan dictionary
        """
        # Retrieve contextual memories
        memories = await memory_manager.get_contextual_memories(user_id, goal_id, goal)
        
        # Build planner prompt
        planner_prompt = self._build_planner_prompt(goal, memories)
        
        # Get LLM response
        response = await huggingface_service.generate_json(planner_prompt, {
            "goal": "string",
            "subGoals": "array of {id: string, title: string, description: string, priority: number}",
            "tasks": "array of {id: string, subGoalId: string, title: string, description: string, dependencies: array, estimatedTime: string, tool: string}",
            "timeline": "string",
            "successCriteria": "array of strings"
        })
        
        # Store plan in long-term memory
        await memory_manager.store_long_term(user_id, goal_id, {
            "type": "plan",
            "goal": goal,
            "plan": response
        })
        
        return {
            "goalId": goal_id,
            "goal": goal,
            "plan": response,
            "createdAt": datetime.utcnow().isoformat() + "Z"
        }
    
    async def replan(
        self,
        goal_id: str,
        completed_tasks: List[Dict[str, Any]],
        failed_tasks: List[Dict[str, Any]],
        current_state: Dict[str, Any],
        user_id: str = "default-user"
    ) -> Dict[str, Any]:
        """
        Re-plan based on current state and failures.
        
        Args:
            goal_id: Goal identifier
            completed_tasks: Completed tasks
            failed_tasks: Failed tasks
            current_state: Current execution state
            user_id: User identifier
            
        Returns:
            Updated plan dictionary
        """
        memories = await memory_manager.get_memories(user_id, goal_id)
        original_plan = next((m for m in memories if m.get("content", {}).get("type") == "plan"), None)
        
        replan_prompt = self._build_replan_prompt(
            original_plan.get("content", {}).get("goal", "Unknown goal") if original_plan else "Unknown goal",
            completed_tasks,
            failed_tasks,
            current_state,
            memories
        )
        
        response = await huggingface_service.generate_json(replan_prompt, {
            "reason": "string",
            "updatedTasks": "array of {id: string, title: string, description: string, changes: string}",
            "newTasks": "array of {id: string, title: string, description: string}",
            "removedTasks": "array of strings",
            "adjustments": "string"
        })
        
        return {
            "goalId": goal_id,
            "replan": response,
            "replannedAt": datetime.utcnow().isoformat() + "Z"
        }
    
    def _build_planner_prompt(self, goal: str, memories: Dict[str, Any]) -> str:
        """Build planner prompt."""
        context = ""
        
        long_term = memories.get("longTerm", [])
        if len(long_term) > 0:
            past_goals = [
                m.get("content", {}).get("goal", "N/A")
                for m in long_term[:2]
            ]
            context += "\n\nPast goals: " + ", ".join(past_goals)
        
        return f"""Break down this goal into a plan.

Goal: "{goal}"{context}

Return ONLY valid JSON (no other text before or after):
{{
  "goal": "goal summary",
  "subGoals": [{{id, title, description, priority (1-10)}}],
  "tasks": [{{id, subGoalId, title, description, dependencies (array of task ids), estimatedTime, tool}}],
  "timeline": "estimated total time",
  "successCriteria": ["criterion1", "criterion2"]
}}

Constraints:
- Max 5 sub-goals
- Max 8 tasks total
- Keep descriptions short (one sentence)
- Be realistic with timelines"""
    
    def _build_replan_prompt(
        self,
        goal: str,
        completed_tasks: List[Dict[str, Any]],
        failed_tasks: List[Dict[str, Any]],
        current_state: Dict[str, Any],
        memories: List[Dict[str, Any]]
    ) -> str:
        """Build replan prompt."""
        import json
        
        past_experiences = "\n".join([
            f"- {m.get('content', {}).get('task', 'N/A')}: {m.get('outcome', 'N/A')}"
            for m in memories[:10]
        ])
        
        return f"""You are an expert planning AI. The current plan needs adjustment.

Original Goal: "{goal}"

Completed Tasks:
{json.dumps(completed_tasks, indent=2)}

Failed Tasks:
{json.dumps(failed_tasks, indent=2)}

Current State:
{json.dumps(current_state, indent=2)}

Past Experiences:
{past_experiences}

Analyze what went wrong and create an updated plan:
1. Identify why tasks failed
2. Adjust remaining tasks
3. Add new tasks if needed
4. Remove obsolete tasks
5. Update dependencies

Respond with a structured JSON replan."""
    
    def prioritize_tasks(self, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Prioritize tasks.
        
        Args:
            tasks: List of task dictionaries
            
        Returns:
            Sorted list of tasks
        """
        def sort_key(task):
            priority = task.get("priority", 0)
            dependencies = task.get("dependencies", [])
            # Higher priority first, then tasks with no dependencies
            return (-priority, len(dependencies))
        
        return sorted(tasks, key=sort_key)


# Singleton instance
planner = Planner()
