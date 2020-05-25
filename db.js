const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://Test123:Test123@cluster0-gamdj.mongodb.net/Blog-Site-ReactNode?retryWrites=true&w=majority',
 {useNewUrlParser: true,
     useUnifiedTopology: true})
     .then(()=>
     {
         console.log("connected successfully")
     }).catch(err=>{
         console.error(err);
         process.exit(1);
     });