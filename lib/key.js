/*
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
*/
'use strict';

const {Ed25519KeyPair} = require('jsonld-signatures');
const Gist = require('./Gist');
const Secp256k1KeyPair = require('secp256k1-key-pair');

exports.generate = async cmd => {
  let k;
  switch(cmd.keyType) {
    case 'ed25519':
      k = await Ed25519KeyPair.generate();
      break;
    case 'secp256k1':
      k = await Secp256k1KeyPair.generate();
      break;
    default:
      throw new Error(`Unknown key type: "${cmd.keyType}".`);
  }

  const {gitHubToken} = cmd;
  if(!gitHubToken) {
    throw new Error('A GitHub token is required.');
  }

  const controllerGist = new Gist({gitHubToken});
  const keyGist = new Gist({gitHubToken});

  // initialize blank documents for controller and key
  await Promise.all([
    controllerGist.create({filename: 'creator.json', content: {}}),
    keyGist.create({filename: 'key.json', content: {}}),
  ]);

  const publicKeyDoc = Object.assign(k.publicNode(), {
    '@context': 'https://w3id.org/security/v2',
    id: keyGist.rawUrl,
    controller: controllerGist.rawUrl
  });
  const controllerDoc = {
    '@context': 'https://w3id.org/security/v2',
    id: controllerGist.rawUrl,
    assertionMethod: [keyGist.rawUrl]
  };
  // update controller and key documents
  await Promise.all([
    controllerGist.update({content: controllerDoc}),
    keyGist.update({content: publicKeyDoc}),
  ]);

  console.log(JSON.stringify(Object.assign(k, {
    id: keyGist.rawUrl,
    controller: controllerGist.rawUrl,
  }), null, 2));
};
