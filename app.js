const express= require("express");
const bodyParser= require("body-parser");
const mongoose= require("mongoose");

const app= express();

app.use(express.static(__dirname+"/public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));


// ----------------------------------------Mongoose (Database) ------------------------------------------------------

mongoose.connect("mongodb://localhost:27017/JobsDB",{useNewUrlParser:true});

//creating bluePrint for Jobs
const jobSchema= new mongoose.Schema({
  num:Number,
  name:String,
  retrievalName:String,
  batch:Number,
  location:String,
  message:String,
  link:String
});

//creating a collection named "JOB" that follows "jobSchema"
//Collection 1-> Company
const Company= mongoose.model("Company",jobSchema);



//creating blue print for Login and password
const AdminSchema= new mongoose.Schema({
  name:String,
  Id:String,
  Pass:String
});

//creating collection named "Credential" which follows schema "AdminSchema"
//Collection 2-> Credential
const Credential= mongoose.model("Credential",AdminSchema);
// ---------------------------------------Database Basic Schema completed-------------------------------------




//--------------- To be run only once ----for LogId & password---------------------------------------------
const admin1 = new Credential({
  name: "Aayush",
  Id:"aayushSingh@sz",
  Pass: "22081999"
});

const admin2= new Credential({
  name: "Swats",
  Id:"swatikriplani@sz",
  Pass:"08021998"
});

// admin1.save();
// admin2.save();
// -------------------------------------------------------------------------------------------------------



app.get("/",function(req,res){

// ---------------Runs only once to put userId and Pass of Admins in Database------------
  Credential.count(function (err, count) {
    if (!err && count === 0) {
      admin1.save();
      admin2.save();
      console.log("Credentials made successful -> Runs only for one time");
    }
});
// -------------------------------------------------------------------------------------------

  Company.find(function(err,allData){
    res.render("home",{comp:allData});
  });

});

app.get("/jobsList",function(req,res){
  Company.find(function(err,allComp){
    res.render("jobList",{comp:allComp});
  });

});

app.get("/login",function(req,res){
  res.render('login');
});

app.get("/admin",function(req,res){
  res.render('adminPost');
});

app.get("/posts/:postHeading",function(req,res){
  let postHead=req.params.postHeading;
  let postURL="/posts/"+postHead;
  Company.find(function(err,data){
    if(!err){
      data.forEach(function(comp){
        if(comp.retrievalName===postURL){
          res.render('jobs',{compName:comp.name, compBatch:comp.batch, compLocation:comp.location,compLink:comp.link});
        }
      });
    }
  });
});

app.post("/login",function(req,res){
  const id=req.body.myemail;
  const pass=req.body.mypass;

  let found=0;

  Credential.find(function(err,allData){
    if(err){
      console.log(err);
    }
    else{
      allData.forEach(function(user){
        if(user.Id===id && user.Pass===pass){
          found=1;
          res.render('adminPost');
        }
      });
    }
  });

// All this lines are written to wasre time so that above for loop runs before exection of below imp lines
// ------------from here ----------------------------------------------------
  Credential.find(function(err,allData){
    if(err){
      console.log(err);
    }
    else{
      allData.forEach(function(user){
        if(user.Id===id && user.Pass===pass){
          found=1;
          //res.render('adminPost');
        }
      });
  // --------------till here are just for wasting time ----------------------
      if(found===0){
        res.render("wrongCredential");
      }
    }
  });



});


app.post("/admin", function(req,res){
  const companyObj=new Company({
    //__id: is given by default if not specified. So here unique id will be automatically be given everytime this copnayObj is made
    num:req.body.companyNumber,
    name:req.body.companyname,
    batch:req.body.batchname,
    location:req.body.joblocation,
    link:req.body.jobLink,
    message:req.body.subject
  });
  companyObj.save();

  //--------get count of same Company name -----------
  var count=0;
  Company.find(function(err,allComp){
    allComp.forEach(function(currComp){
      if(!err){
        if(currComp.name===companyObj.name){
          count++;
        }
      }
    });
  });

// --------count value calculated-----------






//Imp: All line from here----------
var temp=0;
  Company.find(function(err,allComp){
    allComp.forEach(function(currComp){
      if(err){
        console.log(err);
      }
      else{
        if(currComp.name===companyObj.name){
          temp++;
        }
      }
    });
  // ----------Till  here are wtitten to waste time so that the above for loop for count runs before execution of below lines



  //Below lines are imp and useful
    let urlLink="";
    if(count===0){
      urlLink="/posts/"+companyObj.name;
    }
    else{
      urlLink="/posts/"+companyObj.name+count.toString();
    }

    //update company retrieval name in db with name=urllink's name for retrieval in 'app.get("/posts/:postHeading)'
    Company.updateOne({_id:companyObj._id},{retrievalName:urlLink},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Retrieval Name for "+companyObj.name+" is updated successfully!");
      }
    });

    res.render('confirm',{data:companyObj,publishingLink:urlLink});

  });


});

app.listen("3000",function(){
  console.log("Server Running on port 3000");
});
