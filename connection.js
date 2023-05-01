const mysql = require('mysql2');

let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.MYSQL_DB
});

connection.connect(function(err){
    if(err) throw err;
    console.log("connected");
    // connection.query("CREATE DATABASE blog_project", function(err,result){
    //     if(err) throw err;
    //     console.log("database created")
    // })
    // connection.query('create table userss (first_name varchar(55) not null, last_name varchar(55), email varchar(55) primary key not null, password varchar(200) not null, confirm_password varchar(200) not null, address varchar(200) not null)',function(error,data){
    //     if(error) throw error;
    //     console.log("table created", data);
    // })

    // connection.query("create table blogs (title varchar(255) not null, blog_body text not null, blogger varchar(255) not null, image varchar(255), foreign key(blogger) references users (email))", function(err, result){
    //     if(err) throw err;
    //     console.log("table created");
    // })

    // connection.query("update blogs set description= 'desc2' where blog_body='body 2'", function(err, result){
    //     if(err) throw err;
    // })
    
    // connection.query("update blogs set title = 'demo blog 2' where blog_body='body 2'", function(err,data){
    //     if(err) throw err;
    // })
    
})
module.exports.connection = connection;