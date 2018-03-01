
// модификаторы data-объектов
import modifiers from './modifiers';

import modifiersNew from './modifiersNew';

// дополняем прототип Object методами observe
import './observe';

const debug = require('debug')('wb:meta');

// конструктор MetaEngine
import metaCore from 'metadata-core';
import metaPouchdb from 'metadata-pouchdb';
const MetaEngine = metaCore.plugin(metaPouchdb);

// функция установки параметров сеанса
const settings = require('./config/report.settings');

// функция инициализации структуры метаданных
const meta_init = require('./server/metadata/init.js');

debug('required');

// создаём контекст MetaEngine
const $p = global.$p = new MetaEngine();
debug('created');

// параметры сеанса инициализируем сразу
$p.wsql.init(settings);

// эмулируем излучатель событий dhtmlx
import dhtmlx_eve from './dhtmlx_eve';
dhtmlx_eve($p);

// обеспечиваем совместимость DataManager с v0.12
import meta_pouchdb from './meta_pouchdb';
meta_pouchdb($p.classes.DataManager.prototype);


// инициализируем параметры сеанса и метаданные
(async () => {

  // реквизиты подключения к couchdb
  const {user_node} = settings();

  // выполняем скрипт инициализации метаданных
  meta_init($p);

  // сообщяем адаптерам пути, суффиксы и префиксы
  const {wsql, job_prm, adapters} = $p;
  adapters.pouch.init(wsql, job_prm);

  // подключим модификаторы
  modifiers($p);
  modifiersNew($p);
  debug('inited & modified');

  // загружаем кешируемые справочники в ram и начинаем следить за изменениями ram
  const {pouch} = $p.adapters;
  pouch.log_in(user_node.username, user_node.password)
    .then(() => pouch.load_data())
    .catch((err) => debug(err));

  pouch.on({
    user_log_in(name) {
      debug(`logged in ${$p.job_prm.couch_local}, user:${name}, zone:${$p.job_prm.zone}`);
    },
    user_log_fault(err) {
      debug(`login error ${err}`);
    },
    pouch_load_start(page) {
      debug('loadind to ram: start');
    },
    pouch_data_page(page) {
      debug(`loadind to ram: page №${page.page} (${page.page * page.limit} from ${page.total_rows})`);
    },
    pouch_complete_loaded(page) {
      debug(`ready to receive queries, listen on port: ${process.env.PORT || 3000}`);
    },
    pouch_doc_ram_loaded() {
      pouch.local.ram.changes({
        since: 'now',
        live: true,
        include_docs: true,
      }).on('change', (change) => {
        // формируем новый
        pouch.load_changes({docs: [change.doc]});
      }).on('error', (err) => {
        debug(`change error ${err}`);
      });
      debug(`loadind to ram: READY`);
      // обычно, это событие генерирует модуль pricing после загрузки цен, но в данном сервисе цены не нужны
      pouch.emit('pouch_complete_loaded');
    },
  });

})();

export default $p;




