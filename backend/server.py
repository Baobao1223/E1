from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.gzip import GZipMiddleware
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# Add current directory to path for local imports
import sys
sys.path.append(os.path.dirname(__file__))

# Import our optimization modules
try:
    import simple_cache
    import database_optimization
    
    cache_manager = simple_cache.cache_manager
    cache_response = simple_cache.cache_response
    invalidate_product_cache = simple_cache.invalidate_product_cache
    get_cache_stats = simple_cache.get_cache_stats
    setup_database_optimization = database_optimization.setup_database_optimization
    DatabaseOptimizer = database_optimization.DatabaseOptimizer
    OPTIMIZATIONS_AVAILABLE = True
    
except ImportError as e:
    # Fallback if optimization modules are not available
    print(f"Warning: Performance optimization modules not available: {e}. Running in basic mode.")
    OPTIMIZATIONS_AVAILABLE = False
    cache_manager = None
    get_cache_stats = lambda: {"status": "unavailable"}
    invalidate_product_cache = lambda: None
    setup_database_optimization = lambda db: None
    DatabaseOptimizer = None

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Rate limiting setup
limiter = Limiter(key_func=get_remote_address)

# Create the main app without a prefix
app = FastAPI(title="3D Tech Store API", version="2.0.0")

# Add middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)  # Compress responses > 1KB
app.add_middleware(SlowAPIMiddleware)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Global variables for optimization modules
db_optimizer: Optional[DatabaseOptimizer] = None

# Startup event
@app.on_event("startup")
async def startup_event():
    global db_optimizer
    
    if OPTIMIZATIONS_AVAILABLE:
        # Initialize cache
        if cache_manager:
            await cache_manager.connect()
        
        # Setup database optimization
        if setup_database_optimization:
            db_optimizer = await setup_database_optimization(db)
    
    logging.info(f"🚀 3D Tech Store API v2.0.0 started! Optimizations: {'Enabled' if OPTIMIZATIONS_AVAILABLE else 'Disabled'}")

# Shutdown event  
@app.on_event("shutdown")
async def shutdown_event():
    if OPTIMIZATIONS_AVAILABLE and cache_manager:
        await cache_manager.disconnect()
    logging.info("👋 3D Tech Store API shutting down...")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Product Models
class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: str
    product_type: str  # laptop, phone, headphones, watch
    colors: List[str] = []
    model_url: Optional[str] = None
    images: List[str] = []
    stock: int = 0
    featured: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    product_type: str
    colors: List[str] = []
    model_url: Optional[str] = None
    images: List[str] = []
    stock: int = 0
    featured: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    product_type: Optional[str] = None
    colors: Optional[List[str]] = None
    model_url: Optional[str] = None
    images: Optional[List[str]] = None
    stock: Optional[int] = None
    featured: Optional[bool] = None

# Cart Models
class CartItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    quantity: int
    selected_color: str
    added_at: datetime = Field(default_factory=datetime.utcnow)

class Cart(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None  # For guest users, this can be None
    session_id: str  # To track guest carts
    items: List[CartItem] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CartItemAdd(BaseModel):
    product_id: str
    quantity: int = 1
    selected_color: str

# User Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    favorites: List[str] = []  # List of product IDs
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    email: str
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None

# Wishlist Models
class WishlistItem(BaseModel):
    product_id: str
    added_at: datetime = Field(default_factory=datetime.utcnow)

# Review Models
class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    user_id: str
    user_name: str
    rating: int = Field(ge=1, le=5)  # 1-5 stars
    comment: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReviewCreate(BaseModel):
    product_id: str
    user_id: str
    user_name: str
    rating: int = Field(ge=1, le=5)
    comment: str

# Basic status check endpoints
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "3D Tech Store API - Ready to serve!", "version": "2.0.0"}

# Simple test endpoint
@api_router.get("/test")
async def test_endpoint():
    return {"status": "working", "optimizations": OPTIMIZATIONS_AVAILABLE}

# Test cache endpoint
@api_router.get("/test-cache")
async def test_cache():
    """Test cache functionality"""
    if OPTIMIZATIONS_AVAILABLE and cache_manager:
        # Test cache set/get
        await cache_manager.set("test_key", {"test": "data"}, 60)
        result = await cache_manager.get("test_key")
        stats = await get_cache_stats()
        return {"cache_test": result, "cache_stats": stats}
    return {"error": "Cache not available"}

# Status check endpoints
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Product endpoints
@api_router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    product_type: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    limit: int = 50
):
    """Get all products with optional filtering and search - CACHED"""
    
    # Create cache key from parameters
    cache_key = f"products:{category}:{product_type}:{featured}:{search}:{min_price}:{max_price}:{limit}"
    
    # Try cache first if available
    if OPTIMIZATIONS_AVAILABLE and cache_manager:
        cached_result = await cache_manager.get(cache_key)
        if cached_result:
            logger.info(f"Cache HIT for key: {cache_key}")
            return [Product(**product) for product in cached_result]
    
    # Build query
    filter_dict = {}
    if category:
        filter_dict["category"] = category
    if product_type:
        filter_dict["product_type"] = product_type
    if featured is not None:
        filter_dict["featured"] = featured
    if search:
        filter_dict["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}}
        ]
    if min_price is not None or max_price is not None:
        price_filter = {}
        if min_price is not None:
            price_filter["$gte"] = min_price
        if max_price is not None:
            price_filter["$lte"] = max_price
        filter_dict["price"] = price_filter
    
    # Execute optimized query
    products = await db.products.find(filter_dict).limit(limit).to_list(limit)
    result = [Product(**product) for product in products]
    
    # Cache the result for 5 minutes if caching available
    if OPTIMIZATIONS_AVAILABLE and cache_manager:
        await cache_manager.set(cache_key, [product.dict() for product in result], expire=300)
        logger.info(f"Cache SET for key: {cache_key}")
    
    return result

@api_router.get("/products/{product_id}", response_model=Product)
@limiter.limit("200/minute")
async def get_product(request, product_id: str):
    """Get a specific product by ID - CACHED"""
    
    # Try cache first
    cache_key = f"product:{product_id}"
    cached_result = await cache_manager.get(cache_key)
    if cached_result:
        return Product(**cached_result)
    
    # Query database
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    result = Product(**product)
    
    # Cache for 10 minutes (individual products change less frequently)
    await cache_manager.set(cache_key, result.dict(), expire=600)
    
    return result

@api_router.post("/products", response_model=Product)
@limiter.limit("10/minute")  # Limit product creation
async def create_product(request, product_data: ProductCreate):
    """Create a new product"""
    product = Product(**product_data.dict())
    await db.products.insert_one(product.dict())
    
    # Invalidate product cache
    await invalidate_product_cache()
    
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductUpdate):
    """Update an existing product"""
    existing_product = await db.products.find_one({"id": product_id})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in product_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    updated_product = await db.products.find_one({"id": product_id})
    return Product(**updated_product)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    """Delete a product"""
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# Cart endpoints
@api_router.get("/cart/{session_id}", response_model=Cart)
async def get_cart(session_id: str):
    """Get cart by session ID"""
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        # Create new cart for session
        new_cart = Cart(session_id=session_id)
        await db.carts.insert_one(new_cart.dict())
        return new_cart
    return Cart(**cart)

@api_router.post("/cart/{session_id}/items")
async def add_to_cart(session_id: str, item_data: CartItemAdd):
    """Add item to cart"""
    # Check if product exists
    product = await db.products.find_one({"id": item_data.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get or create cart
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        cart = Cart(session_id=session_id)
        await db.carts.insert_one(cart.dict())
    else:
        cart = Cart(**cart)
    
    # Check if item already exists in cart
    existing_item = None
    for item in cart.items:
        if (item.product_id == item_data.product_id and 
            item.selected_color == item_data.selected_color):
            existing_item = item
            break
    
    if existing_item:
        # Update quantity
        existing_item.quantity += item_data.quantity
    else:
        # Add new item
        new_item = CartItem(**item_data.dict())
        cart.items.append(new_item)
    
    cart.updated_at = datetime.utcnow()
    await db.carts.update_one(
        {"session_id": session_id}, 
        {"$set": cart.dict()}
    )
    
    return {"message": "Item added to cart successfully", "cart": cart}

@api_router.delete("/cart/{session_id}/items/{item_id}")
async def remove_from_cart(session_id: str, item_id: str):
    """Remove item from cart"""
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart = Cart(**cart)
    cart.items = [item for item in cart.items if item.id != item_id]
    cart.updated_at = datetime.utcnow()
    
    await db.carts.update_one(
        {"session_id": session_id}, 
        {"$set": cart.dict()}
    )
    
    return {"message": "Item removed from cart successfully"}

@api_router.delete("/cart/{session_id}")
async def clear_cart(session_id: str):
    """Clear all items from cart"""
    await db.carts.update_one(
        {"session_id": session_id}, 
        {"$set": {"items": [], "updated_at": datetime.utcnow()}}
    )
    return {"message": "Cart cleared successfully"}

# User endpoints
@api_router.post("/users", response_model=User)
async def create_user(user_data: UserCreate):
    """Create a new user"""
    # Check if user with email already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    user = User(**user_data.dict())
    await db.users.insert_one(user.dict())
    return user

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Get user by ID"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

# Wishlist endpoints
@api_router.post("/users/{user_id}/favorites/{product_id}")
async def add_to_favorites(user_id: str, product_id: str):
    """Add product to user's favorites"""
    # Check if user exists
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if product exists
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Add to favorites if not already there
    if product_id not in user.get("favorites", []):
        await db.users.update_one(
            {"id": user_id},
            {"$addToSet": {"favorites": product_id}}
        )
    
    return {"message": "Product added to favorites"}

@api_router.delete("/users/{user_id}/favorites/{product_id}")
async def remove_from_favorites(user_id: str, product_id: str):
    """Remove product from user's favorites"""
    # Check if user exists
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Remove from favorites
    await db.users.update_one(
        {"id": user_id},
        {"$pull": {"favorites": product_id}}
    )
    
    return {"message": "Product removed from favorites"}

@api_router.get("/users/{user_id}/favorites", response_model=List[Product])
async def get_user_favorites(user_id: str):
    """Get user's favorite products"""
    # Check if user exists
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get favorite products
    favorite_ids = user.get("favorites", [])
    if not favorite_ids:
        return []
    
    products = await db.products.find({"id": {"$in": favorite_ids}}).to_list(100)
    return [Product(**product) for product in products]

# Review endpoints
@api_router.post("/reviews", response_model=Review)
async def create_review(review_data: ReviewCreate):
    """Create a new product review"""
    # Check if product exists
    product = await db.products.find_one({"id": review_data.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if user already reviewed this product
    existing_review = await db.reviews.find_one({
        "product_id": review_data.product_id,
        "user_id": review_data.user_id
    })
    if existing_review:
        raise HTTPException(status_code=400, detail="User has already reviewed this product")
    
    review = Review(**review_data.dict())
    await db.reviews.insert_one(review.dict())
    return review

@api_router.get("/reviews/product/{product_id}", response_model=List[Review])
async def get_product_reviews(product_id: str, limit: int = 20):
    """Get all reviews for a product"""
    reviews = await db.reviews.find({"product_id": product_id}).sort("created_at", -1).limit(limit).to_list(limit)
    return [Review(**review) for review in reviews]

@api_router.get("/reviews/stats/{product_id}")
async def get_product_review_stats(product_id: str):
    """Get review statistics for a product"""
    pipeline = [
        {"$match": {"product_id": product_id}},
        {"$group": {
            "_id": None,
            "total_reviews": {"$sum": 1},
            "average_rating": {"$avg": "$rating"},
            "rating_counts": {
                "$push": "$rating"
            }
        }}
    ]
    
    stats = await db.reviews.aggregate(pipeline).to_list(1)
    
    if not stats:
        return {
            "total_reviews": 0,
            "average_rating": 0,
            "rating_distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        }
    
    stat = stats[0]
    rating_counts = stat["rating_counts"]
    
    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for rating in rating_counts:
        distribution[rating] += 1
    
    return {
        "total_reviews": stat["total_reviews"],
        "average_rating": round(stat["average_rating"], 1),
        "rating_distribution": distribution
    }

# Recommendation endpoints  
@api_router.get("/products/{product_id}/recommendations", response_model=List[Product])
async def get_product_recommendations(product_id: str, limit: int = 4):
    """Get product recommendations based on category and price range"""
    # Get the current product
    current_product = await db.products.find_one({"id": product_id})
    if not current_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get products in same category, different from current product
    price_range = current_product["price"] * 0.3  # 30% price range
    min_price = current_product["price"] - price_range
    max_price = current_product["price"] + price_range
    
    recommendations = await db.products.find({
        "id": {"$ne": product_id},
        "category": current_product["category"],
        "price": {"$gte": min_price, "$lte": max_price}
    }).limit(limit).to_list(limit)
    
    # If not enough in same category, get by similar price
    if len(recommendations) < limit:
        additional = await db.products.find({
            "id": {"$ne": product_id},
            "category": {"$ne": current_product["category"]},
            "price": {"$gte": min_price, "$lte": max_price}
        }).limit(limit - len(recommendations)).to_list(limit - len(recommendations))
        recommendations.extend(additional)
    
    return [Product(**product) for product in recommendations]

@api_router.get("/products/trending")
async def get_trending_products(limit: int = 8):
    """Get trending products based on recent reviews and featured status"""
    # Get products with recent reviews or featured products
    pipeline = [
        {"$lookup": {
            "from": "reviews",
            "localField": "id",
            "foreignField": "product_id",
            "as": "reviews"
        }},
        {"$addFields": {
            "review_count": {"$size": "$reviews"},
            "trend_score": {
                "$add": [
                    {"$multiply": [{"$size": "$reviews"}, 2]},
                    {"$cond": [{"$eq": ["$featured", True]}, 5, 0]}
                ]
            }
        }},
        {"$sort": {"trend_score": -1, "created_at": -1}},
        {"$limit": limit},
        {"$project": {
            "reviews": 0,
            "trend_score": 0,
            "review_count": 0
        }}
    ]
    
    trending = await db.products.aggregate(pipeline).to_list(limit)
    return [Product(**product) for product in trending]

# Statistics endpoints
@api_router.get("/stats/dashboard")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    # Count products
    total_products = await db.products.count_documents({})
    featured_products = await db.products.count_documents({"featured": True})
    
    # Count users
    total_users = await db.users.count_documents({})
    
    # Count carts with items
    carts_with_items = await db.carts.count_documents({"items": {"$ne": []}})
    
    # Count by category
    category_pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    categories = await db.products.aggregate(category_pipeline).to_list(100)
    
    # Price statistics
    price_pipeline = [
        {"$group": {
            "_id": None,
            "avg_price": {"$avg": "$price"},
            "min_price": {"$min": "$price"},
            "max_price": {"$max": "$price"}
        }}
    ]
    price_stats = await db.products.aggregate(price_pipeline).to_list(1)
    
    return {
        "products": {
            "total": total_products,
            "featured": featured_products,
            "by_category": categories
        },
        "users": {
            "total": total_users
        },
        "carts": {
            "active": carts_with_items
        },
        "pricing": price_stats[0] if price_stats else {
            "avg_price": 0,
            "min_price": 0,
            "max_price": 0
        }
    }

# Initialize sample data
@api_router.post("/init-sample-data")
async def initialize_sample_data():
    """Initialize the database with sample products"""
    
    # Check if products already exist
    existing_products = await db.products.count_documents({})
    if existing_products > 0:
        return {"message": "Sample data already exists"}
    
    sample_products = [
        {
            "name": "MacBook Pro M3",
            "description": "Laptop cao cấp với chip M3 mạnh mẽ, màn hình Retina 14 inch tuyệt đẹp",
            "price": 29999000,
            "category": "Laptop",
            "product_type": "laptop",
            "colors": ["#C0C0C0", "#222222", "#FFD700"],
            "stock": 25,
            "featured": True
        },
        {
            "name": "iPhone 15 Pro",
            "description": "Smartphone flagship với camera Pro, chip A17 Pro và thiết kế titanium",
            "price": 26999000,
            "category": "Smartphone",
            "product_type": "phone",
            "colors": ["#C0C0C0", "#222222", "#0066CC", "#FFD700"],
            "stock": 50,
            "featured": True
        },
        {
            "name": "AirPods Pro (2nd Gen)",
            "description": "Tai nghe không dây cao cấp với chống ồn chủ động và âm thanh không gian",
            "price": 5999000,
            "category": "Audio",
            "product_type": "headphones",
            "colors": ["#FFFFFF", "#222222"],
            "stock": 100,
            "featured": True
        },
        {
            "name": "Apple Watch Series 9",
            "description": "Đồng hồ thông minh với tính năng sức khỏe tiên tiến và màn hình Always-On",
            "price": 8999000,
            "category": "Wearable",
            "product_type": "watch",
            "colors": ["#C0C0C0", "#222222", "#FFD700", "#CC0000"],
            "stock": 75,
            "featured": True
        }
    ]
    
    products_to_insert = []
    for product_data in sample_products:
        product = Product(**product_data)
        products_to_insert.append(product.dict())
    
    await db.products.insert_many(products_to_insert)
    
    return {
        "message": "Sample data initialized successfully", 
        "products_created": len(products_to_insert)
    }

# Include the router in the main app
app.include_router(api_router)

# Performance monitoring endpoints
@api_router.get("/performance/cache")
async def get_cache_performance():
    """Get cache performance statistics"""
    return await get_cache_stats()

@api_router.get("/performance/database")
async def get_database_performance():
    """Get database performance statistics"""
    if not db_optimizer:
        return {"error": "Database optimizer not initialized"}
    
    return await db_optimizer.get_collection_stats()

@api_router.post("/performance/analyze-query")
async def analyze_query_performance(collection: str, query: dict, limit: int = 100):
    """Analyze query performance"""
    if not db_optimizer:
        return {"error": "Database optimizer not initialized"}
    
    return await db_optimizer.analyze_query_performance(collection, query, limit)

@api_router.post("/performance/clear-cache")
@limiter.limit("5/minute")
async def clear_cache(request, pattern: str = "*"):
    """Clear cache with optional pattern"""
    result = await cache_manager.clear_pattern(pattern)
    return {"success": result, "pattern": pattern}

@api_router.post("/performance/optimize-database")
@limiter.limit("2/minute")
async def optimize_database(request, collection: Optional[str] = None):
    """Optimize database collections"""
    if not db_optimizer:
        return {"error": "Database optimizer not initialized"}
    
    if collection:
        result = await db_optimizer.optimize_collection(collection)
        return {"collection": collection, "result": result}
    else:
        # Optimize all collections
        collections = ["products", "users", "carts", "reviews", "status_checks"]
        results = {}
        for coll in collections:
            results[coll] = await db_optimizer.optimize_collection(coll)
        return {"results": results}

# Health check with performance metrics
@api_router.get("/health")
async def health_check():
    """Enhanced health check with performance metrics"""
    cache_stats = await get_cache_stats()
    db_stats = await db_optimizer.get_collection_stats() if db_optimizer else {}
    
    return {
        "status": "healthy",
        "version": "2.0.0",
        "cache": cache_stats,
        "database": {
            "status": "connected",
            "collections": len(db_stats),
            "total_documents": sum(stats.get("document_count", 0) for stats in db_stats.values() if isinstance(stats, dict))
        },
        "features": [
            "redis_caching",
            "database_optimization", 
            "rate_limiting",
            "gzip_compression"
        ]
    }

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()