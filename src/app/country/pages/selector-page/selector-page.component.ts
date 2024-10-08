import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountryService } from '../../services/country.service';
import { Region, smallCountry } from '../../interfaces/country.interfaces';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
 
})
export class SelectorPageComponent implements OnInit {
  
  public countriesByRegion:smallCountry[]=[]
  public borders:smallCountry[]=[];
  myform:FormGroup;
  constructor(
    private fb:FormBuilder,
    private countryService:CountryService,
    
    ){
    this.myform=this.fb.group({
      region:['',Validators.required],
      country:['',Validators.required],
      border:['',Validators.required],
    })

  }
  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }
  get regions():Region[]{
    return this.countryService.regions
  }

  onRegionChanged():void{
    this.myform.get('region')!.valueChanges
    .pipe(
      tap(()=>this.myform.get('country')!.setValue('')),
      tap( () => this.borders = [] ),
      switchMap(region=>this.countryService.getCountriesByRegion(region))
    )
    .subscribe(countries=>{
      this.countriesByRegion=countries;
    }

    )
  }

  onCountryChanged(): void {
    this.myform.get('country')!.valueChanges
      .pipe(
        tap(() => this.myform.get('border')!.setValue('')), // Limpiar fronteras al cambiar el país
        filter((value: string) => value.length > 0), // Solo continuar si hay un valor
        switchMap((alphaCode) => this.countryService.getCountryByAc(alphaCode)),
        switchMap((response) => {
          // Si la respuesta es un array, tomamos el primer país
          const country = Array.isArray(response) ? response[0] : response;
          return this.countryService.getCountryBordersByCodes(country.borders);
        })
      )
      .subscribe(countries => {
        this.borders = countries; // Actualizar las fronteras
      });
  }
  
}
