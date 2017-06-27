/**
 * Created by ngtmuzi on 2017/6/7.
 */
'use strict';

const fs = require('fs');

const lodash = require('lodash');

const nRouter = require('../lib/nRouter');
const reject  = nRouter.reject;
let layers    = [
  {
    name : 'project',
    desc : '项目',
    items: {
      wnt: {
        desc  : 'WNT!',
        config: {a: 1}
      }
    }
  },

  {
    name : 'env',
    desc : '环境',
    items: {
      production: {
        desc  : '生产环境',
        config: {}
      },
      test      : {
        desc  : '测试环境',
        config: {b: 1}
      }
    }
  },

  {
    name : 'cluster',
    desc : '集群',
    items: {
      wnt1: {
        desc  : 'wnt1!',
        config: {wntCode: 'wnt1'}
      }
    }
  },

  {
    name : 'module',
    desc : '模块',
    items: {
      ping: {
        config: {c: 1}
      }
    }
  }
];

module.exports = nRouter({
  getFullWebConfig,
  saveWebConfig,
  'getWebConfig/*': getWebConfig
});

console.log(getConfigByPath(layers, ['wnt', 'wnt1', 'ping']));

function getConfigByPath(layers = [], paths = []) {
  let l          = 0;
  let matchItems = [];
  let result     = {};

  for (let p = 0; p < paths.length; p++) {
    while (l < layers.length) {

      let _config = lodash.get(layers, [l++, 'items', paths[p], 'config']);

//      let _s_configs = permutations(matchItems.concat(paths[p]), ':')
//        .map(path => lodash.get(layers, [l, 'items', path, 'config']))
//        .filter(lodash.isPlainObject);

      if (lodash.isPlainObject(_config)) {

        matchItems.push(paths[p]);
        lodash.mergeWith(result, _config, mergeFn);
//        _s_configs.forEach(_s_config => lodash.mergeWith(result, _s_config, mergeFn));
        break;

      }
    }
  }

  return result;
}

/**
 * 合并配置的额外处理函数
 * @param target
 * @param source
 * @return {*}
 */
function mergeFn(target, source) {
  if (lodash.isArray(target) || lodash.isArray(source)) {  //不合并数组，直接覆盖
    return source;
  }
}

///**
// * 排列组合，不指定分隔符则返回数组
// * @param array
// * @param separator
// */
//function permutations(array = [], separator) {
//  if (array.length <= 1)return array;
//
//  const top    = [array.shift()];
//  const subArr = permutations(array);
//  const result = [top].concat(subArr.map(a => (top.concat(a)))).concat(subArr);
//
//  return separator === undefined ? result : result.map(a => a.join(separator));
//}

async function getWebConfig(msg, headers, ctx) {
  const paths = ctx.url.split('/').filter(Boolean).slice(1);

  return getConfigByPath(layers, paths);
}

async function getFullWebConfig(msg, headers, ctx) {
  return layers;
}

async function saveWebConfig(msg) {
  layers = msg.configLayers;
  fs.writeFileSync('./layers.json', JSON.stringify(layers,null,2));
  return 'ok';
}
