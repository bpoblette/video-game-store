/*
Name: Brandon Poblette
Date: 11/14/2023
Assignment: HW6
Section: 01
*/

const mysql = require('mysql2');
const express = require('express');
const path = require('path');
const config = require('./config.json');
const q = ''
const cn = mysql.createConnection(config);

var app = express();
app.use(express.urlencoded({extended : false}));
app.use(express.json());
app.listen(3000);

app.get('/', function (request, response) {
  response.sendFile(path.join(__dirname + "/store.html"));
});

app.get('/topgames', (request, response) => {
  cn.connect((err) => {
      if (err) {
          console.error('Error connecting to MySQL: ' + err.stack);
          response.status(500).send('Internal Server Error');
          return;
      }

      const query = `
      SELECT v.name AS title, s.sold AS number_sold
      FROM videogame v JOIN store s USING (game_id)
      ORDER BY s.sold DESC
      LIMIT 5`;

      cn.query(query, (err, result) => {
          if (err) {
              console.error('Error fetching top games: ' + err.message);
              response.status(500).send('Internal Server Error');
          } else {
              response.render('store', { games: result });
          }

          // Close the connection after sending the response
          cn.end();
      });
  });
});

app.get('/games', function (request, response) {
  cn.connect((err) => {
      if (err) {
          console.error('Error connecting to MySQL: ' + err.stack);
          response.status(500).send('Internal Server Error');
          return;
      }

      const query = `
      SELECT v.name, s.price, s.sold
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



    
// app.post("/Library", function(request, response)) {

// }
