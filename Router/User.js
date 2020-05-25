const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const CustomError = require('../Helpers/customError');
const {
    validationResult,
    check
} = require('express-validator');

const User = require('../Models/user');
const Blog=require('../Models/Blog');
const checkRequiredParams = require('../Middlewares//CheckRequiredParams');
const AuthenticationMiddleware=require('../Middlewares/Authentication');

const saltRounds = 10;
router.post('/signup',
    // checkRequiredParams(['name','email','password'])
    [
        check('email').isEmail(),
        check('password').isLength({
            min: 5
        })
    ],
    (req, res, next) => {
        const {
            errors
        } = validationResult(req);
        if (errors.length) {
            const error = new Error('Validation Error');
            error.statusCode = 422;
            error.errors = errors.reduce((agg, fieldError) => {
                agg[fieldError.param] = fieldError;
                return agg;
            }, {});
            return next(error);
        }
        next();
    }, async (req, res, next) => {
        try {
            //   validationResult;
            const currentUser = new User({
                name: req.body.name,
                email: req.body.email,
                age: req.body.age,
                password: req.body.password,
                followersIds:req.body.followersIds,
                followingIds:req.body.followingIds
                
            });
            const user = await currentUser.save();
            res.statusCode = 200;
            res.send(user);

        } catch (err) {
            err.statusCode = 422;
            next(err);
        }
    });

router.post('/login',
    checkRequiredParams(['email', 'password']),
    async (req, res, next) => {

        try {
            const user = await User.findOne({
                email: req.body.email
            });
          
            const isMatch = await user.checkPassword(req.body.password);
            if (!user) throw new CustomError("Invalid user name or password",401);
            if (!isMatch) throw new CustomError("Invalid user name or password",401);
            const token = await user.generateToken();
            res.json({
                token,
                user
            })
        } catch (err) {
            err.statusCode = 422;
            next(err);
        }
    });

router.get('/profile',
AuthenticationMiddleware
        , (req, res, next) => {
            res.send(req.user);
        });

 
        router.get('/profile/:id',
AuthenticationMiddleware
        ,  async (req, res, next) => {
            try{
                var id = req.params.id;
                var hea = req.headers.RequestedProfileId;
                const user = await User.findOne({
                    _id: id
                });
                res.send(user);
            }catch(err)
                {
                    err.statusCode=422;
         next(err);
                }
            });
            
    

            router.post('/follow',
            AuthenticationMiddleware,
            async(req,res,next)=>{
                try
                {
                  
                    const Currentuser = await User.findOne({
                        email: req.user.email
                    });
                    let index=Currentuser.followingIds.indexOf(req.headers.requestedprofileid);
                    if(index<0)
                    {if(Currentuser.id!==req.headers.requestedprofileid)
                    {

                        let requestedProfile=req.headers.requestedprofileid;
                        const userToFollow = await User.findOne({
                            _id: requestedProfile
                        });
                        
                        let followings=[];
                        followings=Currentuser.followingIds;
                        followings.push(requestedProfile);
                        await User.updateMany(
                            { "_id": Currentuser._id}, // Filter
                            {$set: {followingIds:  followings}}
                             
                        );
                        let followers=[];
                        followers=userToFollow.followersIds;
                        followers.push(Currentuser.id);
                        await User.updateMany(
                            { "_id": requestedProfile}, // Filter
                            {$set: {followersIds:  followers}}
                             
                        );
                        
                        
                        res.statusCode=200;
                       res.send(followings);
                    }
                    else 
                    {
                        throw Error("You can't Follow Your Self");
                    }
                }
                    else 
                    {
                        throw Error("Follower Already Exist");
                    }
     
            
                }
                catch(err)
                {
                    next(err);
                }
            })
                       



router.get('/followers',
AuthenticationMiddleware,
async(req,res,next)=>{
    try
    {
      
        const user = await User.findOne({
            email: req.user.email
        });
        
        let followers=[];
        for (const element of user.followersIds) {
            let user2 = await User.findOne({_id:element});
            followers.push(user2)
        }
        res.send(followers);

    }
    catch(err)
    {
        next(err);
    }
})


router.get('/following',
AuthenticationMiddleware,
async(req,res,next)=>{
    try
    {
        const user = await User.findOne({
            email: req.user.email
        });
        
        let followings=[];
        for (const element of user.followingIds) {
            let user2 = await User.findOne({_id:element});
            followings.push(user2)
        }
        res.send(followings);
    }
    catch(err)
    {
        next(err);
    }
});


router.get('/myblogs', 
AuthenticationMiddleware
,async (req,res,next)=>{
   try{
   const user = await User.findOne({
    email:  req.user.email
});

   const Blogs =user.BlogsIds;
   const fullBlogs=[];
   for (const id of Blogs) {
    const blog=await  Blog.findOne({_id:id});
    fullBlogs.push(blog);
   }
  
   res.send(fullBlogs);
   }
   catch(err)
   {
       err.statusCode=422;
       next(err);
   }
});

router.get('/myFollowers', 
AuthenticationMiddleware
,async (req,res,next)=>{
   try{
    const user = await User.findOne({
        email: req.user.email
    });
    let followers=[];
    user.followersIds.forEach(element => {
        followers.push(User.findById(element));
        
    });
    res.send(followers);
   }
   catch(err)
   {
       err.statusCode=422;
       next(err);
   }
});

module.exports = router;