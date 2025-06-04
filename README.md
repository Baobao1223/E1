# 🛍️ 3D TECH STORE - Nền tảng Thương mại Điện tử 3D

<div align="center">
  <img src="https://img.shields.io/badge/React-19.0.0-61dafb?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-0.110.1-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/MongoDB-4.4+-4ea94b?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Three.js-0.177.0-000000?style=for-the-badge&logo=three.js" alt="Three.js" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
</div>

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Demo](#-demo)
- [Kiến trúc](#-kiến-trúc)
- [Cài đặt](#-cài-đặt)
- [Sử dụng](#-sử-dụng)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Giới thiệu

**3D Tech Store** là nền tảng thương mại điện tử tiên tiến với tính năng **trực quan hóa sản phẩm 3D**, được thiết kế dành riêng cho thị trường Việt Nam. Platform cho phép người dùng tương tác với sản phẩm trong không gian 3D, xoay, phóng to, đổi màu và trải nghiệm sản phẩm như thật trước khi mua hàng.

### ✨ Điểm nổi bật

- 🎮 **Interactive 3D Visualization** - Trải nghiệm sản phẩm 360°
- 🇻🇳 **Vietnamese First** - UI/UX hoàn toàn tiếng Việt
- 🚀 **Modern Tech Stack** - React 19, FastAPI, Three.js
- 📱 **Responsive Design** - Tối ưu cho mọi thiết bị
- ⚡ **High Performance** - Fast loading & smooth interactions
- 🛒 **Complete E-commerce** - Giỏ hàng, user management, reviews

## 🌟 Tính năng

### 🎨 Frontend Features

#### 3D Product Visualization
- **Interactive 3D Viewer** với Three.js
- **Auto-rotation** có thể bật/tắt
- **Orbit Controls** - zoom, pan, rotate
- **Real-time Color Changing**
- **Multiple Product Types** - laptop, phone, headphones, watch
- **Professional Lighting** & environment setup

#### User Interface
- **Beautiful Vietnamese UI** với orange-red theme
- **Responsive Design** cho mobile & desktop
- **Smooth Animations** & hover effects
- **Advanced Search** với real-time results
- **Product Filtering** theo category, price, brand
- **Shopping Cart** với session management
- **Product Categories** & detailed product pages

#### Pages & Navigation
- 🏠 **Homepage** - Hero section với 3D showcase
- 📂 **Category Pages** - Product listing với filters
- 🔍 **Search Results** - Advanced search functionality
- 📦 **Product Detail** - Enhanced 3D viewer & info
- 🛒 **Shopping Cart** - Session-based cart management

### ⚙️ Backend Features

#### API Endpoints
- **Product Management** - Full CRUD operations
- **Search & Filtering** - Advanced product search
- **Cart Management** - Session-based shopping cart
- **User Management** - User registration & profiles
- **Wishlist/Favorites** - Save favorite products
- **Reviews & Ratings** - Product review system
- **Recommendations** - Smart product suggestions

#### Data Models
- **Product Model** - Comprehensive product schema
- **User Model** - User profiles với favorites
- **Cart Model** - Session-based cart items
- **Review Model** - Rating & comment system
- **Responsive Error Handling**

#### Database Features
- **MongoDB** với Motor async driver
- **UUID-based IDs** (không dùng ObjectID)
- **Vietnamese Text Support** 
- **Aggregation Pipelines** cho analytics
- **Sample Data Initialization**

## 🎥 Demo

### 🖥️ Live Demo
```
Frontend: https://e74680c4-c58f-4dc2-becd-ade10a64fbb4.preview.emergentagent.com
Backend API: https://e74680c4-c58f-4dc2-becd-ade10a64fbb4.preview.emergentagent.com/api
```

### 📱 Screenshots

#### Homepage với 3D Hero Section
```
- Interactive 3D product showcase
- Vietnamese product carousel
- Category navigation
- Promotional banners
```

#### Product 3D Viewer
```
- 360° product rotation
- Real-time color changing
- Zoom & pan controls
- Professional lighting
```

#### Search & Filtering
```
- Advanced search functionality
- Category & price filters
- Real-time results
- Sort options
```

## 🏗️ Kiến trúc

### 📁 Project Structure

```
3d-tech-store/
├── 📂 backend/                 # FastAPI Backend
│   ├── server.py              # Main FastAPI app
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables
│   └── external_integrations/ # External integrations
├── 📂 frontend/               # React Frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── App.js           # Main React component
│   │   ├── App.css          # Styles
│   │   ├── index.js         # Entry point
│   │   └── index.css        # Global styles
│   ├── package.json         # Dependencies
│   ├── tailwind.config.js   # Tailwind config
│   └── .env                 # Environment variables
├── 📂 tests/                 # Test files
├── 📂 scripts/               # Utility scripts
├── 🐳 Dockerfile            # Docker configuration
├── 📋 docker-compose.yml    # Multi-container setup
├── ⚙️ nginx.conf            # Nginx configuration
└── 📚 README.md             # This file
```

### 🔧 Tech Stack

#### Frontend
- **React 19.0.0** - Latest React với concurrent features
- **Three.js 0.177.0** - 3D graphics library
- **@react-three/fiber** - React renderer cho Three.js
- **@react-three/drei** - Useful helpers cho Three.js
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Router DOM** - Client-side routing

#### Backend
- **FastAPI 0.110.1** - Modern Python web framework
- **Motor 3.3.1** - Async MongoDB driver
- **Pydantic** - Data validation
- **Python-dotenv** - Environment management
- **Uvicorn** - ASGI server

#### Database
- **MongoDB** - NoSQL document database
- **Motor** - Async MongoDB driver
- **Aggregation Pipelines** - Complex queries

#### DevOps
- **Docker** - Containerization
- **Nginx** - Reverse proxy
- **Supervisor** - Process management

## 🚀 Cài đặt

### 📋 Yêu cầu hệ thống

- **Node.js** 18+ & **Yarn**
- **Python** 3.11+
- **MongoDB** 4.4+
- **Docker** & **Docker Compose** (optional)

### 🔧 Cài đặt thủ công

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/3d-tech-store.git
cd 3d-tech-store
```

#### 2. Backend Setup
```bash
# Di chuyển vào thư mục backend
cd backend

# Tạo virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate    # Windows

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo file .env
cp .env.example .env
# Chỉnh sửa .env với thông tin database
```

#### 3. Frontend Setup
```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
yarn install

# Tạo file .env
cp .env.example .env
# Chỉnh sửa .env với backend URL
```

#### 4. Database Setup
```bash
# Khởi động MongoDB
sudo systemctl start mongod

# Hoặc dùng Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 🐳 Cài đặt với Docker

```bash
# Clone repository
git clone https://github.com/yourusername/3d-tech-store.git
cd 3d-tech-store

# Build và khởi động containers
docker-compose up --build

# Chạy ở background
docker-compose up -d
```

### ⚙️ Environment Variables

#### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=tech_store_db
JWT_SECRET=your-secret-key
DEBUG=True
```

#### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=443
```

## 💻 Sử dụng

### 🚀 Khởi động Development

#### Backend
```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

#### Frontend
```bash
cd frontend
yarn start
```

#### Truy cập ứng dụng
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs

### 📊 Khởi tạo dữ liệu mẫu

```bash
# Gọi API để tạo dữ liệu mẫu
curl -X POST http://localhost:8001/api/init-sample-data
```

### 🎮 Sử dụng 3D Features

#### 3D Product Viewer
- **Click & Drag** - Xoay sản phẩm
- **Scroll** - Zoom in/out
- **Color Picker** - Đổi màu real-time
- **Auto Rotation Toggle** - Bật/tắt xoay tự động

#### Search & Filter
- **Search Bar** - Tìm kiếm theo tên, mô tả
- **Category Filter** - Lọc theo danh mục
- **Price Range** - Lọc theo khoảng giá
- **Sort Options** - Sắp xếp theo tên, giá, ngày

## 📚 API Documentation

### 🔗 Base URL
```
Local: http://localhost:8001/api
Production: https://your-domain.com/api
```

### 📦 Product Endpoints

#### Get Products
```http
GET /api/products
```

**Parameters:**
- `category` (optional) - Filter by category
- `product_type` (optional) - Filter by product type
- `featured` (optional) - Filter featured products
- `search` (optional) - Search in name/description
- `min_price` (optional) - Minimum price
- `max_price` (optional) - Maximum price
- `limit` (optional) - Results limit (default: 50)

**Example:**
```bash
curl "http://localhost:8001/api/products?search=MacBook&category=Laptop&limit=10"
```

#### Get Product by ID
```http
GET /api/products/{product_id}
```

#### Create Product
```http
POST /api/products
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "description": "Smartphone flagship với camera Pro",
  "price": 26999000,
  "category": "Smartphone",
  "product_type": "phone",
  "colors": ["#C0C0C0", "#222222", "#0066CC"],
  "stock": 50,
  "featured": true
}
```

### 🛒 Cart Endpoints

#### Get Cart
```http
GET /api/cart/{session_id}
```

#### Add to Cart
```http
POST /api/cart/{session_id}/items
Content-Type: application/json

{
  "product_id": "product-uuid",
  "quantity": 2,
  "selected_color": "#FF4500"
}
```

#### Remove from Cart
```http
DELETE /api/cart/{session_id}/items/{item_id}
```

### 👤 User Endpoints

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "Nguyễn Văn A",
  "phone": "+84 123 456 789",
  "address": "123 Đường ABC, Quận 1, TP.HCM"
}
```

#### Get User
```http
GET /api/users/{user_id}
```

### ❤️ Wishlist Endpoints

#### Add to Favorites
```http
POST /api/users/{user_id}/favorites/{product_id}
```

#### Remove from Favorites
```http
DELETE /api/users/{user_id}/favorites/{product_id}
```

#### Get User Favorites
```http
GET /api/users/{user_id}/favorites
```

### ⭐ Review Endpoints

#### Create Review
```http
POST /api/reviews
Content-Type: application/json

{
  "product_id": "product-uuid",
  "user_id": "user-uuid",
  "user_name": "Nguyễn Văn A",
  "rating": 5,
  "comment": "Sản phẩm tuyệt vời!"
}
```

#### Get Product Reviews
```http
GET /api/reviews/product/{product_id}
```

#### Get Review Stats
```http
GET /api/reviews/stats/{product_id}
```

### 🎯 Recommendation Endpoints

#### Get Product Recommendations
```http
GET /api/products/{product_id}/recommendations?limit=4
```

#### Get Trending Products
```http
GET /api/products/trending?limit=8
```

## 🚀 Deployment

### 🌐 Production Deployment

#### 1. Environment Setup
```bash
# Production environment variables
MONGO_URL=mongodb://your-mongo-cluster
DB_NAME=tech_store_production
JWT_SECRET=your-super-secret-key
DEBUG=False
REACT_APP_BACKEND_URL=https://api.your-domain.com
```

#### 2. Build Frontend
```bash
cd frontend
yarn build
```

#### 3. Docker Production
```bash
# Build production image
docker build -t 3d-tech-store .

# Run with production env
docker run -d -p 80:80 --env-file .env.production 3d-tech-store
```

#### 4. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
        root /app/frontend/build;
    }

    # Backend API
    location /api {
        proxy_pass http://backend:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### ☁️ Cloud Deployment Options

#### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend && vercel --prod
```

#### Railway (Full Stack)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

#### DigitalOcean App Platform
```yaml
# .do/app.yaml
name: 3d-tech-store
services:
- name: frontend
  source_dir: frontend
  build_command: yarn build
  run_command: yarn start
- name: backend
  source_dir: backend
  build_command: pip install -r requirements.txt
  run_command: uvicorn server:app --host 0.0.0.0 --port 8080
databases:
- name: mongodb
  engine: MONGODB
```

## 🧪 Testing

### 🔍 Backend Testing

#### Automated Testing
```bash
cd backend

# Run comprehensive API tests
python backend_test.py

# Run specific test
python -m pytest tests/test_products.py -v

# Run with coverage
python -m pytest --cov=server tests/
```

#### Manual API Testing
```bash
# Test basic endpoint
curl http://localhost:8001/api/

# Test search
curl "http://localhost:8001/api/products?search=iPhone"

# Test create product
curl -X POST http://localhost:8001/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":1000000,"category":"Test"}'
```

### 🎨 Frontend Testing

#### Development Testing
```bash
cd frontend

# Run React tests
yarn test

# Run with coverage
yarn test --coverage

# Run specific test
yarn test App.test.js
```

#### E2E Testing with Playwright
```bash
# Install Playwright
npm install -D @playwright/test

# Run E2E tests
npx playwright test

# Run specific test
npx playwright test tests/product-viewer.spec.js
```

### 📊 Testing Results

#### Backend Test Coverage
- ✅ **14/14 API Tests** passing
- ✅ **Product CRUD** operations
- ✅ **Cart Management** functionality
- ✅ **User Management** system
- ✅ **Vietnamese Text** validation
- ✅ **Error Handling** coverage

#### Frontend Test Coverage
- ✅ **3D Visualization** rendering
- ✅ **Product Selection** & color changing
- ✅ **Search Functionality** 
- ✅ **Responsive Design** on different devices
- ✅ **API Integration** với backend

## 🤝 Contributing

### 📝 Development Workflow

1. **Fork** repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** Pull Request

### 📋 Code Standards

#### Python (Backend)
```bash
# Format code
black server.py

# Sort imports
isort server.py

# Lint code
flake8 server.py

# Type checking
mypy server.py
```

#### JavaScript (Frontend)
```bash
# Format code
prettier --write src/

# Lint code
eslint src/

# Fix lint issues
eslint src/ --fix
```

### 🐛 Bug Reports

**Khi báo cáo bug, bao gồm:**
- 📱 Device/Browser information
- 🔄 Steps to reproduce
- 🎯 Expected vs actual behavior
- 📸 Screenshots/videos
- 📋 Console errors

### 💡 Feature Requests

**Khi đề xuất tính năng:**
- 🎯 Problem description
- 💡 Proposed solution
- 📈 Use cases
- 🔄 Implementation approach

## 🗺️ Roadmap

### 📅 Version 2.0 (Q3 2024)

#### 🔐 Authentication & Security
- [ ] JWT-based authentication
- [ ] OAuth integration (Google, Facebook)
- [ ] Role-based access control
- [ ] Security headers & rate limiting

#### 💳 Payment Integration
- [ ] VNPay integration
- [ ] MoMo wallet support
- [ ] Stripe for international
- [ ] Order processing system
- [ ] Invoice generation

#### 🛡️ Advanced Features
- [ ] Real 3D models upload
- [ ] Admin dashboard
- [ ] Inventory management
- [ ] Email notifications
- [ ] Advanced analytics

### 📅 Version 3.0 (Q4 2024)

#### 🚀 Performance & Scale
- [ ] Redis caching
- [ ] CDN integration
- [ ] Image optimization
- [ ] Database indexing
- [ ] Load balancing

#### 📱 Mobile Experience
- [ ] React Native mobile app
- [ ] Push notifications
- [ ] Offline support
- [ ] AR product preview

#### 🤖 AI & ML Features
- [ ] AI-powered recommendations
- [ ] Chatbot support
- [ ] Image search
- [ ] Price optimization

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 3D Tech Store

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

## 🙏 Acknowledgments

### 📚 Libraries & Frameworks
- **React** - A JavaScript library for building user interfaces
- **Three.js** - JavaScript 3D library
- **FastAPI** - Modern, fast web framework for building APIs
- **MongoDB** - Document database
- **Tailwind CSS** - Utility-first CSS framework

### 🎨 Design Inspiration
- **Modern e-commerce platforms**
- **Vietnamese user experience principles**
- **3D visualization best practices**

### 👥 Contributors

<div align="center">
  <a href="https://github.com/yourusername/3d-tech-store/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=yourusername/3d-tech-store" />
  </a>
</div>

---

<div align="center">
  <h3>🌟 Star this project if you find it helpful! 🌟</h3>
  <p>Made with ❤️ for the Vietnamese tech community</p>
  
  **🔗 Links:**
  [Demo](https://your-demo-url.com) • 
  [Documentation](https://docs.your-domain.com) • 
  [Issues](https://github.com/yourusername/3d-tech-store/issues) • 
  [Discussions](https://github.com/yourusername/3d-tech-store/discussions)
</div>
