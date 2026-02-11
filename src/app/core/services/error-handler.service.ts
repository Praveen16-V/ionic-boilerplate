import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

export interface ApiError {
  message: string;
  status: number;
  error?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    let apiError: ApiError = {
      message: errorMessage,
      status: 0,
      error: error
    };

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
      apiError.message = errorMessage;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Bad Request: Invalid data provided';
          break;
        case 401:
          errorMessage = 'Unauthorized: Please login again';
          this.handleUnauthorized();
          break;
        case 403:
          errorMessage = 'Forbidden: You don\'t have permission to access this resource';
          break;
        case 404:
          errorMessage = 'Not Found: The requested resource does not exist';
          break;
        case 422:
          errorMessage = 'Validation Error: Please check your input';
          if (error.error && error.error.errors) {
            errorMessage = this.formatValidationErrors(error.error.errors);
          }
          break;
        case 429:
          errorMessage = 'Too Many Requests: Please try again later';
          break;
        case 500:
          errorMessage = 'Internal Server Error: Please try again later';
          break;
        case 503:
          errorMessage = 'Service Unavailable: The server is temporarily down';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
      
      apiError = {
        message: errorMessage,
        status: error.status,
        error: error.error
      };
    }

    console.error('API Error:', apiError);
    return new Observable(observer => {
      observer.error(apiError);
      observer.complete();
    });
  }

  private handleUnauthorized(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private formatValidationErrors(errors: any): string {
    if (typeof errors === 'string') {
      return errors;
    }
    
    if (Array.isArray(errors)) {
      return errors.join(', ');
    }
    
    if (typeof errors === 'object') {
      return Object.values(errors).flat().join(', ');
    }
    
    return 'Validation failed';
  }

  logError(message: string, error?: any): void {
    console.error(`[ErrorHandler] ${message}`, error);
  }

  logWarning(message: string): void {
    console.warn(`[ErrorHandler] ${message}`);
  }

  logInfo(message: string): void {
    console.info(`[ErrorHandler] ${message}`);
  }
}
