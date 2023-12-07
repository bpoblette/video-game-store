
DROP TABLE IF EXISTS pet;

CREATE TABLE pet (
  id INT UNSIGNED,
  name TINYTEXT NOT NULL,
  type TINYTEXT NOT NULL,
  breed TINYTEXT NOT NULL,
  birth_date DATE,
  size ENUM ('S', 'M', 'L', 'XL') NOT NULL,
  appearance TINYTEXT NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO pet VALUES
  (1, 'fido', 'dog', 'half pointer', '1941-08-01', 'M', 'short-haired'),
  (2, 'toto', 'dog', 'cairn terrier', '1933-11-17', 'S', 'loyal'),
  (3, 'bill', 'cat', 'house', '1982-06-13', 'L', 'fictional'),
  (4, 'hobbes', 'tiger', 'stuffed', '1987-04-01', 'L', 'sardonic'),
  (5, 'babe', 'pig', 'white yorkshire', '1995-01-01', 'M', 'sheep like'),
  (6, 'louise', 'tiger', 'stuffed', '1821-01-09', 'M', 'like from life of pi'),
  (7, 'cava', 'dog', 'golden retriever', '2010-04-11', 'M', 'pink nose with black dot'),
  (8, 'scott', 'cat', 'Japanese bobtails', '2003-05-17', 'S', 'dinner'),
  (9, 'togaf', 'fish', 'beta fish', '2022-12-03', 'S', 'dead'),
  (10, 'finnigan', 'fish', 'beta fish', '2022-09-23', 'S', 'alive lol'),
  (11, 'shane', 'horse', 'mustang', '2003-04-15', 'L', 'horse expert'),
  (12, 'fudge', 'pig', 'feral', '1982-12-23', 'L', 'cereal killer'),
  (13, 'jesus', 'horse', 'Appaloosa', '0001-3-23', 'L', 'just jesus'),
  (14, 'terminator', 'bird', 'big bird', '2001-10-11', 'L', 'possibly insane'),
  (15, 'eagly', 'bird', 'bald eagle', '1453-01-09', 'M', 'from peacemaker');
