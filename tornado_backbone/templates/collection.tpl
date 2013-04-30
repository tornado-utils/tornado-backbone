{% include "model.tpl" %}

/**
* File: collection.tpl
* User: Martin Martimeo
* Date: 29.04.13
* Time: 19:18
*/

var {{ model_name }}Collection = Backbone.Collection.extend({
model : {{ model_name }},
url: '{{ api_url }}/{{ collection_name }}'
});

{{ collection_name }} = new {{ model_name }}Collection;