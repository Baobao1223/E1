"""
Database Optimization Module for 3D Tech Store
Handles MongoDB indexing and query optimization
"""

import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import List, Dict, Any
import time
import asyncio

logger = logging.getLogger(__name__)

class DatabaseOptimizer:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        
    async def create_indexes(self) -> Dict[str, Any]:
        """Create optimal indexes for all collections"""
        results = {}
        
        try:
            # Products collection indexes
            products_indexes = [
                # Single field indexes
                ("name", 1),  # Text search on product name
                ("category", 1),  # Filter by category
                ("product_type", 1),  # Filter by product type
                ("price", 1),  # Sort by price
                ("featured", 1),  # Filter featured products
                ("created_at", -1),  # Sort by creation date (newest first)
                ("stock", 1),  # Filter by stock availability
                
                # Compound indexes for common query patterns
                [("category", 1), ("price", 1)],  # Category + price filtering
                [("category", 1), ("featured", 1)],  # Category + featured
                [("product_type", 1), ("price", 1)],  # Product type + price
                [("featured", 1), ("created_at", -1)],  # Featured + newest
                [("category", 1), ("product_type", 1), ("price", 1)],  # Multi-filter
                
                # Text index for search functionality
                [("name", "text"), ("description", "text"), ("category", "text")],
            ]
            
            products_result = await self._create_collection_indexes("products", products_indexes)
            results["products"] = products_result
            
            # Users collection indexes
            users_indexes = [
                ("email", 1),  # Unique email lookup
                ("created_at", -1),  # User registration date
                ("name", 1),  # User name search
            ]
            
            users_result = await self._create_collection_indexes("users", users_indexes)
            results["users"] = users_result
            
            # Carts collection indexes
            carts_indexes = [
                ("session_id", 1),  # Unique session lookup
                ("user_id", 1),  # User cart lookup
                ("updated_at", -1),  # Recent carts
                [("session_id", 1), ("updated_at", -1)],  # Session + recency
            ]
            
            carts_result = await self._create_collection_indexes("carts", carts_indexes)
            results["carts"] = carts_result
            
            # Reviews collection indexes
            reviews_indexes = [
                ("product_id", 1),  # Reviews for specific product
                ("user_id", 1),  # Reviews by specific user
                ("rating", -1),  # Sort by rating
                ("created_at", -1),  # Sort by date
                [("product_id", 1), ("rating", -1)],  # Product reviews by rating
                [("product_id", 1), ("created_at", -1)],  # Product reviews by date
            ]
            
            reviews_result = await self._create_collection_indexes("reviews", reviews_indexes)
            results["reviews"] = reviews_result
            
            # Status checks collection indexes
            status_indexes = [
                ("timestamp", -1),  # Recent status checks
                ("client_name", 1),  # Status by client
            ]
            
            status_result = await self._create_collection_indexes("status_checks", status_indexes)
            results["status_checks"] = status_result
            
            logger.info("All database indexes created successfully")
            return {"success": True, "results": results}
            
        except Exception as e:
            logger.error(f"Error creating indexes: {e}")
            return {"success": False, "error": str(e)}
    
    async def _create_collection_indexes(self, collection_name: str, indexes: List) -> Dict[str, Any]:
        """Create indexes for a specific collection"""
        collection = self.db[collection_name]
        created_indexes = []
        skipped_indexes = []
        
        for index_spec in indexes:
            try:
                if isinstance(index_spec, tuple):
                    # Single field index
                    index_name = await collection.create_index([index_spec])
                    created_indexes.append(f"{index_spec[0]}_{index_spec[1]}")
                    
                elif isinstance(index_spec, list) and len(index_spec) == 2 and isinstance(index_spec[0], tuple):
                    # Compound index
                    index_name = await collection.create_index(index_spec)
                    created_indexes.append("_".join([f"{field}_{direction}" for field, direction in index_spec]))
                    
                elif isinstance(index_spec, list) and any(isinstance(item, tuple) and len(item) == 2 and item[1] == "text" for item in index_spec):
                    # Text index
                    index_name = await collection.create_index(index_spec)
                    created_indexes.append("text_search_index")
                    
                elif isinstance(index_spec, list):
                    # Multi-field compound index
                    index_name = await collection.create_index(index_spec)
                    created_indexes.append("_".join([f"{field}_{direction}" for field, direction in index_spec]))
                    
            except Exception as e:
                if "already exists" in str(e).lower():
                    skipped_indexes.append(str(index_spec))
                else:
                    logger.error(f"Error creating index {index_spec} on {collection_name}: {e}")
        
        return {
            "collection": collection_name,
            "created": created_indexes,
            "skipped": skipped_indexes
        }
    
    async def analyze_query_performance(self, collection_name: str, query: Dict, limit: int = 100) -> Dict[str, Any]:
        """Analyze query performance and suggest optimizations"""
        collection = self.db[collection_name]
        
        try:
            # Execute query with explain
            start_time = time.time()
            cursor = collection.find(query).limit(limit)
            
            # Get execution stats
            explain_result = await cursor.explain()
            
            # Execute actual query to measure time
            results = await cursor.to_list(limit)
            execution_time = time.time() - start_time
            
            analysis = {
                "collection": collection_name,
                "query": query,
                "execution_time_ms": round(execution_time * 1000, 2),
                "documents_examined": explain_result.get("executionStats", {}).get("totalDocsExamined", 0),
                "documents_returned": len(results),
                "index_used": explain_result.get("executionStats", {}).get("winningPlan", {}).get("inputStage", {}).get("indexName"),
                "stage": explain_result.get("executionStats", {}).get("winningPlan", {}).get("stage"),
            }
            
            # Performance recommendations
            recommendations = []
            
            if analysis["documents_examined"] > analysis["documents_returned"] * 10:
                recommendations.append("Consider adding an index for this query pattern")
            
            if analysis["execution_time_ms"] > 100:
                recommendations.append("Query is slow - consider optimization")
            
            if not analysis["index_used"]:
                recommendations.append("Query is not using any index - collection scan detected")
            
            analysis["recommendations"] = recommendations
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing query performance: {e}")
            return {"error": str(e)}
    
    async def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics for all collections"""
        stats = {}
        
        collections = ["products", "users", "carts", "reviews", "status_checks"]
        
        for collection_name in collections:
            try:
                collection = self.db[collection_name]
                
                # Get basic stats
                count = await collection.count_documents({})
                indexes = await collection.list_indexes().to_list(None)
                
                # Get storage stats
                stats_result = await self.db.command("collStats", collection_name)
                
                stats[collection_name] = {
                    "document_count": count,
                    "indexes": [index.get("name") for index in indexes],
                    "index_count": len(indexes),
                    "storage_size": stats_result.get("storageSize", 0),
                    "total_index_size": stats_result.get("totalIndexSize", 0),
                    "avg_obj_size": stats_result.get("avgObjSize", 0)
                }
                
            except Exception as e:
                stats[collection_name] = {"error": str(e)}
        
        return stats
    
    async def optimize_collection(self, collection_name: str) -> Dict[str, Any]:
        """Optimize a specific collection"""
        try:
            collection = self.db[collection_name]
            
            # Compact collection (MongoDB 4.4+)
            try:
                result = await self.db.command("compact", collection_name)
                return {"success": True, "compaction": result}
            except Exception as e:
                logger.warning(f"Compaction not available or failed: {e}")
                return {"success": True, "compaction": "not_available"}
                
        except Exception as e:
            logger.error(f"Error optimizing collection {collection_name}: {e}")
            return {"success": False, "error": str(e)}

async def setup_database_optimization(db: AsyncIOMotorDatabase) -> DatabaseOptimizer:
    """Setup database optimization and create indexes"""
    optimizer = DatabaseOptimizer(db)
    
    # Create indexes on startup
    await optimizer.create_indexes()
    
    return optimizer