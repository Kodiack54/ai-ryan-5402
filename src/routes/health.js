const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ryan',
    port: 5402,
    role: 'Project Manager',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
