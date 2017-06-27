/**
 * Created by ngtmuzi on 2017/6/27.
 */
const lodash   = require('lodash');
module.exports = getConfigByPath;

function getConfigByPath(layers = [], paths = []) {
  let l          = 0;
  let matchItems = [];
  let result     = {};

  for (let p = 0; p < paths.length; p++) {
    while (l < layers.length) {
      let _config = lodash.get(layers, [l++, 'items', paths[p], 'config']);

      if (lodash.isPlainObject(_config)) {
        matchItems.push(paths[p]);
        lodash.mergeWith(result, _config, mergeFn);
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