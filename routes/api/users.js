const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// Load Input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load User model
const User = require('../../models/User');

// @route       GET api/userss/test //
// @description Tests users route //
// @access      public
router.get('/test', (req, res) => res.json({ msg: "Users Works" }));

// @route       GET api/users/register//
// @description Register user//
// @access      public
router.post('/register', (req, res) => {
    //check validation for registration
    const { errors, isValid } = validateRegisterInput(req.body);
    if(!isValid) {
        return res.status(400).json(errors);
    }
    // validation check end 

    User.findOne({ email: req.body.email })
    .then(user => {
        if (user) {
            // return res.status(400).json({ email: 'email already exists' })
            errors.email = 'Email already exists'
            return res.status(400).json(errors);
        } else {
            const avatar = gravatar.url(req.body.email, {
                s: '200', // Size
                r: 'pg', // Rating 
                d: 'nm' //Default
            });

            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.password
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser
                    .save()
                    .then(user => res.json(user))
                    .catch(err => console.log(err));
                })
            })
        }
    });
});

// @route       GET api/users/login//
// @description login user// returning the jwt token
// @access      public
router.post('/login', (req, res) => {
    //check validation for registration
    const { errors, isValid } = validateLoginInput(req.body);
    if(!isValid) {
        return res.status(400).json(errors);
    }
    // validation check end
    const email = req.body.email;
    const password = req.body.password;

    // find user by email //
    User.findOne({ email })
    .then(user => {
        // check for user //
        if(!user) {
            errors.email = 'User Email not found'
            return res.status(404).json(errors);
        } 
        // check password //
        bcrypt.compare(password, user.password)
        .then(isMatch => {
            if(isMatch) {
                // user password matched //
                const payload = { id: user.id, name: user.name, avatar: user.avatar }

                // Sign Jwt Token //
                jwt.sign(
                    payload, 
                    keys.secretOrkey, 
                    { expiresIn: 3600 }, 
                    (err, token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token 
                        })
                    }
                );
            } else {
                errors.password = "incorrect password"
                return res.status(400).json(errors);
            }
        })
    })
})

// @route       GET api/users/current//
// @description return current user//
// @access      private
router.get('/current', passport.authenticate('jwt', { session: false}), (req, res)=> {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});

module.exports = router;