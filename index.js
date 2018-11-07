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

function ValidCreate(req) {
    if (req.body.title !== undefined && req.body.rating !== undefined && req.body.rating > 0 && req.body.year !== undefined
        && req.body.budget !== undefined && req.body.gross !== undefined && req.body.poster !== undefined && req.body.position !== undefined
        && req.body.year > 0 && req.body.budget > 0 && req.body.gross > 0 && req.body.position > 0)
    return true;
    else
        return false;
}


app.post('/create', (req, res) => {
    if (ValidCreate(req)) {
        req.body.id = films.length;
        for (let i = 0; i < films.length; i++) {
            if (req.body.position === films[i].position) {
                for (let j = i; j < films.length; j++) {
                    films[j].position++;
                }
            }
        }
        films.push(req.body);
        fs.writeFile("top250.json", JSON.stringify(films), "utf8", function () {});
        RefreshPosition();
        res.send(All());
    }
    else {
        res.send("{code: 400, message: Request invalid}");
    }
});

function ExistID(id) {
    return new Promise((resolve, reject) => {
        let exist = 0;
        for (i = 0; i < films.length; i++) {
            if (films[i].id === id) {
                resolve("exist");
                exist = 1;
            }
            if (i === films.length && exist === 0) {
                reject("error");
            }
        }
    })
}

app.post('/update', (req, res) => {
    ExistID(req.body.id).then(
        exist => {
            for (let i = 0; i < films.length; i++) {
                if (films[i].id === req.body.id) {
                    if (req.body.title !== undefined)
                        films[i].title = req.body.title;
                    if (req.body.rating !== undefined && req.body.rating > 0)
                        films[i].rating = req.body.rating;
                    if (req.body.year !== undefined && req.body.year > 0)
                        films[i].year = req.body.year;
                    if (req.body.budget !== undefined && req.body.budget >= 0)
                        films[i].budget = req.body.budget;
                    if (req.body.gross !== undefined && req.body.gross >= 0)
                        films[i].gross = req.body.gross;
                    if (req.body.poster !== undefined)
                        films[i].poster = req.body.poster;
                    if (req.body.position !== undefined && req.body.position > 0) {
                        for (let j = 0; j < films.length; j++) {
                            if(films[j].position >= req.body.position) {
                                films[j].position++;
                            }
                        }
                        films[i].position = req.body.position;
                    }
                }
            }
            res.send(All());
        },
        error => {
            res.send("{code: 404, message: Not found");
        });
    fs.writeFile("top250.json", JSON.stringify(films), "utf8", function () {});
});

app.post('/delete', (req, res) => {
    ExistID(req.body.id).then(
        exist => {
            let k = films[films.findIndex(film => film.id === req.body.id)].position;
            films.splice(films.findIndex(film => film.id === req.body.id), 1);
            for (let i = 0; i < films.length-1; i++) {
                if(films[i].position > k) {
                    films[i].position--;
                }
            }
            fs.writeFile("top250.json", JSON.stringify(films), "utf8", function () {});
            RefreshPosition();
            res.send(All());
        },
        error => {
            res.send("{code: 404, message: Not found");
        });
});

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});