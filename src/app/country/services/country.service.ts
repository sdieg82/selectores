import { Injectable } from '@angular/core';
import { Country, Region, smallCountry } from '../interfaces/country.interfaces';
import { HttpClient } from '@angular/common/http';
import { combineLatest, map, Observable, of, tap } from 'rxjs';

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

  getCountryByAc(alphaCode:string):Observable<smallCountry>{
    console.log({alphaCode})
    const url:string=`${this.baseUrl}/alpha/${alphaCode}?flieds=cca3,name,borders`;
    return this.http.get<Country>(url)
    .pipe(
      map(country=>({
        name:country.name.common,
        cca3:country.cca3,
        borders:country.borders ?? []
      }))
    )

  }

  getCountryBordersByCodes( borders: string[] ): Observable<smallCountry[]> {
    if ( !borders || borders.length === 0 ) return of([]);

    const countriesRequests:Observable<smallCountry>[]  = [];

    borders.forEach( code => {
      const request = this.getCountryByAc( code );
      countriesRequests.push( request );
    });


    return combineLatest( countriesRequests );
  }

}
