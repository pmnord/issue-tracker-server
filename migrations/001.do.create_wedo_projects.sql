CREATE TABLE wedo_projects (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    date_created TIMESTAMP DEFAULT now() NOT NULL,
    uuid TEXT NOT NULL
);