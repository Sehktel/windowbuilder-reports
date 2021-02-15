/**
 *
 *
 * @module calc_order_calculations
 *
 * Created by Evgeniy Malyarov on 20.03.2019.
 */

module.exports = function (class_name) {
  return {
    class_name,
    listener(couch, acc, doc) {
      const ref = doc._id.substr(class_name.length + 1);
      if(doc.posted) {
        let queue = Promise.resolve();
        let row = 0;
        for(const {trans, amount} of doc.payment_details) {
          row++;
          queue = queue.then(() => acc.client.query(`INSERT INTO areg_calculations (register, register_type, row, period, trans, partner, organization, amount_credit) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (register, row) DO UPDATE SET 
        register_type = EXCLUDED.register_type,
        period = EXCLUDED.period,
        trans = EXCLUDED.trans,
        partner = EXCLUDED.partner,
        organization = EXCLUDED.organization,
        amount_debit = EXCLUDED.amount_debit,
        amount_credit = EXCLUDED.amount_credit;`, [ref, class_name, row, new Date(doc.date), trans, doc.partner, doc.organization, amount]));
        }
        return queue;
      }
      else {
        return acc.client.query(`DELETE FROM areg_calculations WHERE register = $1;`, [ref]);
      }
    }
  };
}

/*

-- Type: refs

DROP TYPE public.refs;

CREATE TYPE public.refs AS ENUM
    ('doc.calc_order',
	 'doc.debit_cash_order',
	 'doc.credit_cash_order',
	 'doc.credit_card_order',
	 'doc.debit_bank_order',
	 'doc.credit_bank_order',
	 'doc.selling',
	 'doc.nom_prices_setup',
	 'doc.planning_event',
	 'doc.work_centers_task',
	 'doc.work_centers_performance');

ALTER TYPE public.refs
    OWNER TO postgres;


-- DROP TABLE areg_calculations;

CREATE TABLE areg_calculations
(
    register uuid NOT NULL,
    register_type refs,
    "row" bigint NOT NULL,
    period timestamp without time zone,
    trans uuid,
    partner uuid,
    organization uuid,
    amount_debit money DEFAULT 0,
    amount_credit money DEFAULT 0,
    CONSTRAINT calculations_pkey PRIMARY KEY (register, "row")
)


 */


