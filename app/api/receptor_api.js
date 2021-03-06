var ActualLrpsApi = require('./actual_lrps_api');
var CellsApi = require('./cells_api');
var DesiredLrpsApi = require('./desired_lrps_api');

var ReceptorApi = {
  fetch() {
    return Promise.all([ActualLrpsApi.fetch(), CellsApi.fetch(), DesiredLrpsApi.fetch()]).then(function(responses) {
      var [{actualLrps}, {cells}, {desiredLrps}] = responses;
      return {actualLrps, cells, desiredLrps};
    });
  }
};

module.exports = ReceptorApi;