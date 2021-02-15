/**
 *
 *
 * @module accumulation
 *
 * Created by Evgeniy Malyarov on 20.03.2019.
 */

module.exports = function accumulation({adapters, accumulation}) {

  return process.env.PGPASSWORD ? accumulation.init({
    dbs: [
      adapters.pouch.remote.doc,
    ],
    listeners: [
      // клон заказов
      require('./calc_order_clone'),

      // Расчеты с контрагентами
      require('./calc_order_calculations'),                       // заказы
      require('./calculations_credit')('doc.debit_cash_order'),   // касса приход
      require('./calculations_credit')('doc.credit_card_order'),  // оплата картой
      require('./calculations_credit')('doc.debit_bank_order'),   // банк приход
    ]
  })
    : Promise.resolve();
};
