import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import axios from "axios";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Box, Sphere, Cylinder, Text, Environment } from "@react-three/drei";
import * as THREE from "three";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Header Component
const Header = ({ cartItemCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-white shadow-lg border-b-4 border-orange-500 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top bar */}
        <div className="flex justify-between items-center py-2 text-sm border-b border-gray-200">
          <div className="flex items-center space-x-4 text-gray-600">
            <span>📞 Hotline: 1900-xxxx</span>
            <span>📧 support@3dtechstore.vn</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Miễn phí vận chuyển toàn quốc</span>
            <span className="text-orange-500 font-semibold">🚚 Giao hàng nhanh 2h</span>
          </div>
        </div>

        {/* Main header */}
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <a href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">3D</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  <span className="text-orange-500">3D</span> Tech Store
                </h1>
                <p className="text-xs text-gray-500">Trải nghiệm công nghệ 3D</p>
              </div>
            </a>

            {/* Navigation Menu */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="/" className="text-gray-900 hover:text-orange-500 font-medium transition">
                Trang chủ
              </a>
              <div className="relative group">
                <button className="text-gray-900 hover:text-orange-500 font-medium transition flex items-center">
                  Danh mục sản phẩm
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="p-4 space-y-2">
                    <a href="/category/laptop" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded transition">
                      💻 Laptop
                    </a>
                    <a href="/category/smartphone" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded transition">
                      📱 Smartphone
                    </a>
                    <a href="/category/audio" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded transition">
                      🎧 Audio
                    </a>
                    <a href="/category/wearable" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded transition">
                      ⌚ Wearable
                    </a>
                  </div>
                </div>
              </div>
              <a href="/promotions" className="text-gray-900 hover:text-orange-500 font-medium transition">
                Khuyến mãi
              </a>
              <a href="/about" className="text-gray-900 hover:text-orange-500 font-medium transition">
                Về chúng tôi
              </a>
              <a href="/contact" className="text-gray-900 hover:text-orange-500 font-medium transition">
                Liên hệ
              </a>
            </nav>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-4 py-2 w-80">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent flex-1 outline-none text-gray-700"
              />
            </div>

            {/* User Account */}
            <button className="p-3 text-gray-600 hover:text-orange-500 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {/* Cart */}
            <a href="/cart" className="relative p-3 text-gray-600 hover:text-orange-500 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 6l1.6 8h10.4M9 19a1 1 0 102 0 1 1 0 00-2 0zm8 0a1 1 0 102 0 1 1 0 00-2 0z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-orange-500 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="space-y-4">
              <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="bg-transparent flex-1 outline-none text-gray-700"
                />
              </div>
              <nav className="space-y-2">
                <a href="/" className="block py-2 text-gray-900 hover:text-orange-500 transition">Trang chủ</a>
                <a href="/category/laptop" className="block py-2 text-gray-900 hover:text-orange-500 transition">💻 Laptop</a>
                <a href="/category/smartphone" className="block py-2 text-gray-900 hover:text-orange-500 transition">📱 Smartphone</a>
                <a href="/category/audio" className="block py-2 text-gray-900 hover:text-orange-500 transition">🎧 Audio</a>
                <a href="/category/wearable" className="block py-2 text-gray-900 hover:text-orange-500 transition">⌚ Wearable</a>
                <a href="/promotions" className="block py-2 text-gray-900 hover:text-orange-500 transition">Khuyến mãi</a>
                <a href="/about" className="block py-2 text-gray-900 hover:text-orange-500 transition">Về chúng tôi</a>
                <a href="/contact" className="block py-2 text-gray-900 hover:text-orange-500 transition">Liên hệ</a>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">3D</span>
              </div>
              <span className="text-xl font-bold">3D Tech Store</span>
            </div>
            <p className="text-gray-400 mb-4">
              Nền tảng thương mại điện tử hàng đầu Việt Nam với công nghệ 3D tiên tiến, 
              mang đến trải nghiệm mua sắm công nghệ tuyệt vời nhất.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-orange-500 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378 0 0-.599 2.282-.744 2.840-.282 1.084-1.064 2.456-1.549 3.235C9.584 23.815 10.77 24.001 12.017 24.001c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.017 0z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Liên kết nhanh</h3>
            <ul className="space-y-3">
              <li><a href="/about" className="text-gray-400 hover:text-orange-500 transition">Về chúng tôi</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-orange-500 transition">Liên hệ</a></li>
              <li><a href="/warranty" className="text-gray-400 hover:text-orange-500 transition">Chính sách bảo hành</a></li>
              <li><a href="/shipping" className="text-gray-400 hover:text-orange-500 transition">Chính sách vận chuyển</a></li>
              <li><a href="/return" className="text-gray-400 hover:text-orange-500 transition">Chính sách đổi trả</a></li>
              <li><a href="/privacy" className="text-gray-400 hover:text-orange-500 transition">Chính sách bảo mật</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Danh mục sản phẩm</h3>
            <ul className="space-y-3">
              <li><a href="/category/laptop" className="text-gray-400 hover:text-orange-500 transition">💻 Laptop</a></li>
              <li><a href="/category/smartphone" className="text-gray-400 hover:text-orange-500 transition">📱 Smartphone</a></li>
              <li><a href="/category/audio" className="text-gray-400 hover:text-orange-500 transition">🎧 Audio</a></li>
              <li><a href="/category/wearable" className="text-gray-400 hover:text-orange-500 transition">⌚ Wearable</a></li>
              <li><a href="/category/accessories" className="text-gray-400 hover:text-orange-500 transition">🔌 Phụ kiện</a></li>
              <li><a href="/promotions" className="text-gray-400 hover:text-orange-500 transition">🔥 Khuyến mãi</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Thông tin liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-orange-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <div className="text-gray-400">
                  <p>123 Nguyễn Văn Cừ, Quận 1</p>
                  <p>TP. Hồ Chí Minh, Việt Nam</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span className="text-gray-400">1900-xxxx</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span className="text-gray-400">support@3dtechstore.vn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 3D Tech Store. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <img src="https://via.placeholder.com/60x40/FF4500/FFFFFF?text=VISA" alt="Visa" className="h-8"/>
            <img src="https://via.placeholder.com/60x40/FF4500/FFFFFF?text=MC" alt="Mastercard" className="h-8"/>
            <img src="https://via.placeholder.com/60x40/FF4500/FFFFFF?text=VNPAY" alt="VNPay" className="h-8"/>
            <img src="https://via.placeholder.com/60x40/FF4500/FFFFFF?text=MOMO" alt="MoMo" className="h-8"/>
          </div>
        </div>
      </div>
    </footer>
  );
};

// 3D Product Component
const Product3D = ({ productType, color, rotation, scale }) => {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current && rotation) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  const material = new THREE.MeshStandardMaterial({ 
    color: color,
    metalness: 0.6,
    roughness: 0.4
  });

  const getGeometry = () => {
    switch (productType) {
      case 'laptop':
        return <Box ref={meshRef} args={[4, 0.3, 3]} material={material} scale={scale} />;
      case 'phone':
        return <Box ref={meshRef} args={[1.5, 0.2, 3]} material={material} scale={scale} />;
      case 'headphones':
        return <Sphere ref={meshRef} args={[1.5]} material={material} scale={scale} />;
      case 'watch':
        return <Cylinder ref={meshRef} args={[1, 1, 0.5]} material={material} scale={scale} />;
      default:
        return <Box ref={meshRef} args={[2, 2, 2]} material={material} scale={scale} />;
    }
  };

  return getGeometry();
};

// Promotional Banners Component
const PromotionalBanners = () => {
  const banners = [
    {
      id: 1,
      title: "FLASH SALE 50%",
      subtitle: "Laptop & Smartphone",
      description: "Giảm giá sốc cho tất cả sản phẩm công nghệ cao cấp",
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwyfHx0ZWNofGVufDB8fHx8MTc0OTA1NDAyOHww&ixlib=rb-4.1.0&q=85",
      gradient: "from-purple-600 to-pink-600",
      textColor: "text-white"
    },
    {
      id: 2,
      title: "BLACK FRIDAY",
      subtitle: "Super Sale",
      description: "Cơ hội mua sắm tuyệt vời nhất trong năm",
      image: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwyfHxzYWxlfGVufDB8fHx8MTc0OTA1NDAzOHww&ixlib=rb-4.1.0&q=85",
      gradient: "from-gray-900 to-black",
      textColor: "text-white"
    },
    {
      id: 3,
      title: "GIẢM GIÁ ĐẶC BIỆT",
      subtitle: "Cho thành viên VIP",
      description: "Ưu đãi độc quyền dành cho khách hàng thân thiết",
      image: "https://images.unsplash.com/photo-1577538928305-3807c3993047?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwzfHxzYWxlfGVufDB8fHx8MTc0OTA1NDAzOHww&ixlib=rb-4.1.0&q=85",
      gradient: "from-red-600 to-orange-500",
      textColor: "text-white"
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Khuyến mãi đặc biệt
          </h2>
          <p className="text-xl text-gray-600">
            Đừng bỏ lỡ cơ hội tiết kiệm lớn cho sản phẩm công nghệ yêu thích
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer transform hover:scale-105 transition-all duration-500 ${
                index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
              }`}
              style={{ minHeight: index === 0 ? '400px' : '300px' }}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} opacity-75 group-hover:opacity-60 transition-opacity duration-300`}></div>
              </div>

              {/* Content */}
              <div className={`relative h-full flex flex-col justify-center p-8 ${banner.textColor}`}>
                <div className="mb-4">
                  <span className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                    🔥 HOT DEAL
                  </span>
                </div>
                <h3 className={`font-bold mb-2 ${index === 0 ? 'text-4xl' : 'text-2xl'}`}>
                  {banner.title}
                </h3>
                <p className={`font-semibold mb-4 ${index === 0 ? 'text-2xl' : 'text-lg'} opacity-90`}>
                  {banner.subtitle}
                </p>
                <p className={`mb-6 opacity-80 ${index === 0 ? 'text-lg' : 'text-base'}`}>
                  {banner.description}
                </p>
                <button className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition self-start">
                  Khám phá ngay →
                </button>
              </div>

              {/* Animated elements */}
              <div className="absolute top-4 right-4 animate-pulse">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Product Showcase Posters Component
const ProductPosters = () => {
  const posters = [
    {
      id: 1,
      category: "Laptop",
      title: "MacBook Pro M3",
      description: "Sức mạnh vô tận cho công việc sáng tạo",
      price: "29.999.000₫",
      originalPrice: "35.999.000₫",
      discount: "17%",
      image: "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg",
      features: ["Chip M3 Pro", "16GB RAM", "512GB SSD", "14-inch Retina"],
      color: "from-blue-600 to-purple-700"
    },
    {
      id: 2,
      category: "Audio",
      title: "Premium Headphones",
      description: "Trải nghiệm âm thanh đỉnh cao",
      price: "5.999.000₫",
      originalPrice: "7.999.000₫",
      discount: "25%",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwzfHxlbGVjdHJvbmljc3xlbnwwfHx8fDE3NDkwNTQwMzR8MA&ixlib=rb-4.1.0&q=85",
      features: ["Noise Cancelling", "Wireless", "30h Battery", "Premium Sound"],
      color: "from-gray-800 to-gray-900"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Sản phẩm nổi bật
          </h2>
          <p className="text-xl text-gray-600">
            Những sản phẩm được tin dùng nhất với công nghệ 3D
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {posters.map((poster) => (
            <div
              key={poster.id}
              className="relative bg-white rounded-3xl shadow-2xl overflow-hidden group cursor-pointer transform hover:scale-105 transition-all duration-500"
            >
              {/* Background */}
              <div className="relative h-80 overflow-hidden">
                <img
                  src={poster.image}
                  alt={poster.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${poster.color} opacity-80`}></div>
                
                {/* Discount Badge */}
                <div className="absolute top-6 left-6">
                  <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                    -{poster.discount}
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-6 right-6">
                  <div className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-full font-semibold backdrop-blur-sm">
                    {poster.category}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {poster.title}
                </h3>
                <p className="text-gray-600 text-lg mb-6">
                  {poster.description}
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {poster.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-bold text-orange-500">
                        {poster.price}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        {poster.originalPrice}
                      </span>
                    </div>
                    <p className="text-green-600 font-semibold">
                      Tiết kiệm {((parseInt(poster.originalPrice.replace(/[^\d]/g, '')) - parseInt(poster.price.replace(/[^\d]/g, ''))) / 1000).toLocaleString('vi-VN')}k
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-4">
                  <button className="flex-1 bg-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-orange-600 transition">
                    Mua ngay
                  </button>
                  <button className="flex-1 border-2 border-orange-500 text-orange-500 py-4 rounded-xl font-semibold text-lg hover:bg-orange-500 hover:text-white transition">
                    Xem 3D
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Trending Categories Banner
const TrendingCategoriesBanner = () => {
  const categories = [
    {
      name: "Laptop Gaming",
      count: "50+ sản phẩm",
      trending: "+25% tuần này",
      icon: "🎮",
      color: "from-green-500 to-emerald-600",
      image: "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg"
    },
    {
      name: "Smartphone 5G",
      count: "80+ sản phẩm", 
      trending: "+40% tuần này",
      icon: "📱",
      color: "from-blue-500 to-cyan-600",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwzfHxlbGVjdHJvbmljc3xlbnwwfHx8fDE3NDkwNTQwMzR8MA&ixlib=rb-4.1.0&q=85"
    },
    {
      name: "Audio Premium",
      count: "30+ sản phẩm",
      trending: "+15% tuần này", 
      icon: "🎧",
      color: "from-purple-500 to-pink-600",
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwyfHx0ZWNofGVufDB8fHx8MTc0OTA1NDAyOHww&ixlib=rb-4.1.0&q=85"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-3 rounded-full font-semibold text-lg">
            🔥 TRENDING NOW
          </span>
          <h2 className="text-4xl font-bold text-white mt-6 mb-4">
            Danh mục thịnh hành
          </h2>
          <p className="text-xl text-gray-300">
            Những sản phẩm được tìm kiếm nhiều nhất tuần này
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className="relative group cursor-pointer transform hover:scale-105 transition-all duration-500"
            >
              <div className="relative h-64 rounded-2xl overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-85`}></div>
                
                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                  <div className="flex justify-between items-start">
                    <div className="text-4xl">{category.icon}</div>
                    <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                      Trending
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                    <p className="opacity-90 mb-1">{category.count}</p>
                    <p className="text-yellow-300 font-semibold text-sm">
                      📈 {category.trending}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-12 py-4 rounded-xl text-xl font-semibold hover:from-orange-600 hover:to-red-600 transition shadow-2xl">
            Khám phá tất cả danh mục →
          </button>
        </div>
      </div>
    </section>
  );
};

// Homepage Component
const Homepage = () => {
  const [selectedProduct, setSelectedProduct] = useState('laptop');
  const [selectedColor, setSelectedColor] = useState('#FF4500');
  const [isRotating, setIsRotating] = useState(true);
  const [products, setProducts] = useState([]);

  const heroProducts = [
    { id: 'laptop', name: 'MacBook Pro M3', price: '29.999.000₫', image: 'laptop' },
    { id: 'phone', name: 'iPhone 15 Pro', price: '26.999.000₫', image: 'phone' },
    { id: 'headphones', name: 'AirPods Pro', price: '5.999.000₫', image: 'headphones' },
    { id: 'watch', name: 'Apple Watch', price: '8.999.000₫', image: 'watch' }
  ];

  const categories = [
    { name: 'Laptop', icon: '💻', count: '150+', color: 'from-blue-500 to-purple-600' },
    { name: 'Smartphone', icon: '📱', count: '200+', color: 'from-green-500 to-teal-600' },
    { name: 'Audio', icon: '🎧', count: '80+', color: 'from-orange-500 to-red-600' },
    { name: 'Wearable', icon: '⌚', count: '60+', color: 'from-pink-500 to-rose-600' }
  ];

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API}/products?featured=true&limit=8`);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-red-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-white z-10">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Trải nghiệm
                <span className="block text-yellow-300">3D Shopping</span>
                <span className="block text-sm font-normal mt-4 text-orange-100">
                  Công nghệ tương lai - Mua sắm thông minh
                </span>
              </h1>
              <p className="text-xl mb-8 text-orange-100 leading-relaxed">
                Khám phá sản phẩm công nghệ với trải nghiệm 3D tuyệt vời. 
                Xoay, phóng to và tương tác với sản phẩm như thật.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-white text-orange-500 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition shadow-lg">
                  Khám phá ngay 🚀
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-orange-500 transition">
                  Xem demo 3D
                </button>
              </div>
            </div>

            {/* 3D Showcase */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 border border-white border-opacity-20">
              <div className="h-96 bg-gradient-to-br from-white to-gray-100 rounded-2xl overflow-hidden">
                <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
                  <ambientLight intensity={0.6} />
                  <directionalLight position={[10, 10, 5]} intensity={1} />
                  <pointLight position={[-10, -10, -5]} intensity={0.5} />
                  
                  <Product3D 
                    productType={selectedProduct}
                    color={selectedColor}
                    rotation={isRotating}
                    scale={1.2}
                  />
                  
                  <OrbitControls 
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={3}
                    maxDistance={15}
                  />
                  
                  <Environment preset="studio" />
                </Canvas>
              </div>
              
              {/* Hero Product Switcher */}
              <div className="grid grid-cols-4 gap-3 mt-6">
                {heroProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product.id)}
                    className={`p-3 rounded-xl transition ${
                      selectedProduct === product.id
                        ? 'bg-white text-orange-500 shadow-lg'
                        : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                    }`}
                  >
                    <div className="text-sm font-medium">{product.name}</div>
                    <div className="text-xs opacity-75">{product.price}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Banners */}
      <PromotionalBanners />

      {/* Categories Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Danh mục sản phẩm
            </h2>
            <p className="text-xl text-gray-600">
              Khám phá bộ sưu tập công nghệ đa dạng với trải nghiệm 3D
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <div key={index} className="group cursor-pointer">
                <div className={`bg-gradient-to-br ${category.color} rounded-2xl p-8 text-white text-center transform group-hover:scale-105 transition-all duration-300 shadow-xl`}>
                  <div className="text-6xl mb-4">{category.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <p className="text-lg opacity-90">{category.count} sản phẩm</p>
                  <button className="mt-4 bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-2 rounded-lg transition">
                    Khám phá →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Posters */}
      <ProductPosters />

      {/* Trending Categories Banner */}
      <TrendingCategoriesBanner />

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Sản phẩm nổi bật
            </h2>
            <p className="text-xl text-gray-600">
              Những sản phẩm được yêu thích nhất với công nghệ 3D
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group">
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 group-hover:scale-110 transition-transform duration-500">
                    <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
                      <ambientLight intensity={0.6} />
                      <directionalLight position={[5, 5, 5]} intensity={1} />
                      <Product3D 
                        productType={product.product_type}
                        color={product.colors?.[0] || '#FF4500'}
                        rotation={true}
                        scale={0.8}
                      />
                      <OrbitControls enableZoom={false} enablePan={false} />
                    </Canvas>
                  </div>
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    3D
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-orange-500">
                      {product.price?.toLocaleString('vi-VN')}₫
                    </span>
                    <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition">
                      Xem 3D
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white shadow-lg border border-orange-100">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Giao hàng nhanh</h3>
              <p className="text-gray-600">Giao hàng trong 2 giờ tại TP.HCM và Hà Nội. Miễn phí vận chuyển toàn quốc.</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white shadow-lg border border-orange-100">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Bảo hành uy tín</h3>
              <p className="text-gray-600">Bảo hành chính hãng, hỗ trợ kỹ thuật 24/7. Đổi trả trong 30 ngày.</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white shadow-lg border border-orange-100">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">💳</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Thanh toán an toàn</h3>
              <p className="text-gray-600">Hỗ trợ nhiều hình thức thanh toán: ATM, Visa, MasterCard, VNPay, MoMo.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Category Page Component
const CategoryPage = ({ category = 'all' }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    priceRange: [0, 50000000],
    brands: [],
    colors: [],
    sortBy: 'name'
  });
  const [showFilters, setShowFilters] = useState(false);

  const categoryMappings = {
    'laptop': { name: 'Laptop', icon: '💻', category: 'Laptop' },
    'smartphone': { name: 'Smartphone', icon: '📱', category: 'Smartphone' },
    'audio': { name: 'Audio', icon: '🎧', category: 'Audio' },
    'wearable': { name: 'Wearable', icon: '⌚', category: 'Wearable' }
  };

  const currentCategory = categoryMappings[category] || { name: 'Tất cả sản phẩm', icon: '🛍️', category: null };

  const brands = ['Apple', 'Samsung', 'Sony', 'Bose', 'Garmin', 'Xiaomi'];
  const availableColors = [
    { name: 'Đen', value: '#222222' },
    { name: 'Trắng', value: '#FFFFFF' },
    { name: 'Bạc', value: '#C0C0C0' },
    { name: 'Vàng', value: '#FFD700' },
    { name: 'Xanh', value: '#0066CC' },
    { name: 'Đỏ', value: '#CC0000' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Tên A-Z' },
    { value: 'price_asc', label: 'Giá thấp đến cao' },
    { value: 'price_desc', label: 'Giá cao đến thấp' },
    { value: 'newest', label: 'Mới nhất' },
    { value: 'popular', label: 'Phổ biến nhất' }
  ];

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = currentCategory.category 
          ? `${API}/products?category=${currentCategory.category}`
          : `${API}/products`;
        const response = await axios.get(url);
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  // Apply filters
  useEffect(() => {
    let filtered = [...products];

    // Price filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter(product =>
        filters.brands.some(brand => product.name.includes(brand))
      );
    }

    // Color filter
    if (filters.colors.length > 0) {
      filtered = filtered.filter(product =>
        product.colors && product.colors.some(color =>
          filters.colors.includes(color)
        )
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [products, filters]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleBrandFilter = (brand) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }));
  };

  const toggleColorFilter = (color) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 50000000],
      brands: [],
      colors: [],
      sortBy: 'name'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">{currentCategory.icon}</div>
            <h1 className="text-4xl font-bold mb-4">{currentCategory.name}</h1>
            <p className="text-xl opacity-90">
              Khám phá bộ sưu tập {currentCategory.name.toLowerCase()} với công nghệ 3D
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Bộ lọc</h3>
                <button
                  onClick={clearFilters}
                  className="text-orange-500 hover:text-orange-600 font-medium"
                >
                  Xóa tất cả
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Khoảng giá</h4>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="50000000"
                    value={filters.priceRange[1]}
                    onChange={(e) => updateFilter('priceRange', [0, parseInt(e.target.value)])}
                    className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>0₫</span>
                    <span className="font-semibold text-orange-500">
                      {filters.priceRange[1].toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Thương hiệu</h4>
                <div className="space-y-3">
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand)}
                        onChange={() => toggleBrandFilter(brand)}
                        className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-orange-500 transition">
                        {brand}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Màu sắc</h4>
                <div className="grid grid-cols-3 gap-3">
                  {availableColors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => toggleColorFilter(color.value)}
                      className={`p-3 rounded-lg border-2 transition ${
                        filters.colors.includes(color.value)
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div 
                        className="w-6 h-6 rounded-full mx-auto mb-1 border border-gray-200"
                        style={{ backgroundColor: color.value }}
                      ></div>
                      <span className="text-xs font-medium">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort & Results Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {filteredProducts.length} sản phẩm
                  </h2>
                  <p className="text-gray-600">
                    {currentCategory.name} - Trải nghiệm 3D tuyệt vời
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 font-medium">Sắp xếp:</span>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                    {/* 3D Preview */}
                    <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                      <div className="absolute inset-0 group-hover:scale-110 transition-transform duration-500">
                        <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
                          <ambientLight intensity={0.6} />
                          <directionalLight position={[5, 5, 5]} intensity={1} />
                          <Product3D 
                            productType={product.product_type}
                            color={product.colors?.[0] || '#FF4500'}
                            rotation={true}
                            scale={0.8}
                          />
                          <OrbitControls enableZoom={false} enablePan={false} />
                        </Canvas>
                      </div>
                      
                      {/* Product badges */}
                      <div className="absolute top-4 right-4 space-y-2">
                        <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          3D
                        </div>
                        {product.featured && (
                          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            HOT
                          </div>
                        )}
                      </div>

                      {/* Quick actions */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex space-x-2">
                          <button className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          <button className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {product.description}
                        </p>
                      </div>

                      {/* Colors */}
                      {product.colors && product.colors.length > 0 && (
                        <div className="flex items-center space-x-2 mb-4">
                          <span className="text-sm text-gray-500">Màu:</span>
                          {product.colors.slice(0, 4).map((color, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                              style={{ backgroundColor: color }}
                            ></div>
                          ))}
                          {product.colors.length > 4 && (
                            <span className="text-sm text-gray-500">+{product.colors.length - 4}</span>
                          )}
                        </div>
                      )}

                      {/* Price & Actions */}
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-2xl font-bold text-orange-500">
                            {product.price?.toLocaleString('vi-VN')}₫
                          </span>
                          {product.stock > 0 ? (
                            <p className="text-green-600 text-sm">Còn hàng ({product.stock})</p>
                          ) : (
                            <p className="text-red-600 text-sm">Hết hàng</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition">
                            Xem 3D
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-600 mb-6">
                  Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Detail Page Component
const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#FF4500');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isRotating, setIsRotating] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // If no productId, use first sample product
        if (!productId) {
          const response = await axios.get(`${API}/products?limit=1`);
          setProduct(response.data[0]);
          if (response.data[0]?.colors?.[0]) {
            setSelectedColor(response.data[0].colors[0]);
          }
        } else {
          const response = await axios.get(`${API}/products/${productId}`);
          setProduct(response.data);
          if (response.data?.colors?.[0]) {
            setSelectedColor(response.data.colors[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId') || 'guest_' + Date.now();
      localStorage.setItem('sessionId', sessionId);
      
      await axios.post(`${API}/cart/${sessionId}/items`, {
        product_id: product.id,
        quantity: quantity,
        selected_color: selectedColor
      });
      
      alert('Đã thêm sản phẩm vào giỏ hàng!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Có lỗi xảy ra khi thêm vào giỏ hàng!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sản phẩm</h2>
          <a href="/" className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition">
            Về trang chủ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <a href="/" className="hover:text-orange-500 transition">Trang chủ</a>
          <span>›</span>
          <a href={`/category/${product.category?.toLowerCase()}`} className="hover:text-orange-500 transition">
            {product.category}
          </a>
          <span>›</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* 3D Product Viewer */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-orange-100">
              <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden mb-6">
                <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
                  <ambientLight intensity={0.6} />
                  <directionalLight position={[10, 10, 5]} intensity={1} />
                  <pointLight position={[-10, -10, -5]} intensity={0.5} />
                  
                  <Product3D 
                    productType={product.product_type}
                    color={selectedColor}
                    rotation={isRotating}
                    scale={1.2}
                  />
                  
                  <OrbitControls 
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={3}
                    maxDistance={15}
                  />
                  
                  <Environment preset="studio" />
                </Canvas>
              </div>

              {/* 3D Controls */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Điều khiển 3D:</span>
                <button
                  onClick={() => setIsRotating(!isRotating)}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    isRotating 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isRotating ? 'Dừng xoay' : 'Tự động xoay'}
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">✨ Tính năng 3D</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-500">🔄</span>
                  </div>
                  <span className="text-gray-700">Xoay 360°</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-500">🔍</span>
                  </div>
                  <span className="text-gray-700">Phóng to</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-500">🎨</span>
                  </div>
                  <span className="text-gray-700">Đổi màu</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-500">📱</span>
                  </div>
                  <span className="text-gray-700">Tương thích</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {product.category}
                  </span>
                  {product.featured && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      HOT
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                <p className="text-xl text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Pricing */}
              <div className="mb-8">
                <div className="flex items-baseline space-x-4">
                  <span className="text-5xl font-bold text-orange-500">
                    {product.price?.toLocaleString('vi-VN')}₫
                  </span>
                  <span className="text-xl text-gray-400 line-through">
                    {(product.price * 1.2)?.toLocaleString('vi-VN')}₫
                  </span>
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                    Tiết kiệm 20%
                  </span>
                </div>
                <p className="text-green-600 font-semibold mt-2">
                  {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                </p>
              </div>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn màu sắc:</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {product.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        className={`p-4 rounded-xl border-2 transition ${
                          selectedColor === color
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div 
                          className="w-8 h-8 rounded-full mx-auto mb-2 border-2 border-white shadow-md"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-sm font-medium">Màu {index + 1}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Số lượng:</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 bg-gray-200 rounded-lg hover:bg-gray-300 transition flex items-center justify-center text-xl font-bold"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold text-gray-900 min-w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 bg-gray-200 rounded-lg hover:bg-gray-300 transition flex items-center justify-center text-xl font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-orange-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                </button>
                <button className="w-full border-2 border-orange-500 text-orange-500 py-4 rounded-xl font-semibold text-lg hover:bg-orange-500 hover:text-white transition">
                  Mua ngay
                </button>
              </div>
            </div>

            {/* Product Specifications */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Thông số kỹ thuật</h3>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Danh mục:</span>
                  <span className="font-semibold text-gray-900">{product.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Loại sản phẩm:</span>
                  <span className="font-semibold text-gray-900">{product.product_type}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Màu sắc:</span>
                  <span className="font-semibold text-gray-900">{product.colors?.length || 0} màu</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Bảo hành:</span>
                  <span className="font-semibold text-gray-900">12 tháng</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Xuất xứ:</span>
                  <span className="font-semibold text-gray-900">Chính hãng</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Sản phẩm liên quan</h2>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔄</div>
            <p className="text-gray-600">Đang tải sản phẩm liên quan...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Shopping Cart Page Component
const ShoppingCartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        let currentSessionId = localStorage.getItem('sessionId');
        if (!currentSessionId) {
          currentSessionId = 'guest_' + Date.now();
          localStorage.setItem('sessionId', currentSessionId);
        }
        setSessionId(currentSessionId);
        
        const response = await axios.get(`${API}/cart/${currentSessionId}`);
        setCart(response.data);
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`${API}/cart/${sessionId}/items/${itemId}`);
      // Refresh cart
      const response = await axios.get(`${API}/cart/${sessionId}`);
      setCart(response.data);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${API}/cart/${sessionId}`);
      // Refresh cart
      const response = await axios.get(`${API}/cart/${sessionId}`);
      setCart(response.data);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Giỏ hàng của bạn</h1>
          <p className="text-xl text-gray-600">
            {cart?.items?.length || 0} sản phẩm trong giỏ hàng
          </p>
        </div>

        {cart?.items?.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-6">
              Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
            </p>
            <a
              href="/"
              className="bg-orange-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-600 transition"
            >
              Tiếp tục mua sắm
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart?.items?.map((item, index) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center space-x-6">
                    {/* Product 3D Preview */}
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
                      <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
                        <ambientLight intensity={0.6} />
                        <directionalLight position={[5, 5, 5]} intensity={1} />
                        <Product3D 
                          productType="laptop" // You'd fetch the actual product type
                          color={item.selected_color}
                          rotation={true}
                          scale={0.6}
                        />
                        <OrbitControls enableZoom={false} enablePan={false} />
                      </Canvas>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Sản phẩm #{item.product_id}
                      </h3>
                      <p className="text-gray-600 mb-2">Màu đã chọn:</p>
                      <div className="flex items-center space-x-2 mb-2">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                          style={{ backgroundColor: item.selected_color }}
                        ></div>
                        <span className="text-sm text-gray-600">{item.selected_color}</span>
                      </div>
                      <p className="text-lg font-semibold text-orange-500">
                        Số lượng: {item.quantity}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="text-right">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-600 transition mb-4"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart */}
              <div className="text-center">
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-600 transition font-medium"
                >
                  Xóa tất cả sản phẩm
                </button>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-8 h-fit">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-semibold">0₫</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giảm giá:</span>
                  <span className="font-semibold text-red-500">-0₫</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl">
                    <span className="font-bold text-gray-900">Tổng cộng:</span>
                    <span className="font-bold text-orange-500">0₫</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-orange-600 transition">
                  Thanh toán
                </button>
                <button className="w-full border-2 border-orange-500 text-orange-500 py-3 rounded-xl font-semibold hover:bg-orange-500 hover:text-white transition">
                  Tiếp tục mua sắm
                </button>
              </div>

              {/* Security */}
              <div className="mt-8 pt-8 border-t">
                <div className="flex items-center space-x-3 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-medium">Thanh toán an toàn & bảo mật</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrapper component to pass category parameter
const CategoryPageWrapper = () => {
  const { category } = useParams();
  return <CategoryPage category={category} />;
};

export default App;