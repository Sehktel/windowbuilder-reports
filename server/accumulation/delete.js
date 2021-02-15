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

    if(!ctx.params.path) {
      ctx.body = {
        ok: true,
      };
    }

    try{
      switch (ctx.params.class){

      }
    }
    catch(err){
      ctx.status = 500;
      ctx.body = err.stack;
      console.error(err);
    }

  };
}
