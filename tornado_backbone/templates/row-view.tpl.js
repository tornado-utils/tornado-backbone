/**
 * File: row-view.tpl
 * User: Martin Martimeo
 * Date: 17.05.13
 * Time: 15:18
 */

var {{ model_name }}Row = Backbone.View.extend({

    tagName: "tr",

    className: "model-row model-row-{{ collection_name }}",

    events: {},

    initialize: function () {
        this.listenTo(this.model, "change", this.render);
    }

    render: function () {

        var model = this.model;

        var model_tr = $("<tr>");
        $.each(model.columns, function (index, column) {
            $("<td>").attr("data-column", column).text(model.get(column)).appendTo(model_tr);
        });
        this.$el.replaceWith(model_tr);

    }

});