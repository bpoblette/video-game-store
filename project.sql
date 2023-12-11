DROP TABLE IF EXISTS library;
DROP TABLE IF EXISTS store;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS friends;
DROP TABLE IF EXISTS group_table;
DROP TABLE IF EXISTS videogame;
DROP TABLE IF EXISTS game_genre;

CREATE TABLE game_genre(
  tag_id CHAR(10),
  description CHAR(50),
  PRIMARY KEY(tag_id)
);

INSERT INTO game_genre VALUES
('fps', 'first-person shooter');

CREATE TABLE videogame (
  game_id INT UNSIGNED AUTO_INCREMENT,
  name CHAR(50), 
  tag_id CHAR(10),
  description CHAR(50),
  PRIMARY KEY(game_id),
  FOREIGN KEY(tag_id) REFERENCES game_genre(tag_id)
);

INSERT INTO videogame VALUES
(1, 'halo 3', 'fps', 'believe');

CREATE TABLE library(
  library_id INT UNSIGNED AUTO_INCREMENT,
  game_id INT UNSIGNED,
  user_id INT UNSIGNED,
  PRIMARY KEY(library_id),
  FOREIGN KEY(game_id) REFERENCES videogame(game_id),
  FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE store(
  game_id INT UNSIGNED,
  price INT UNSIGNED NOT NULL,
  sold INT UNSIGNED,
  PRIMARY KEY(game_id),
  FOREIGN KEY(game_id) REFERENCES videogame(game_id)
);

CREATE TABLE users(
  user_id INT UNSIGNED,
  username CHAR(50),
  birth_date DATE,
  list_id INT UNSIGNED,
  PRIMARY KEY(user_id)
);

CREATE TABLE friends(
  list_id INT UNSIGNED,
  user_id INT UNSIGNED,
  PRIMARY KEY(list_id, user_id),
  FOREIGN KEY(list_id) REFERENCES users(list_id),
  FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE group_table(
  group_id INT UNSIGNED,
  group_name CHAR(50) NOT NULL,
  group_member INT UNSIGNED,
  description CHAR(50),
  PRIMARY KEY(group_id, group_member),
  FOREIGN KEY(group_member) REFERENCES users(user_id)
);
