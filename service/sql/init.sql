-- drop table if exists users;

-- create table users(
--     id integer primary key,
--     asuid text,
--     email text
-- );
-- create index

drop table if exists api_keys;
create table api_keys(
    id integer primary key,
    key text,
    allowed text
);
create index key_find on api_keys(key);

drop table if exists vault;
create table vault(
    id integer primary key,
    name text,
    key text,
    value text
);
create index vault_find on vault(name);
