var Factory = require('rosie').Factory;
Factory.define('actualLrp')
  .sequence('process_guid')
  .sequence('instance_guid')
  .sequence('cell_id')
  .sequence('index');