const exp = require('express');
let server = exp();
const rout = exp.Router();
const sql = require('mysql2');
const mysql = require('../connection.js').connection;
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const session = require('express-session');
server.use(exp.static('public'));
server.use(bodyParser.urlencoded({extended:true}));
server.use(bodyParser.json());
server.set('view engine', 'ejs');


const MySqlStore = require('express-mysql-session')(session);

const options = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.MYSQL_DB
}

const connection = sql.createConnection(options)
const sessionStore = new MySqlStore({}, connection);

// const sessionStore = new MySqlStore(options);


server.use(cookieParser());
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



rout.get('/',async function(req,res){
    try{
        // console.log(req.session.user)
        // let user = await req.session.user;
        
        mysql.query('select title, blogger, description ,image from blogs', function(err, result){
            if(err) throw err;
            // console.log(user);
            res.render('index.ejs', {data:result});
        })
    }
    catch(error){
        console.log(error);
    }
})

rout.get('/blog/:id', async (req, res)=>{
    try{
        // console.log(req.params.id);
        mysql.query(`select title, blog_body from blogs where title='${req.params.id}'`, function(err, result){
            if(err) throw err;
            else{
                // console.log(result)
                res.render('blog.ejs', {data:result});
                // console.log(result);
            }
        })
    }
    catch(error){
        console.log(error);
    }
    
})

rout.get('/sign_up',async function(req,res){
    try{
        res.render('sign_up.ejs')
    }
    catch(error){
        console.log(error);
    }
})

rout.post('/sign_up',async function(req, res){
    try{
        const{first_name, last_name, email, password, confirm_password, address} = req.body;

        if(!first_name || !last_name || !email || !password || !confirm_password || !address){
            res.json({err:'fill all the fields'});
        }

        const user = mysql.query('select * from users where email=?',[email],(error, result)=>{
            if(error) throw error;
            else{
                if(result.length>0){
                    res.json({msg:'user exits already'});
                }
                else{
                    const sql_insert = "insert into users(first_name, last_name, email, password, confirm_password, address) values(?,?,?,?,?,?)";
                    mysql.query(sql_insert,[first_name, last_name, email, password, confirm_password, address],(error, result)=>{
                        if(error) throw error;
                        console.log("record added");
                        res.status(200).json({msg:'record added successfully'});
            })
                }
            }
        })
        // if(user){
        //     res.json({msg:'user exits already'});
        // }
        // else{
        //     const sql_insert = "insert into users(first_name, last_name, email, password, confirm_password, address) values(?,?,?,?,?,?)";
        //     mysql.query(sql_insert,[first_name, last_name, email, password, confirm_password, address],(error, result)=>{
        //         if(error) throw error;
        //         console.log("record added");
        //         res.status(200).json({msg:'record added successfully'});
        //     })
        // }
        
    }
    catch(error){
        console.log(error);
    }
})

rout.get('/log_in',async function(req,res){
    try{
        res.render('log_in.ejs')
    }
    catch(error){
        console.log(error);
    }
})

rout.post('/log_in', async(req,res)=>{
    const{email, password} = req.body;
    try{
        if(!email || !password){
            // res.json({error: 'fill all fields'});
            console.log('fill all fields');
        }

        const userr = mysql.query("select * from users where email=? && password=?",[email,password],(err, result)=>{
            if(err) throw err;
            else{
                if(result.length>0){
                    // res.json({msg:'logged in successfully'});
                    console.log('logged in');
                    res.redirect('/')
                    req.session.user=result[0];
                    req.session.loggedin = true;
                    // console.log(result);
                    // console.log(req.session.user);
                }
                else{
                    // res.json({error:'no user found'});
                    res.redirect('/log_in')
                    console.log('no user found');
                }
            }
        })
        const user = req.session.user;
        

        // if(userr){
        //     res.json({msg:'logged in successfully'});
        //     console.log('logged in');
        // }
        // else{
        //     res.json({error:'no user found'});
        //     console.log('no user found');
        // }
    }
    catch(error){
        console.log(error);
    }
})


// rout.post('/blogs', async (req,res)=>{
//     try{
//         const {title, blog_body, author, description} = req.body;
//         if(!title || !blog_body || !author || !description){
//             res.json({err:'fill all fields'})
//         }

//         const data = mysql.query('insert into blogs (title, blog_body, author, description) values(?,?,?,?)', [title, blog_body, author, description], (err, result)=>{
//             if(err) throw err;
//             else{
//                 res.status(201).json({msg: 'data inserted'})
//             }
//         });
//     }
//     catch(error){
//         console.log(error);
//     }

// })

rout.get('/logout', async (req, res)=>{
    if(req.session){
        req.session.destroy(function(error){
            if(error){
                return nextTick(error);
            }
            else{
                return res.redirect('/');
            }
        })
    }
})


server.use('/',rout);
module.exports = rout;