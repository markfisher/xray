require('../spec_helper');

describe('ReceptorStreamMixin', function() {
  const receptorUrl = 'http://example.com';
  var subject, callbackSpy, desiredLrp;

  beforeEach(function() {
    var ReceptorStreamMixin = require('../../../app/mixins/receptor_stream_mixin');
    var Klass = React.createClass({
      mixins: [ReceptorStreamMixin],
      render() {
        return null;
      }
    });
    callbackSpy = jasmine.createSpy('callback');
    var Cursor = require('../../../app/lib/cursor');
    var actualLrp = Factory.build('actualLrp', {process_guid: 'xyz', index: 1});
    desiredLrp = Factory.build('desiredLrp', {process_guid: 'xyz'});
    var desiredLrpsByProcessGuid = {
      xyz: desiredLrp
    };
    var $receptor = new Cursor({cells: [], desiredLrps: [desiredLrp], actualLrps: [actualLrp], desiredLrpsByProcessGuid}, callbackSpy);
    subject = React.render(<Klass {...{$receptor}}/>, root);
    subject.createSSE(receptorUrl);
  });

  afterEach(function() {
    React.unmountComponentAtNode(root);
  });

  describe('#streamActualLrps', function() {
    beforeEach(function() {
      subject.streamActualLrps();
    });
    describe('when actual_lrp created events are received', function() {
      var actualLrp;
      beforeEach(function() {
        actualLrp = Factory.build('actualLrp', {process_guid: 'abc', index: 1});
        MockEventSource.mostRecent().trigger('actual_lrp_created', {
          actual_lrp: actualLrp
        });
      });

      it('adds the actual lrp to the receptor', function() {
        expect(callbackSpy).toHaveBeenCalled();
        var actualLrps = callbackSpy.calls.mostRecent().args[0].actualLrps;
        expect(actualLrps.map(({process_guid, index}) => ({process_guid, index}))).toEqual([
          {process_guid: 'abc', index: 1},
          {process_guid: 'xyz', index: 1}
        ]);
      });
    });
  });

  describe('#streamDesiredLrps', function() {
    beforeEach(function() {
      subject.streamDesiredLrps();
    });
    describe('when desired_lrp created events are received', function() {
      var newDesiredLrp;
      beforeEach(function() {
        newDesiredLrp = Factory.build('desiredLrp', {process_guid: 'abc'});
        MockEventSource.mostRecent().trigger('desired_lrp_created', {
          desired_lrp: newDesiredLrp
        });
        expect(callbackSpy).toHaveBeenCalled();
      });

      it('adds the desired lrp to the receptor', function() {
        var desiredLrps = callbackSpy.calls.mostRecent().args[0].desiredLrps;
        expect(desiredLrps).toContain(newDesiredLrp);
      });

      it('adds the desired lrp to the index', function() {
        var desiredLrpsByProcessGuid = callbackSpy.calls.mostRecent().args[0].desiredLrpsByProcessGuid;
        expect(desiredLrpsByProcessGuid.abc).toEqual(newDesiredLrp);
      });
    });

    describe('when desired lrp removed events are received', function() {
      beforeEach(function() {
        MockEventSource.mostRecent().trigger('desired_lrp_removed', {
          desired_lrp: desiredLrp
        });
        expect(callbackSpy).toHaveBeenCalled();
      });

      it('removes the desired lrp from the receptor', function() {
        var desiredLrps = callbackSpy.calls.mostRecent().args[0].desiredLrps;
        expect(desiredLrps).not.toContain(desiredLrp);
      });

      it('removes the desired lrp from the index', function() {
        var desiredLrpsByProcessGuid = callbackSpy.calls.mostRecent().args[0].desiredLrpsByProcessGuid;
        expect(desiredLrpsByProcessGuid.xyz).toBeUndefined();
      });
    });

    describe('when desired lrp change events is received', function() {
      var newDesiredLrp;
      beforeEach(function() {
        newDesiredLrp = Factory.build('desiredLrp');
        MockEventSource.mostRecent().trigger('desired_lrp_changed', {
          desired_lrp_after: newDesiredLrp
        });
        expect(callbackSpy).toHaveBeenCalled();
      });

      it('adds the desired lrp to the receptor', function() {
        var desiredLrps = callbackSpy.calls.mostRecent().args[0].desiredLrps;
        expect(desiredLrps).toContain(newDesiredLrp);
      });

      it('adds the desired lrp to the index', function() {
        var desiredLrpsByProcessGuid = callbackSpy.calls.mostRecent().args[0].desiredLrpsByProcessGuid;
        expect(desiredLrpsByProcessGuid[newDesiredLrp.process_guid]).toEqual(newDesiredLrp);
      });
    });
  });
});