'use strict';

const express = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const c = require('./employees.controller');

const router = express.Router();

// Collection endpoints (also serve legacy `employees.php` alias mounted in app.js).
router.get('/', asyncHandler(c.list));
router.post('/', asyncHandler(c.create));
// Legacy PHP-style body-with-id PUT/DELETE on the collection URL.
router.put('/', asyncHandler(c.update));
router.delete('/', asyncHandler(c.remove));

// New RESTful item endpoints.
router.get('/:id(\\d+)', asyncHandler(c.getOne));
router.put('/:id(\\d+)', asyncHandler(c.update));
router.delete('/:id(\\d+)', asyncHandler(c.remove));

module.exports = router;
