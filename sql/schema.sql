
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

CREATE TABLE IF NOT EXISTS public.clubs (
	id uuid default uuid_generate_v4() not null 
    constraint club_pkey 
      primary key,
  name varchar(255) not null,
  shorthand varchar(10) not null unique,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

CREATE TABLE IF NOT EXISTS public.users (
	id uuid default uuid_generate_v4() not null
		constraint users_pkey
			primary key,
  email varchar(255) not null unique,
  password varchar(128) not null,
	name varchar(255),
  club uuid REFERENCES clubs(id),
  disabled boolean default false not null,
  role varchar(64),
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);


CREATE TABLE IF NOT EXISTS public.athletes (
	id uuid default uuid_generate_v4() not null
		constraint athletes_pkey
			primary key,
  name varchar(255),
  ssn varchar(25) unique,
  club uuid REFERENCES clubs(id),
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

CREATE TABLE IF NOT EXISTS public.achievements (
	athlete_id uuid not null
		constraint achievements_pkey
			primary key
      REFERENCES athletes(id),
  diploma_date date,
  diploma_bouts_left int default 0,
  bronz_date date,
  bronz_bouts_left int default 4,
  silver_date date,
  silver_bouts_left int default 4,
  gold_date date,
  gold_bouts_left int default 4,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

CREATE TABLE IF NOT EXISTS public.bouts (
	id uuid default uuid_generate_v4() not null
		constraint bouts_pkey
			primary key,
  athlete_id uuid not null REFERENCES athletes(id),
  athlete_name varchar(255) not null,
  athlete_club_shorthand varchar(10),
  opponent_id uuid not null,
  opponent_name varchar(255) not null,
  opponent_club_shorthand varchar(10),
  class varchar(2) not null,
  bout_date date not null,
  points numeric(3,1) not null,
  organizer varchar(255) not null,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp BEFORE UPDATE ON clubs FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON athletes FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON achievements FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON bouts FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();