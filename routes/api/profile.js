const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Validation //
const validateProfileInput = require('../../validation/profile')
// Load Profile model //
const Profile = require('../../models/Profile');
// Load User Profile //
const User = require('../../models/User');

// @route Get request to api/profile/test //
// @description test profile route //
// @access public //
router.get('/test', (req, res) => res.json({msg: 'profile works'}));

// @route Get request to api/profile//
// @description get current user profile  //
// @access private //
router.get('/', passport.authenticate('jwt', { session: false }), (req,res)=> {
    const errors = {};

    Profile.findOne({ user: req.user.id })
    .populate('user', ['name', 'email', 'avatar'])
    .then(profile => {
        if(!profile) {
            errors.noprofile = 'There is no profile for this user';
            return res.status(404).json(errors);
        }
        res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route get request to api/profile/handle/:handle //
// @description create or update user profile  //
// @access public //
router.get('/handle/:handle', (req, res)=> {
    const errors = {};
    Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        if(!profile) {
            errors.noprofile = 'There is no profile for this handle'
            res.status(404).json(errors);
        }
        res.json(profile);
    })
    .catch(err => res.status(404).json(err));
})

// @route get request to api/profile/usere/:user_id //
// @description get profile user ID  //
// @access public //
router.get('/user/:user_id', (req, res)=> {
    const errors = {};
    Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        if(!profile) {
            errors.noprofile = 'There is no profile for this handle'
            res.status(404).json(errors);
        }
        res.json(profile);
    })
    .catch(err => res.status(404).json({profile:'ther is no profile for this user'}));
})
// @route post request to api/profile//
// @description create or edit user profile  //
// @access private //
router.post('/', passport.authenticate('jwt', { session: false }), (req,res)=> {
    const { errors, isValid } = validateProfileInput(req.body);

    // check validation //
    if(!isValid) {
        // reurn any error with 400 status //
        return res.status(400).json(errors);
    }
    //Get profile fields
    const profileFields = {};
    profileFields.user = req.user.id; 
    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.company) profileFields.company = req.body.company;
    if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.status) profileFields.status = req.body.status;
    if(req.body.bio) profileFields.bio = req.body.bio;
    if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;

    // skills - split into an array
    if(typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',');
    }

    //Socials
    profileFields.social = {}; 
    if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram;
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook;

    Profile.findOne({ user: req.user.id })
    .then(profile => {
        if(profile) {
            // update //
            Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            ).then(profile => res.json(profile));
        } else {
            // create //
            // check if handle exists//
            Profile.findOne({ handle: profileFields.handle }).then(profile => {
                if(profile) {
                    errors.handle = 'That handle already exists';
                    res.status(400).json(errors);
                }
                // save profile if no errors and handle doesnt exist //
                new Profile(profileFields).save().then(profile => res.json(profile));
            });
        }
    });
});


module.exports = router;