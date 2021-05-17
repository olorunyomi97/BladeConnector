const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');


// Post Model //
const Post = require('../../models/Post');

// Validation //
const validatePostInput = require('../../validation/post');
// @route Get request to api/post/test //
// @description test post route //
// @access public //
router.get('/test', (req, res) => res.json({msg: 'posts works'}));

// @route POST api/post //
// @description Create Blog Posts //
// @access private //
router.post('/', passport.authenticate('jwt', { session: false }), (req, res)=>{
    const { errors, isValid } = validatePostInput(req.body);
    // check validation //
    if(!isValid) {
        // if and errors, send 400 with errors //
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save()
    .then(post => res.json(post));
});

module.exports = router;