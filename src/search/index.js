/**
 * быстрый поиск заказов
 *
 * @module index
 *
 * Created by Evgeniy Malyarov on 29.09.2018.
 */

import auth from '../auth';
import indexer from './indexer';

function json(ctx) {
  return new Promise((resolve, reject) => {
    let rawData = '';
    ctx.req.on('data', (chunk) => { rawData += chunk; });
    ctx.req.on('end', () => {
      try {
        resolve(ctx._json = JSON.parse(rawData));
      }
      catch (err) {
        ctx.status = 500;
        ctx.body = err.message;
        reject(err);
      }
    });
  });
}

export default async (ctx, next) => {

  // проверяем ограничение по ip и авторизацию
  await auth(ctx, $p)
    .then(() => json(ctx))
    .catch(() => null);

  if(ctx._json && ctx._auth) {
    try{
      ctx.body = indexer.find(ctx._json, ctx._auth);
      ctx.status = 200;
    }
    catch(err){
      ctx.status = err.status || 500;
      ctx.body = err.message;
      console.error(err);
    }
  }

}
