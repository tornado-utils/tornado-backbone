/**
 * File: model.tpl
 * User: Martin Martimeo
 * Date: 30.04.13
 * Time: 13:12
 */


var {{ model_name }} = Backbone.Model.extend({

    defaults: {
        {% for column in columns %}
        {% if column.default %}
        "{{ column.name }}": "{{ column.default }}",
        {% end %}
        {% end %}
    },

    urlRoot: '{{ api_url }}/{{ collection_name }}',

    {% if len(primary_key_names) == 1 %}
    idAttribute: "{{ primary_key_names[0] }}",
    {% else %}
    idAttributes: new Array('{{ "','".join(primary_key_names) }}'),
    {% end %}

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