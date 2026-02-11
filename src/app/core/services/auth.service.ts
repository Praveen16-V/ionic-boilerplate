import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, LoginResponse, RegisterRequest } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenKey = 'auth_token';
  private userKey = 'current_user';

  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userStr = localStorage.getItem(this.userKey);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.clearStorage();
      }
    }
  }

  login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).toPromise()
      .then(response => {
        if (response && response.user && response.token) {
          this.setToken(response.token);
          this.setCurrentUser(response.user);
          return response;
        }
        throw new Error('Invalid response from server');
      })
      .catch(error => {
        this.clearStorage();
        this.currentUserSubject.next(null);
        throw error;
      });
  }

  register(userData: RegisterRequest): Promise<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/register`, userData).toPromise()
      .then(response => {
        if (response && response.user && response.token) {
          this.setToken(response.token);
          this.setCurrentUser(response.user);
          return response;
        }
        throw new Error('Invalid response from server');
      })
      .catch(error => {
        this.clearStorage();
        this.currentUserSubject.next(null);
        throw error;
      });
  }

  refreshToken(): Observable<string> {
    // Refresh token is handled via HTTP-only cookie by the backend
    return this.http.post<{token: string}>(`${environment.apiUrl}/auth/refresh`, {})
      .pipe(
        map(response => {
          if (response && response.token) {
            this.setToken(response.token);
            return response.token;
          }
          throw new Error('Failed to refresh token');
        }),
        catchError(error => {
          this.logout();
          throw error;
        })
      );
  }

  logout(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private clearStorage(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
