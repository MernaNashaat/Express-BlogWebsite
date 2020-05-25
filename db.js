const mongoose = require('mongoose');
mongoose.connect(process.env.URI_Connection,
 {useNewUrlParser: true,
     useUnifiedTopology: true})
     .then(()=>
     {
         console.log("connected successfully")
     }).catch(err=>{
         console.error(err);
         process.exit(1);
     });