/**
 * User: Martin Martimeo
 * Date: 17.08.13
 * Time: 17:32
 *
 * Extension to backbone_relations
 */

require(["jquery", "underscore", "backbone", "backbone-relational"],function ($, _, Backbone, BackboneRelation) {
    var self = this.Tornado || {};
    var Tornado = this.Tornado = self;

    Tornado.RelationalModel = Backbone.RelationalModel.extend(Tornado.Model);

    return Tornado;
}).call(window);