// модификаторы объектов и менеджеров данных

// // модификаторы справочников
// import catalogs from './catalogs';
//
// // модификаторы документов
// import documents from './documents';
//
// модификаторы планов видов характеристик
import chartscharacteristics from '../../src/metadata/chartscharacteristics';
//

//
// общие модули
import common from '../../src/metadata/common';


export default function ($p) {
  // catalogs($p);
  // documents($p);
  chartscharacteristics($p);
  //reports($p);
  //dataprocessors($p);
  common($p);
}
