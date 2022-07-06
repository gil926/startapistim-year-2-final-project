const express = require('express')
const app = express()
const ejs = require('ejs')
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const User = require('./models/usermodel')
const Msg = require('./models/massages')
const mongodb = 'mongodb+srv://gil123:5656tyui@cluster0.msvzs.mongodb.net/massage-database?retryWrites=true&w=majority'
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);




app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended: true}));


mongoose.connect(mongodb,{ useNewUrlParser: true,useUnifiedTopology: true }).then(()=>{
    console.log('mongo connected')
   }).catch(err => console.log(err))
   

app.get('/',  (req, res)=> {
  res.render('login')

})

app.get('/sign_up',  (req, res)=> {
  res.render('sign_up')
})


app.post('/',async(req,res)=>{
 let user = new User(req.body);
 await user.save();
  res.render('login')
})

app.post('/post-page',async(req,res)=>{ 
if(await User.find(req.body) == false){
  res.render('login')
}
else{
  let username = req.body.username;
  let user = await User.find(req.body);
  let avatar = await User.find(req.body,{avatar:1});
  res.render('page',{user,avatar})

}
})


io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  //outputing the massages from database
      Msg.find().then(result=>{
       socket.emit('output-messages',result)
      });
      
      //emiting the massage to mongodb database
       socket.on('chat message', (msg) => {
        const message = new Msg({msg});
          message.save().then(()=>{
            io.emit('chat message', msg);
            });
          });

          socket.on('chat message', (msg) => {
            console.log('message: ' + msg);
          });      
});


app.use(express.static('images'))

// app.post('/',async(req,res)=>{
//   const username = req.body.username;
//   const password = req.body.password;
//  let user = new User(req.body);
//  await user.save();
//   res.render('chat',{username,password,user})
// })



server.listen(3000, () => {
  console.log('listening on *:3000');
});