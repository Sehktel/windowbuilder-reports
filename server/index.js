
// app.restrict_ips = process.env.IPS ? process.env.IPS.split(',') : [];

module.exports = function reports($p, log) {

  const windowbuilder = require('./windowbuilder')($p, log);
  const search  = require('./search')($p, log);
  const acc_get  = require('./accumulation/get')($p, log);
  const acc_post  = require('./accumulation/post')($p, log);
  const acc_delete  = require('./accumulation/delete')($p, log);

  return async function reportsHandler(req, res) {
    const {query, path, paths} = req.parsed;

    if (paths[1] === 'img' || paths[3] === 'img') {
      return windowbuilder(req, res);
    }

    if (req.method === 'POST' && (paths[1] === '_find' || paths[3] === '_find')) {
      return search(req, res);
    }

    // rep.loadMethods()
    //   .get('/', async (ctx, next) => {
    //     await next();
    //     ctx.body = `Reports: try out <a href="/r/img">/r/img</a> too`
    //   })
    //   .get('/img/:class/:ref', executer)
    //   .get('/postgres/:db', acc_get)
    //   .get('/postgres/:db/:path', acc_get)
    //   .post('/postgres/:db/:path', acc_post)
    //   .post('/_find', search)
    //   .delete('/postgres/:db', acc_delete)
    //   .delete('/postgres/:db/:path', acc_delete);

  }
}

