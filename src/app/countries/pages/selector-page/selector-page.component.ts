import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter, switchMap, tap } from 'rxjs';

import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit {

  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] = [];

  public myForm: FormGroup = this.fb.group({
    region : ['', Validators.required ],
    country: ['', Validators.required ],
    border : ['', Validators.required ],
  });


  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService,
  ) {}

  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }

  get regions(): Region[] {
    return this.countriesService.regions;
  }


  onRegionChanged(): void {
    this.myForm.get('region')!.valueChanges
      .pipe(
        // los tapos son para Limpieza de campos para cuando cambie la region
        tap( () => this.myForm.get('country')!.setValue('') ), //rxjs efecto secundario
        tap( () => this.borders = [] ), //rxjs efecto secundario
        switchMap( (region) => this.countriesService.getCountriesByRegion(region) ), //rxjs tiene el valor anterior y manda ese valor a otro
      )
      .subscribe( countries => {
        this.countriesByRegion = countries;
      });
  }

  onCountryChanged(): void {
    this.myForm.get('country')!.valueChanges
    .pipe(
      tap( () => this.myForm.get('border')!.setValue('') ),
      filter( (value: string) => value.length > 0 ), //rxjs true, continua y falso termina
      switchMap( (alphaCode) => this.countriesService.getCountryByAlphaCode(alphaCode) ),
      switchMap( (country) => this.countriesService.getCountryBordersByCodes( country.borders ) ),
    )
    .subscribe( countries => {
      this.borders = countries;
    });
  }


}
