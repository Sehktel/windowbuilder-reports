/**
 * Клон заказов
 *
 * @module calc_order_calculations
 *
 * Created by Evgeniy Malyarov on 20.03.2019.
 */

const class_name = 'doc.calc_order';

function leftPad(str, len) {
  if(str.length <= len) return str;
  return str.substr(str.length - len);
}

module.exports = {
  class_name,
  listener(couch, acc, doc) {
    const ref = doc._id.substr(15);
    return acc.client.query(`INSERT INTO doc_calc_order (ref, _deleted, posted, date, number_doc, number_internal, project, organization, partner, client_of_dealer, contract, bank_account, note, manager, leading_manager, department, warehouse, doc_amount, amount_operation, amount_internal, accessory_characteristic, phone, delivery_area, shipping_address, coordinates, address_fields, vat_consider, vat_included, settlements_course, settlements_multiplicity, extra_charge_external, obj_delivery_state, category, production, extra_fields, contact_information, planning) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37)
      ON CONFLICT (ref) DO UPDATE SET 
        _deleted = EXCLUDED._deleted,
        posted = EXCLUDED.posted,
        date = EXCLUDED.date,
        number_doc = EXCLUDED.number_doc,
        number_internal = EXCLUDED.number_internal,
        project = EXCLUDED.project,
        organization = EXCLUDED.organization,
        partner = EXCLUDED.partner,
        client_of_dealer = EXCLUDED.client_of_dealer,
        contract = EXCLUDED.contract,
        bank_account = EXCLUDED.bank_account,
        note = EXCLUDED.note,
        manager = EXCLUDED.manager,
        leading_manager = EXCLUDED.leading_manager,
        department = EXCLUDED.department,
        warehouse = EXCLUDED.warehouse,
        doc_amount = EXCLUDED.doc_amount,
        amount_operation = EXCLUDED.amount_operation,
        amount_internal = EXCLUDED.amount_internal,
        accessory_characteristic = EXCLUDED.accessory_characteristic,
        phone = EXCLUDED.phone,
        delivery_area = EXCLUDED.delivery_area,
        shipping_address = EXCLUDED.shipping_address,
        coordinates = EXCLUDED.coordinates,
        address_fields = EXCLUDED.address_fields,
        vat_consider = EXCLUDED.vat_consider,
        vat_included = EXCLUDED.vat_included,
        settlements_course = EXCLUDED.settlements_course,
        settlements_multiplicity = EXCLUDED.settlements_multiplicity,
        extra_charge_external = EXCLUDED.extra_charge_external,
        obj_delivery_state = EXCLUDED.obj_delivery_state,
        category = EXCLUDED.category,
        production = EXCLUDED.production,
        extra_fields = EXCLUDED.extra_fields,
        contact_information = EXCLUDED.contact_information,
        planning = EXCLUDED.planning;`, [
      ref,
      doc._deleted,
      doc.posted,
      doc.date,
      leftPad(doc.number_doc || '', 11),
      (doc.number_internal || '').substr(0,20),
      doc.project,
      doc.organization,
      doc.partner,
      (doc.client_of_dealer || '').substr(0,255),
      doc.contract,
      doc.bank_account,
      (doc.note || '').substr(0,255),
      doc.manager,
      doc.leading_manager,
      doc.department,
      doc.warehouse,
      doc.doc_amount > 1e11 ? 1e11 : doc.doc_amount,
      doc.amount_operation > 1e11 ? 1e11 : doc.amount_operation,
      doc.amount_internal > 1e11 ? 1e11 : doc.amount_internal,
      doc.accessory_characteristic,
      (doc.phone || '').substr(0,255),
      doc.delivery_area,
      (doc.shipping_address || '').substr(0,255),
      doc.coordinates,
      doc.address_fields,
      doc.vat_consider,
      doc.vat_included,
      doc.settlements_course,
      doc.settlements_multiplicity,
      doc.extra_charge_external,
      doc.obj_delivery_state,
      doc.category,
      {rows: doc.production || []},
      {rows: doc.extra_fields || []},
      {rows: doc.contact_information || []},
      {rows: doc.planning || []}]);
  }
}

/*

-- Type: refs

-- Table: doc_calc_order

-- DROP TABLE doc_calc_order;

CREATE TABLE doc_calc_order
(
    ref uuid NOT NULL,
    _deleted boolean,
    posted boolean,
    date timestamp without time zone,
    number_doc character(11) NOT NULL DEFAULT ''::bpchar,
    number_internal character varying(20) NOT NULL DEFAULT ''::character varying,
    project uuid,
    organization uuid,
    partner uuid,
    client_of_dealer character varying(255) NOT NULL DEFAULT ''::character varying,
    contract uuid,
    bank_account uuid,
    note character varying(255) NOT NULL DEFAULT ''::character varying,
    manager uuid,
    leading_manager uuid,
    department uuid,
    warehouse uuid,
    doc_amount numeric(15,2),
    amount_operation numeric(15,2),
    amount_internal numeric(15,2),
    accessory_characteristic uuid,
    phone character varying(255) NOT NULL DEFAULT ''::character varying,
    delivery_area uuid,
    shipping_address character varying(255),
    coordinates character varying(50),
    address_fields text,
    vat_consider boolean,
    vat_included boolean,
    settlements_course numeric(10,4),
    settlements_multiplicity bigint,
    extra_charge_external numeric(5,2),
    obj_delivery_state character varying(25),
    category character varying(25),
    production jsonb,
    extra_fields jsonb,
    contact_information jsonb,
    planning jsonb,
    fts tsvector,
    CONSTRAINT doc_calc_order_pkey PRIMARY KEY (ref)
)

-- Index: calc_order_rls

-- DROP INDEX calc_order_rls;

CREATE INDEX calc_order_rls
    ON doc_calc_order USING btree
    (date, partner, department)
    TABLESPACE pg_default;

-- Trigger: calc_order_fts_update

-- DROP TRIGGER calc_order_fts_update ON doc_calc_order;

CREATE TRIGGER calc_order_fts_update
    BEFORE INSERT OR UPDATE
    ON doc_calc_order
    FOR EACH ROW
    EXECUTE PROCEDURE calc_order_fts();


select setweight(to_tsvector(number_doc_str(number_doc)),'A')
	|| setweight(to_tsvector(number_internal),'A')
	|| setweight(to_tsvector(note), 'B')
	|| setweight(to_tsvector(phone_str(phone)), 'B')
	|| setweight(to_tsvector(client_of_dealer), 'B') fts, * from doc_calc_order
	where setweight(to_tsvector(number_doc_str(number_doc)),'A')
	|| setweight(to_tsvector(number_internal),'A')
	|| setweight(to_tsvector(note), 'B')
	|| setweight(to_tsvector(phone_str(phone)), 'B')
	|| setweight(to_tsvector(client_of_dealer), 'B') @@ websearch_to_tsquery('ахун') limit 100

EXPLAIN (ANALYZE) select * from doc_calc_order
	where
	date between '2018-01-18' and '2019-01-18' and
	partner in ('84b4b51d-01c4-11e8-81dc-005056aafe4c', '010bc0a7-5442-11e4-8025-00215ad499ae') and
	department in ('ba5f08b2-2dbe-11de-a9e8-0015174f51fe', 'ac024484-e56e-11e7-9552-ca5fe16a4746') and
	fts @@ websearch_to_tsquery('каримова') limit 100

 */


