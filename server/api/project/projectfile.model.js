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

mongoose.set('debug', true);

var ProjectFileSchema = new Schema({
  _project: {type: Schema.Types.ObjectId, ref: 'Project'},
  name: String,
  content: String,
});

ProjectFileSchema.index({name: 1, _project: 1}, {unique: true});

module.exports = mongoose.model('ProjectFile', ProjectFileSchema);
