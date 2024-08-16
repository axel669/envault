insert into
    api_keys(key, allowed)
values
    ('testing', '["test/*","other"]')
;

insert into
    vault(name, key, value)
values
    ('test/first', 'not_real_cf_token', 'lolwat'),
    ('other', 'not_real_aws_token', 'noway')
;
