import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WeatherService } from '../service/weather.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  [x: string]: any;
  selectedTemperatureUnit: string = 'celsius';
  subscriptions: any = [];
  futureData: any;
  future: any;
  searchForm!: FormGroup;
  weather: any;
  forecast: any = [];
  currentCity: string = 'Manila';
  selectedCity: string = 'any';
  selectedDataToShow: string = 'heatIndex';
  weatherGif: any
  isRainy!: boolean;
  isSunny!: boolean;
  cityNotFound: boolean = false; // Flag to indicate if city not found

  constructor(
    private fb: FormBuilder,
    private weatherService: WeatherService
  ) {}

  ngOnInit() {
    this.searchForm = this.fb.group({
      city: ['', Validators.required]
    });

    this.searchWeatherForCity(this.currentCity);
  }

  searchWeatherForCity(city: string) {
    // Replace spaces with underscores
    const formattedCity = city.replace(/\s+/g, '_');
    const encodedCity = encodeURIComponent(formattedCity);
    
    this.weatherService.searchWeather(encodedCity).subscribe(
      (resp) => {
        console.log('Weather API response:', resp, city);
        if (resp && resp.forecast && resp.forecast.forecastday) {
          this.weather = resp;
          this.currentCity = city;
          this.forecast = resp.forecast.forecastday;
          this.updateWeatherGif();  // Update GIF based on weather condition
          this.cityNotFound = false; // Reset city not found flag
        } else {
          console.error('Invalid API response format:', resp);
          this.cityNotFound = true; // Set city not found flag
        }
      },
      (error) => {
        console.error('Error fetching weather data:', error);
        this.cityNotFound = true; // Set city not found flag
      }
    );
  }
  
  searchWeather() {
    const city = this.searchForm.get('city')!.value;
    console.log('Searching weather for:', city);
    if (city) {
      this.searchWeatherForCity(city);
    }
  }  
  
  toggleErrorDialog() {
    this.cityNotFound = false; // Close the error dialog
  }

  showLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          
          console.log('Latitude:', latitude);
          console.log('Longitude:', longitude);
          
          this.weatherService.searchWeatherByCoords(latitude, longitude).subscribe(
            (resp) => {
              console.log('Weather API response:', resp);
              
              if (resp && resp.location && resp.location.name && resp.forecast && resp.forecast.forecastday) {
                this.weather = resp;
                this.currentCity = resp.location.name;
                this.forecast = resp.forecast.forecastday;
                this.updateWeatherGif();  // Update GIF based on weather condition
                this.cityNotFound = false; // Reset city not found flag
              } else {
                console.error('Invalid API response format:', resp);
                alert('Invalid API response format. Please try again later.');
                this.cityNotFound = true; // Set city not found flag
              }
            },
            (error) => {
              console.error('Error fetching weather data:', error);
              alert('Error fetching weather data. Please try again later.');
              this.cityNotFound = true; // Set city not found flag
            }
          );
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Error getting your location. Please check your browser settings.');
          this.cityNotFound = true; // Set city not found flag
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      alert('Geolocation is not supported by this browser.');
      this.cityNotFound = true; // Set city not found flag
    }
  }  

  updateWeatherGif() {
    const condition = this.weather.current.condition.text.toLowerCase();
    const rainyConditions = ['rain', 'drizzle', 'thunderstorm', 'shower'];
    this.isRainy = rainyConditions.some(rainCondition => condition.includes(rainCondition));
    this.weatherGif = this.isRainy ? '../../assets/KeepSafe.gif' : '../../assets/HotDay.gif';
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub: { unsubscribe: () => any; }) => sub.unsubscribe());
    Object.keys(this.weatherService['cache']).forEach(city => {
      this.weatherService['clearCache'](city);
    });
  }
}