const express=require("express");
const app=express();
const PORT=process.env.PORT || 3000;
const path = require("path");
const userRoute=require("./routes/user");
const vehicleRoute=require("./routes/vehicle");
const serviceRoute=require("./routes/service");
const mongoose=require("mongoose");
const {  checkForAuthenticationCookie } = require('./middlewares/authentication');
const cookieParser=require('cookie-parser');
const setupCronJob = require('./services/sendReminder');
const contactRoute=require('./routes/contact');
const adminRoutes=require('./routes/admin');
setupCronJob();

require('dotenv').config();

mongoose.connect('mongodb://127.0.0.1:27017/ServiTrack').then(e=>console.log("MongoDB Connected"));
app.use(express.urlencoded({ extended: true }));


app.use('/public', express.static('public'));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));

app.set("view engine",'ejs');
app.set('views',path.resolve("./views"));

app.get("/",async (req,res)=>{

    if(req.user)
    {
        res.render("home",{
            user:req.user,
        });
    }else{
        res.render("home");
    }

})


app.use('/contact',contactRoute);
app.use('/admin',adminRoutes);
app.use("/user",userRoute);
app.use("/vehicle",vehicleRoute);
app.use("/service",serviceRoute);

app.listen(PORT,()=>console.log(`Server started at PORT:${PORT}`));