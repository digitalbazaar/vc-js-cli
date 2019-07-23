/*
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
*/
'use strict';

const program = require('commander');
const {api, key} = require('./lib');

program
  .command('keygen')
  .alias('k')
  .description('Generate a public/private key pair.')
  .option('-g, --git-hub-token <gitHubToken>',
    'GitHub personal access token used to store public key/controller data.')
  .option('-t, --key-type <keyType>',
    'Key type to generate. [ed25519|secp256k1]', 'ed25519')
  .action(key.generate)
  .on('--help', () => {
    console.log();
    console.log('  Examples: ');
    console.log();
    console.log('    $ vc-js-cli -g <GITHUB_TOKEN>');
    console.log('    $ vc-js-cli -g <GITHUB_TOKEN> -t secp256k1');
    console.log();
  });

program
  .command('issue')
  .alias('i')
  .description('issue a credential')
  .option('-k, --key <key-file>')
  .action(api.issue)
  .on('--help', () => {
    console.log();
    console.log('  Examples: ');
    console.log();
    console.log('    $ vc-js issue ... < cred.jsonld');
    console.log();
  });

program
  .command('verify')
  .alias('v')
  .description('verify a credential')
  .action(api.verify)
  .on('--help', () => {
    console.log();
    console.log('  Examples: ');
    console.log();
    console.log('    $ vc-js verify ... < signed-cred.jsonld');
    console.log();
  });

program.parse(process.argv);
