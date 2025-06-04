"""
Simple In-Memory Caching Module for 3D Tech Store
Provides basic caching functionality without Redis dependency
"""

import json
import time
from typing import Optional, Any, Dict
import asyncio
from functools import wraps
import hashlib
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleCacheManager:
    def __init__(self):
        self.cache: Dict[str, Dict] = {}
        self.connected = True  # Always connected for in-memory cache
        
    async def connect(self):
        """Initialize in-memory cache"""
        self.cache = {}
        self.connected = True
        logger.info("In-memory cache initialized successfully")
    
    async def disconnect(self):
        """Clear in-memory cache"""
        self.cache.clear()
        self.connected = False
        logger.info("In-memory cache cleared")
    
    def _generate_key(self, prefix: str, **kwargs) -> str:
        """Generate cache key from parameters"""
        key_data = json.dumps(kwargs, sort_keys=True)
        key_hash = hashlib.md5(key_data.encode()).hexdigest()
        return f"{prefix}:{key_hash}"
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.connected:
            return None
            
        try:
            if key in self.cache:
                cache_entry = self.cache[key]
                current_time = time.time()
                
                # Check if expired
                if current_time > cache_entry['expires_at']:
                    del self.cache[key]
                    return None
                
                return cache_entry['data']
            return None
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None
    
    async def set(self, key: str, value: Any, expire: int = 300) -> bool:
        """Set value in cache with expiration (default 5 minutes)"""
        if not self.connected:
            return False
            
        try:
            current_time = time.time()
            self.cache[key] = {
                'data': value,
                'expires_at': current_time + expire,
                'created_at': current_time
            }
            return True
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.connected:
            return False
            
        try:
            if key in self.cache:
                del self.cache[key]
            return True
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False
    
    async def clear_pattern(self, pattern: str) -> bool:
        """Clear all keys matching pattern"""
        if not self.connected:
            return False
            
        try:
            # Simple pattern matching (supports * wildcard)
            if pattern == "*":
                self.cache.clear()
            else:
                pattern_prefix = pattern.replace("*", "")
                keys_to_delete = [key for key in self.cache.keys() if key.startswith(pattern_prefix)]
                for key in keys_to_delete:
                    del self.cache[key]
            return True
        except Exception as e:
            logger.error(f"Cache clear pattern error: {e}")
            return False
    
    def _cleanup_expired(self):
        """Remove expired entries"""
        current_time = time.time()
        expired_keys = [
            key for key, entry in self.cache.items() 
            if current_time > entry['expires_at']
        ]
        for key in expired_keys:
            del self.cache[key]

# Global cache manager instance
cache_manager = SimpleCacheManager()

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
    if not cache_manager.connected:
        return {"status": "disconnected", "keys": 0}
    
    try:
        # Cleanup expired entries first
        cache_manager._cleanup_expired()
        
        total_keys = len(cache_manager.cache)
        total_memory = 0
        
        # Estimate memory usage
        for key, entry in cache_manager.cache.items():
            try:
                total_memory += len(json.dumps(entry).encode('utf-8'))
            except:
                pass
        
        return {
            "status": "connected",
            "type": "in_memory",
            "keys": total_keys,
            "memory_used": f"{total_memory / 1024:.2f} KB",
            "hits": "not_tracked",
            "misses": "not_tracked",
            "connected_clients": 1
        }
    except Exception as e:
        logger.error(f"Cache stats error: {e}")
        return {"status": "error", "error": str(e)}