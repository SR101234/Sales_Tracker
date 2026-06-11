create database office;

use office;

create table agents(
 id bigint primary key,
 pan varchar(10),
 name varchar(70),
 is_deleted varchar(1)
 );
 
 create table subtask(
 transaction_id varchar(20) primary key,
 agent_id varchar(10),
 client_name varchar(50),
 id_or_folio varchar(50),
 service_type varchar(100),
 amc text,
 entery_date date,
 new_information text,
 remark text,
 flag varchar(1),
 arn varchar(7)
 );
 
 create table switch_stp(
 transaction_id varchar(20) primary key,
 agent_id varchar(20),
 mode varchar(10),
 switch_type varchar(20),
 investor_name varchar(50),
 id_or_folio varchar(50),
 amount int,
 entery_date date,
 from_amc text,
 from_scheme text,
 to_scheme text,
 remark text,
 frequency varchar(20),
 flag varchar(1)
 );
 
 create table target(
 pan varchar(10),
 sip_target bigint,
 lumpsum_target bigint,
 target_date date
 );
 
 
 create table transaction(
 transaction_id varchar(20) primary kay,
 agent_id varchar(10),
 mode varchar(20),
 nature varchar(20),
 investor_name varchar(50),
 id_or_folio varchar(50),
 amc_name text,
 scheme_name text,
 amount int,
 entery_date date,
 remark text,
 flag varchar(1),
 arn varchar(7)
 );
 
 
 
 
 
 
 
 