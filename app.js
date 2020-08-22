require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const GitHubStrategy = require('passport-github');
const JSON = require('JSON');

const app = express();
// app.use("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("", {
  useNewUrlParser: true
});

const UserSchema = new mongoose.Schema({
  name: String,
  content: String
});

const SummarySchema = new mongoose.Schema({
  summary: String
});

const EducationSchema = new mongoose.Schema({
  education_level: String,
  college_Name: String,
  location: String,
  branch: String,
  graduation_year: String,
  GPA: String
});

const SkillsSchema = new mongoose.Schema({
  name: String,
  rating: String
});

const ProjectSchema = new mongoose.Schema({
  name: String,
  link: String,
  tech_stack: String,
});

const CertificateSchema = new mongoose.Schema({
  name: String,
  link: String
});

const Details = mongoose.model("Details", UserSchema);
const Summary = mongoose.model("Summary", SummarySchema);
const Education = mongoose.model("Education", EducationSchema);
const Skills = mongoose.model("Skills", SkillsSchema);
const Project = mongoose.model("Project", ProjectSchema);
const Certificate = mongoose.model("Certificate", CertificateSchema);

// app.get("/Add",function(req,res){
//   console.log(req.body.name);
//   console.log(req.body.content);
// });
//


app.route("/Summary/:name")
  .get(function(req, res) {
    if (req.params.name === "all") {
      Summary.find(function(err, val) {
        var ans = []
        val.forEach(function(items){
          var value = JSON.parse(JSON.stringify(items));
          delete value._id;
          delete value.__v;
          ans.push(value);
        });
        res.send(ans);
      });
    } else {
      res.send("wrong params used");
    }
  })
  .post(function(req, res) {
    if (req.params.name === "add") {
      const val = new Summary({
        summary: req.body.arr
      });
      console.log(req.body.arr);
      val.save();
    } else {
      res.send("Sorry");
    }

  })

  .put();




app.route("/Education/:name")
  .get(function(req, res) {
    if (req.params.name === "all") {
      Education.find(function(err, val) {
        var ans = []
        val.forEach(function(items){
          var value = JSON.parse(JSON.stringify(items));
          delete value._id;
          delete value.__v;
          ans.push(value);
        });
        res.send(ans);
      });
    } else {
      res.send("wrong params used");
    }
  })
  .post(function(req, res) {
    if (req.params.name === "add") {
      const val = new Education({
        education_level: req.body.education_level,
        college_Name: req.body.college_Name,
        location: req.body.location,
        branch: req.body.branch,
        graduation_year: req.body.year,
        GPA: req.body.GPA
      });
      console.log(req.body);
      val.save();
    } else {
      res.send("Sorry");
    }

  })
  .put();




app.route("/Skills/:name")
  .get(function(req, res) {
    if (req.params.name === "all") {
      Skills.find(function(err, val) {
        var ans = []
        val.forEach(function(items){
          var value = JSON.parse(JSON.stringify(items));
          delete value._id;
          delete value.__v;
          ans.push(value);
        });
        res.send(ans);
      });
    } else {
      Skills.find({
        name: {
          $regex: new RegExp(req.params.name, "i")
        }
      }, function(err, val) {
        if (err || val.length == 0) {
          res.send("Sorry I dont have that skill. Use 'all' param to get all the skils I have")
        } else {
          var ans = []
          val.forEach(function(items){
            var value = JSON.parse(JSON.stringify(items));
            delete value._id;
            delete value.__v;
            ans.push(value);
          });
          res.send(ans);
        }

      });
    }
  })

  .post(function(req, res) {
    if (req.params.name === "add") {
      const val = new Skills({
        name: req.body.name,
        rating: req.body.rating
      });
      val.save();
    } else {
      res.send("Sorry");
    }

  })

  .put();




app.route("/Projects/:name")
  .get(function(req, res) {
    if (req.params.name === "all") {
      Projects.find(function(err, val) {
        var ans = []
        val.forEach(function(items){
          var value = JSON.parse(JSON.stringify(items));
          delete value._id;
          delete value.__v;
          ans.push(value);
        });
        res.send(ans);
      });
    } else {
      res.send("wrong params used");
    }
  })

  .post(function(req, res) {
    if (req.params.name === "add") {
      const val = new Project({
        name: req.body.name,
        link: req.body.link,
        tech_stack: req.body.tech_stack
      });
      val.save();
    } else {
      res.send("Sorry");
    }

  })

  .put();




app.route("/Certificates/:name")
  .get(function(req, res) {
    if (req.params.name === "all") {
      Certificates.find(function(err, val) {
        var ans = []
        val.forEach(function(items){
          var value = JSON.parse(JSON.stringify(items));
          delete value._id;
          delete value.__v;
          ans.push(value);
        });
        res.send(ans);
      });
    } else {
      res.send("wrong params used");
    }
  })

  .post(function(req, res) {
    if (req.params.name === "add") {
      const val = new Certificate({
        name: req.body.name,
        link: req.body.link
      });
      val.save();
    } else {
      res.send("Sorry");
    }

  })

  .put();




let port = process.env.PORT;
if (port == null || port == "") {
  port = 9000;
}

app.listen(port, function() {
  console.log("connected");
});
