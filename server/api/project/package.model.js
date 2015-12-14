/**
 * Copyright (c) TUT Tampere University of Technology 2015-2016
 * All rights reserved.
 *
 * Main author(s):
 * Antti Nieminen <antti.h.nieminen@tut.fi>
 */

'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


// TODO: not needed?
var PackageSchema = new Schema({
  _project: {type: Schema.Types.ObjectId, ref: 'Project'},
});



module.exports = mongoose.model('Package', PackageSchema);
