require('dotenv').config()
const port = process.env.PORT || 5000;
const express = require('express');
require('./db/config');
const cors = require('cors');
const User = require('./db/User');
const Product = require('./db/Product'); // Fixed the case of 'Product' to 'product'
// const { default: PrivateComponent } = require('../front-end/src/components/PrivateComponent');
const Jwt = require('jsonwebtoken');
const jwtKey= 'priy' //authentication key should be kept secret
const app = express();
app.use(express.json());
app.use(cors());


// Register
app.post("/register", async (req, res) => {
    let user = new User(req.body);
    let result = await user.save();
    result= result.toObject(); //postman ma password na dekhay aena mate
    delete result.password;
    if(user){
        Jwt.sign({result},jwtKey,{expiresIn:"2h"},(err,token)=>{ //result register vali api mate lakhyu che 
            if(err){                                             //login mate result ni jagya ae user lakhvanu 
                res.send({result: "Something went wrong"  });
            }
            res.send({result,auth:token});
        })
       
    }
    else{
        res.send({result: "User not found"  });
    }
})

// Login
app.post("/login", async (req, res) => {
    console.log(req.body);
    if(req.body.email && req.body.password){
        let user = await User.findOne(req.body).select("-password");
        if(user){
            Jwt.sign({user},jwtKey,{expiresIn:"2h"},(err,token)=>{
                if(err){
                    res.send({result: "Something went wrong"  });
                }
                res.send({user,auth:token});
            })
           
        }
        else{
            res.send({result: "User not found"  });
        }
    }else{
        res.send({result: "User not found"  });
    }
})

// Add Product
app.post("/add-product",verifyToken, async (req, res) => {
   let product = new Product(req.body);
   let result = await product.save();   
   res.send(result);
})

// product list
app.get("/products",verifyToken, async (req, res) => {
    let products = await Product.find();
    if(products.length > 0){
    res.send(products);
    } else{
        res.send({result: "No products found"  });
    }
})

// delete products
app.delete("/product/:id",verifyToken, async (req, res) => {
    const result = await Product.deleteOne({_id:req.params.id});
    res.send(result);
})

//find producr by id
app.get("/product/:id",verifyToken, async (req, res) => { //aaiya .get ane .delete banne method alag che to problem nai aave
    const result = await Product.findOne({_id:req.params.id});
    if(result){
    res.send(result);
    }else{
        res.send({result: "Product not found"  });
    }
})


//Update Product
app.put("/product/:id",verifyToken, async (req, res) => {
    const result = await Product.updateOne({_id:req.params.id}, 
        { $set: req.body}
    );
    res.send(result);
})

//search for product
app.get("/search/:key",verifyToken, async (req, res) => {
    let result = await Product.find({
            $or :[
                {name:{$regex: req.params.key.toString()}},
                {category:{$regex: req.params.key.toString() }},
                {price:{$regex: req.params.key.toString()}},
                {material:{$regex: req.params.key.toString()}}
            ]
        });
    res.send(result);
})

//aapde ek token banaisu ane aena pachi aenu ek middleware banaisu token verify mate.
//  Middleware aetle banaisu k aapde badhi api sathe use kari sakay middleware and simple fun ma ae diffrence hoy che k middleware ma atleast 3 para hoy aj che 'req,rs, next' 
// next middleware ne api na process ma send karavse
function verifyToken(req,res,next) {
    let token = req.headers['authorization']
    if(token){
        token= token.split(' ')[1]; //[1] token ne pehla lakhva mate
        Jwt.verify(token, jwtKey, (err,valid)=>{ //token ne verify karva mate nu inbuilt function hoy che  jwt ma
            if(err){
                res.status(401).send({result: "Please provide valid token"  });

            }else{
                    next();
            }
        }) 
    }else{
        res.status(404).send({result: "Please provide token"  });

    }
    // console.warn("middleware called", token ) khali check karva aj lakhyu hatu 
    // next(); //verifyToken j aapdu middleware function che aene api sudhi lai jase(shifted to else line number 114)
}
app.listen(process.env.PORT,()=>{
    console.log(`Server running on port ${port}`);  // app.listen(5000);  kaise bhi change karva thaye to 5000 na aaye.  process.env.PORT is for heroku deployment.
});


// deployment
app.get("/deploy", async (req, res) => {

    res.send("Hieee Divy...😉");
})