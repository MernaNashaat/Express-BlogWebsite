const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        index:true
    },
    body:{
        type:String,
        required:true
    },
   
    tags:{
        type:[String],
        index:true
    },
    userEmail:{
        type:String
    },
    userId:{
        type:String
    },
    creationTime:{
        type:Date
    }
});


const Blog = mongoose.model('Blog',schema);
module.exports=Blog;