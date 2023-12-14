const mysql = require('mysql2');
const express = require('express');
const path = require('path');
const config = require('./config.json');

const cn = mysql.createConnection(config);
const app = express();

app.set('view engine', 'ejs'); // Set the view engine to EJS
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});


app.get('/', (request, response) => {
    // Connect to MySQL
    const cnTopGames = mysql.createConnection(config);

    cnTopGames.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL: ' + err.stack);
            response.status(500).send('Internal Server Error');
            return;
        }

        const query = `
        SELECT title, number_sold
        FROM (
            SELECT v.name AS title, s.sold AS number_sold,
                   ROW_NUMBER() OVER (ORDER BY s.sold DESC) AS rank
            FROM videogame v
            JOIN store s USING (game_id)
        ) ranked_games
        WHERE rank <= 5`;

        cnTopGames.query(query, (err, result) => {
            if (err) {
                console.error('Error fetching top games: ' + err.message);
                response.status(500).send('Internal Server Error');
            } else {
                // Render the 'store.ejs' view with the fetched data
                response.render('store', { games: result });
            }

            // Close the connection after sending the response
            cnTopGames.end();
        });
    });
});


app.get('/games', (request, response) => {
    cn.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL: ' + err.stack);
            response.status(500).send('Internal Server Error');
            return;
        }

        const query = `
        SELECT v.name, s.price, s.sold, v.game_id
        FROM videogame v JOIN store s USING (game_id)`;

        cn.query(query, (err, result) => {
            if (err) {
                console.error('Error fetching games from the store: ' + err.message);
                response.status(500).send('Internal Server Error');
            } else {
                var res = '<ul>'; // Opening unordered list tag
                for (const r of result) {
                    res += '<li>' + r['name'] + ' - $' + r['price'] + ' - Sold: ' + r['sold'] + '</li>';
                }
                res += '</ul>'; // Closing unordered list tag
                response.send(res);
            }

            // Close the connection after sending the response
            cn.end();
        });
    });
});

app.post('/search', (request, response) => {
    const searchTerm = request.body.searchTerm;
    const genre = request.body.genre || '';  // Default to an empty string if not provided
    const sortBy = request.body.sortBy;

    // Connect to MySQL
    const cnSearchGames = mysql.createConnection(config);

    cnSearchGames.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL: ' + err.stack);
            response.status(500).send('Internal Server Error');
            return;
        }

        // Validate sortBy to prevent SQL injection
        const validSortOptions = ['title', 'number_sold DESC'];
        const sanitizedSortBy = validSortOptions.includes(sortBy) ? sortBy : 'title';

        let query = `
        SELECT v.name AS title, v.tag_id AS genre, s.sold AS number_sold, s.game_id AS id
        FROM videogame v JOIN store s USING (game_id)
        WHERE v.name LIKE ?
          AND v.tag_id LIKE ?
        ORDER BY ${sanitizedSortBy}`;
        

        // Add "%" around searchTerm and genre for a partial match
        const params = [`%${searchTerm}%`, `%${genre}%`];

        cnSearchGames.query(query, params, (err, result) => {
            if (err) {
                console.error('Error searching games: ' + err.message);
                response.status(500).send('Internal Server Error');
            } else {
                // Render the 'store.ejs' view with the fetched data
                response.render('store', { games: result });
            }

            // Close the connection after sending the response
            cnSearchGames.end();
        });
    });
});

app.post('/buy', (request, response) => {
    const userId = request.body.userId;
    const gameId = parseInt(request.body.gameId);

    console.log('Received userId:', userId);
    console.log('Received gameId:', gameId);

    if (isNaN(gameId) || isNaN(userId)) {
        return response.status(400).send('Invalid gameId or userId');
    }

    // Establish a new connection for the buy operation
    const cnBuy = mysql.createConnection(config);

    cnBuy.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL for purchase: ' + err.stack);
            return response.status(500).send('Internal Server Error');
        }

        // Check if the game is already in the user's library
        const checkQuery = 'SELECT * FROM library WHERE game_id = ? AND user_id = ?';
        cnBuy.query(checkQuery, [gameId, userId], (checkErr, checkResult) => {
            if (checkErr) {
                console.error('Error checking library: ' + checkErr.message);
                response.status(500).send('Internal Server Error');
            } else {
                if (checkResult.length > 0) {
                    // The game is already in the user's library
                    cnBuy.end();
                    const backButton = '<br><a href="/"><button>Go Back to Store</button></a>';
                    return response.status(400).send('Game is already in your library' + backButton);
                }

                // If the game is not in the library, proceed with the purchase
                const insertQuery = 'INSERT INTO library (game_id, user_id) VALUES (?, ?)';
                cnBuy.query(insertQuery, [gameId, userId], (purchaseErr, purchaseResult) => {
                    if (purchaseErr) {
                        console.error('Error purchasing game: ' + purchaseErr.message);
                        response.status(500).send('Internal Server Error');
                    } else {
                        // Close the connection after the query completes
                        cnBuy.end();
                        const backButton = '<br><a href="/"><button>Go Back to Store</button></a>';
                        response.send('Game purchased and added to library successfully!' + backButton);
                    }
                });
            }
        });
    });
});

// ...

app.get('/addGame', (request, response) => {
    // Render a form for adding a new game
    response.render('addGame');
});

app.post('/addGame', (request, response) => {
    // Extract game details from the request body
    const name = request.body.name;
    const tag_id = request.body.tag_id;
    const description = request.body.description;
    const price = parseInt(request.body.price); 

    // Connect to MySQL
    const cnAddGame = mysql.createConnection(config);

    cnAddGame.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL: ' + err.stack);
            response.status(500).send('Internal Server Error');
            return;
        }

        // Insert new game into videogame table
        const insertQuery = 'INSERT INTO videogame (name, tag_id, description) VALUES (?, ?, ?)';
        cnAddGame.query(insertQuery, [name, tag_id, description], (err, result) => {
            if (err) {
                console.error('Error adding new game: ' + err.message);
                response.status(500).send('Internal Server Error');
            } else {
                // Get the auto-generated game_id from the inserted row
                const game_id = result.insertId;

                // Insert the new game into the store table
                const insertStoreQuery = 'INSERT INTO store (game_id, price, sold) VALUES (?, ?, 0)';
                cnAddGame.query(insertStoreQuery, [game_id, price], (err, result) => {
                    if (err) {
                        console.error('Error adding new game to store: ' + err.message);
                        response.status(500).send('Internal Server Error');
                    } else {
                        // Close the connection after the query completes
                        cnAddGame.end();
                        const backButton = '<br><a href="/"><button>Go Back to Store</button></a>';
                        response.send('Game added to store successfully!' + backButton);
                    }
                });
            }
        });
    });
});



// Display the form to input user_id
app.get('/library', (request, response) => {
    response.render('libraryForm'); // Create a new EJS file for the form, e.g., 'library-form.ejs'
});


app.post('/library', (request, response) => {
    const userId = parseInt(request.body.userId);

    // Validate user input
    if (isNaN(userId)) {
        return response.status(400).send('Invalid userId');
    }

    // Connect to MySQL
    const cnLibrary = mysql.createConnection(config);

    cnLibrary.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL for library: ' + err.stack);
            return response.status(500).send('Internal Server Error');
        }

        // Query to fetch the user's game library
        const query = `
            SELECT v.name AS title, v.tag_id AS genre, l.playtime
            FROM videogame v
            JOIN library l USING (game_id)
            JOIN store s USING (game_id)
            WHERE l.user_id = ?
        `;

        cnLibrary.query(query, [userId], (err, result) => {
            if (err) {
                console.error('Error fetching library: ' + err.message);
                response.status(500).send('Internal Server Error');
            } else {
                // Render the 'library.ejs' view with the fetched data
                response.render('library', { games: result });
            }

            // Close the connection after sending the response
            cnLibrary.end();
        });
    });
});
// Display all users
app.get('/users', (request, response) => {
    // Connect to MySQL
    const cnUsers = mysql.createConnection(config);

    cnUsers.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL for users: ' + err.stack);
            return response.status(500).send('Internal Server Error');
        }

        // Query to fetch all users
        const query = 'SELECT * FROM users';

        cnUsers.query(query, (err, result) => {
            if (err) {
                console.error('Error fetching users: ' + err.message);
                response.status(500).send('Internal Server Error');
            } else {
                // Render the 'users.ejs' view with the fetched data
                response.render('users', { users: result });
            }

            // Close the connection after sending the response
            cnUsers.end();
        });
    });
});

// Display the form to add a new user
app.get('/addUser', (request, response) => {
    response.render('addUserForm'); 
});

// Handle the form submission to add a new user
app.post('/addUser', (request, response) => {
    const username = request.body.username;
    const birthDate = request.body.birthDate;

    // Connect to MySQL
    const cnAddUser = mysql.createConnection(config);

    cnAddUser.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL for adding user: ' + err.stack);
            return response.status(500).send('Internal Server Error');
        }

        // Query to insert a new user
        const insertQuery = 'INSERT INTO users (username, birth_date) VALUES (?, ?)';

        cnAddUser.query(insertQuery, [username, birthDate], (err, result) => {
            if (err) {
                console.error('Error adding new user: ' + err.message);
                response.status(500).send('Internal Server Error');
            } else {
                // Close the connection after the query completes
                cnAddUser.end();
                const backButton = '<a href="/users" class="back-to-users-button">Back to Users</a>';
                response.send('User added successfully!' + backButton);
            }
        });
    });
});


app.get('/friends', (request, response) => {
    response.render('friendForm'); 
});

// Handle the form submission to fetch the user's friends
app.post('/friends', (request, response) => {
    const userId = parseInt(request.body.userId);

    // Validate user input
    if (isNaN(userId)) {
        return response.status(400).send('Invalid userId');
    }

    // Connect to MySQL
    const cnFriends = mysql.createConnection(config);

    cnFriends.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL for friends: ' + err.stack);
            return response.status(500).send('Internal Server Error');
        }

        // Query to fetch the user's friends
        const query = `
            SELECT f.friend_id, u.username AS friend_username
            FROM friends f
            JOIN users u ON f.friend_id = u.user_id
            WHERE f.user_id = ?
        `;

        cnFriends.query(query, [userId], (err, result) => {
            if (err) {
                console.error('Error fetching friends: ' + err.message);
                response.status(500).send('Internal Server Error');
            } else {
                // Render the 'friends.ejs' view with the fetched data
                response.render('friends', { friends: result, userId });
            }

            // Close the connection after sending the response
            cnFriends.end();
        });
    });
});

// Handle adding a friend
app.post('/addFriend', (request, response) => {
    const userId = parseInt(request.body.userId); // User ID making the request
    const friendId = parseInt(request.body.friendId); // Friend's User ID to be added

    // Validate user input
    if (isNaN(userId) || isNaN(friendId)) {
        return response.status(400).send('Invalid userId or friendId');
    }

    // Connect to MySQL
    const cnAddFriend = mysql.createConnection(config);

    cnAddFriend.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL for adding friend: ' + err.stack);
            return response.status(500).send('Internal Server Error');
        }

        // Check if the friendship already exists in any list
        const checkFriendshipQuery = `
            SELECT * 
            FROM friends 
            WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
        `;
        
        cnAddFriend.query(checkFriendshipQuery, [userId, friendId, friendId, userId], (checkErr, checkResult) => {
            if (checkErr) {
                console.error('Error checking friendship: ' + checkErr.message);
                response.status(500).send('Internal Server Error');
            } else {
                if (checkResult.length > 0) {
                    // The friendship already exists
                    cnAddFriend.end();
                    const backButton = '<a href="/friends" class="back-to-friends-button">Back to friends</a>';
                    return response.status(400).send('Friendship already exists'+ backButton);
                }

                // If the friendship does not exist, add the friend to any list
                const addFriendQuery = `
                    INSERT INTO friends (user_id, friend_id)
                    VALUES (?, ?), (?, ?)
                `;
                
                cnAddFriend.query(addFriendQuery, [userId, friendId, friendId, userId], (addErr, addResult) => {
                    if (addErr) {
                        console.error('Error adding friend: ' + addErr.message);
                        response.status(500).send('Internal Server Error');
                    } else {
                        // Close the connection after the query completes
                        cnAddFriend.end();
                        response.redirect('/friends');
                    }
                });
            }
        });
    });
});


app.get('/groups', (request, response) => {
    // Connect to MySQL
    const cnGroups = mysql.createConnection(config);

    cnGroups.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL for groups: ' + err.stack);
            return response.status(500).send('Internal Server Error');
        }

        // Query to fetch all groups
        const query = 'SELECT * FROM group_table';

        cnGroups.query(query, (err, result) => {
            if (err) {
                console.error('Error fetching groups: ' + err.message);
                response.status(500).send('Internal Server Error');
            } else {
                // Render the 'groups.ejs' view with the fetched data
                response.render('groups', { groups: result });
            }

            // Close the connection after sending the response
            cnGroups.end();
        });
    });
});
