from fastapi import FastAPI, APIRouter, HTTPException
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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="3D Tech Store API", version="1.0.0")

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
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    email: str
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None

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
    return {"message": "3D Tech Store API - Ready to serve!", "version": "1.0.0"}

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
    limit: int = 50
):
    """Get all products with optional filtering"""
    filter_dict = {}
    if category:
        filter_dict["category"] = category
    if product_type:
        filter_dict["product_type"] = product_type
    if featured is not None:
        filter_dict["featured"] = featured
    
    products = await db.products.find(filter_dict).limit(limit).to_list(limit)
    return [Product(**product) for product in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get a specific product by ID"""
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate):
    """Create a new product"""
    product = Product(**product_data.dict())
    await db.products.insert_one(product.dict())
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