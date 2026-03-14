create schema Office;
use office;

Create table Agents (
id SERIAL PRIMARY KEY,
pan varchar(10),
name varchar(50),
email varchar(70),
is_deleted varchar(1)
);



create table target(

pan varchar(10),
sip_target bigint,
lumpsum_target bigint,
target_date date
);




Create table Transaction(
 transaction_id varchar(20) primary key,
 agent_id varchar(10),
 mode varchar(20),
 nature varchar(20),
 investor_name varchar(50),
 id_or_folio varchar(50),
 amc_name text,
 scheme_name text,
 amount int,
 entery_date date,
 remark text
 
);

Create table subtask(

transaction_id varchar(20) primary key,
agent_id varchar(10),
client_name varchar(50),
id_or_folio varchar(50),
service_type varchar(100),
amc text,
entery_date date,
new_information text,
remark text
);





