const express = require('express');
const app = express();
let films = require("./top250.json");
const fs = require('fs');
let bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

function RefreshPosition() {
    films.sort((a, b) => {
        return a.position - b.position;
    });
    let a = 1;
    for (let i = 0; i < films.length; i++) {
        films[i].position = a;
        ++a;
    }
}

function All() {
    RefreshPosition();
    return films;
}

app.get('/readAll', (req, res) => {
    res.send(All());
});


app.post('/read', (req, res) => {
    res.send(films[films.findIndex(film => film.id === req.body.id)]);
});

//
// app.get('/', (req, res) => {
//     res.send('Hello World!');
// });

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});