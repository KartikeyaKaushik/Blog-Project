const exp = require('express');
let server = exp();
const rout = exp.Router();
const sql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});
const cookieParser = require('cookie-parser');
const session = require('express-session');
server.use(exp.static('public'));
server.use(bodyParser.urlencoded({extended:true}));
server.use(bodyParser.json());
server.set('view engine', 'ejs');
server.use(cookieParser());
const MySqlStore = require('express-mysql-session')(session);
server.use(exp.static('./public/uploads'));



const options = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.MYSQL_DB
}

const connection = sql.createConnection(options)
const sessionStore = new MySqlStore({}, connection);

// const sessionStore = new MySqlStore(options);

server.use(
    session({
        key: "user_id",
        secret: "dkfjdkjfkdj",
        resave: true,
        saveUninitialized: true,
        store: sessionStore,     // assigning sessionStore to session
        cookie: {
            expires: 500000
        }
    })
);
server.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.session.loggedin = req.session.loggedin;
    next();
});

// server.use((req,res,next)=>{
//     if(req.cookies.user_id && !req.session.user){
//         res.clearCookie("user_id");
//     }
//     next();
// });


// // middleware function to check for logged-in users
// var sessionChecker = (req, res, next)=>{
//     if(req.session.user && req.cookies.user_id){
//         res.redirect('/dashboard');
//     }
//     else{
//         next();
//     }
// }








server.use('/',require('./routes/index_routes.js'));
server.use('/',require('./routes/dahsboard_routes.js'))
server.use('/', rout);
server.listen(9999,()=> console.log('server running at 9999'));