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
const q = 'SELECT * FROM country ORDER BY country_name'

var app = express();
app.use(express.urlencoded({extended : false}));
app.use(express.json());
app.listen(3000);

// list countries to select country to update
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

// update country information based on user input
app.post("/updateCountry", function(request, response) {
    const selectedCountry = request.body.CountryCode;
    const qUpdateCountry = 'UPDATE country SET gdp=?, inflation=? WHERE country_name=?';

    var gdp = request.body.GDP;
    var inflation = request.body.Inflation;

    const cn = mysql.createConnection(config);
    cn.connect();

    cn.query(qUpdateCountry, [gdp, inflation, selectedCountry], function(err, result, fields) {
        if (err) {console.log('Error: ', err)};
    });
    cn.commit();

    // list countries to view updated information
    const q = 'SELECT * FROM country';
    cn.query(q, function(err, result, fields) {
        var res = '<html>\n<body>\n<h2>Country Information</h2>\n';
       
        for (const r of result) {    
            res += '<table>'
            res += '<h3>Country Name:' + r['country_name'] + '</h3>\n';
            res += '<p>Country Code:' + r['country_code'] + '</p>\n';
            res += '<p>Country GDP:' + r['gdp'] + '</p>\n';
            res += '<p>Country Inflation:' + r['inflation'] + '</p>\n';
            res += '</table>' 
        }
        res += '</body>\n</html>';

        response.send(res);    
    });
    cn.end();
});