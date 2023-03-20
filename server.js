const express = require ('express');
const mongoose = require('mongoose');
const collection = require("./mongodb");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const rooms = require("./roomschema");
const teams = require("./teams");
var crypto = require("node:crypto");
const ws = require('ws');

const fs = require('fs');
const { Console } = require('node:console');

webSockets = {};

var team_play_enabled = 0;
var current_users = new Set();
var joined_teams = {}


var indvidual=0;


const app = express();

var http = require('http').Server(app);
var io = require("socket.io")(http);




// const server = app.listen(3000);
http.listen(3000);

// server.on("upgrade" , (request , socket , head) => {
//     wsServer.handleUpgrade(request , socket, head, socket => {
//         wsServer.emit('connection' , socket , request);
//     })
// })



var red_room = "red";




app.set('view engine', 'ejs'); // Register View Engine

// app.listen(3000);





// Connecting to DB
const dbURL = "mongodb+srv://pranav:1I8VF9VcVCB0nB5k@node-db.3fceikj.mongodb.net/node-db";
mongoose.connect(dbURL)
    .then((result) => {
        console.log("Connected");
    }).catch((err)=>{
        console.log(err);
    })



// Setting static middle ware files
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}))
app.use(express.json());


//User redirected to quiz-page after signing up!

app.use(express.json());
app.use(cookieParser());
const oneDay = 1000 * 60 * 60 * 24;

//session middleware
app.use(sessions({
    secret: crypto.randomBytes(16).toString('hex'),
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));
var session={
    userid:0,
}
// Route for home page
app.get('/' , (req,res) => {
    session = req.session;
    if(session.userid){
        res.render('index',{username:session.userid});
    }else{
       res.render('index',{username:0});}
});

// Route for login page
app.get('/login' , (req,res) => {
    res.render('login',{message:""})
});

app.get('/logout',(req,res) => {
    current_users.delete(session.userid)
    current_users_scores[session.userid] = 0;
    req.session.destroy();
    res.redirect('/');
});


app.get('/signup', (req,res) => {
    res.render('signup',{message:0})
});

app.get('/instructions', (req,res) => {
    res.render('instructions')
});
app.get("/quizpage",(req,res)=>{
    if(session.userid){
        res.render("quizpage",{user:session.userid})
    }else{
        res.redirect("/")
    }

})
var roomid;
app.get("/quiz-details" , (req,res) => {
    roomid = crypto.randomBytes(2).toString('hex');
    
    res.render("quiz-details" , {roomid});
})
var teamid;
app.get("/join-quiz" , (req,res) => {
    teamid = crypto.randomBytes(2).toString('hex');
    res.render("quizjoin", {teamid})
})


app.post('/signup',async (req,res)=>{
    const check = await collection.findOne({username:req.body.username})

    try{if(check.username){
        res.render('login',{message:"You have already registered with us. You will be now redirected to login page"})
        
    }}
    
    catch
    
    {
    const data = {
        username : req.body.username,
        password : req.body.password
    }

    await collection.insertMany([data])



    res.render('signup',{message:"You have successfully registered with us. Please login when prompted."})
}


})

let team_users;

app.post("/login" , async (req,res) => {

    
        const check = await collection.findOne({username:req.body.username})
        if(check != null){
        if(check.password === req.body.password){
            session=req.session;
            session.userid=req.body.username;
            if(indvidual==0 && red_room != "red" ){
                const check = await teams.findOne({roomcode:red_room})
                await node-db.teams.deleteOne({roomcode:red_room}).then(()=>{
                    console.log("chalgya")
                }).catch((err)=>{
                    console.log(err)
                })
                check.users.push(session.userid)
               
                await teams.insertMany([check])


                res.redirect(`/room/${red_room}`)
            }else if(indvidual==1){
                res.redirect(`/room/${red_room}`)
            }else{
                res.redirect('/')
            }
            
            // res.render('quizpage' , {user: req.body.username});
        }
        else{
            res.render('login',{message:"Incorrect credentials"})

        }
    }

        else{
            // res.render('login',{message:""})
            res.render('login',{message:"User does not exists"})
        }
    })

let quiz_players = [];

let quiz;

app.post("/quiz-details" , async (req,res) => {
    room_code = roomid;
    quizdetails = {
        roomcode : roomid,
        tf : {"length" : req.body.tf,"questions":[],"answers":[]},
        scq : {"length" : req.body.scq,"questions":[],"answers":[]},
        num : {"length" : req.body.num,"questions":[],"answers":[]}
    }
    quiz = quiz_details;
    // await rooms.insertMany([quizdetails])
    res.render("quiz-create" , {params : quizdetails});
})

app.post("/quizcreate",async (req,res)=>{
    for(let i=0;i<quizdetails.scq.length;i++){
        quizdetails.scq.questions[i] = {}

        quizdetails.scq.questions[i] = {text:req.body["SCQ"+i],options:[]}
        quizdetails.scq.answers[i] = req.body.Answer;

        for(let j=0;j<4;j++){
            quizdetails.scq.questions[i].options[j] = req.body[j]
        }
        


    }
    for(let i=0;i<quizdetails.tf.length;i++){
        quizdetails.tf.questions[i] = req.body["TF"+i]
       
        if(req.body.T == "True"){
            quizdetails.tf.answers[i] = "True"
        }else{
            quizdetails.tf.answers[i] = "False"
        }
    }

    for(let i=0;i<quizdetails.num.length;i++){
        quizdetails.num.questions[i] = req.body["NUM"+i]
        quizdetails.num.answers[i] = req.body.value;
    }
   
    
    //insert into database here ..> Pranav

    await rooms.insertMany([quizdetails]);
    res.redirect('/');


})
var room_code;
app.get("/team/:id",async (req,res)=>{
    const id = req.params.id;
    const check = await teams.findOne({teamid:id})
            if(check == null){
                res.send('Incorrect team id')
                
            }
            else{
                team_play_enabled = 1;
                red_room = check.roomcode
                res.redirect('/login')
                
                   
                }
                // res.redirect(`/room/${check.roomcode}`)
                // res.send(`Welcome ${session.userid} to the quiz`)
               
            }

)






app.get("/room/:id",async (req,res)=>{
    const id = req.params.id;
    const check = await rooms.findOne({roomcode:id})
            if(check==null){
                res.send("Incorrect roomid")
            }else{
                if(session.userid){

                    res.redirect(`/quiz/${req.params.id}`)
                }else{
                    indvidual =1
                    red_room = id
                res.redirect('/login')

                }
                
                // res.redirect(`/room/${check.roomcode}`) 
                // res.send(`Welcome ${session.userid} to the quiz`)
               
            }

})

var team_current_code;

app.post("/join-quiz",async (req,res)=>{
    if(req.body.team_id==undefined){
        
        {
            const check = await rooms.findOne({roomcode:req.body.room_id})
            room_code = req.body.room_id;
            // console.log(check);
            // console.log(room_code +" is your room.");
            if(check == null){
                res.send('Incorrect room id')
                
            }
            else{
                
                res.redirect(`/quiz/${room_code}`)
               
            }
            
                
        }
    }else if(req.body.room_id==undefined){
       
            const check = await teams.findOne({teamid:req.body.team_id})
            team_current_code = req.body.team_id;
            
            if(check == null){
                res.send('Incorrect team id')
                
            }
            else{
                const check1 = await teams.findOne({roomcode:check.roomcode})

                var flag = 0;
                await teams.deleteOne({roomcode:check.roomcode}).then(()=>{
                    console.log("chalgya")
                }).catch((err)=>{
                    console.log(err)
                })
                
                    if(!check1.users.includes(session.userid)){
                    check1.users.push(session.userid);}
                        var index;
                    //io.on('connection' , function(socket) {
                        
                        // Have to make a room so that all players are redirected to quiz site when leader clicks so!
                        
                    //})
                
                
                await teams.insertMany([check1])
                

                
                team_play_enabled = 1

                var team_leader = check1.users[0];

                // socket.join(check.team_id)
                // socket.join(session.userid)


                // res.render('teamspage' , {team: check1.users , team_leader:team_leader , user: session.userid , room : check1.roomcode});
                res.redirect(`/waitingroom/${check1.roomcode}`)
                // res.redirect(`/quiz/${check.roomcode}`)            

                
            }
        

    }else{
        
            const check = await rooms.findOne({roomcode:req.body.room_id})
            if(check==null){
                res.send("Incorrect roomid")
            }else{
            var data = {
                roomcode:req.body.room_id,
                teamid:req.body.team_id,
                users:[session.userid]
            }
            team_play_enabled = 1;
            team_current_code = req.body.team_id;
            await teams.insertMany([data])
            
            res.redirect(`/waitingroom/${req.body.room_id}`)
            
           
    }
}
});
var online_teams;
var online_users;
var new_user;
var new_team;
var team_leader;
const online_leaders = [];
const arr_checker = [];
app.get("/waitingroom/:id",async (req,res)=>{
            const data = await teams.find({roomcode:req.params.id}) 
            online_teams = [] 
            online_users = []
            
            new_team = ""
            new_user = session.userid;
            for(const j of data){
                online_teams.push(j.teamid)
                arr_checker.push(j.teamid);
                const arr = []
                for(const i of j.users){
                    if(i==session.userid){
                        new_team = team_current_code
                        console.log("Teamid is: " + team_current_code);
                    }
                    arr.push(i)
                }
                online_users.push(arr)
            }
            console.log(online_teams)
            console.log(online_users)
            for(const j of online_users){
                online_leaders.push(j[0]);
            }
            
            // io.on("connection", (socket) => {
                
            //     socket.join(req.params.id);
            //     socket.join(new_user);
            //     socket.join(new_team);
               

            //     console.log(new_team + " " + new_user)

                
            //     // socket.to("quiz-room").emit("new_user",{new_user_team : new_team, new_user_joined:session.userid})
            //     socket.to(req.params.id).emit("new_user",{new_user_team : new_team, new_user_joined:session.userid})
            //     // console.log("i worked")

            //   });
              
            res.render('teamspage',{teams_online : online_teams,users_online:online_users,logged_in:session.userid , room: req.params.id , leaders: online_leaders , teamname : team_current_code , prevteams : arr_checker})
            
})



// let msg_final;
let quiz_details;
// app.get('/quizpage:id' , async (req, res) => {
//     const check = await rooms.findOne({roomcode: req.params.id})
//     res.render('quizpage' , {check1: check , user: session.userid});
    

    
//     io.on('connection' , function(socket){

//         socket.on("start" , (msg) =>{
//             msg_final+=msg.msg
//             console.log("MSG IS: " +msg.msg)
                
//             })
        
        
//        if(msg_final == "11"){
//         //Not working, found a bit of a flaw in the logic.. will try tom.. rest the things that are working are that the leader gets the start quiz button.. 
//         // Team code - e889 , leader - god!
//        }
       

       

        
//     })
    
    
    
// }
// )

var room_current_code;
var team_game_start =0;

app.get("/quiz/:id",async (req,res)=>{
    const check = await rooms.findOne({roomcode:req.params.id})

    // console.log(check)
    if(check==null){
        res.send("incorrect room id")
    }
    
    else{
        if(session.userid){
            if(team_play_enabled){
            team_game_start = 1;
            res.render('quizpage_team' , {user:session.userid , check1 : check , team_code: team_current_code , team: online_users , leaders: online_leaders});
            console.log(joined_teams)
            }
            else{
                team_mode()
                res.render('quizpage' , {user:session.userid , check1 : check});

            }
        
        }else{
            const check1 = await teams.findOne({roomcode:check.roomcode})
            team_mode()
            room_current_code = req.params.id;
            res.redirect(`/room/${req.params.id}`)
        }
    }

    

})

function team_mode(){
    console.log("successful")
}





var currentusers = {};

var current_users_scores = {}
currentusers[room_code] = "Players are: "
var current_teams_scores = {};
var roomcode = room_code;
let scores = [];

let msg = "Players in the quiz right now: ";
var thumbs_up = 0

// let users = "The players currently are: ";
io.on('connection' , function(socket){
    if(session.userid){
        current_users.add(session.userid);
        console.log(session.userid + " is connected.");
        current_users_scores[session.userid] = 0;
        socket.join(room_code)
   
        console.log("LEADERS ARE" + online_leaders);

        if(online_leaders.includes(session.userid)){
           join_team_leaders();
        }
        

       
        
    //     if(socket.rooms.has(room_code)){
    //         currentusers[room_code] += session.userid + " ";
    //         console.log(currentusers[room_code]);

    //          currentusers[room_code] =  currentusers[room_code].slice(9);
    // }

    //         io.to(room_code).emit('testing' , currentusers[room_code]);

       
        
    }
    var prev_rand_int = [];
    
    if(team_play_enabled){

        
    //    function get_uniq_rand_int () {
    //     var rand_nums = []
    //     for(const j of online_users){
    //         let num = Math.random();
    //         num = num * j.length;
    //         num = Math.floor(num);
    //         prev_rand_int.push(num);
    //         if(!prev_rand_int.includes(num)){
    //             rand_nums.push(num);
    //             return rand_nums;
    //         }
    //         else{
    //             get_uniq_rand_int();
    //         }
    //     }

    //    }
                // socket.join("quiz-room");
                // socket.on("req" , (data) => {
                //     var random_num = [];
                //     random_num = get_uniq_rand_int();
                //     let user_target_0 = online_users[0][random_num[0]];
                //     let user_target_1 = online_users[0][random_num[1]];

                //     socket.to(user_target_0).emit("remove_hide");
                //     socket.to(user_target_1).emit("remove_hide");

                // })
                
                socket.join(room_current_code);
                // socket.join(new_user);
                // socket.join("quiz-room");
                // socket.join(new_team);
                join_team_memebers();

                if(online_leaders.includes(session.userid)){
                    socket.emit("Leader" , {name:session.userid});
                    
                }

                // for(const item of online_users){
                //     if(item.length > 1){
                //         join_leaders();
                //     }
                // }
                // if(online_leaders.includes(session.userid)){
                //     socket.emit("leader" , {data: "MSG TO LEADER"})
                // }
               

                
                console.log(team_current_code + " " + new_user)

                
                // socket.to("quiz-room").emit("new_user",{new_user_team : new_team, new_user_joined:session.userid})
                socket.to(room_current_code).emit("new_user",{new_user_team : team_current_code, new_user_joined:session.userid})
                // console.log("i worked")


               io.to(online_leaders[0]).emit("unhide");
               io.to(online_leaders[2]).emit('unhide');


                // socket.on("thumbs_up",(data)=>{
                //     thumbs_up++;
                //     if(thumbs_up==2){
                //         redirect();
                //     }
                // })
               
                socket.on('thumbs_up' , () => {
                    io.to(team_current_code).emit("gotoquiz");
                    console.log("I EMMITTED THE EVENT");
                })
                // function redirect(){
                //     socket.to(room_current_code).emit("redirect",{left_user:session.userid});

                // }

                // if(team_game_start){
                //     for(let i=0;i<online_teams;i++){
                //         for(let j=0;j<online_users[i].length;j++){
                //             socket.to(online_teams[i]).to(online_users[i][j]).emit(online_users[i][j])
                //         }
                    
                //     }
                // }



               

                

                

                // socket.on("thumbs_up1" , (data) => {
                //     thumbs_up++;
                //     if(thumbs_up==2){
                //         socket.to("quiz-room").emit("redirect");
                //     }
                // })


    

              
    }
    async function join_team_memebers(){
        await socket.join(team_current_code);
        console.log("PLAYER IS IN");
    }
    async function join_team_leaders(){
        await socket.join(session.userid);
        console.log("LEADER HAS JOINED SESSION>USER ID ROOM");
    }

    socket.on("score",(obj)=>{
        current_users_scores[obj.userid] = obj.score
        console.log("Current score of " + obj.userid + " is " + obj.score)
    })
    socket.on("score-team",(obj)=>{
        current_teams_scores[obj.team] = obj.score
        console.log("Current score of " + obj.team + " is " + obj.score)
    })

    socket.on('disconnect' , () => {
        if(session.userid){
            console.log(session.userid + " is disconnected.");           
            current_users.delete(session.userid);
            // console.log(current_users);
        }
        // socket.to("quiz-room").emit("del_user",{user_left:session.userid}) 

    })
 

    
    // Real time team players starting
    // Players event for submit button in temam

})




app.post('/score' , async (req,res) => {
     res.render('leaderboard' , {scores_list : scores , player: current_users}); 

})



// Users display, leaders creation , css +> Tasks to do.  Css is done! 
// Idea is to the set the users[0] guy or gal to be the leader and then he / she will see the submit button!




