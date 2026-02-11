import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../../environments/environment';

export interface WebVitalsMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  timestamp: number;
}

export interface PerformanceMetrics {
  memoryUsage?: any;
  networkInfo?: any;
  deviceInfo?: any;
  webVitals?: WebVitalsMetrics;
  customMetrics?: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  constructor(private platform: Platform) {
    this.initializePerformanceMonitoring();
  }

  private initializePerformanceMonitoring(): void {
    if (!environment.features.performanceMonitoring) {
      console.log('Performance monitoring is disabled');
      return;
    }

    if (this.platform.is('capacitor')) {
      this.initializeNativePerformanceMonitoring();
    } else {
      this.initializeWebPerformanceMonitoring();
    }
  }

  private initializeNativePerformanceMonitoring(): void {
    // For native platforms, we'll use basic performance APIs
    this.isMonitoring = true;
    this.collectBasicMetrics();
    
    // Set up periodic collection
    setInterval(() => {
      this.collectBasicMetrics();
    }, 30000); // Every 30 seconds
  }

  private initializeWebPerformanceMonitoring(): void {
    if (!this.isPerformanceAPIAvailable()) {
      console.warn('Performance APIs not available');
      return;
    }

    this.isMonitoring = true;
    this.setupWebVitalsMonitoring();
    this.collectBasicMetrics();
    
    // Set up periodic collection
    setInterval(() => {
      this.collectBasicMetrics();
    }, 30000); // Every 30 seconds
  }

  private isPerformanceAPIAvailable(): boolean {
    return 'performance' in window && 
           'measure' in window.performance && 
           'getEntriesByType' in window.performance;
  }

  private setupWebVitalsMonitoring(): void {
    // Largest Contentful Paint (LCP)
    this.observePerformanceEntry('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      this.metrics.webVitals = {
        ...this.metrics.webVitals,
        lcp: lastEntry.startTime,
        timestamp: Date.now()
      };
    });

    // First Input Delay (FID)
    this.observePerformanceEntry('first-input', (entries) => {
      const firstEntry = entries[0] as any;
      if (firstEntry && firstEntry.processingStart) {
        this.metrics.webVitals = {
          ...this.metrics.webVitals,
          fid: firstEntry.processingStart - firstEntry.startTime,
          timestamp: Date.now()
        };
      }
    });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    this.observePerformanceEntry('layout-shift', (entries) => {
      entries.forEach(entry => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      });
      
      this.metrics.webVitals = {
        ...this.metrics.webVitals,
        cls: clsValue,
        timestamp: Date.now()
      };
    });

    // First Contentful Paint (FCP)
    this.observePerformanceEntry('paint', (entries) => {
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.metrics.webVitals = {
          ...this.metrics.webVitals,
          fcp: fcpEntry.startTime,
          timestamp: Date.now()
        };
      }
    });

    // Time to First Byte (TTFB)
    this.observePerformanceEntry('navigation', (entries) => {
      const navEntry = entries[0] as PerformanceNavigationTiming;
      if (navEntry) {
        this.metrics.webVitals = {
          ...this.metrics.webVitals,
          ttfb: navEntry.responseStart - navEntry.requestStart,
          timestamp: Date.now()
        };
      }
    });
  }

  private observePerformanceEntry(type: string, callback: (entries: PerformanceEntryList) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }

  private collectBasicMetrics(): void {
    // Memory usage (web only)
    if ('memory' in performance) {
      this.metrics.memoryUsage = (performance as any).memory;
    }

    // Network information
    if ('connection' in navigator) {
      this.metrics.networkInfo = (navigator as any).connection;
    }

    // Device information
    this.metrics.deviceInfo = {
      platform: Capacitor.getPlatform(),
      userAgent: navigator.userAgent,
      screenWidth: screen.width,
      screenHeight: screen.height,
      pixelRatio: window.devicePixelRatio,
      isNative: Capacitor.isNativePlatform()
    };
  }

  // Public API methods

  getCurrentMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  measureCustomMetric(name: string, duration: number): void {
    if (!this.isMonitoring) return;

    if (!this.metrics.customMetrics) {
      this.metrics.customMetrics = {};
    }
    
    this.metrics.customMetrics[name] = duration;
  }

  startTiming(operation: string): () => void {
    if (!this.isMonitoring) {
      return () => {}; // No-op
    }

    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.measureCustomMetric(operation, duration);
    };
  }

  measureFunction<T>(operation: string, fn: () => T): T {
    if (!this.isMonitoring) {
      return fn();
    }

    const endTiming = this.startTiming(operation);
    try {
      const result = fn();
      endTiming();
      return result;
    } catch (error) {
      endTiming();
      throw error;
    }
  }

  async measureAsyncFunction<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    if (!this.isMonitoring) {
      return fn();
    }

    const endTiming = this.startTiming(operation);
    try {
      const result = await fn();
      endTiming();
      return result;
    } catch (error) {
      endTiming();
      throw error;
    }
  }

  // Page load performance
  getPageLoadMetrics(): any {
    if (!this.isPerformanceAPIAvailable()) {
      return null;
    }

    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart,
      loadComplete: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
      totalTime: navigationEntry.loadEventEnd - navigationEntry.fetchStart,
      domInteractive: navigationEntry.domInteractive - navigationEntry.fetchStart,
      firstPaint: this.getFirstPaint(),
      firstContentfulPaint: this.getFirstContentfulPaint()
    };
  }

  private getFirstPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  private getFirstContentfulPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  }

  // Resource timing
  getResourceMetrics(): any[] {
    if (!this.isPerformanceAPIAvailable()) {
      return [];
    }

    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    return resourceEntries.map(entry => ({
      name: entry.name,
      duration: entry.duration,
      size: entry.transferSize,
      type: this.getResourceType(entry.name),
      cached: entry.transferSize === 0 && entry.decodedBodySize > 0
    }));
  }

  private getResourceType(url: string): string {
    if (url.match(/\.(css)$/)) return 'css';
    if (url.match(/\.(js)$/)) return 'javascript';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  // Performance scoring
  getPerformanceScore(): number {
    if (!this.metrics.webVitals) {
      return 0;
    }

    const { lcp, fid, cls, fcp } = this.metrics.webVitals;
    
    let score = 0;
    let factors = 0;

    // LCP scoring (good: <2.5s, needs improvement: 2.5s-4s, poor: >4s)
    if (lcp) {
      if (lcp < 2500) score += 100;
      else if (lcp < 4000) score += 50;
      else score += 0;
      factors++;
    }

    // FID scoring (good: <100ms, needs improvement: 100ms-300ms, poor: >300ms)
    if (fid) {
      if (fid < 100) score += 100;
      else if (fid < 300) score += 50;
      else score += 0;
      factors++;
    }

    // CLS scoring (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
    if (cls) {
      if (cls < 0.1) score += 100;
      else if (cls < 0.25) score += 50;
      else score += 0;
      factors++;
    }

    // FCP scoring (good: <1.8s, needs improvement: 1.8s-3s, poor: >3s)
    if (fcp) {
      if (fcp < 1800) score += 100;
      else if (fcp < 3000) score += 50;
      else score += 0;
      factors++;
    }

    return factors > 0 ? Math.round(score / factors) : 0;
  }

  // Export metrics
  exportMetrics(): string {
    const exportData = {
      timestamp: Date.now(),
      metrics: this.metrics,
      pageLoadMetrics: this.getPageLoadMetrics(),
      resourceMetrics: this.getResourceMetrics(),
      performanceScore: this.getPerformanceScore(),
      userAgent: navigator.userAgent,
      platform: Capacitor.getPlatform()
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Cleanup
  stopMonitoring(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isMonitoring = false;
  }

  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  // Debug method to get current state
  debugInfo(): any {
    return {
      isMonitoring: this.isMonitoring,
      observersCount: this.observers.length,
      currentMetrics: this.metrics,
      performanceAPIAvailable: this.isPerformanceAPIAvailable(),
      platform: Capacitor.getPlatform()
    };
  }
}
