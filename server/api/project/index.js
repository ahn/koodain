/**
 * Copyright (c) TUT Tampere University of Technology 2015-2016
 * All rights reserved.
 *
 * Main author(s):
 * Antti Nieminen <antti.h.nieminen@tut.fi>
 */

'use strict';

var express = require('express');
var controller = require('./project.controller');
var fileCtrl = require('./projectfile.controller');
var packageCtrl = require('./package.controller');

var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/:project', controller.show);
router.post('/', controller.create);

router.get('/:project/files', fileCtrl.index);
router.get('/:project/files/:file', fileCtrl.show);
router.post('/:project/files', fileCtrl.create);
router.put('/:project/files/:file', fileCtrl.update);

router.post('/:project/package', packageCtrl.create);

module.exports = router;
