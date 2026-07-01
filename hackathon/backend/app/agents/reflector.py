"""Reflector agent for analyzing execution results and improving plans."""
from typing import Dict, Any, List
from datetime import datetime
from app.services.huggingface import huggingface_service
from app.agents.memory import memory_manager
import logging
import json

logger = logging.getLogger(__name__)


class Reflector:
    """Reflector agent that analyzes execution results and generates improvements."""
    
    async def reflect(
        self,
        goal_id: str,
        execution_results: List[Dict[str, Any]],
        user_id: str = "default-user"
    ) -> Dict[str, Any]:
        """
        Reflect on execution results and improve future plans.
        
        Args:
            goal_id: Goal identifier
            execution_results: Results from task execution
            user_id: User identifier
            
        Returns:
            Reflection insights dictionary
        """
        # Get relevant memories
        memories = await memory_manager.get_memories(user_id, goal_id)
        episodic_memories = [m for m in memories if m.get("memoryType") == "episodic"]
        
        # Build reflection prompt
        reflection_prompt = self._build_reflection_prompt(execution_results, episodic_memories)
        
        # Get LLM reflection
        reflection = await huggingface_service.generate_json(reflection_prompt, {
            "overallSuccess": "boolean",
            "successRate": "number",
            "keyInsights": "array of strings",
            "failures": "array of {task: string, reason: string, suggestion: string}",
            "improvements": "array of strings",
            "recommendations": "array of strings"
        })
        
        # Store reflection in long-term memory
        await memory_manager.store_long_term(user_id, goal_id, {
            "type": "reflection",
            "reflection": reflection,
            "executionResults": execution_results
        })
        
        return {
            "goalId": goal_id,
            "reflection": reflection,
            "reflectedAt": datetime.utcnow().isoformat() + "Z"
        }
    
    async def analyze_patterns(self, user_id: str) -> Dict[str, Any]:
        """
        Analyze patterns across multiple goal executions.
        
        Args:
            user_id: User identifier
            
        Returns:
            Pattern analysis dictionary
        """
        all_memories = await memory_manager.get_memories(user_id, None)
        episodic_memories = [m for m in all_memories if m.get("memoryType") == "episodic"]
        
        analysis_prompt = self._build_pattern_analysis_prompt(episodic_memories)
        
        analysis = await huggingface_service.generate_json(analysis_prompt, {
            "commonFailures": "array of strings",
            "successfulPatterns": "array of strings",
            "userPreferences": "array of strings",
            "recommendations": "array of strings"
        })
        
        return {
            "userId": user_id,
            "analysis": analysis,
            "analyzedAt": datetime.utcnow().isoformat() + "Z"
        }
    
    def _build_reflection_prompt(
        self,
        execution_results: List[Dict[str, Any]],
        past_memories: List[Dict[str, Any]]
    ) -> str:
        """Build reflection prompt."""
        success_count = sum(1 for r in execution_results if r.get("success"))
        failure_count = len(execution_results) - success_count
        success_rate = (success_count / len(execution_results) * 100) if execution_results else 0
        
        past_experiences = "\n".join([
            f"- {m.get('content', {}).get('task', 'N/A')}: {m.get('outcome', 'N/A')}"
            for m in past_memories[:10]
        ])
        
        return f"""You are a reflective AI. Analyze the execution results and provide insights.

Execution Summary:
- Total Tasks: {len(execution_results)}
- Successful: {success_count}
- Failed: {failure_count}
- Success Rate: {success_rate:.1f}%

Execution Results:
{json.dumps(execution_results, indent=2)}

Past Experiences:
{past_experiences}

Analyze and provide:
1. Overall success assessment
2. Key insights from execution
3. Reasons for failures (if any)
4. Suggestions for improvement
5. Recommendations for future similar goals

Respond with structured JSON."""
    
    def _build_pattern_analysis_prompt(self, episodic_memories: List[Dict[str, Any]]) -> str:
        """Build pattern analysis prompt."""
        success_memories = [m for m in episodic_memories if m.get("outcome") == "success"]
        failure_memories = [m for m in episodic_memories if m.get("outcome") == "failure"]
        
        all_experiences = "\n".join([
            f"- Task: {m.get('content', {}).get('task', 'N/A')}, Action: {m.get('content', {}).get('action', 'N/A')}, Outcome: {m.get('outcome', 'N/A')}"
            for m in episodic_memories
        ])
        
        return f"""You are an AI pattern analyzer. Analyze user behavior and outcomes across multiple goal executions.

Total Experiences: {len(episodic_memories)}
Successful: {len(success_memories)}
Failed: {len(failure_memories)}

All Experiences:
{all_experiences}

Identify:
1. Common failure patterns
2. Successful execution patterns
3. User preferences (from successful outcomes)
4. Recommendations for future goal planning

Respond with structured JSON."""
    
    async def generate_improvements(
        self,
        goal_id: str,
        failures: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate improvement suggestions.
        
        Args:
            goal_id: Goal identifier
            failures: List of failure dictionaries
            
        Returns:
            Improvement suggestions dictionary
        """
        memories = await memory_manager.get_memories(None, goal_id)
        
        improvement_prompt = f"""Based on these failures, suggest improvements:

Failures:
{json.dumps(failures, indent=2)}

Past Context:
{chr(10).join([json.dumps(m.get('content', {})) for m in memories[:5]])}

Provide specific, actionable improvement suggestions."""
        
        improvements = await huggingface_service.generate(improvement_prompt)
        
        return {
            "goalId": goal_id,
            "improvements": improvements.get("text", ""),
            "generatedAt": datetime.utcnow().isoformat() + "Z"
        }


# Singleton instance
reflector = Reflector()
