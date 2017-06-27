/**
 * Created by ngtmuzi on 2017/4/25.
 */
'use strict';
const URL        = require('url');
const lodash     = require('lodash');
const pathRegexp = require('path-to-regexp');

module.exports        = nRouter;
module.exports.reject = reject;

/**
 * 拍平对象
 * @example {a:1, b:{c:1,d:{e:[2]}}} -> {a:1,'b.c':1,'b.d.e':[2]}
 * @param obj
 * @param pre
 * @param split
 * @returns {*}
 */
function pave(obj, pre = '', split = '.') {
  return Object.assign({}, ...lodash.flatMap(obj, (value, key) => {
    if (lodash.isPlainObject(value)) return pave(value, `${pre && (pre + split)}${key}`, split);
    else return {[`${pre && (pre + split)}${key}`]: value};
  }));
}

/**
 * 将对象展平并返回一个koa中间件
 * @param {Object} router controller函数按路由拼凑出的对象
 * @returns {function(*=, *=)}
 */
function nRouter(router) {
  const keyMaps = lodash.map(pave(router, '', '/'), (fn, exp) => {
    let keys = [];
    return {regExp: pathRegexp('/' + exp, keys), fn, keys};
  });

  return async (ctx, next) => {
    const path      = URL.parse(ctx.request.url).pathname;
    let matchKeyMap = keyMaps.find(({regExp}) => regExp.test(path));
    if (!matchKeyMap) return await next();

    const {regExp, fn, keys} = matchKeyMap;

    const msg = Object.assign({}, ctx.request.query, ctx.request.body);
    let m     = regExp.exec(path);
    keys.forEach((key, i) => msg[key.name] = m[i + 1]);

    const headers  = lodash.mapKeys(ctx.request.header, (v, k) => lodash.camelCase(k));
    headers.method = ctx.method.toLowerCase();

    try {
      let result = await fn(msg, headers, ctx, next);
      if (!lodash.isNil(result)) ctx.body = {code: 200, succeed: true, msg: result};
    } catch ({code, message, msg, ext}) {
      if (ctx.body) return;
      ctx.body = {code: code || 500, succeed: false, msg: msg || message || 'un handle error', ext};
    }
  };
}

/**
 * 返回一个表示错误结果的json
 * @param code
 * @param msg
 * @param ext
 */
function reject(code, msg, ext) {
  const e = new Error(msg);
  e.code  = code;
  e.ext   = ext;
  throw e;
}