"""Memory management for storing and retrieving agent memories."""
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.core.database import Database
import logging

logger = logging.getLogger(__name__)


class MemoryManager:
    """Manages short-term, long-term, and episodic memories."""
    
    async def _ensure_connected(self):
        """Ensure database is connected."""
        if Database.client is None:
            await Database.connect()
    
    async def store_short_term(
        self,
        user_id: str,
        goal_id: str,
        content: Dict[str, Any],
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Store short-term memory (current task context).
        
        Args:
            user_id: User identifier
            goal_id: Goal identifier
            content: Memory content
            context: Optional context string
            
        Returns:
            Created memory document
        """
        await self._ensure_connected()
        
        # Ensure userId and goalId are not null/undefined
        valid_user_id = user_id if user_id is not None else "default-user"
        valid_goal_id = goal_id if goal_id is not None else "default-goal"
        
        memory_doc = {
            "userId": valid_user_id,
            "goalId": valid_goal_id,
            "memoryType": "short-term",
            "content": content,
            "context": context,
            "timestamp": datetime.utcnow()
        }
        
        result = await Database.database.memories.insert_one(memory_doc)
        memory_doc["_id"] = str(result.inserted_id)
        return memory_doc
    
    async def store_long_term(
        self,
        user_id: str,
        goal_id: str,
        content: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Store long-term memory (user goals, preferences).
        
        Args:
            user_id: User identifier
            goal_id: Goal identifier
            content: Memory content
            metadata: Optional metadata
            
        Returns:
            Created memory document
        """
        await self._ensure_connected()
        
        # Ensure userId and goalId are not null/undefined
        valid_user_id = user_id if user_id is not None else "default-user"
        valid_goal_id = goal_id if goal_id is not None else "default-goal"
        
        memory_doc = {
            "userId": valid_user_id,
            "goalId": valid_goal_id,
            "memoryType": "long-term",
            "content": content,
            "metadata": metadata or {},
            "timestamp": datetime.utcnow()
        }
        
        result = await Database.database.memories.insert_one(memory_doc)
        memory_doc["_id"] = str(result.inserted_id)
        return memory_doc
    
    async def store_episodic(
        self,
        user_id: str,
        goal_id: str,
        task: str,
        action: str,
        result: Dict[str, Any],
        outcome: str
    ) -> Dict[str, Any]:
        """
        Store episodic memory (task → action → result).
        
        Args:
            user_id: User identifier
            goal_id: Goal identifier
            task: Task description
            action: Action taken
            result: Execution result
            outcome: Outcome (success/failure)
            
        Returns:
            Created memory document
        """
        await self._ensure_connected()
        
        # Ensure userId and goalId are not null/undefined
        valid_user_id = user_id if user_id is not None else "default-user"
        valid_goal_id = goal_id if goal_id is not None else "default-goal"
        
        memory_doc = {
            "userId": valid_user_id,
            "goalId": valid_goal_id,
            "memoryType": "episodic",
            "content": {
                "task": task,
                "action": action,
                "result": result
            },
            "outcome": outcome,
            "timestamp": datetime.utcnow()
        }
        
        result = await Database.database.memories.insert_one(memory_doc)
        memory_doc["_id"] = str(result.inserted_id)
        return memory_doc
    
    async def get_memories(
        self,
        user_id: Optional[str],
        goal_id: Optional[str],
        memory_type: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Retrieve memories by type.
        
        Args:
            user_id: User identifier (can be None)
            goal_id: Goal identifier (can be None)
            memory_type: Type of memory to filter (optional)
            limit: Maximum number of memories to return
            
        Returns:
            List of memory documents
        """
        await self._ensure_connected()
        
        query = {}
        if user_id is not None:
            query["userId"] = user_id
        if goal_id is not None:
            query["goalId"] = goal_id
        if memory_type:
            query["memoryType"] = memory_type
        
        cursor = Database.database.memories.find(query).sort("timestamp", -1).limit(limit)
        memories = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string
        for memory in memories:
            memory["_id"] = str(memory["_id"])
            if "timestamp" in memory and isinstance(memory["timestamp"], datetime):
                memory["timestamp"] = memory["timestamp"].isoformat() + "Z"
        
        return memories
    
    async def get_contextual_memories(
        self,
        user_id: str,
        goal_id: str,
        current_task: str
    ) -> Dict[str, Any]:
        """
        Retrieve relevant memories for context.
        
        Args:
            user_id: User identifier
            goal_id: Goal identifier
            current_task: Current task description
            
        Returns:
            Dictionary with shortTerm, episodic, longTerm, and context
        """
        short_term = await self.get_memories(user_id, goal_id, "short-term", 10)
        episodic = await self.get_memories(user_id, goal_id, "episodic", 20)
        long_term = await self.get_memories(user_id, goal_id, "long-term", 5)
        
        return {
            "shortTerm": short_term,
            "episodic": episodic,
            "longTerm": long_term,
            "context": {
                "currentTask": current_task,
                "retrievedAt": datetime.utcnow().isoformat() + "Z"
            }
        }
    
    async def update_memory_outcome(
        self,
        memory_id: str,
        outcome: str
    ) -> Optional[Dict[str, Any]]:
        """
        Update memory outcome after task completion.
        
        Args:
            memory_id: Memory document ID
            outcome: New outcome value
            
        Returns:
            Updated memory document or None
        """
        await self._ensure_connected()
        
        from bson import ObjectId
        try:
            result = await Database.database.memories.find_one_and_update(
                {"_id": ObjectId(memory_id)},
                {"$set": {"outcome": outcome, "updatedAt": datetime.utcnow()}},
                return_document=True
            )
            if result:
                result["_id"] = str(result["_id"])
                if "timestamp" in result and isinstance(result["timestamp"], datetime):
                    result["timestamp"] = result["timestamp"].isoformat() + "Z"
            return result
        except Exception as e:
            logger.error(f"Error updating memory outcome: {e}")
            return None
    
    async def clear_short_term(self, user_id: str, goal_id: str) -> int:
        """
        Clear short-term memories (cleanup).
        
        Args:
            user_id: User identifier
            goal_id: Goal identifier
            
        Returns:
            Number of deleted memories
        """
        await self._ensure_connected()
        
        result = await Database.database.memories.delete_many({
            "userId": user_id,
            "goalId": goal_id,
            "memoryType": "short-term"
        })
        return result.deleted_count


# Singleton instance
memory_manager = MemoryManager()
