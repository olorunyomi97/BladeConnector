const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');


// Post Model //
const Post = require('../../models/Post');
// Profile Model //
const Profile = require('../../models/Profile');

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


// @route DELETE api/post/:id //
// @description Delete Blog Posts by id //
// @access private //
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res)=>{
    Profile.findOne({ user: req.user.id })
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            // check for owner of the post //
            if(post.user.toString() !== req.user.id) {
                return res.status(401).json({ notauthorized : 'User not Authorized' });
            }
            // Delete //
            post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postnotfound : 'Post not found' }));
    })
});


// @route POST api/post/like/:id //
// @description Like Blog Posts //
// @access private //
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res)=>{
    Profile.findOne({ user: req.user.id })
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            // check if the post has been liked //
           if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ alreadyliked: 'User already liked post' });
           }
           // Add user id to likes array
           post.likes.unshift({ user: req.user.id });
           post.save()
           .then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound : 'Post not found' }));
    });
});

// @route POST api/post/unlike/:id //
// @description unlike Blog Posts //
// @access private //
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res)=>{
    Profile.findOne({ user: req.user.id })
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            // check if the post has been liked //
           if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ notliked: 'You have not yet liked post' });
           }

           // get removed index //
           const removeIndex = post.likes
           .map(item => item.user.toString())
           .indexOf(req.user.id);

           //splice out array //
           post.likes.splice(removeIndex, 1);
           // save to db//

           post.save()
           .then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound : 'Post not found' }));
    });
});

// @route POST api/post/comment/:id //
// @description Add comment to Blog Posts //
// @access private //
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res)=>{
    const { errors, isValid } = validatePostInput(req.body);
    // check validation //
    if(!isValid) {
        // if and errors, send 400 with errors //
        return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
    .then(post => {
        const newComment = {
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id
        }
        // add to comment array //
        post.comments.unshift(newComment);
        // save //
        post.save()
        .then(post => res.json(post));
    })
    .catch(err => res.status(404).json({ postnotfound: 'No Post Found'}));
});

// @route DELETE api/post/comment/:id/:comment_id //
// @description delete comment from Blog Posts //
// @access private //
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res)=>{
    Post.findById(req.params.id)
    .then(post => {
        // check if comment exist //
        if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
            return res.status(404).json({ commentnotexists: 'comment does not exist' })
        }
        // remove index //
        const removeIndex = post.comments
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id);

        //splice out the array //
        post.comments.splice(removeIndex, 1);
        post.save()
        .then(post => res.json(post));
    })
    .catch(err => res.status(404).json({ postnotfound: 'No Post Found'}));
});
    // Delete Put //

});
module.exports = router;