import { Injectable } from '@angular/core';
import { Country, Region, smallCountry } from '../interfaces/country.interfaces';
import { HttpClient } from '@angular/common/http';
import { combineLatest, forkJoin, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  private baseUrl:string="https://restcountries.com/v3.1"

  private _region:Region[]=[Region.Asia,Region.Africa,Region.Americas,Region.Europe,Region.Oceania]
  constructor(
    private http:HttpClient
  ) { }

  get regions():Region[]{
    return[...this._region];
  }

  getCountriesByRegion(region:Region):Observable<smallCountry[]>{
    if(!region) return of([]);
    const url:string=`${this.baseUrl}/region/${region}?flieds=cca3,name,borders`

    return this.http.get<Country[]>(url)
    .pipe(
      map(countries=>
          countries.map(country=>({
          name:country.name.common,
          cca3:country.cca3,
          borders:country.borders ?? []
        }))
      ),
    );
  }

  getCountryByAc(alphaCode: string): Observable<smallCountry | smallCountry[]> {
    const url: string = `${this.baseUrl}/alpha/${alphaCode}?fields=cca3,name,borders`;
    
    return this.http.get<Country | Country[]>(url).pipe(
      map(response => {
        if (Array.isArray(response)) {
          // Si es un array, mapeamos cada país
          return response.map(country => ({
            name: country.name.common,
            cca3: country.cca3,
            borders: country.borders ?? []
          }));
        } else {
          // Si es un solo país, devolvemos un objeto de tipo smallCountry
          return {
            name: response.name.common,
            cca3: response.cca3,
            borders: response.borders ?? []
          };
        }
      })
    );
  }
  
  

  getCountryBordersByCodes(borders: string[]): Observable<smallCountry[]> {
    if (!borders || borders.length === 0) return of([]);
  
    const countriesRequests: Observable<smallCountry | smallCountry[]>[] = borders.map(code => this.getCountryByAc(code));
  
    return forkJoin(countriesRequests).pipe(
      map(results => {
        // results es un array de respuestas que pueden ser un array o un solo país
        return results.flatMap(result => Array.isArray(result) ? result : [result]);
      })
    );
  }
  

}
