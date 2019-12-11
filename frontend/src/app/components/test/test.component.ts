import { Component, OnInit } from '@angular/core';
import {TestService} from "../../services/test.service";
import { NgForm } from '@angular/forms';
import { FormGroup } from '../../models/formGroup';
import * as bigintCryptoUtils from 'bigint-crypto-utils';
import * as arrToString from 'arraybuffer-to-string';
// @ts-ignore
import * as hexToArrayBuffer from 'hex-to-array-buffer';
import { from } from 'rxjs';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
  providers : [TestService]
})
export class TestComponent implements OnInit {

  text1: String = '';
  text2: String = '';
  text3: String = '';
  text4: String = '';
  iv;
  eFrontend;dFrontend;nFrontend; //clave pública y privada del Frontend
  eBackend; nBackend; // clave pública del Backend


  constructor( private testService: TestService) {

  }

  ngOnInit() {
    this.getInit(); //enviamos nuestra clave pública y recibimos la clave pública del backend
  }


  /************************/
  /******* Metodo 1 *******/
  /************************/
  //Clave simetrica

  //importa la key y desencrypta
  _decrypt(key, iv, data) {
    return self.crypto.subtle.importKey(
      "raw",
      key,
      {
          name: "AES-CBC",
          length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    ).then(function(key2){
      return self.crypto.subtle.decrypt(
        {
          name: "AES-CBC",
          length: 256,
          iv: iv, //The initialization vector you used to encrypt
       },
        key2, //from generateKey or importKey above
        data, //ArrayBuffer of the data
      )
      .then(function(decrypted){
        //returns an ArrayBuffer containing the decrypted data
        //console.log(new Uint8Array(decrypted));
        var string = new TextDecoder("utf-8").decode(new Uint8Array(decrypted));
        console.log('-------------------');
        console.log(string);
        return string;
      });
    });
  }

  async getText1() {
    this.testService.getText1()
      .subscribe(res => {
        //esta devolviendo una promesa
        this._decrypt(hexToArrayBuffer(res['password']),hexToArrayBuffer(res['iv']), hexToArrayBuffer(res['text']))
        .then( value => {
          this.text1 = value;
        });
      });
  }

  /************************/
  /******* Metodo 2 *******/
  /************************/
  //RSA

  async getInit() {
    let p = await bigintCryptoUtils.prime(1024);
    let q = await bigintCryptoUtils.prime(1025);
    let r = BigInt('1');
    this.nFrontend = p * q;
    let phi_n = (p-r)*(q-r);
    this.eFrontend = BigInt('65537');
    this.dFrontend = bigintCryptoUtils.modInv(this.eFrontend, phi_n);

    this.testService.sendPublicKey({"eFrontend":this.eFrontend.toString(16), "nFrontend": this.nFrontend.toString(16)})
      .subscribe(res => {
        let nB = res['nBackend']; // esto esta en hexadecimal
        let eB = res['eBackend'];
        this.nBackend = BigInt('0x' + nB);
        this.eBackend = BigInt('0x' + eB);
    });
  }

  async getText2() {
    this.testService.getText2()
      .subscribe(res => {

        let textcifrado = res['text'];
        textcifrado = BigInt('0x' + textcifrado);
        let textBigInt = bigintCryptoUtils.modPow(textcifrado,this.dFrontend,this.nFrontend);
        let hex = textBigInt.toString(16);
        let buf = hexToArrayBuffer(hex);
        this.text2 = arrToString(buf);
      });
  }

  /************************/
  /******* Metodo 3 *******/
  /************************/
  //Firma ciega

  resetForm(form?: NgForm) {
    if (form) {
      form.reset();
      this.testService.selectedForm = new FormGroup();
    }
  }

  //Añade lo que tiene el form, guardar para el referendum
  enviarTexto(form?: NgForm) {
    let m = BigInt(form.value.text);
    //let m = BigInt('55');
    let r = bigintCryptoUtils.randBetween(this.nBackend);
    let blinded_m = ( m * bigintCryptoUtils.modPow(r, this.eBackend, this.nBackend) ) % this.nBackend;
    let blinded_m_to_string= blinded_m.toString(16);
    this.testService.signedBlinded({'blinded_m': blinded_m_to_string})
      .subscribe(res => {
        let signed_blinded_m = BigInt('0x' + res['signed_blinded_m']);
        //verificar el mensaje no ha sido modificado
        let signed_m = ( signed_blinded_m * bigintCryptoUtils.modInv(r, this.nBackend) ) % this.nBackend ; // A
        let verified = (bigintCryptoUtils.modPow(signed_m, this.eBackend, this.nBackend) == m);  // A.    m2 debe ser = m
        this.text3 = res['signed_blinded_m'];
        this.text4 = verified.toString();
      });
  }



  /************************/
  /******* Metodo 4 *******/
  /************************/
  //No repudio

  /************************/
  /******* Metodo 5 *******/
  /************************/
  //Paillier




}
