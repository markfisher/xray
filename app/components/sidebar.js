var React = require('react/addons');
var {pickColor} = require('../helpers/application_helper');
var DesiredLrp = require('./desired_lrp');
var SidebarHeader = require('./sidebar_header');
var cx = React.addons.classSet;

var types = React.PropTypes;

function matchesRoutes(desiredLrp, filter) {
  var routerKey = Object.keys(desiredLrp.routes)[0];
  var routes = desiredLrp.routes[routerKey];
  return routes.some(route => route.hostnames.some(hostname => hostname.includes(filter)));
}

var Sidebar = React.createClass({
  propTypes: {
    $receptor: types.object.isRequired
  },

  contextTypes: {
    colors: types.array.isRequired
  },

  renderDesiredLrps(desiredLrps) {
    var {$receptor} = this.props;
    var {actualLrps = []} = $receptor.get();
    var $selectedLrp = $receptor.refine('selectedLrp');

    if(!desiredLrps.length) {
      return <div className="mam">No filtered processes found.</div>;
    }

    return desiredLrps.map(function(desiredLrp, i) {
      var key = desiredLrp.process_guid;
      var containerColor = pickColor(this.context.colors, key);
      var odd = i % 2;
      var className = cx({'bg-dark-1': odd, 'bg-dark-2': !odd});
      var filtered = actualLrps.filter(({process_guid}) => process_guid === desiredLrp.process_guid);
      var isSelected = !!(desiredLrp && $selectedLrp.get() === desiredLrp);
      var props = {className, containerColor, desiredLrp, actualLrps: filtered, key, $selectedLrp, isSelected};
      return <DesiredLrp {...props}/>;
    }, this);
  },

  render() {
    var {$receptor} = this.props;
    var {filter} = $receptor.get();
    var {desiredLrps = []} = $receptor.get();
    if (filter) {
      desiredLrps = desiredLrps.filter(desiredLrp  => desiredLrp.process_guid.includes(filter) || matchesRoutes(desiredLrp, filter))
    }

    return (
      <div className="sidebar">
        <SidebarHeader $filter={$receptor.refine('filter')}/>
        <section className="desired-lrps">
          {this.renderDesiredLrps(desiredLrps)}
        </section>
      </div>
    );
  }
});

module.exports = Sidebar;