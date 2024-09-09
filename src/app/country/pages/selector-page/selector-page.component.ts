import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountryService } from '../../services/country.service';
import { Region, smallCountry } from '../../interfaces/country.interfaces';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
 
})
export class SelectorPageComponent implements OnInit {
  
  public countriesByRegion:smallCountry[]=[]
  myform:FormGroup;
  constructor(
    private fb:FormBuilder,
    private countryService:CountryService,
    
    ){
    this.myform=this.fb.group({
      region:['',Validators.required],
      contry:['',Validators.required],
      borders:['',Validators.required],
    })

  }
  ngOnInit(): void {
    this.onRegionChanged();
  }
  get regions():Region[]{
    return this.countryService.regions
  }

  onRegionChanged(){
    this.myform.get('region')!.valueChanges
    .pipe(
      switchMap(region=>this.countryService.getCountriesByRegion(region))
    )
    .subscribe(countries=>{
      this.countriesByRegion=countries;
    }

    )
  }
}
