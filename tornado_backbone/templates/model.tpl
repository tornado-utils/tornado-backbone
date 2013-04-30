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
"{{ column.name }}":  "{{ column.default }}",
{% end %}
{% end %}
}

idAttribute: "{{ primary_key_name }}"

});