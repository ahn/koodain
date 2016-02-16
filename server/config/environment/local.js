'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/koodain-dev'
  },

  git: {
    projects: '/full/path/to/dir/where/to/save/koodain/projects'
  },

  seedDB: true
};
