const express = require('express');
const router = express.Router();
router.post('/login', (req, res) => res.json({ token: 'mock_token' }));
module.exports = router;