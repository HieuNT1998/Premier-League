const express = require('express');
const app = express();
var {Pool,Client} = require("pg");
const bodyParse = require('body-parser');
const hds = require("express-handlebars");
app.engine("handlebars", hds({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
    next();
});
app.use(bodyParse.urlencoded({ extended: false }));
app.use(bodyParse.json());

app.use(express.static('./views'));

var connectionString = "postgres://postgres:123@localhost:5432/PremierLeague";
var pool = new Pool({
    connectionString:  connectionString,
})


app.get("/",(req,res)=>{
    res.render("ClubPage");
})

app.get("/login",(req,res)=>{
    res.sendFile(__dirname + '/Login.html')
})

app.post('/UserData',(req,res)=>{
    var User = req.body;
    pool.query(`select * from taikhoan where tendangnhap = '${User.username}' and matkhau ='${User.password}'`,
        (err,data)=>{
            if(err) res.status(500).send({success:0,err})
            else{
                if(data.rows.length > 0 ){
                    console.log("success");
                    res.status(201).send({success:1,userName : data.rows[0]})
                }
                else{
                    res.status(500).send({success:0,error:'ten dang nhap hoac mat khau ko dung'})
                }
            }
        }
    )
})



app.get('/register',(req,res)=>{
    res.sendFile(__dirname + '/Register.html')
})

app.post('/registerdata',(req,res)=>{
    var data = req.body
    //console.log(data);
    pool.query(`
    insert into taikhoan values ('${data.username}','${data.password}','${data.name}','${data.Gender}','${data.Birthday}','${data.address}')
    `,(err,data)=>{
        if(err) console.log(err)
        else res.status(201).send({success:1});
    })
})
app.get("/clubs",(req,res)=>{
    res.render("ClubPage");
})

app.get("/club/:clubid/:clubname",(req,res)=>{
    var id = req.params.clubid 
    pool.query(`Select * from doibong where maclb='${id}'`,(err,data)=>{
        if(err) res.status(200).send("ERROR");
        else res.render("clubdetail",{
            Club: data.rows[0] 
        });
        // else res.send(data.rows[0]);
    })
})

app.get("/players",(req,res)=>{
    res.render('Players');
})

app.get('/getplayers',(req,res)=>{
    pool.query(`select ct.*,db.ten from cauthu ct,doibong db where ct.maclb = db.maclb `,(err,data)=>{
        if(err) res.status(500).send({success:0,err:"error"});
        else res.status(201).send({success:1,players:data.rows});
    })
})

app.post('/getplayername',(req,res)=>{
   
    pool.query(`select ct.*,db.ten from cauthu ct,doibong db 
    where ct.maclb = db.maclb and lower(tencauthu) like '%${req.body.name}%'`,
    (err,data)=>{
        if(err) res.status(500).send({success:0,err:"error"});
        else res.status(201).send({success:1,players:data.rows});
    })
})

app.get('/player/:id/:playername',(req,res)=>{
    var idplayer = req.params.id
    pool.query(`select ct.*,db.ten as caulacbo from cauthu ct,doibong db
                where ct.maclb = db.maclb and ct.msct = '${idplayer}'
    `,(err,data)=>{
        if(err) res.status(500).send({success:0,err:'Error'});
        else res.render('playerdetail',{
            player:data.rows[0]
        })
    })
})
app.get('/bxh',(req,res)=>{
    res.render('bxh');
})

app.get("/bangxephang", function (req,res) {
    pool.connect(function(err, client, done){
        if(err){
            return console.error("error fetching client from pool")
        }
        client.query('SELECT * FROM doibong ORDER BY diem DESC , (sobanthang-sobanthua) DESC, sobanthang DESC, ten', function(err, result){
            done();

            if(err){
                res.end();
                return console.error('error running query', err);
            }
           res.status(201).send({Clb:result.rows})
        });
    });
})

app.get('/match',(req,res)=>{
    res.render('LichThiDau');
})


app.get('/trandau',(req,res)=>{
    pool.query(`select td.*, db.ten as ten,db.maclb as maclb,db.logourl as logourl from trandau td,doibong db
    where td.madoinha = db.maclb or td.madoikhach = db.maclb
    order by vongdau , matran`,(err,data)=>{
        if(err) res.status(500).send({success:0,err:"error"})
        else {
            for(var i=0 ; i< data.rows.length ;i = i+2){
                if(data.rows[i].maclb == data.rows[i].madoikhach){
                    var tmp = data.rows[i];
                    data.rows[i] = data.rows[i+1];
                    data.rows[i+1] = tmp;
                }
            }
            res.status(201).send({success:1,matchs:data.rows})
        }
    })
})

app.get('/match/:Idtran',(req,res)=>{
    // console.log("run")
    var idtran = req.params.Idtran;
    pool.query(`
    select td.*, db.ten as ten,db.maclb as maclb from trandau td,doibong db
    where (td.madoinha = db.maclb or td.madoikhach = db.maclb) and td.matran = '${idtran}'
    `,(err,data)=>{
        if(err) res.status(500).send({success:0,Err:"ERROR"})
        else{ 
            if( data.rows.length >0 ){
                // console.log( data);
                if(data.rows[0].maclb == data.rows[0].madoikhach ){
                    var tmp = data.rows[0];
                    data.rows[0] = data.rows[1];
                    data.rows[1] = tmp;
                }
                // console.log(data.rows[0])
                res.render('match',{
                    trandau: data.rows[0],
                    trandau1:data.rows[1]
                })  
        }}
    })
})
app.get('/goals/:idtran',(req,res)=>{
    var idtran = req.params.idtran;
    pool.query(`select bt.*,ct.tencauthu as tencauthu,ct.maclb as maclb, td.madoinha as madoinha,td.madoikhach as madoikhach from banthang bt,cauthu ct,trandau td
    where ct.msct = bt.mact and bt.matran = td.matran and bt.matran='${idtran}'`,
    (err,data)=>{
        if(err) res.status(500).send({success:0,err:"ERROR"})
        else {
            res.status(201).send({success:1,goals:data.rows})
        }
    })
})

app.get('/comments/:Idtran',(req,res)=>{
    // console.log('aaaaaaa')
    var idtran = req.params.Idtran;
    pool.query(`select * from binhluan where matran = '${idtran}'`,(err,data)=>{
        if(err) res.status(501).send({success:0,err:err});
        // else console.log(data.rows);
        else res.status(201).send({success:1,comments:data.rows});
    })

})

app.get('/vuaphaluoi',(req,res)=>{
    res.render('VPL');  
})
app.get('/getvuaphaluoi',(req,res)=>{
    pool.query(`
    select ct.tencauthu as tencauthu ,ct.tuoi as tuoi, ct.soban as soban, clb.ten as tenclb from cauthu ct ,doibong clb
    where ct.maclb = clb.maclb
    order by ct.soban desc limit 10`,(err,data)=>{
        if(err) console.log(err);
        else res.status(201).send({players:data.rows})        
    }
) 
})

app.get('/datve/:idtran',(req,res)=>{
    var idtran = req.params.idtran
    pool.query(`
    select td.*, db.ten as ten,db.maclb as maclb , db.sannha as sanvandong from trandau td,doibong db
    where (td.madoinha = db.maclb or td.madoikhach = db.maclb) and td.matran = '${idtran}'   
    `,(err,data)=>{
        if(err) console.log(err)
        else{ 
            if( data.rows.length >0 ){
                // console.log( data);
                if(data.rows[0].maclb == data.rows[0].madoikhach ){
                    var tmp = data.rows[0];
                    data.rows[0] = data.rows[1];
                    data.rows[1] = tmp;
                }
                // console.log(data.rows[0])

                res.render('datve',{
                    trandau: data.rows[0],
                    trandau1:data.rows[1]
                })  
        }}
    })
})


app.get('/ticket', (req, res)=>{
    res.render('ticket');
})

app.get("/getticket", function(req,res){
    
    pool.connect(function(err, client, done){
        if(err){
            return console.error("error fetching client from pool")
        }
        client.query('SELECT ten FROM doibong ORDER BY maclb', function(err, result){
            done();
            if(err){
                res.end();
                return console.error('error running query', err);
            }
            res.status(201).send({Clb:result.rows})
        });
    });
})

app.get('/getMatchInfor', function(req, res){
    pool.connect(function(err, client, done){
        if(err){
            return console.error("error fetching client from pool")
        }
        client.query(`select matran, sannha, madoinha, madoikhach, maclb, vongdau, thoigian, ten, trangthai from trandau, doibong
        where maclb = madoinha or maclb = madoikhach 
        order by vongdau,matran asc `, function(err, result){
            done();
            if(err){
                res.end();
                return console.error('error running query', err);
            }
            // console.log(result.rows);
            var Infor = result.rows
            // console.log(Infor)
            for(var i=0; i<result.rows.length; i+=2){
                if(Infor[i].madoikhach == Infor[i].maclb){
                    var swap = Infor[i+1]
                    Infor[i+1] = Infor[i]
                    Infor[i] = swap
                }
            }
            res.status(201).send({Infor:result.rows})
        });
    });
})


app.get('/getbooked/:idtran',(req,res)=>{
    var idtran = req.params.idtran;
    pool.query(`
    select * from ghe g,trandau td,ve v
    where g.maghe = v.maghe and v.matran = td.matran and td.matran='${idtran}'
    `,(err,data)=>{
        if(err) console.log(err)
        else {
            res.status(201).send({success:1,tickets:data.rows})

        }
    })
})
app.post('/booktickets',(req,res)=>{
    var data = req.body
    var err = 1
    for(var i=0;i<data.data.chairs.length;i++){
        pool.query(`
        insert into ve values ('${data.data.matran}','${data.data.chairs[i]}','${data.data.userName}')
        `)
    }
    res.status(201).send({success:1,message:"thanh cong"})
})
app.get('/cost',(req,res)=>{
    pool.query(`
        select * from ghe
    `,(err,data)=>{
        if(err) console.log(err)
        else res.status(201).send({success:1,cost:data.rows})
    })
})
app.post('/bookednum',(req,res)=>{
    pool.query(`
        select count(*) from ve
        where username='${req.body.userName}' and matran = '${req.body.matran}'
        group by username
    `,(err,data)=>{
        if(err) console.log(err)
        else res.status(201).send({bookednum:data.rows[0]})
    })
})
io.on('connection', function(socket){
    socket.on('room', function(room) {
        socket.join(room);
        socket.phong = room
    });
    socket.on('comment',(data)=>{
        pool.query(`insert into binhluan values ('${data.match}','${data.userName}','${data.content}')`,(err,data1)=>{
            if(err) console.log(err);
            else io.sockets.in(socket.phong).emit('co_comment',{userName:data.userName,binhluan:data.content});
        })
    })
});

http.listen(6969,(err)=>{
    if(err) console.log(err);
    else console.log("Server ready !!!");
})