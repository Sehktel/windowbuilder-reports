/**
 *
 *
 * @module get
 *
 * Created by Evgeniy Malyarov on 22.03.2019.
 */

module.exports = function($p, log) {

  return async (ctx, next) => {

    // контролируем загруженность справочников
    if(!$p.job_prm.complete_loaded) {
      ctx.status = 403;
      ctx.body = 'loading to ram, wait 1 minute';
      return;
    }

    // проверяем ограничение по ip и авторизацию
    // await auth(ctx, $p)
    //   .catch(() => null);
    //
    // if(!ctx._auth) {
    //   return;
    // }

    try{
      switch (ctx.params.path){
      case undefined:
        ctx.body = ctx.params.db === '_session' ?
          {
            ok: true,
            name: 'postgres',
          }
          :
          {
            db_name: ctx.params.db,
            adapter: 'postgres',
          };
        break;
      case '_all_docs':
        ctx.body = {
          docs: []
        }
      default:
        const parts = ctx.params.path.split('|');
      }
    }
    catch(err){
      ctx.status = 500;
      ctx.body = err.stack;
      console.error(err);
    }

  };
}
