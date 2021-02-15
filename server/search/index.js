/**
 * быстрый поиск заказов
 *
 * @module index
 *
 * Created by Evgeniy Malyarov on 29.09.2018.
 */


module.exports = function($p, log) {

  // const indexer = require('./indexer')($p);
  // $p.adapters.pouch.on('indexer_page', (page) => {
  //   log(`indexed ${page.indexer._count} ${page.bookmark.substr(10, 30)}`);
  // });

  const {getBody} = $p.utils;

  return async (req, res) => {

    const body = await getBody(req);
    const selector = JSON.parse(body);
    const rows = await $p.accumulation.find(selector, req.user);
    res.end(JSON.stringify(rows));

  }
}
