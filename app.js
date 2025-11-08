require('dotenv').config()
const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path')
const methodOverride = require('method-override');

const DbConnection = require('./app/config/dbCon')
DbConnection()



app.use(methodOverride('_method'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const flash = require('connect-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(session({
  secret: 'secrect',
  cookie: { maxAge: 600000 },
  resave: false,
  saveUninitialized: false
}))

// user middleware
app.use((req, res, next) => {
  if (req.cookies && req.cookies.userToken) {
    jwt.verify(req.cookies.userToken, process.env.JWT_SECRET || "hellowelcometowebskittersacademy123456", (err, data) => {
      if (!err) {
        res.locals.user = data;
      }
    });
  }
  next();
});

// admin middleware
app.use((req, res, next) => {
  if (req.cookies && req.cookies.adminToken) {
    jwt.verify(req.cookies.adminToken, process.env.JWT_SECRET_ADMIN || "hellowelcomeAdmin123456", (err, data) => {
      if (!err) {
        res.locals.admin = data;
      }
    });
  }
  next();
});

app.use(flash())

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use('/uploads', express.static(path.join(__dirname, './uploads')))
app.use(express.static(path.join(__dirname, 'public')))


const userRouter = require('./app/router/userRouter')
app.use("/auth", userRouter)
const adminRouter = require('./app/router/adminRouter')
app.use("/admin", adminRouter)
const bookingRouter = require("./app/router/bookingRouter")
app.use("/booking", bookingRouter)
const reportRouter = require("./app/router/reportRouter")
app.use("/report", reportRouter)

const PORT = 8400
app.listen(PORT, () => {
  console.log(`Server is running this url http://localhost:${PORT}`);
})