import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { FormGroup } from '../models/formGroup';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  readonly URL_API = 'http://localhost:3000';
  readonly URL_Server = 'http://localhost:3001';

  selectedForm: FormGroup;

  constructor(private http: HttpClient) { 
    this.selectedForm = new FormGroup();
  }
  

  //metodo1
  getText1() {
    return this.http.get(this.URL_API + "/text1");
  }
  //metodo2
  getText2() {
    return this.http.get(this.URL_API + "/text2");
  }
  sendPublicKey(publicKey){
    return this.http.post(this.URL_API + "/publicKey", publicKey);
  }
  //metodo3
  signedBlinded(blinded_m){
    return this.http.post(this.URL_API + '/signedBlinded', blinded_m);
  }
  //metodo4

  //metodo5

/*
  getReferendums(){
    return this.http.get(this.URL_API + '/referendums');
  }

  getReferendum(id: string){
    return this.http.get(this.URL_API + '/referendum/:id');
  }

  deleteReferendum(id: string) {
    return this.http.delete(this.URL_API + `/referendum/${id}`);
  }


  postReferendum(formGroup: FormGroup){
    return this.http.post(this.URL_API + '/referendum', formGroup);
  }
  */
}
