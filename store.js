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

var app = express();
app.use(express.urlencoded({extended : false}));
app.use(express.json());
app.listen(3000);

app.get('/', function(request, response) {
    const cn = mysql.createConnection(config);
    cn.connect();

    cn.query(q, function(err, result, fields) {
        if (err) {console.log('Error: ', err)};

        var res = '<html>\n<body>\n<b>Update country information:</b>\n<br/>\n<form method="post" action="/updateCountry">\n<table>\n<tr>\n<td>Country:</td>\n<td>\n<select name="CountryCode">';

        for (const r of result){
            res += '<option>' + r['country_name'] + '</option>\n'
        }

        res += '</select>\n</td>\n</tr>\n<tr>\n<td>GDP:</td>\n<td><input type="text" name="GDP" /></td>\n</tr>\n<tr>\n<td>Inflation:</td>\n<td><input type="text" name="Inflation" /></td>\n</tr>\n<tr>\n<td><input type="submit" value="Update" /></td>\n</tr>\n</table>\n</form>\n</body>\n</html>';
        response.send(res);
    });
    cn.end();
});

app.post("/updateCountry", function(request, response) {

    const cn = mysql.createConnection(config);
    cn.connect();

    cn.end();
});