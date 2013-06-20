/**
 * File: model.tpl
 * User: Martin Martimeo
 * Date: 30.04.13
 * Time: 13:12
 */


var {{ collection_name }}Model = Backbone.Model.extend({

    defaults: { {% for column in columns %}{% if column.default %}"{{ column.key }}": "{{ column.default }}", {% end %}{% end %} },

    urlRoot: '{{ api_url }}/{{ collection_name }}',

    {% if len(primary_keys) == 1 %}
    idAttribute: "{{ list(primary_keys)[0] }}",
    {% else %}
    idAttributes: new Array('{{ "','".join(primary_keys.keys()) }}'),
    {% end %}

    /**
     * Columns of this model (to be shown f.e. in table view)
     */
    columnAttributes: new Array('{{ "','".join([c.key for c in columns]) }}'),

    /**
     * Columns that are considered to be integer
     */
    integerAttributes: new Array('{{ "','".join([c.key for c in integer_columns]) }}'),

    /**
     * Columns that are considered to be floats or similiar
     */
    numericAttributes: new Array('{{ "','".join([c.key for c in numeric_columns]) }}'),

    /**
     * Columns that are marked as readonly
     */
    readonlyAttributes: new Array('{{ "','".join([c.key for c in readonly_columns]) }}'),

    /**
     * Columns that are relations
     */
    relationAttributes: new Array('{{ "','".join(relation_key_names) }}'),

    /**
     * Load all required foreign collections
     *
     */
    initialize: function () {
        this.deferred = new jQuery.Deferred();
        var dfd = this.deferred;
        this.collection.deferred.done(function () {
            dfd.resolve();
        });

    },

    /**
     * Override get method to get model objects on foreign keys
     *
     * @param attribute
     * @returns {*}
     */
    get: function (attribute) {

        var value = this.attributes[attribute];

        if (this.collection.foreignAttributes.indexOf(attribute) !== -1) {
            return this.collection.foreignCollections[attribute].get(value);
        }

        return value;
    },

    /**
     * Override sync method to pass xsrf token with call
     *
     * @param method
     * @param model
     * @param options
     * @returns {*}
     */
    sync: function (method, model, options) {
        options = options || {};

        options.headers = options.headers || {};
        options.headers['X-XSRFToken'] = '{{ handler.xsrf_token }}';

        return Backbone.sync(method, model, options);
    }

});

