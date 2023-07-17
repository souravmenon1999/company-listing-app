// packeges
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('./config/database');
const auth = require('./middleware/auth');

// database models
const User = require('./models/userModel');
const Product = require('./models/productModel');

app.use(express.json());
app.use(cors());

// routes
app.get('/', (req, res)=>{
    res.send("server is On");
})

// get products route
app.get('/api/product', async(req, res, next)=>{
    try {
        let filter = req.query;
        let sort = req.query.sort && JSON.parse(req.query.sort);
        if (req.query.category) {
            let category = {$in: req.query.category};
            filter.category = category;
        }
        for (const key in filter) {
            if (filter[key] === '' || key === 'sort') {
                delete filter[key];
            }
        }
        const products = await Product.find(filter).collation({ locale: "en" }).sort(sort);
        res.send(products);
    } catch (error) {
        next(error);
    }
})

// user register route
app.post('/api/register', async(req, res, next)=>{
    try {
        const {name, email, mobile, password} = req.body;
        console.log(req.body)
        if (!(name && email && mobile && password)) {
            return res.status(400).send("All input is required");
        }

        const oldUser = await User.findOne({ email });
        if (oldUser) {
            console.log('409')
            return res.status(409).send("User Already Exist. Please Login");
        }
        console.log('again')
        const encryptedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name,
            email: email.toLowerCase(),
            mobile: mobile,
            password: encryptedPassword
        });

        res.status(201).json(user.name);
    } catch (err) {
        next(err);
        // res.status(400).json({message: err.message});
    }
})

// login user
app.post('/api/login', async(req, res, next)=>{
    try {
        console.log(req.body)
        const {email, password} = req.body;
        if (!(email && password)) {
            return res.status(400).json('All input is required')
        }

        const user = await User.findOne({email});

        if (user && (await bcrypt.compare(password, user.password))) {
            //create token
            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY
            );
            user.token = token;

            return res.status(200).json(token);
        }
        res.status(400).json("Invalid Credential")
    } catch (err) {
        next(err);
    }
})

// post project route
app.post('/api/product', auth, async(req, res, next)=>{
    try {
        console.log(req.body)
        const {name, category, imgUrl, link, description} = req.body;
        if (!(name, category, imgUrl, link, description)) {
            return res.status(400).json("All Input Is Required")
        }
        console.log(category);

        const categoryArray = category.split(',');
        console.log(categoryArray);

        const product = await Product.create({
            name: name,
            imgUrl: imgUrl,
            category: categoryArray,
            description: description,
            vote: 0,
            link: link,
            comments: [],
            commentLength: 0
        })
        res.status(201).json({message: 'successfuly added', product});

    } catch (err) {
        err.status = 400;
        next(err);
    }
})

// edit project
app.put('/api/product/:id', async(req, res, next)=>{
    try {
        const {id} = req.params;
        let body = req.body;
        if (req.body.comments) {
            let comments = {comments: {$each: [req.body.comments], $position: 0}};
            body.$push = comments;
        }
        for (const key in body) {
            if (body[key] === '' || key === 'comments') {
                delete body[key];
            }
        }
        const product = await Product.findByIdAndUpdate(id, body);
        if (!product) {
            return res.status(404).json("Cannot find any product1")
        }

        const updateProduct = await Product.findById(id);
        res.status(200).send(updateProduct);
    } catch (err) {
        err.status = 500;
        next(err)
    }
})

module.exports = app;