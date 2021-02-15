--
-- PostgreSQL database dump
--

-- Dumped from database version 11.2 (Debian 11.2-1.pgdg90+1)
-- Dumped by pg_dump version 11.2

-- Started on 2019-04-18 22:22:29

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;


--
-- TOC entry 604 (class 1247 OID 16508)
-- Name: refs; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.refs AS ENUM (
    'doc.calc_order',
    'doc.debit_cash_order',
    'doc.credit_cash_order',
    'doc.credit_card_order',
    'doc.debit_bank_order',
    'doc.credit_bank_order',
    'doc.selling',
    'doc.nom_prices_setup',
    'doc.planning_event',
    'doc.work_centers_task',
    'doc.work_centers_performance'
);


ALTER TYPE public.refs OWNER TO postgres;

--
-- TOC entry 207 (class 1255 OID 21199)
-- Name: calc_order_fts(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calc_order_fts() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.fts= setweight(to_tsvector(number_doc_str(NEW.number_doc)),'A')
	|| setweight(to_tsvector(NEW.number_internal),'A')
	|| setweight(to_tsvector(NEW.note), 'B')
	|| setweight(to_tsvector(NEW.shipping_address), 'B')
	|| setweight(to_tsvector(phone_str(NEW.phone)), 'B')
	|| setweight(to_tsvector(NEW.client_of_dealer), 'B');
 RETURN NEW;
END;
$$;


ALTER FUNCTION public.calc_order_fts() OWNER TO postgres;

--
-- TOC entry 206 (class 1255 OID 21198)
-- Name: number_doc_str(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.number_doc_str(number_doc text) RETURNS text
    LANGUAGE plpgsql
    AS $$
declare
	tmp text[];
	pos text;
begin
	pos = regexp_matches(number_doc, '\D{1,}');
	tmp = regexp_split_to_array(number_doc, '\D');
	if tmp[3] is null then
		pos = number_doc;
	else
		pos = number_doc || ' ' || tmp[3];
	end if;
	return pos;
end
$$;


ALTER FUNCTION public.number_doc_str(number_doc text) OWNER TO postgres;

--
-- TOC entry 205 (class 1255 OID 21126)
-- Name: phone_str(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.phone_str(phone text) RETURNS text
    LANGUAGE plpgsql
    AS $$
declare tmp text;
begin
	tmp = replace(phone, '-', '');
	tmp = replace(tmp, '(', '');
	tmp = replace(tmp, ')', '');
	tmp = replace(tmp, ' ', '');
	tmp = replace(tmp, ',', ' ');
    RETURN tmp;
	end
$$;


ALTER FUNCTION public.phone_str(phone text) OWNER TO postgres;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 203 (class 1259 OID 16531)
-- Name: areg_calculations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.areg_calculations (
    register uuid NOT NULL,
    register_type public.refs,
    "row" bigint NOT NULL,
    period timestamp without time zone,
    trans uuid,
    partner uuid,
    organization uuid,
    amount_debit money DEFAULT 0,
    amount_credit money DEFAULT 0
);


ALTER TABLE public.areg_calculations OWNER TO postgres;

--
-- TOC entry 204 (class 1259 OID 19065)
-- Name: doc_calc_order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doc_calc_order (
    ref uuid NOT NULL,
    _deleted boolean,
    posted boolean,
    date timestamp without time zone,
    number_doc character(11) DEFAULT ''::bpchar NOT NULL,
    number_internal character varying(20) DEFAULT ''::character varying NOT NULL,
    project uuid,
    organization uuid,
    partner uuid,
    client_of_dealer character varying(255) DEFAULT ''::character varying NOT NULL,
    contract uuid,
    bank_account uuid,
    note character varying(255) DEFAULT ''::character varying NOT NULL,
    manager uuid,
    leading_manager uuid,
    department uuid,
    warehouse uuid,
    doc_amount numeric(15,2),
    amount_operation numeric(15,2),
    amount_internal numeric(15,2),
    accessory_characteristic uuid,
    phone character varying(255) DEFAULT ''::character varying NOT NULL,
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
    fts tsvector
);


ALTER TABLE public.doc_calc_order OWNER TO postgres;


--
-- TOC entry 202 (class 1259 OID 16416)
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    param character varying(100) NOT NULL,
    value text
);


ALTER TABLE public.settings OWNER TO postgres;


--
-- TOC entry 2772 (class 2606 OID 16537)
-- Name: areg_calculations calculations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.areg_calculations
    ADD CONSTRAINT calculations_pkey PRIMARY KEY (register, "row");


--
-- TOC entry 2776 (class 2606 OID 19077)
-- Name: doc_calc_order doc_calc_order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doc_calc_order
    ADD CONSTRAINT doc_calc_order_pkey PRIMARY KEY (ref);


--
-- TOC entry 2770 (class 2606 OID 16423)
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (param);


--
-- TOC entry 2773 (class 1259 OID 69515)
-- Name: calc_order_fts; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX calc_order_fts ON public.doc_calc_order USING gist (fts);


--
-- TOC entry 2774 (class 1259 OID 139455)
-- Name: calc_order_rls; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX calc_order_rls ON public.doc_calc_order USING btree (date, department, partner) INCLUDE (ref, _deleted, posted, organization, manager, obj_delivery_state, category);


--
-- TOC entry 2777 (class 2620 OID 21200)
-- Name: doc_calc_order calc_order_fts_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER calc_order_fts_update BEFORE INSERT OR UPDATE ON public.doc_calc_order FOR EACH ROW EXECUTE PROCEDURE public.calc_order_fts();


-- Completed on 2019-04-18 22:22:30

--
-- PostgreSQL database dump complete
--

