
const fetch = require('node-fetch');

const auth_cache = {};
const couch_local = `${process.env.COUCHLOCAL.replace('/wb_', '')}/_session`;

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
  let {authorization} = ctx.req.headers;
  if(!authorization){
    ctx.status = 403;
    ctx.body = 'access denied';
    return;
  }

  const _auth = {'username': '', roles: []};


  const resp = await new Promise((resolve, reject) => {

    function set_cache(key, auth) {
      auth_cache[key] = Object.assign({}, _auth, {stamp: Date.now(), auth});
      resolve(auth);
    }

    // получаем строку из заголовка авторизации
    const auth_str = authorization.substr(6);
    const cached = auth_cache[auth_str];
    if(cached && (cached.stamp + 30 * 60 * 1000) > Date.now()) {
      Object.assign(_auth, cached);
      return resolve(cached.auth);
    }

    fetch(couch_local, {headers: ctx.req.headers})
      .then((res) => {
        return res.json();
      })
      .then(({ok, userCtx}) => {
        if(!ok) {
          return set_cache(auth_str, false);
        }
        let branch, user, suffix;
        _auth.username = userCtx.name;
        for(const role of userCtx.roles) {
          if(role.startsWith('suffix:')) {
            _auth.suffix = role.substr(7);
          }
          else if(role.startsWith('ref:')) {
            _auth.user = cat.users.get(role.substr(4));
          }
          else if(role.startsWith('branch:')) {
            _auth.branch = cat.branches.get(role.substr(7));
          }
          else {
            _auth.roles.push(role);
          }
        }
        while (_auth.suffix.length < 4){
          _auth.suffix = '0' + _auth.suffix;
        }
        if(!_auth.branch) {
          _auth.branch = _auth.user.branch;
        }
        return _auth.branch.is_new() && !_auth.branch.empty() && _auth.branch.load();
      })
      .then(() => set_cache(auth_str, true))
      .catch((e) => {
        ctx.status = 500;
        ctx.body = e.message;
        delete auth_cache[auth_str];
        resolve(false);
      });
  });

  return ctx._auth = resp && _auth;

};
