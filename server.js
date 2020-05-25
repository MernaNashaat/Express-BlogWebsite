require('dotenv').config();
const express=require('express');
require('./db');
const cors = require('cors');
const blogRouter=require('./Router/blog');
const userRouter=require('./Router/User');
const app=express();
// const port = 80;
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});

app.use('/blog',blogRouter);
app.use('/user',userRouter);
app.use((err,req,res,next)=>{ 
    console.log(err.message);
    err.statusCode=err.statusCode||500;
    err.message=err.message;
    const handledError=err.statusCode <500;
    res.status(err.statusCode).send(
        {
            message:handledError?err.message : 'some thing went wrong',
            statusCode:err.statusCode,
            errors:err.errors
            
        });
});

// app.listen(port,()=>{
//     console.info(`server is listening on port ${port}`);
// })