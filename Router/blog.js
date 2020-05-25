const express=require('express');
const router=express.Router();
const Blog = require('../Models/Blog');
const User = require('../Models/user');

const AuthenticationMiddleware=require('../Middlewares/Authentication');
  
//blog
//create
router.post('/add',
AuthenticationMiddleware
, async (req,res,next)=>{
try {

    const createdBlog =new Blog( {
        title:req.body.title,
        body:req.body.body,
        tags:req.body.tags
    });
    createdBlog.userEmail=req.user.email;
    createdBlog.userId=req.user.id; 
    createdBlog.creationTime=Date.now();

    const blog = await createdBlog.save();

    const user = await User.findOne({
        email: req.user.email
    });
    let newBlogsIds=[];
    newBlogsIds=user.BlogsIds;
    newBlogsIds.push(blog.id);
    await User.updateMany(
        { "_id": req.user.id}, // Filter
        {$set: {BlogsIds: newBlogsIds}}
         
    )
        res.status(200).send(blog);
    
}
catch(err)
{
    err.statusCode=422;
    next(err);
}
});
  
router.get('/count', async (req,res,next)=>{
       try 
       {

        let count = await Blog.countDocuments();
        res.statusCode=200;
        res.send({count})
       }catch(err)
       {
           next(err);
       }
});




router.get('/Blogs',async (req,res) => {
    var pageNo = parseInt(req.query.pageNo)
    var size = parseInt(req.query.size)
    var query = {}
    if(pageNo < 0 || pageNo === 0) {
          response = {"error" : true,"message" : "invalid page number, should start with 1"};
          return res.json(response)
    }
    query.skip = size * (pageNo - 1)
    query.limit = size
    var arr=[];
       await  Blog.find({},{},query,function(err,data) {
              if(err) {
                  response = {"error" : true,"message" : "Error fetching data"};
              } else {
                  response = {"error" : false,"message" : data};
              }
            //   arr=response;
              res.send(response);

            });
            // arr.sort((a,b)=>a.creationTime-b.creationTime);
            // res.send(arr);
          
  })
  


//read
router.get('/list',async(req,res,next)=>{
try{
    
     const BlogsList = await Blog.find();
     res.send(BlogsList);
}
catch(err)
{
  err.statusCode=422;
  next(err);
}
});
//update
router.patch('/:id',
AuthenticationMiddleware
,async (req,res,next)=>{
    try{var id = req.params.id;
    const blog = await Blog.findOne({
        _id: id
    });
    // const updatedBlog= new Blog({
    //     title:req.body.title,
    //     body:req.body.body,
    //     tags:req.body.tags
    // })

    // updatedBlog.userEmail=req.user.email;

//    await Blog.updateOne(id,updatedBlog);
   await Blog.updateMany(
                    { "_id": id}, // Filter
                    {$set: {title: req.body.title , body:req.body.body,tags:req.body.tags}}
                     
                )
                res.statusCode=200;
   res.send(await Blog.findOne({"_id":id}));
    }catch(err)
    {
        err.statusCode=422;
        next(err);
    }
});
//delete
router.delete('/:id', 
AuthenticationMiddleware
,async (req,res,next)=>{
   try{
    var id = req.params.id;
    
    const user = await User.findOne({
        email: req.user.email
    });
    await Blog.remove({_id:id});
    let newArr=[];
    const index=await user.BlogsIds.indexOf(id);
    user.BlogsIds.splice(index,1);

    const fullBlogs=[];

    for (const id of  user.BlogsIds) {
     const blog=await  Blog.findOne({_id:id});
     fullBlogs.push(blog);
    }
    await User.updateMany(
        { "_id": req.user.id}, // Filter
        {$set: {BlogsIds:user.BlogsIds}}
         
    )
    res.statusCode=200;
    res.send(fullBlogs);
   }
   catch(err)
   {
       err.statusCode=422;
       next(err);
   }
});


module.exports = router;