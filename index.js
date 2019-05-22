var express = require('express');
var app = express();
const hds = require('express-handlebars');
app.engine('handlebars',hds({defaultLayout:'demo'}));
app.set("view engine","handlebars");

app.use(express.static("public"));
// app.set("view engine" , "ejs");
// app.set("views", "./views");
app.listen(3000);

app.get("/", function(req, res){
    console.log("adawdcsafew")
    res.render("bxh");
});

var pg = require('pg');
var config = {
    user: 'postgres',
    database: 'PremierLeage',
    password: '23051998',
    host: 'localhost',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
};

var pool = new pg.Pool(config);

app.get("/bangxephang", function (req,res) {
    pool.connect(function(err, client, done){
        if(err){
            return console.error("error fetching client from pool")
        }
        client.query('SELECT * FROM doibong ORDER BY diem DESC', function(err, result){
            done();

            if(err){
                res.end();
                return console.error('error running query', err);
            }
           res.status(201).send({Clb:result.rows})
        });
    });
})


