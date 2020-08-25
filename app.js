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
const FacebookStrategy = require('passport-facebook');

const app = express();
// app.use("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  Id: String
});

const UserDetailsSchema = new mongoose.Schema({
  full_name: String,
  first_name: String,
  last_name: String,
  gmail: String,
  linkedin: String,
  github: String
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

userSchema.index({
  "username": 1
}, {
  sparse: true
})




userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


mongoose.connect("", {
  useNewUrlParser: true
});

const User = mongoose.model("User", userSchema);
const UserDetails = mongoose.model("UserDetails", UserDetailsSchema);
const Summary = mongoose.model("Summary", SummarySchema);
const Education = mongoose.model("Education", EducationSchema);
const Skills = mongoose.model("Skills", SkillsSchema);
const Projects = mongoose.model("Project", ProjectSchema);
const Certificates = mongoose.model("Certificate", CertificateSchema);


passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRETS,
    callbackURL: "http://localhost:9000/auth/google/Rest_API",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({
      Id: profile.id
    }, function(err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRETS,
    callbackURL: "http://localhost:9000/auth/github/Rest_API",
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({
      Id: profile.id
    }, function(err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:9000/auth/facebook/Rest_API"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({
      Id: profile.id
    }, function(err, user) {
      return cb(err, user);
    });
  }
));


app.get('/auth/google',
  passport.authenticate('google', {
      scope: ['profile']
    }

  ));

app.get('/auth/google/Rest_API',
  passport.authenticate('google', {
    failureRedirect: "/"
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  });

app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/Rest_API',
  passport.authenticate('github', {
    failureRedirect: "/"
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/Rest_API',
  passport.authenticate('facebook', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log("hello");
    res.redirect('/');
  });


// app.get("/Add",function(req,res){
//   console.log(req.body.name);
//   console.log(req.body.content);
// });
//

app.post("/register", function(req, res) {

  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      // console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        // console.log("hello");
        res.redirect("/");
      });
    }
  });
});

app.post("/login", function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if (err) {

    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/");
      });
    }
  });
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});


app.get("/", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("index", {
      present: true,
      app_id: req.user._id
    });
  } else {
    res.render("index", {
      present: false,
      app_id: 0
    });
  }
});


app.route("/UserDetails/:app_id/:query")
  .get(function(req, res) {
    User.findById(req.params.app_id, function(err, value) {
      if (err) {
        res.send("unauthorized user")
      } else {
        if (req.params.query === "all") {
          UserDetails.find(function(err, val) {
            var ans = []
            val.forEach(function(items) {
              var value = JSON.parse(JSON.stringify(items));
              delete value._id;
              delete value.__v;
              ans.push(value);
            });
            res.send(ans);
          });
        } else {
          UserDetails.find({
            name: {
              $regex: new RegExp(req.params.query, "i")
            }
          }, function(err, val) {
            if (err || val.length == 0) {
              res.send("Sorry I dont have that field. Use 'all' param to get all the fields I have")
            } else {
              var ans = []
              val.forEach(function(items) {
                var value = JSON.parse(JSON.stringify(items));
                delete value._id;
                delete value.__v;
                ans.push(value);
              });
              res.send(ans);
            }

          });
        }
      }

    })
  })

  .post(function(req, res) {
    User.findById(process.env.ADMIN_ID, function(err, value) {
      if (err) {
        res.send("Your not Admin hahaha")
      } else {
        if (req.params.query === "add") {
          const val = new UserDetails({
            full_name: req.body.full_name,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            gmail: req.body.gmail,
            github: req.body.github,
            linkedin: req.body.linkedin,
          });
          val.save();
        } else {
          res.send("Sorry");
        }
      }
    })

  })

  .put();



app.route("/Summary/:app_id/:name")
  .get(function(req, res) {
    User.findById(req.params.app_id, function(err, value) {
      if (err) {
        res.send("unauthorized user")
      } else {
        if (req.params.name === "all") {
          Summary.find(function(err, val) {
            var ans = []
            val.forEach(function(items) {
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

      }
    })
  })

  .post(function(req, res) {
    User.findById(process.env.ADMIN_ID, function(err, value) {
      if (err) {
        res.send("Your not Admin hahaha")
      } else {
        if (req.params.name === "add") {
          const val = new Summary({
            summary: req.body.arr
          });
          console.log(req.body.arr);
          val.save();
        } else {
          res.send("Sorry");
        }
      }
    })


  })

  .put();




app.route("/Education/:app_id/:name")
  .get(function(req, res) {
    User.findById(req.params.app_id, function(err, value) {
      if (err) {
        res.send("unauthorized user")
      } else {}
      if (req.params.name === "all") {
        Education.find(function(err, val) {
          var ans = []
          val.forEach(function(items) {
            var value = JSON.parse(JSON.stringify(items));
            delete value._id;
            delete value.__v;
            ans.push(value);
          });
          res.send(ans);
        });
      } else if (req.params.name === "intermediate" || req.params.name === "Intermediate" || req.params.name === "B.Tech") {
        Education.find({
          education_level: req.params.name
        }, function(err, val) {
          var ans = []
          val.forEach(function(items) {
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
  })

  .post(function(req, res) {
    User.findById(process.env.ADMIN_ID, function(err, value) {
      if (err) {
        res.send("Your not Admin hahaha")
      } else {
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
      }
    })
  })
  .put();




app.route("/Skills/:app_id/:name")
  .get(function(req, res) {
    User.findById(req.params.app_id, function(err, value) {
      if (err) {
        res.send("unauthorized user")
      } else {
        if (req.params.name === "all") {
          Skills.find(function(err, val) {
            var ans = []
            val.forEach(function(items) {
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
              val.forEach(function(items) {
                var value = JSON.parse(JSON.stringify(items));
                delete value._id;
                delete value.__v;
                ans.push(value);
              });
              res.send(ans);
            }

          });
        }
      }

    })
  })

  .post(function(req, res) {
    User.findById(process.env.ADMIN_ID, function(err, value) {
      if (err) {
        res.send("Your not Admin hahaha")
      } else {
        if (req.params.name === "add") {
          const val = new Skills({
            name: req.body.name,
            rating: req.body.rating
          });
          val.save();
        } else {
          res.send("Sorry");
        }

      }
    })
  })

  .put();




app.route("/Projects/:app_id/:name")
  .get(function(req, res) {
    User.findById(req.params.app_id, function(err, value) {
      if (err) {
        res.send("unauthorized user")
      } else {
        if (req.params.name === "all") {
          Projects.find(function(err, val) {
            var ans = []
            val.forEach(function(items) {
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
      }

    })
  })

  .post(function(req, res) {
    User.findById(process.env.ADMIN_ID, function(err, value) {
      if (err) {
        res.send("Your not Admin hahaha")
      } else {
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
      }
    })
  })

  .put();




app.route("/Certificates/:app_id/:name")
  .get(function(req, res) {
    User.findById(req.params.app_id, function(err, value) {
      if (err) {
        res.send("unauthorized user")
      } else {
        if (req.params.name === "all") {
          Certificates.find(function(err, val) {
            var ans = []
            val.forEach(function(items) {
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
      }

    })
  })


  .post(function(req, res) {
    User.findById(process.env.ADMIN_ID, function(err, value) {
      if (err) {
        res.send("Your not Admin hahaha")
      } else {
        if (req.params.name === "add") {
          const val = new Certificate({
            name: req.body.name,
            link: req.body.link
          });
          val.save();
        } else {
          res.send("Sorry");
        }
      }
    })
  })

  .put();

app.get("/documentation", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("document", {
      present: true,
      app_id: req.user._id
    });
  } else {
    res.render("document", {
      present: false,
      app_id: 0
    });
  }

});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 9000;
}

app.listen(port, function() {
  console.log("connected");
});
