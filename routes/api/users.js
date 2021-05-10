const express = require('express');
const router = express.Router();

// @route Get request to api/user/test //
// @description test user route //
// @access public //
router.get('/test', (req, res) => res.json({msg: 'users works'}));

module.exports = router;