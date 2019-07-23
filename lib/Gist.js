/*
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
*/
'use strict';

const axios = require('axios');

class Gist {
  constructor({gitHubToken, timeout = 5000}) {
    this.axiosInstance = axios.create({
      baseURL: 'https://api.github.com',
      headers: {Authorization: `token ${gitHubToken}`},
      timeout,
    });
    this.filename = null;
    this.url = null;
    this.fullRawUrl = null;
  }

  get rawUrl() {
    // remove the commit hash from the full raw url
    const index = nthIndex(this.fullRawUrl, '/', 5);
    return `${this.fullRawUrl.substr(0, index)}/raw`;
  }

  async create({filename, content}) {
    let result;
    try {
      result = await this.axiosInstance.post('/gists', {
        public: false,
        files: {
          [filename]: {
            content: JSON.stringify(content, null, 2)
          }
        }
      });
    } catch(e) {
      throw new Error('Error creating gist', e);
    }
    this.filename = filename;
    this.url = result.data.url;
    this.fullRawUrl = result.data.files[filename].raw_url;
  }

  async update({content}) {
    if(!this.filename) {
      throw new Error('Gist has not been created.');
    }
    let result;
    try {
      result = await this.axiosInstance.post(this.url, {
        public: false,
        files: {
          [this.filename]: {
            content: JSON.stringify(content, null, 2)
          }
        }
      });
    } catch(e) {
      throw new Error('Error updating gist', e);
    }
    this.fullRawUrl = result.data.files[this.filename].raw_url;
  }
}

function nthIndex(str, pat, n) {
  const L = str.length;
  let i = -1;
  while(n-- && i++ < L) {
    i = str.indexOf(pat, i);
    if(i < 0) {
      break;
    }
  }
  return i;
}

module.exports = Gist;
