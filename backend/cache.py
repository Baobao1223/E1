"""
Redis Caching Module for 3D Tech Store
Provides caching functionality for API responses and session data
"""

import json
import pickle
from typing import Optional, Any, Dict
import aioredis
import os
import asyncio
from functools import wraps
import hashlib
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CacheManager:
    def __init__(self):
        self.redis: Optional[aioredis.Redis] = None
        self.connected = False
        
    async def connect(self):
        """Connect to Redis"""
        try:
            redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379')
            self.redis = aioredis.from_url(redis_url, decode_responses=True)
            
            # Test connection
            await self.redis.ping()
            self.connected = True
            logger.info("Connected to Redis successfully")
            
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}. Caching disabled.")
            self.connected = False
            self.redis = None
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis:
            await self.redis.close()
            self.connected = False
            logger.info("Disconnected from Redis")
    
    def _generate_key(self, prefix: str, **kwargs) -> str:
        """Generate cache key from parameters"""
        key_data = json.dumps(kwargs, sort_keys=True)
        key_hash = hashlib.md5(key_data.encode()).hexdigest()
        return f"{prefix}:{key_hash}"
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.connected or not self.redis:
            return None
            
        try:
            value = await self.redis.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None
    
    async def set(self, key: str, value: Any, expire: int = 300) -> bool:
        """Set value in cache with expiration (default 5 minutes)"""
        if not self.connected or not self.redis:
            return False
            
        try:
            json_value = json.dumps(value, default=str)
            await self.redis.setex(key, expire, json_value)
            return True
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.connected or not self.redis:
            return False
            
        try:
            await self.redis.delete(key)
            return True
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False
    
    async def clear_pattern(self, pattern: str) -> bool:
        """Clear all keys matching pattern"""
        if not self.connected or not self.redis:
            return False
            
        try:
            keys = await self.redis.keys(pattern)
            if keys:
                await self.redis.delete(*keys)
            return True
        except Exception as e:
            logger.error(f"Cache clear pattern error: {e}")
            return False

# Global cache manager instance
cache_manager = CacheManager()

def cache_response(prefix: str, expire: int = 300):
    """
    Decorator to cache API responses
    Args:
        prefix: Cache key prefix
        expire: Expiration time in seconds (default 5 minutes)
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key from function arguments
            cache_key = cache_manager._generate_key(prefix, args=str(args), kwargs=kwargs)
            
            # Try to get from cache first
            cached_result = await cache_manager.get(cache_key)
            if cached_result is not None:
                logger.info(f"Cache HIT for key: {cache_key}")
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            
            # Cache the result
            await cache_manager.set(cache_key, result, expire)
            logger.info(f"Cache SET for key: {cache_key}")
            
            return result
        return wrapper
    return decorator

async def invalidate_product_cache():
    """Invalidate all product-related cache"""
    await cache_manager.clear_pattern("products:*")
    await cache_manager.clear_pattern("product:*")
    logger.info("Product cache invalidated")

async def invalidate_user_cache(user_id: str):
    """Invalidate user-specific cache"""
    await cache_manager.clear_pattern(f"user:{user_id}:*")
    logger.info(f"User cache invalidated for user: {user_id}")

async def get_cache_stats() -> Dict[str, Any]:
    """Get cache statistics"""
    if not cache_manager.connected or not cache_manager.redis:
        return {"status": "disconnected", "keys": 0}
    
    try:
        info = await cache_manager.redis.info()
        keys_count = await cache_manager.redis.dbsize()
        
        return {
            "status": "connected",
            "keys": keys_count,
            "memory_used": info.get("used_memory_human", "Unknown"),
            "hits": info.get("keyspace_hits", 0),
            "misses": info.get("keyspace_misses", 0),
            "connected_clients": info.get("connected_clients", 0)
        }
    except Exception as e:
        logger.error(f"Cache stats error: {e}")
        return {"status": "error", "error": str(e)}