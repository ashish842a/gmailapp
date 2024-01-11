var express = require('express');
var router = express.Router();

const passport = require("passport");
const multer = require("multer")
const path = require("path")
var userModel = require("./users")
const mails = require("./mail")
const sentMail = require("./nodemailer");
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()))

// const { route } = require('../app');

// multer code
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    // console.log(file.filename);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null,uniqueSuffix+"-"+file.originalname)
  }
})


// filter function

// var maxSize = 1 * 1000 * 1000;
function fileFilter (req, file, cb) {
  var ext = path.extname(file.originalname);
  console.log(file);
  console.log(ext);
  // console.log(file.mimetype);
  if(ext == '.jpg'|| ext == '.jpeg'||ext == '.png'){
    console.log("Sahi file");
    cb(null, true);
  }
  else{
    
    console.log("galt file");
    return cb(null, false, new Error('I don\'t have a clue!'));
  }
  // if (file.mimetype !== 'image/png' || file.mimetype !== 'image/jpeg') {
  //   console.log("Sahi file");
  //   cb(null, true);
  // }
  // else{
    
  //   // console.log("galt file");
  //   // return cb(null, false, new Error('I don\'t have a clue!'));
  // }
}

  // You can always pass an error if something goes wrong:
  // cb(new Error('I don\'t have a clue!'))

// }

const upload = multer({ storage: storage ,fileFilter:fileFilter})


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// logout
router.get("/logout",function(req,res){
  req.logout(function(err){
    if (err) throw err;
    res.redirect('/login')
  })
})



// check username while registering
// router.get("/check/:username",async function(req,res){
//   let userData =await userModel.findOne({username:req.params.username})
//   res.json({userData})
//   // console.log(userData);
// })

router.get("/check/:username",async function(req,res){
  const userData = await userModel.findOne({username:req.params.username})
    res.json({userData})
})







// 1 Register

router.post('/register',function(req,res){
  
  const userData = new userModel({
    name:req.body.name,
    username:req.body.username,
    phone:req.body.phone,
    email:req.body.email
  })

  userModel.register(userData,req.body.password)
  .then(function(registerUser){
    passport.authenticate('local')(req,res,function(){
      res.redirect("/profile")
    })
  })
})

router.get("/register",function(req,res){
  res.render("register");
})

// Login
// login code
router.post('/login',passport.authenticate("local",{
  
  successRedirect:'/profile',
  failureRedirect:'/login',
  
}),function(req,res){})

router.get("/login",function(req,res){
  
  res.render("login");
})
// profile 

router.get("/profile",isLoggedIn,async function(req,res){
  const logginInUser = await userModel.findOne({username:req.session.passport.user})
    // console.log(logginInUser.profilePic);
  const ruser =await userModel.findOne({username:req.session.passport.user})
  .populate({
    path:"recievedMails",
    populate:{
      path:"userId"
    }
  })
  
// console.log(ruser.recievedMails);
  res.render("profile",{user:logginInUser,ruser:ruser.recievedMails})

})
// receive mail check
router.get("/receive",isLoggedIn,async function(req,res){
  const logginInUser = await userModel.findOne({username:req.session.passport.user})
    // console.log(logginInUser.profilePic);
  const ruser =await userModel.findOne({username:req.session.passport.user})
  .populate({
    path:"recievedMails",
    populate:{
      path:"userId"
    }
  })
  
// console.log(ruser);
  res.render("receive",{user:logginInUser,ruser:ruser.recievedMails})
})

// sent mail check

router.get("/sentmail",isLoggedIn,async function(req,res){
  const logginInUser = await userModel.findOne({username:req.session.passport.user})

  const suser =await userModel.findOne({username:req.session.passport.user})
  .populate({
    path:"sentMails",
    populate:{
      path:"userId"
    }
  })
  console.log(suser.sentMails);
    res.render("sent",{user:logginInUser,suser:suser.sentMails})
})

// read
router.get("/read",isLoggedIn,async function(req,res){
  const ruser =await userModel.findOne({username:req.session.passport.user})
  .populate({
    path:"recievedMails",
    populate:{
      path:"userId"
    }
  })
  res.render("read",{ruser:ruser.recievedMails})

  res.send("hello")
})

// photo code 
router.post("/photo",upload.single("image"),async function(req,res,next){
  const user =await userModel.findOne({username:req.session.passport.user});

  user.profilePic=`${req.file.filename}`
  await user.save();
 
  try {
    
  } catch (error) {
    err
  }
  
  

  res.redirect("/profile");
 
})

// login function

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login")
}

//  pose mail

router.post("/compose",isLoggedIn,async function(req,res){
  const logginInUser = await userModel.findOne({username:req.session.passport.user})

  const newmail = await mails.create({
    userId:logginInUser._id,
    recieveMail:req.body.recieveMail,
    mailtext: req.body.mailtext,
  })
  
  //  console.log(req.body.recieveMail);
  //  console.log(req.body.mailtext);
  // console.log(newmail.recieveMail);

  // console.log(logginInUser.sentMAils);
  await logginInUser.sentMails.push(newmail._id)
  logginInUser.save()

  const reciever = await userModel.findOne({email:req.body.recieveMail});

  await reciever.recievedMails.push(newmail._id)
  reciever.save();

  sentMail(req.body.recieveMail,req.body.mailtext)
  .then(function(res){
    console.log("sent mail");
  })

  res.redirect("/profile");

});


// check function json

router.get("/check",function(req,res){
  res.json({data:"Welcome to Ajax"})
})
module.exports = router;
