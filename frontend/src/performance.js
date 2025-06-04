/**
 * Frontend Performance Optimization Utilities
 * Provides lazy loading, image optimization, and caching for React components
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Image optimization hook with WebP support and lazy loading
export const useOptimizedImage = (src, options = {}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const imgRef = useRef();
  
  const {
    fallbackSrc = null,
    quality = 85,
    format = 'webp',
    enableLazyLoading = true,
    threshold = 0.1
  } = options;

  // Check if WebP is supported
  const supportsWebP = useCallback(() => {
    return new Promise((resolve) => {
      const webp = new Image();
      webp.onload = webp.onerror = () => {
        resolve(webp.height === 2);
      };
      webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }, []);

  // Optimize image URL
  const getOptimizedImageUrl = useCallback((originalSrc) => {
    if (!originalSrc) return null;
    
    // If it's a data URL or external URL, return as is
    if (originalSrc.startsWith('data:') || originalSrc.startsWith('http')) {
      return originalSrc;
    }
    
    // For Unsplash images, add optimization parameters
    if (originalSrc.includes('unsplash.com')) {
      const url = new URL(originalSrc);
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('q', quality);
      
      if (format === 'webp') {
        url.searchParams.set('fm', 'webp');
      }
      
      return url.toString();
    }
    
    return originalSrc;
  }, [quality, format]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!enableLazyLoading || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadImage();
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, enableLazyLoading, threshold]);

  // Load image function
  const loadImage = useCallback(async () => {
    if (!src) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const optimizedSrc = getOptimizedImageUrl(src);
      
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(optimizedSrc);
        setIsLoading(false);
      };
      
      img.onerror = () => {
        if (fallbackSrc) {
          setImageSrc(fallbackSrc);
        } else {
          setError('Failed to load image');
        }
        setIsLoading(false);
      };
      
      img.src = optimizedSrc;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }, [src, fallbackSrc, getOptimizedImageUrl]);

  // Load immediately if lazy loading is disabled
  useEffect(() => {
    if (!enableLazyLoading) {
      loadImage();
    }
  }, [enableLazyLoading, loadImage]);

  return {
    src: imageSrc,
    isLoading,
    error,
    ref: imgRef
  };
};

// API response caching hook
export const useApiCache = (key, fetchFn, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default TTL
    enableCache = true
  } = options;

  const getCacheKey = useCallback((key) => `api_cache_${key}`, []);

  const getCachedData = useCallback((cacheKey) => {
    if (!enableCache) return null;
    
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        
        if (now - timestamp < ttl) {
          return data;
        } else {
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (err) {
      console.warn('Cache read error:', err);
    }
    
    return null;
  }, [enableCache, ttl]);

  const setCachedData = useCallback((cacheKey, data) => {
    if (!enableCache) return;
    
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (err) {
      console.warn('Cache write error:', err);
    }
  }, [enableCache]);

  const fetchData = useCallback(async () => {
    const cacheKey = getCacheKey(key);
    
    // Try cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return cachedData;
    }

    // Fetch fresh data
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      setCachedData(cacheKey, result);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, [key, fetchFn, getCacheKey, getCachedData, setCachedData]);

  const invalidateCache = useCallback(() => {
    const cacheKey = getCacheKey(key);
    localStorage.removeItem(cacheKey);
  }, [key, getCacheKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidateCache
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    // Monitor page load performance
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0];
      
      if (navigation) {
        setMetrics(prev => ({
          ...prev,
          loadTime: navigation.loadEventEnd - navigation.loadEventStart
        }));
      }

      // Monitor memory usage (Chrome only)
      if (performance.memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: performance.memory.usedJSHeapSize / (1024 * 1024) // MB
        }));
      }
    }
  }, []);

  const measureRenderTime = useCallback((componentName) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
      
      setMetrics(prev => ({
        ...prev,
        renderTime: renderTime
      }));
    };
  }, []);

  return {
    metrics,
    measureRenderTime
  };
};

// Debounced search hook for performance
export const useDebouncedSearch = (searchFn, delay = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef();

  const debouncedSearch = useCallback((term) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (term.trim()) {
        setLoading(true);
        try {
          const results = await searchFn(term);
          setResults(results);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, delay);
  }, [searchFn, delay]);

  useEffect(() => {
    debouncedSearch(searchTerm);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm, debouncedSearch]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading
  };
};

export default {
  useOptimizedImage,
  useApiCache,
  usePerformanceMonitor,
  useDebouncedSearch
};