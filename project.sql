DROP TABLE IF EXISTS library;
DROP TABLE IF EXISTS store;
DROP TABLE IF EXISTS friends;
DROP TABLE IF EXISTS group_table;
DROP TABLE IF EXISTS videogame;
DROP TABLE IF EXISTS game_genre;
DROP TABLE IF EXISTS users;

CREATE TABLE game_genre(
  tag_id CHAR(10),
  description CHAR(50),
  PRIMARY KEY(tag_id)
);

INSERT INTO game_genre VALUES
('fps', 'first-person shooter'),
('action', 'actions game'),
('sports', 'sports game'),
('rpg', 'role-playing game'),
('survival', 'survival game');

CREATE TABLE videogame (
  game_id INT UNSIGNED AUTO_INCREMENT,
  name CHAR(50), 
  tag_id CHAR(10),
  description CHAR(50),
  PRIMARY KEY(game_id),
  FOREIGN KEY(tag_id) REFERENCES game_genre(tag_id)
);



INSERT INTO videogame VALUES
(1, 'halo 3', 'fps', 'believe'),
(2, 'halo 2', 'fps', 'return to sender'),
(3, 'halo 1', 'fps', 'did we lose em?'),
(4, 'CS2', 'fps', 'purple'),
(5, 'Call of Duty', 'fps', 'War Has Changed'),
(6,'Zelda', 'rpg', 'Open-world Adventure'),
(7,'Assassins Creed', 'action', 'Explore Ancient Greece'),
(8,'FIFA 22', 'sports', 'Football Simulation'),
(9, 'Pokemon', 'rpg', 'become a pokemon master'),
(10, 'Dying light', 'rpg', 'survive the apocalypse');


CREATE TABLE store(
  game_id INT UNSIGNED,
  price INT UNSIGNED NOT NULL,
  sold INT UNSIGNED,
  PRIMARY KEY(game_id),
  FOREIGN KEY(game_id) REFERENCES videogame(game_id)
);
INSERT INTO store VALUES 
(1, 60, 7000000),
(2, 60, 600000),
(3, 60, 30000),
(4, 15, 10000),
(5, 60, 6500000),
(6, 30, 123125),
(7, 60, 12351),
(8, 60, 123123),
(9, 60, 700000000),
(10, 30, 123413);

CREATE TABLE users(
  user_id INT UNSIGNED AUTO_INCREMENT,
  username CHAR(50),
  birth_date DATE,
  PRIMARY KEY(user_id)
);

INSERT INTO users VALUES
(1, "bpobbs", "2003-01-09"),
(2, "rex", '2001-01-12'),
(3, "luthor", '2002-01-12');

CREATE TABLE friends(
  user_id INT UNSIGNED,
  friend_id INT UNSIGNED,
  PRIMARY KEY(user_id, friend_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (friend_id) REFERENCES users(user_id)
);
INSERT INTO friends VALUES
(1,2),
(1,3);

CREATE TABLE library(
  game_id INT UNSIGNED,
  user_id INT UNSIGNED,
  PRIMARY KEY(game_id, user_id),
  FOREIGN KEY(game_id) REFERENCES videogame(game_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
INSERT INTO library VALUES
(1, 1);

CREATE TABLE group_table(
  group_id INT UNSIGNED,
  group_name CHAR(50) NOT NULL,
  group_member INT UNSIGNED,
  description CHAR(50),
  PRIMARY KEY(group_id, group_member),
  FOREIGN KEY(group_member) REFERENCES users(user_id)
);
INSERT INTO group_table VALUES
(1, "pokefans", 1, "a group for all fans of pokemon");

  SELECT v.name AS title, v.tag_id AS genre, s.sold AS number_sold, s.game_id
  FROM videogame v JOIN store s USING (game_id)