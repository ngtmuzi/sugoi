/**
 * Created by ngtmuzi on 2017/6/7.
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const lodash = require('lodash');

const nRouter         = require('../lib/nRouter');
const reject          = nRouter.reject;
const getConfigByPath = require('../lib/getConfigByPath');

let layers = require(path.join(__dirname, '../configLayers.json'));

module.exports = nRouter({
  getFullWebConfig,
  saveWebConfig,
  'getWebConfig/*': getWebConfig
});

async function getWebConfig(msg, headers, ctx) {
  const paths = ctx.url.split('/').filter(Boolean).slice(1);

  return getConfigByPath(layers, paths);
}

async function getFullWebConfig(msg, headers, ctx) {
  return layers;
}

async function saveWebConfig(msg) {
  layers = msg.configLayers;
  fs.writeFileSync(path.join(__dirname, '../configLayers.json'), JSON.stringify(layers, null, 2));
  return 'ok';
}
