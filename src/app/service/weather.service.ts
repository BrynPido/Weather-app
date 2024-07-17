import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, throwError  } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private baseUrl = 'http://localhost/weather-app/api/';
  private cache: { [city: string]: BehaviorSubject<any> } = {};

  constructor(private http: HttpClient) {}

  fetchWeather(city: string): Observable<any> {
    const url = `${this.baseUrl}weather/${city}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }
  
  searchWeather(city: string): Observable<any> {
    const url = `${this.baseUrl}weather/${city}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }

  clearCache(city: string) {
    if (this.cache[city]) {
      this.cache[city].complete();
      delete this.cache[city];
    }
  }
  
  searchWeatherByLocation(city: string): Observable<any> {
    if (!this.cache[city]) {
      this.cache[city] = new BehaviorSubject<any>(null);
      this.fetchWeather(city).subscribe(
        (data) => this.cache[city].next(data),
        (error) => console.error('Error fetching weather data:', error)
      );
    }
    return this.cache[city].asObservable();
  }

  searchWeatherByCoords(latitude: number, longitude: number): Observable<any> {
    console.log(`Searching weather by coords: ${latitude}, ${longitude}`);
    const url = `${this.baseUrl}weather-lat-lon/${latitude}/${longitude}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }


  handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Server-side error: ${error.status} ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
