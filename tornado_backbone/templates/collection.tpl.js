{% include "model.tpl.js" %}

{% include "row-view.tpl.js" %}

/**
 * File: collection.tpl
 * User: Martin Martimeo
 * Date: 29.04.13
 * Time: 19:18
 */

var {{ model_name }}Collection = Backbone.Collection.extend({

    model: {{ model_name }},

    url: '{{ api_url }}/{{ collection_name }}',

    _numPages: undefined,
    _loadedPages: [],
    // Did we load already all pages?
    isFullyLoaded: function () {
        return (this._numPages != undefined) && (this._loadedPages == this._numPages);
    },

    // parse data from server
    // This is specific overwritten to work with flask-restless / tornado-restless
    parse: function (response) {
        if (this._loadedPages.indexOf(response.page) == -1) {
            this._loadedPages.push(response.page);
        }
        this._numPages = response.num_pages;
        this._numResults = response.num_results;

        return response.objects;
    },

    // fetches more results to collection
    fetchMore: function () {
        if (!this.isFullyLoaded()) {
            if (this._loadedPages.indexOf('1') == -1) {
                this.fetch();
            } else {
                this.fetch({page: this._loadedPages.length});
            }
            return true;
        }
        return false;
    }

});

{{ collection_name }} = new {{ model_name }}Collection;