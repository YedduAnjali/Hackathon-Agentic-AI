"""n8n webhook service for task execution."""
import httpx
import logging
from typing import Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)


class N8nService:
    """Service for interacting with n8n workflows via webhooks."""
    
    def __init__(self):
        self.webhook_url = settings.N8N_WEBHOOK_BASE_URL or settings.N8N_WEBHOOK_URL
        self.error_logged = False  # Track if we've already logged the setup error
    
    async def trigger_workflow(
        self,
        workflow_type: str,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Trigger an n8n workflow via webhook.
        
        Args:
            workflow_type: Type of workflow to trigger
            payload: Data to send to workflow
            
        Returns:
            Execution result dictionary
        """
        try:
            from datetime import datetime
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.webhook_url,
                    json={
                        "workflowType": workflow_type,
                        **payload,
                        "timestamp": datetime.utcnow().isoformat() + "Z"
                    },
                    headers={
                        "Content-Type": "application/json"
                    }
                )
                response.raise_for_status()
                
                return {
                    "success": True,
                    "data": response.json() if response.content else {},
                    "status": response.status_code
                }
        except httpx.HTTPStatusError as e:
            status = e.response.status_code
            error_data = e.response.json() if e.response.content else {}
            
            # Handle 404 - workflow not activated (most common issue)
            error_message = error_data.get("message", "") if isinstance(error_data, dict) else str(error_data)
            if status == 404 and "not registered" in error_message.lower():
                if not self.error_logged:
                    logger.warning("\n⚠️  n8n Workflow Not Activated")
                    logger.warning("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
                    logger.warning("The n8n workflow needs to be activated to receive webhook requests.")
                    logger.warning("\nTo fix this:")
                    logger.warning("1. Open n8n UI: http://localhost:5678")
                    logger.warning("2. Import the workflow: n8n/workflows/agent-task-executor.json")
                    logger.warning("3. Click the 'Active' toggle in the top-right to activate it")
                    logger.warning("4. Ensure the webhook path matches: /webhook/agent")
                    logger.warning("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
                    self.error_logged = True
            else:
                # Log other errors normally
                logger.error(f"n8n Workflow Error: status={status}, message={e}, data={error_data}")
            
            return {
                "success": False,
                "error": str(e),
                "status": status,
                "errorData": error_data,
                "hint": self._get_error_hint(status, error_data)
            }
        except Exception as e:
            logger.error(f"n8n workflow error: {e}")
            return {
                "success": False,
                "error": str(e),
                "status": 500,
                "hint": "Cannot connect to n8n - ensure it is running"
            }
    
    def _get_error_hint(self, status: int, error_data: Dict[str, Any]) -> str:
        """Get user-friendly error hint."""
        if status == 404:
            return "Ensure n8n webhook is activated at http://localhost:5678"
        elif status == 500:
            return "n8n encountered an internal error - check workflow configuration"
        elif status == 503:
            return "n8n service is not running - start it with: n8n start"
        elif status == 502:
            return "n8n gateway error - ensure n8n is fully started"
        else:
            return "Check n8n workflow configuration and logs"
    
    async def execute_task(self, task_name: str, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a specific task via n8n.
        
        Args:
            task_name: Name of the task
            task_data: Task parameters
            
        Returns:
            Execution result
        """
        return await self.trigger_workflow("task-executor", {
            "task": task_name,
            "data": task_data
        })
    
    async def create_study_plan(self, study_params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a study plan via n8n.
        
        Args:
            study_params: Study plan parameters
            
        Returns:
            Study plan result
        """
        return await self.trigger_workflow("study-plan", study_params)
    
    async def send_notification(self, notification: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send notification via n8n.
        
        Args:
            notification: Notification data
            
        Returns:
            Notification result
        """
        return await self.trigger_workflow("notification", notification)
    
    async def schedule_task(self, schedule_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Schedule a task via n8n.
        
        Args:
            schedule_data: Schedule parameters
            
        Returns:
            Schedule result
        """
        return await self.trigger_workflow("scheduler", schedule_data)


# Singleton instance
n8n_service = N8nService()
