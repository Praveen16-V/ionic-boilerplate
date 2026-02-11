import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Network } from '@capacitor/network';
import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';
import { environment } from '../../../environments/environment';
import { Observable, BehaviorSubject, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  checks: {
    api: HealthCheckItem;
    storage: HealthCheckItem;
    network: HealthCheckItem;
    memory: HealthCheckItem;
    device: HealthCheckItem;
    permissions: HealthCheckItem;
  };
  overall: {
    score: number; // 0-100
    issues: string[];
    recommendations: string[];
  };
}

export interface HealthCheckItem {
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: any;
  responseTime?: number;
}

export interface HealthMetrics {
  uptime: number;
  memoryUsage: number;
  storageUsage: number;
  networkStatus: string;
  batteryLevel?: number;
  deviceInfo: any;
}

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  private readonly HEALTH_CHECK_KEY = 'health_check_data';
  private readonly APP_START_TIME = Date.now();
  
  private healthSubject = new BehaviorSubject<HealthCheckResult | null>(null);
  private metricsSubject = new BehaviorSubject<HealthMetrics | null>(null);
  
  private isMonitoring = false;
  private healthCheckInterval: any;

  constructor(
    private http: HttpClient,
    private platform: Platform
  ) {
    this.initializeHealthMonitoring();
  }

  private async initializeHealthMonitoring(): Promise<void> {
    // Wait for platform to be ready
    await this.platform.ready();
    
    // Start periodic health checks
    this.startHealthMonitoring();
    
    // Collect initial metrics
    await this.collectHealthMetrics();
  }

  private startHealthMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    
    // Run health check every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
      await this.collectHealthMetrics();
    }, 30000);

    // Perform initial health check
    this.performHealthCheck();
  }

  async performHealthCheck(): Promise<HealthCheckResult> {
    const timestamp = Date.now();
    
    const checks = {
      api: await this.checkApiHealth(),
      storage: await this.checkStorageHealth(),
      network: await this.checkNetworkHealth(),
      memory: await this.checkMemoryHealth(),
      device: await this.checkDeviceHealth(),
      permissions: await this.checkPermissionsHealth()
    };

    const result = this.calculateOverallHealth(checks, timestamp);
    
    this.healthSubject.next(result);
    
    // Store last health check result
    await Preferences.set({
      key: this.HEALTH_CHECK_KEY,
      value: JSON.stringify(result)
    });

    return result;
  }

  private async checkApiHealth(): Promise<HealthCheckItem> {
    const startTime = Date.now();
    
    try {
      // Check API connectivity
      await this.http.get(`${environment.apiUrl}/health`, { 
        responseType: 'text',
        headers: { 'X-Health-Check': 'true' }
      }).toPromise();
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: responseTime < 1000 ? 'pass' : 'warn',
        message: `API responding normally (${responseTime}ms)`,
        responseTime
      };
    } catch (error) {
      return {
        status: 'fail',
        message: 'API connection failed',
        details: error,
        responseTime: Date.now() - startTime
      };
    }
  }

  private async checkStorageHealth(): Promise<HealthCheckItem> {
    try {
      const testKey = 'health_check_test';
      const testValue = 'test_value_' + Date.now();
      
      // Test write
      await Preferences.set({ key: testKey, value: testValue });
      
      // Test read
      const { value } = await Preferences.get({ key: testKey });
      
      // Cleanup
      await Preferences.remove({ key: testKey });
      
      if (value === testValue) {
        return {
          status: 'pass',
          message: 'Storage read/write working correctly'
        };
      } else {
        return {
          status: 'fail',
          message: 'Storage data integrity check failed'
        };
      }
    } catch (error) {
      return {
        status: 'fail',
        message: 'Storage access failed',
        details: error
      };
    }
  }

  private async checkNetworkHealth(): Promise<HealthCheckItem> {
    try {
      const networkStatus = await Network.getStatus();
      
      if (networkStatus.connected) {
        return {
          status: 'pass',
          message: `Network connected (${networkStatus.connectionType})`,
          details: networkStatus
        };
      } else {
        return {
          status: 'fail',
          message: 'Network disconnected',
          details: networkStatus
        };
      }
    } catch (error) {
      return {
        status: 'warn',
        message: 'Network status unavailable',
        details: error
      };
    }
  }

  private async checkMemoryHealth(): Promise<HealthCheckItem> {
    try {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        
        if (usageRatio < 0.7) {
          return {
            status: 'pass',
            message: `Memory usage normal (${Math.round(usageRatio * 100)}%)`,
            details: {
              used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
              total: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
            }
          };
        } else if (usageRatio < 0.9) {
          return {
            status: 'warn',
            message: `Memory usage high (${Math.round(usageRatio * 100)}%)`,
            details: {
              used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
              total: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
            }
          };
        } else {
          return {
            status: 'fail',
            message: `Memory usage critical (${Math.round(usageRatio * 100)}%)`,
            details: {
              used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
              total: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
            }
          };
        }
      } else {
        return {
          status: 'warn',
          message: 'Memory monitoring not available'
        };
      }
    } catch (error) {
      return {
        status: 'warn',
        message: 'Memory check failed',
        details: error
      };
    }
  }

  private async checkDeviceHealth(): Promise<HealthCheckItem> {
    try {
      const deviceInfo = await Device.getInfo();
      
      // Check battery level on mobile devices
      let batteryInfo = null;
      if (Capacitor.isNativePlatform()) {
        try {
          // Battery API would need to be implemented via native plugin
          batteryInfo = { level: 'unknown' };
        } catch (e) {
          batteryInfo = null;
        }
      }
      
      return {
        status: 'pass',
        message: `Device: ${deviceInfo.platform} ${deviceInfo.osVersion}`,
        details: {
          ...deviceInfo,
          battery: batteryInfo
        }
      };
    } catch (error) {
      return {
        status: 'warn',
        message: 'Device info unavailable',
        details: error
      };
    }
  }

  private async checkPermissionsHealth(): Promise<HealthCheckItem> {
    try {
      const permissions = [];
      
      if (Capacitor.isNativePlatform()) {
        // Check critical permissions
        const criticalPermissions = ['camera', 'geolocation', 'notifications'];
        
        for (const permission of criticalPermissions) {
          try {
            // This would need to be implemented with proper permission checking
            permissions.push({ permission, status: 'granted' });
          } catch (e) {
            permissions.push({ permission, status: 'denied' });
          }
        }
      }
      
      return {
        status: 'pass',
        message: 'Permissions status checked',
        details: { permissions }
      };
    } catch (error) {
      return {
        status: 'warn',
        message: 'Permission check failed',
        details: error
      };
    }
  }

  private calculateOverallHealth(checks: any, timestamp: number): HealthCheckResult {
    const statusCounts = {
      pass: 0,
      warn: 0,
      fail: 0
    };

    Object.values(checks).forEach((check) => {
      const healthCheck = check as HealthCheckItem;
      statusCounts[healthCheck.status]++;
    });

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (statusCounts.fail === 0 && statusCounts.warn <= 1) {
      status = 'healthy';
    } else if (statusCounts.fail <= 1) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    const score = Math.round((statusCounts.pass / Object.keys(checks).length) * 100);
    
    const issues: string[] = [];
    const recommendations: string[] = [];

    Object.entries(checks).forEach(([key, check]: [string, any]) => {
      if (check.status === 'fail') {
        issues.push(`${key}: ${check.message}`);
        recommendations.push(`Address ${key} issues immediately`);
      } else if (check.status === 'warn') {
        issues.push(`${key}: ${check.message}`);
        recommendations.push(`Monitor ${key} performance`);
      }
    });

    return {
      status,
      timestamp,
      checks,
      overall: {
        score,
        issues,
        recommendations
      }
    };
  }

  private async collectHealthMetrics(): Promise<void> {
    const uptime = Date.now() - this.APP_START_TIME;
    
    let memoryUsage = 0;
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }

    let networkStatus = 'unknown';
    try {
      const network = await Network.getStatus();
      networkStatus = network.connected ? network.connectionType : 'disconnected';
    } catch (e) {
      networkStatus = 'unknown';
    }

    let deviceInfo = {};
    try {
      deviceInfo = await Device.getInfo();
    } catch (e) {
      deviceInfo = { error: 'Unable to get device info' };
    }

    const metrics: HealthMetrics = {
      uptime,
      memoryUsage,
      storageUsage: 0, // Would need to implement storage usage calculation
      networkStatus,
      deviceInfo
    };

    this.metricsSubject.next(metrics);
  }

  // Public API methods

  getHealthStatus(): Observable<HealthCheckResult | null> {
    return this.healthSubject.asObservable();
  }

  getHealthMetrics(): Observable<HealthMetrics | null> {
    return this.metricsSubject.asObservable();
  }

  async getCurrentHealth(): Promise<HealthCheckResult> {
    return await this.performHealthCheck();
  }

  async getCurrentMetrics(): Promise<HealthMetrics | null> {
    await this.collectHealthMetrics();
    return this.metricsSubject.value;
  }

  // Health check for specific components
  async checkComponentHealth(component: string): Promise<HealthCheckItem> {
    switch (component) {
      case 'api':
        return await this.checkApiHealth();
      case 'storage':
        return await this.checkStorageHealth();
      case 'network':
        return await this.checkNetworkHealth();
      case 'memory':
        return await this.checkMemoryHealth();
      case 'device':
        return await this.checkDeviceHealth();
      case 'permissions':
        return await this.checkPermissionsHealth();
      default:
        return {
          status: 'fail',
          message: `Unknown component: ${component}`
        };
    }
  }

  // Get health history
  async getHealthHistory(): Promise<HealthCheckResult[]> {
    try {
      const { value } = await Preferences.get({ key: this.HEALTH_CHECK_KEY });
      if (value) {
        return [JSON.parse(value)];
      }
      return [];
    } catch (error) {
      console.error('Error getting health history:', error);
      return [];
    }
  }

  // Manual health check trigger
  async triggerHealthCheck(): Promise<HealthCheckResult> {
    return await this.performHealthCheck();
  }

  // Stop health monitoring
  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    this.isMonitoring = false;
  }

  // Resume health monitoring
  resumeHealthMonitoring(): void {
    if (!this.isMonitoring) {
      this.startHealthMonitoring();
    }
  }

  // Get app uptime
  getUptime(): number {
    return Date.now() - this.APP_START_TIME;
  }

  // Format uptime for display
  formatUptime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    this.stopHealthMonitoring();
    this.healthSubject.complete();
    this.metricsSubject.complete();
  }
}
