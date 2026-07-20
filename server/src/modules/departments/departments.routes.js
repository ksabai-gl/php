'use strict';

const express = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const c = require('./departments.controller');

const router = express.Router();

router.get('/', asyncHandler(c.list));
router.get('/summary', asyncHandler(c.summary));

module.exports = router;
