drop index if exists vault_find;
drop table if exists vault;

drop index if exists api_key_find;
drop table if exists api_keys;

drop index if exists users_email_find;
drop table if exists users;

create table users(
    asuid text not null primary key unique,
    email text not null unique
);
create index users_email_find on users(email);

drop index if exists api_key_find;
drop table if exists api_keys;
create table api_keys(
    users_asuid text not null,
    key text not null unique,
    desc text not null,
    foreign key(users_asuid) references users(asuid)
);
create index api_key_find on api_keys(users_asuid, key);

create table vault(
    asuid text not null primary key,
    users_asuid text not null,
    name text not null,
    key text not null,
    value text not null,
    foreign key(users_asuid) references users(asuid)
);
create index vault_find on vault(users_asuid, asuid, name);
