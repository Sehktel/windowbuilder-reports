
import request from 'request';

const auth_cache = {};
const couch_public = `${process.env.COUCHPUBLIC}${process.env.ZONE}_doc`;

export default async (ctx, {cat}) => {

  // если указано ограничение по ip - проверяем
  // const {restrict_ips} = ctx.app;
  // const ip = ctx.req.headers['x-real-ip'] || ctx.ip;
  // if(restrict_ips.length && restrict_ips.indexOf(ip) == -1){
  //   ctx.status = 403;
  //   ctx.body = 'ip restricted:' + ip;
  //   return;
  // }

  // проверяем авторизацию
  let {authorization, suffix} = ctx.req.headers;
  if(!authorization || !suffix){
    ctx.status = 403;
    ctx.body = 'access denied';
    return;
  }

  const _auth = {'username': ''};
  const resp = await new Promise((resolve, reject) => {

    function set_cache(key, auth) {
      auth_cache[key] = Object.assign({}, _auth, {stamp: Date.now(), auth});
      resolve(auth);
    }

    const auth_str = authorization.substr(6);

    try{
      // получаем строку из заголовка авторизации
      const cached = auth_cache[auth_str];
      if(cached && (cached.stamp + 30 * 60 * 1000) > Date.now()) {
        Object.assign(_auth, cached);
        return resolve(cached.auth);
      }

      const auth = new Buffer(auth_str, 'base64').toString();
      const sep = auth.indexOf(':');
      _auth.pass = auth.substr(sep + 1);
      _auth.username = auth.substr(0, sep);

      while (suffix.length < 4){
        suffix = '0' + suffix;
      }

      _auth.suffix = suffix;

      request({
        url: couch_public + (suffix === '0000' ? '' : `_${suffix}`),
        auth: {'user':_auth.username, 'pass':_auth.pass, sendImmediately: true}
      }, (e, r, body) => {
        if(r && r.statusCode < 201){
          set_cache(auth_str, true);
        }
        else{
          ctx.status = (r && r.statusCode) || 500;
          ctx.body = body || (e && e.message);
          set_cache(auth_str, false);
        }
      });
    }
    catch(e){
      ctx.status = 500;
      ctx.body = e.message;
      delete auth_cache[auth_str];
      resolve(false);
    }
  });

  return ctx._auth = resp && Object.assign(_auth, {user: cat.users.by_id(_auth.username)});

};
