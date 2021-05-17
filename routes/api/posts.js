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

// @route GET api/post //
// @description Get Blog Posts //
// @access public //
router.get('/', (req, res) => {
    Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostfound: 'no post found with that Id'}));
});

// @route GET api/post/:id //
// @description Get Blog Posts by id //
// @access public //
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({ nopostfound: 'no post found with that Id'}));
});

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