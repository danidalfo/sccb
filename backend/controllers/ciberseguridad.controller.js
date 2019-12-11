'use strict'
const bigintCryptoUtils = require('bigint-crypto-utils');
const crypto = require('crypto');

const ciberseguridadCtrl = {};

let text = {
    "text1": "Hola mundo",
    "text2": "Es una prueba de un get"
}


/************************/
/******* Metodo 1 *******/
/************************/
//Clave simetrica

const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function encrypt(data) {
    let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { encryptedData: encrypted.toString('hex') };
}



//Enviamos con el cifrado de clave simetrica el mensaje encriptado, la key i el iv
ciberseguridadCtrl.getText1 = async (req,res) => {
    let send = {};
    var ex = encrypt(text['text1']); 
    send['text'] = ex['encryptedData'];
    send['iv'] = iv.toString('hex');
    send['password'] = key.toString('hex');

    res.json(send);
}


/************************/
/******* Metodo 2 *******/
/************************/
//RSA

let e, d, n; //Clave pública i privada Backend
let eFrontend, nFrontend; //clave pública Frontend

async function generateKeyRSA(){
    let p = await bigintCryptoUtils.prime(1024);
    let q = await bigintCryptoUtils.prime(1025);
    let r = BigInt('1');
    n = p * q;
    let phi_n = (p-r)*(q-r);
    e = BigInt('65537');
    d = bigintCryptoUtils.modInv(e, phi_n);
}

async function encryptRSAtoFrontend(data) {
    let buffer = Buffer.from(data, 'utf8'); 
    let bi = BigInt('0x' + buffer.toString('hex'));
    let c = bigintCryptoUtils.modPow(bi,eFrontend,nFrontend);
        
    return c;
}

//Enviamos la clave pública del Backend
ciberseguridadCtrl.getPublicKey = async(req,res) => {
    //genero la clave publica y privada del backend
    await generateKeyRSA();

    //Recuperamos la clave pública del Frontend
    let eBody = req.body['eFrontend'];
    let nBody = req.body['nFrontend'];
    eFrontend = BigInt('0x' + eBody);
    nFrontend = BigInt('0x' + nBody);
    //Enviamos nuestra clave pública del Backend al Frontend
    let eBackend = e.toString(16);
    let nBackend = n.toString(16);

    res.send({'eBackend': eBackend, 'nBackend': nBackend});
}

//Enviamos el texto encriptado con RSA
ciberseguridadCtrl.getText2 = async (req, res) => {
    let send = {};
    let c = await encryptRSAtoFrontend(text['text2']);
    send['text'] = c.toString(16);

    res.json(send);
}


/************************/
/******* Metodo 3 *******/
/************************/
//Firma ciega
ciberseguridadCtrl.signedBlinded = async (req, res) => {
    let blinded_m = BigInt('0x' + req.body.blinded_m);
    let send = {};
    let signed_blinded_m = bigintCryptoUtils.modPow(blinded_m, d, n);
    send['signed_blinded_m'] = signed_blinded_m.toString(16);
    res.json(send);
}




module.exports = ciberseguridadCtrl;