/*
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
*/
'use strict';

const documentLoader = require('./document-loader');
const fs = require('fs-extra');
const getStdin = require('get-stdin');
const vc = require('vc-js');
const {Ed25519KeyPair, suites: {Ed25519Signature2018}} =
  require('jsonld-signatures');
const EcdsaSepc256k1Signature2019 = require('ecdsa-secp256k1-signature-2019');
const Secp256k1KeyPair = require('secp256k1-key-pair');

exports.issue = async cmd => {
  let result;
  try {

    let keyDoc;
    try {
      const keyFile = await fs.readFile(`./key-file/${cmd.key}`);
      keyDoc = JSON.parse(keyFile.toString());
    } catch(e) {
      throw new Error(`Could not read the key file: ${cmd.key}`);
    }

    let credential;
    try {
      credential = JSON.parse(await getStdin());
    } catch(e) {
      throw new Error('Invalid credential.');
    }

    const {controller: issuer, type} = keyDoc;

    let suite;
    switch(type) {
      case 'EcdsaSecp256k1VerificationKey2019':
        suite = new EcdsaSepc256k1Signature2019(
          {key: new Secp256k1KeyPair(keyDoc)});
        break;
      case 'Ed25519VerificationKey2018':
        suite = new Ed25519Signature2018({key: new Ed25519KeyPair(keyDoc)});
        break;
      default:
        throw new Error(`Unknown key type ${type}.`);
    }

    credential.issuer = issuer;
    result = await vc.issue({
      credential,
      suite,
      documentLoader,
    });
  } catch(e) {
    console.error('Error:', e);
    process.exit(1);
  }
  console.log(JSON.stringify(result, null, 2));
};

exports.verify = async () => {
  try {
    const credential = JSON.parse(await getStdin());
    const result = await vc.verify({
      credential,
      suite: [new Ed25519Signature2018(), new EcdsaSepc256k1Signature2019()],
      documentLoader,
    });
    if(result.verified === false) {
      // result can include raw Error
      console.log(JSON.stringify(result, null, 2));
      process.exit(1);
    }
  } catch(e) {
    console.log(JSON.stringify({verified: false, error: e}, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({verified: true}, null, 2));
  process.exit(0);
};
