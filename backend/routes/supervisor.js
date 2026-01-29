const express = require('express');
const router = express.Router();
router.get('/', (req, res) => res.json({ message: 'Supervisor route' }));
module.exports = router;