const exp = require('express');
let server = exp();
const rout = exp.Router();
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
const sql = require('mysql2');

const MySqlStore = require('express-mysql-session')(session);

const options = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.MYSQL_DB
}

const connection = sql.createConnection(options)
const sessionStore = new MySqlStore({}, connection);

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

// image upload
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './public/uploads');
    },
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
});

const fileFilter = function(req, file, cb){
    if(file.mimeType==='image/jpeg' || file.mimeType==='image/png'){
        cb(null, true)
    }
    else{
        cb(new Error('unsupported file'), false)
    }
}

const upload = multer({
    storage: storage,
    limits:{
        fileSize: 1024*1024*10
    },
    filefilter: fileFilter
})



rout.get('/dashboard', async(req,res)=>{
    try{
        res.render('../views/dashboard/dashboard.ejs');
        // if(req.session.user && req.cookies.user_id){
        //     res.render('../views/dashboard/dashboard.ejs');
        // }
        // else{
        //     res.redirect('/');
        //     // alert('please login first');
        // }
    }
    catch(error){
        console.log(error);
    }
})

rout.get('/add_blog', async function(req,res){
    // let blogger = mysql.query('select users.first_name from blogs inner join users on blogs.blogger = users.email',function(err,result){
    //     if(err) throw err;
    //     // console.log(result)
    // });
    // console.log(blogger)
    res.render('../views/dashboard/add_blog.ejs')
})

rout.post('/add_blog', upload.single('image'), async (req,res)=>{
    try{
        // let blogger = mysql.query('select users.first_name from blogs inner join users on blogs.blogger = users.email',function(err,result){
        //     if(err) throw err;
        // });
        const blogger = req.session.user.email;
        const image = req.file.filename;
        
        const {title, blog_body, description} = req.body;
        if(!title || !blog_body || !description){
            // res.json({msg:'fill all fields'})
            console.log("fill all fields");
        }
        mysql.query('insert into blogs (title, blog_body, blogger, description, image) values(?,?,?,?,?)', [title, blog_body, blogger,description, image], function(err, result){
            if(err) throw err;
            else{
                res.redirect('/add_blog');
            }
        })
    }
    catch(error){
        console.log(error);
    }
})

rout.get('/view_blogs', async function(req, res){
    try{
        const blogger = req.session.user.email;
        const data = mysql.query("select * from blogs where blogger=?",[blogger], function(err, result){
            if(err) throw err;
            else{
                // console.log(result);
                res.render('../views/dashboard/view_blogs.ejs',{data:result})
            }
        })
    }
    catch(error){
        console.log(error);
    }
})

rout.get('/edit_blogs/:id', async function(req,res){
    try{
        const data = req.params.id;
        const query = mysql.query("select * from blogs where title=?",[data], function(err, result){
            if(err) throw err;
            else{
                res.render('../views/dashboard/edit_blog.ejs',{detail:result});
            }
        })
    }
    catch(error){
        console.log(error);
    }
}) 

rout.post('/update_blog/:id',upload.single('image'), async (req, res)=>{
    try{
        const blogger = req.session.user.email;
        const image = req.file.filename;
        const {title, blog_body, description} = req.body;
        if(!title || !blog_body || !description){
            // res.json({msg:'fill all fields'})
            console.log("fill all fields");
        }

        mysql.query(`update blogs set title=?, blog_body=?, description=?, image=? where blogger=? and title=?`, [title, blog_body, description, image, blogger, title], function(err, result){
            if(err) throw err;
            else{
                res.redirect('/add_blog');
            }
        })
    }
    catch(error){
        console.log(error);
    }

})

rout.get('/delete/:id', async(req, res)=>{
    try{
        mysql.query('delete from blogs where title=?',[req.params.id], function(err, result){
            if(err) throw err;
            res.redirect('/view_blogs');
        })
    }
    catch(error){
        console.log(error);
    }
})

rout.get('/view_user', async (req,res)=>{
    let user = req.session.user.email;
    let data = mysql.query("select * from users where email =?",[user], function(err, result){
        if(err) throw err;
        else{
            res.render('../views/dashboard/view_user.ejs', {detail:result});
        }
    })
})







server.use('/',rout);
module.exports = rout;