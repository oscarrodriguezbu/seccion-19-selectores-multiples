import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Country, Region, SmallCountry } from '../interfaces/country.interfaces';
import { Observable, combineLatest, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseUrl: string = 'https://restcountries.com/v3.1';

  private _regions: Region[] = [ Region.Africa, Region.Americas, Region.Asia, Region.Europe, Region.Oceania ];

  constructor(
    private http: HttpClient
  ) { }

  get regions(): Region[] {
    return [ ...this._regions ];
  }

  getCountriesByRegion( region: Region ): Observable<SmallCountry[]> {
    if ( !region ) return of([]); //of transforma en un observable

    const url: string = `${ this.baseUrl }/region/${ region }?fields=cca3,name,borders`;

    return this.http.get<Country[]>(url)
      .pipe(
        map( countries => countries.map( country => ({ //regresa los valores que se quieren de la peticion
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? [] //expresion de covalencia nula es mas seguro que colocar || para cuando puede llegar un valor nulo
        }))),
      )
  }

  getCountryByAlphaCode( alphaCode: string ): Observable<SmallCountry> {
    const url = `${ this.baseUrl }/alpha/${ alphaCode }?fields=cca3,name,borders`;
    return this.http.get<Country>( url )
      .pipe(
        map( country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? [],
        }))
      )
  }

  getCountryBordersByCodes( borders: string[] ): Observable<SmallCountry[]> {
    if ( !borders || borders.length === 0 ) return of([]);

    const countriesRequests:Observable<SmallCountry>[]  = [];

    borders.forEach( code => {
      const request = this.getCountryByAlphaCode( code );
      countriesRequests.push( request );
    });


    return combineLatest( countriesRequests );
    //combineLatest viene de rxjs, el cual emite hasta que cuando los observables que se le mande
    //como orgumento emitan un valor y todos se disparan de manera simultanea
  }


}
