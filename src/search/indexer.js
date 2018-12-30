/**
 * ### Кеш первого уровня - по датам
 * с функцией поиска в этом кеше
 *
 * @module indexer
 *
 * Created by Evgeniy Malyarov on 29.09.2018.
 */


import $p from '../metadata';

const {adapters: {pouch}, doc: {calc_order}, classes, utils} = $p;
const fields = [
  '_id',
  'state',
  'posted',
  'date',
  'number_doc',
  'number_internal',
  'partner',
  'client_of_dealer',
  'manager',
  'doc_amount',
  'obj_delivery_state',
  'department',
  'note'];
const search_fields = ['number_doc', 'number_internal', 'client_of_dealer', 'note'];

class RamIndexer extends classes.RamIndexer {
  // перебирает кеш в диапазоне дат
  find({selector, sort, ref, limit, skip = 0}, {branch}) {

    if(!this._ready) {
      const err = new Error('Индекс прочитн не полностью, повторите запрос позже');
      err.status = 403;
      throw err;
    }

    // извлекаем значения полей фильтра из селектора
    let dfrom, dtill, from, till, search, department, state;
    for(const row of selector.$and) {
      const fld = Object.keys(row)[0];
      const cond = Object.keys(row[fld])[0];
      if(fld === 'date') {
        if(cond === '$lt' || cond === '$lte') {
          dtill = row[fld][cond];
          till = dtill.substr(0,7);
        }
        else if(cond === '$gt' || cond === '$gte') {
          dfrom = row[fld][cond];
          from = dfrom.substr(0,7);
        }
      }
      else if(fld === 'search') {
        search = row[fld][cond] ? row[fld][cond].toLowerCase().split(' ') : [];
      }
      else if(fld === 'department') {
        department = cond ? row[fld][cond] : row[fld];
      }
      else if(fld === 'state') {
        state = cond ? row[fld][cond] : row[fld];
      }
    }

    if(sort && sort.length && sort[0][Object.keys(sort[0])[0]] === 'desc' || sort === 'desc') {
      sort = 'desc';
    }
    else {
      sort = 'asc';
    }

    const {_search_fields} = this;
    const partners = branch.partners._obj.map(({acl_obj}) => acl_obj);
    const divisions = branch.divisions._obj.map(({acl_obj}) => acl_obj);

    let part,
      // выборка диапазона кеша
      step = 0,
      // флаг поиска страницы со ссылкой
      flag = skip === 0 && utils.is_guid(ref),
      // результат поиска строки со ссылкой
      scroll = 0,
      count = 0;

    const docs = [];

    function add(doc) {
      count++;
      if(flag && doc._id.endsWith(ref)) {
        scroll = count - 1;
        flag = false;
      }
      if(skip > 0) {
        return skip--;
      }
      if(limit > 0) {
        limit--;
        docs.push(doc);
      }
    }

    function check(doc) {

      // фильтруем по дате
      if(doc.date < dfrom || doc.date > dtill) {
        return;
      }

      // фильтруем по контрагенту acl
      if(doc.partner && partners.length && !partners.includes(doc.partner)) {
        return;
      }

      // фильтруем по подразделению acl
      if(doc.department && divisions.length && !divisions.includes(doc.department)) {
        return;
      }

      // фильтруем по строке
      let ok = true;
      for(const word of search) {
        if(!word) {
          continue;
        }
        if(!_search_fields.some((fld) => {
          const val = doc[fld];
          return val && typeof val === 'string' && val.toLowerCase().includes(word);
        })){
          ok = false;
          break;
        }
      }

      ok && add(doc);
    }

    // получаем очередной кусочек кеша
    while(part = this.get_range(from, till, step, sort === 'desc')) {
      step += 1;
      // фильтруем
      if(sort === 'desc') {
        for(let i = part.length - 1; i >= 0; i--){
          check(part[i]);
        }
      }
      else {
        for(let i = 0; i < part.length; i++){
          check(part[i]);
        }
      }
    }

    return {docs, scroll, flag, count};
  }
}

const indexer = new RamIndexer({fields, search_fields, mgr: [calc_order]});

pouch.on('pouch_complete_loaded', () => indexer.init());

export default indexer;
