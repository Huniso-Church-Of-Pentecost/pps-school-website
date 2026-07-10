require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(session({
  secret:'pps-secret-2025',
  resave:false,
  saveUninitialized:false,
  cookie:{maxAge:86400000}
}));

app.use(express.static(path.join(process.cwd(), 'public')));


const storage = multer.diskStorage({
 destination:(req,file,cb)=>{
   const dir='./public/uploads';
   if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
   cb(null,dir);
 },
 filename:(req,file,cb)=>{
   cb(null,Date.now()+"-"+file.originalname.replace(/\s/g,'_'));
 }
});

const upload=multer({
 storage,
 limits:{fileSize:5*1024*1024}
});


const requireAdmin=(req,res,next)=>{
 if(req.session.user?.role==='admin') return next();
 res.status(401).json({error:"Unauthorized"});
};


// AUTH

app.post('/api/auth/login',async(req,res)=>{
 try{

 const {username,password}=req.body;

 const result=await pool.query(
  "SELECT * FROM users WHERE username=$1",
  [username]
 );

 const user=result.rows[0];

 if(!user || !bcrypt.compareSync(password,user.password))
 return res.json({
  success:false,
  message:"Invalid credentials"
 });


 req.session.user={
  id:user.id,
  username:user.username,
  role:user.role
 };


 res.json({
  success:true,
  user:{
   username:user.username,
   role:user.role
  }
 });


 }catch(e){
 console.log(e);
 res.status(500).json({error:e.message});
 }
});


app.post('/api/auth/logout',(req,res)=>{
 req.session.destroy();
 res.json({success:true});
});


app.get('/api/auth/me',(req,res)=>{
 res.json(req.session.user||null);
});



// POSTS

app.get('/api/posts',async(req,res)=>{
try{

let query="SELECT * FROM posts";
let values=[];

if(req.query.category){
 query+=" WHERE category=$1";
 values.push(req.query.category);
}

query+=" ORDER BY date DESC";


const result=await pool.query(query,values);

let posts=result.rows;


if(req.query.featured)
 posts=posts.filter(x=>x.featured);


if(req.query.limit)
 posts=posts.slice(0,Number(req.query.limit));


res.json(posts);


}catch(e){
res.status(500).json({error:e.message});
}
});


app.get('/api/posts/:id',async(req,res)=>{
try{

const result=await pool.query(
"SELECT * FROM posts WHERE id=$1",
[req.params.id]
);

const post=result.rows[0];

if(!post)
return res.status(404).json({error:"Not found"});


await pool.query(
"UPDATE posts SET views=views+1 WHERE id=$1",
[req.params.id]
);


res.json(post);

}catch(e){
res.status(500).json({error:e.message});
}
});


app.post('/api/posts',
requireAdmin,
upload.single('image'),
async(req,res)=>{

try{

const post={
id:uuidv4(),
...req.body,
image:req.file?'/uploads/'+req.file.filename:'',
date:new Date().toISOString().split('T')[0],
views:0,
featured:req.body.featured==="true"
};


await pool.query(
`INSERT INTO posts
(id,title,slug,category,content,date,author,image,featured,views)
VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
[
post.id,
post.title,
post.slug,
post.category,
post.content,
post.date,
post.author||"Admin",
post.image,
post.featured,
0
]
);


res.json(post);


}catch(e){
res.status(500).json({error:e.message});
}

});

// EVENTS

app.get('/api/events', async(req,res)=>{
try{

const result=await pool.query(
"SELECT * FROM events ORDER BY date ASC"
);

res.json(result.rows);

}catch(e){
res.status(500).json({error:e.message});
}
});


app.post('/api/events',requireAdmin,async(req,res)=>{
try{

const ev={
id:uuidv4(),
...req.body
};

await pool.query(
`INSERT INTO events
(id,title,date,time,location,description)
VALUES($1,$2,$3,$4,$5,$6)`,
[
ev.id,
ev.title,
ev.date,
ev.time,
ev.location,
ev.description
]
);

res.json(ev);

}catch(e){
res.status(500).json({error:e.message});
}
});


app.put('/api/events/:id',requireAdmin,async(req,res)=>{
try{

await pool.query(
`UPDATE events SET
title=$1,
date=$2,
time=$3,
location=$4,
description=$5
WHERE id=$6`,
[
req.body.title,
req.body.date,
req.body.time,
req.body.location,
req.body.description,
req.params.id
]
);

res.json({success:true});

}catch(e){
res.status(500).json({error:e.message});
}
});


app.delete('/api/events/:id',requireAdmin,async(req,res)=>{
await pool.query(
"DELETE FROM events WHERE id=$1",
[req.params.id]
);

res.json({success:true});
});




// STAFF

app.get('/api/staff',async(req,res)=>{
try{

const result=await pool.query(
"SELECT * FROM staff"
);

res.json(result.rows);

}catch(e){
res.status(500).json({error:e.message});
}
});


app.post('/api/staff',requireAdmin,async(req,res)=>{
try{

const member={
id:uuidv4(),
...req.body
};


await pool.query(
`INSERT INTO staff
(id,name,role,dept,email,phone,bio)
VALUES($1,$2,$3,$4,$5,$6,$7)`,
[
member.id,
member.name,
member.role,
member.dept,
member.email,
member.phone,
member.bio
]
);


res.json(member);


}catch(e){
res.status(500).json({error:e.message});
}
});


app.put('/api/staff/:id',requireAdmin,async(req,res)=>{

await pool.query(
`UPDATE staff SET
name=$1,
role=$2,
dept=$3,
email=$4,
phone=$5,
bio=$6
WHERE id=$7`,
[
req.body.name,
req.body.role,
req.body.dept,
req.body.email,
req.body.phone,
req.body.bio,
req.params.id
]
);

res.json({success:true});

});


app.delete('/api/staff/:id',requireAdmin,async(req,res)=>{

await pool.query(
"DELETE FROM staff WHERE id=$1",
[req.params.id]
);

res.json({success:true});

});





// ADMISSIONS

app.post('/api/admissions',async(req,res)=>{
try{

const id=uuidv4();

await pool.query(
`INSERT INTO admissions
(id,data,status,date)
VALUES($1,$2,$3,$4)`,
[
id,
JSON.stringify(req.body),
"pending",
new Date()
]
);


res.json({
success:true,
id
});


}catch(e){
res.status(500).json({error:e.message});
}
});


app.get('/api/admissions',requireAdmin,async(req,res)=>{

const result=await pool.query(
"SELECT * FROM admissions ORDER BY date DESC"
);

res.json(result.rows);

});


app.put('/api/admissions/:id',requireAdmin,async(req,res)=>{

await pool.query(
"UPDATE admissions SET status=$1 WHERE id=$2",
[
req.body.status,
req.params.id
]
);

res.json({success:true});

});






// CONTACT MESSAGES


app.post('/api/contact',async(req,res)=>{

const id=uuidv4();

await pool.query(
`INSERT INTO messages
(id,data,date,read)
VALUES($1,$2,$3,$4)`,
[
id,
JSON.stringify(req.body),
new Date(),
false
]
);


res.json({success:true});

});


app.get('/api/messages',requireAdmin,async(req,res)=>{

const result=await pool.query(
"SELECT * FROM messages ORDER BY date DESC"
);

res.json(result.rows);

});


app.put('/api/messages/:id',requireAdmin,async(req,res)=>{

await pool.query(
"UPDATE messages SET read=true WHERE id=$1",
[req.params.id]
);

res.json({success:true});

});


app.delete('/api/messages/:id',requireAdmin,async(req,res)=>{

await pool.query(
"DELETE FROM messages WHERE id=$1",
[req.params.id]
);

res.json({success:true});

});

// ANNOUNCEMENTS

app.get('/api/announcements', async(req,res)=>{
try{

const result=await pool.query(
"SELECT * FROM announcements ORDER BY id"
);

res.json(result.rows.map(x=>x.text));

}catch(e){
res.status(500).json({error:e.message});
}
});


app.put('/api/announcements',requireAdmin,async(req,res)=>{
try{

await pool.query("DELETE FROM announcements");

for(const text of req.body){

await pool.query(
"INSERT INTO announcements(text) VALUES($1)",
[text]
);

}

res.json({success:true});

}catch(e){
res.status(500).json({error:e.message});
}
});




// STATS

app.get('/api/stats',async(req,res)=>{

const result=await pool.query(
"SELECT * FROM stats LIMIT 1"
);

res.json(result.rows[0] || {});

});


app.put('/api/stats',requireAdmin,async(req,res)=>{

await pool.query(
`UPDATE stats SET
students=$1,
bece_rate=$2,
teachers=$3,
houses=$4,
years=$5`,
[
req.body.students,
req.body.bece_rate,
req.body.teachers,
req.body.houses,
req.body.years
]
);

res.json({success:true});

});




// SETTINGS

app.get('/api/settings',async(req,res)=>{

const result=await pool.query(
"SELECT * FROM settings LIMIT 1"
);

res.json(result.rows[0] || {});

});


app.put('/api/settings',requireAdmin,async(req,res)=>{

await pool.query(
`UPDATE settings SET
school_name=$1,
tagline=$2,
address=$3,
phone=$4,
email=$5,
whatsapp=$6`,
[
req.body.school_name,
req.body.tagline,
req.body.address,
req.body.phone,
req.body.email,
req.body.whatsapp
]
);


res.json({success:true});

});




// DASHBOARD

app.get('/api/dashboard',requireAdmin,async(req,res)=>{

const posts=await pool.query(
"SELECT COUNT(*) FROM posts"
);

const admissions=await pool.query(
"SELECT COUNT(*) FROM admissions"
);

const messages=await pool.query(
"SELECT COUNT(*) FROM messages WHERE read=false"
);

const events=await pool.query(
"SELECT COUNT(*) FROM events"
);

const staff=await pool.query(
"SELECT COUNT(*) FROM staff"
);


const recentAdmissions=await pool.query(
"SELECT * FROM admissions ORDER BY date DESC LIMIT 5"
);

const recentMessages=await pool.query(
"SELECT * FROM messages ORDER BY date DESC LIMIT 5"
);


res.json({

posts:Number(posts.rows[0].count),
admissions:Number(admissions.rows[0].count),
messages:Number(messages.rows[0].count),
events:Number(events.rows[0].count),
staff:Number(staff.rows[0].count),

recent_admissions:recentAdmissions.rows,
recent_messages:recentMessages.rows

});


});





// PASSWORD CHANGE

app.post('/api/auth/change-password',
requireAdmin,
async(req,res)=>{

const {current,newPass}=req.body;


const result=await pool.query(
"SELECT * FROM users WHERE id=$1",
[req.session.user.id]
);


const user=result.rows[0];


if(!user ||
!bcrypt.compareSync(current,user.password))
{
return res.json({
success:false,
message:"Current password incorrect"
});
}


await pool.query(
"UPDATE users SET password=$1 WHERE id=$2",
[
bcrypt.hashSync(newPass,10),
user.id
]
);


res.json({success:true});


});





// SEARCH

app.get('/api/search',async(req,res)=>{

const q=(req.query.q||'').toLowerCase();


if(!q)
return res.json({
posts:[],
events:[]
});


const posts=await pool.query(
`SELECT * FROM posts 
WHERE LOWER(title) LIKE $1 
OR LOWER(content) LIKE $1`,
[`%${q}%`]
);


const events=await pool.query(
`SELECT * FROM events 
WHERE LOWER(title) LIKE $1
OR LOWER(description) LIKE $1`,
[`%${q}%`]
);


res.json({
posts:posts.rows,
events:events.rows
});


});





// UPLOAD

app.post('/api/upload-gallery',
requireAdmin,
upload.single('image'),
(req,res)=>{

if(!req.file)
return res.status(400).json({
error:"No file"
});


res.json({
url:'/uploads/'+req.file.filename
});


});





// PAGE ROUTES

const pages=[
'index',
'admissions',
'news',
'staff',
'gallery',
'contact',
'tours',
'badges',
'search'
];


pages.forEach(p=>{

app.get(
p==='index'?'/':`/${p}`,
(req,res)=>
res.sendFile(
path.join(__dirname,'../public',`${p}.html`)
)
);


});



app.get('/news/:id',(req,res)=>
res.sendFile(
path.join(__dirname,'../public','post.html')
)
);


app.get('/admin',
(req,res)=>
res.sendFile(
path.join(__dirname,'../public','admin.html')
)
);





// 404

app.use((req,res)=>{
res.status(404).sendFile(
path.join(__dirname,'../public','404.html')
);
});



module.exports=app;
