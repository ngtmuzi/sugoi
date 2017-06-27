/**
 * Created by ngtmuzi on 2017/6/7.
 */

'use strict';

Promise.prototype.timeout = function (ms) {
  return new Promise((resolve, reject) => {
    this.then(resolve, reject);
    setTimeout(() => reject(new Error('promise timeout')), +ms);
  });
};

global.Promise = Promise = require('bluebird');
const config = global.config = require('./config');

const Koa        = require('koa');
const koaSend    = require('koa-send');
const koaSession = require('koa-session');
const bodyParser = require('koa-bodyparser');
const lodash     = require('lodash');

const controller = require('./controller');

const app = new Koa();
app.use(koaSession({key: 'somethingWonderful', maxAge: 1000 * 60 * 60 * 24 * 30, signed: false}, app));
app.use(bodyParser());

//statics file server
app.use(async (ctx, next) => {
  try {
    await koaSend(ctx, ctx.path, {root: __dirname + '/public', index: 'index.html'});
  } catch (err) {
    if (err.status === 404) {
      const s_time = new Date();
      await next();
      console.log(ctx.request.ip + '\t' + ctx.request.method + '\t' + ctx.response.status + '\t' + ctx.request.url + '\t'
        + (new Date() - s_time) + 'ms');
    }
    else console.error(err);
  }
});

app.use(controller);

app.use(ctx => {
  ctx.response.status = 404;
  ctx.body            = {code: 404, succeed: false, msg: 'Not Found', ext: ctx.request.url};
});

app.listen(config.httpPort);
console.log('http://localhost:' + config.httpPort);
