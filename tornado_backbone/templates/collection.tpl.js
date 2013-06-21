{% include "model.tpl.js" %}

/**
 * File: collection.tpl
 * User: Martin Martimeo
 * Date: 29.04.13
 * Time: 19:18
 */

var {{ collection_name }}Collection = Backbone.Collection.extend({

    model: {{ collection_name }}Model,
    name: '{{ collection_name }}',

    url: '{{ api_url }}/{{ collection_name }}',

    /**
     * Columns that are foreign keys
     */
    foreignAttributes: new Array('{{ "','".join(foreign_keys.keys()) }}'),
    foreignCollections: {},

    // Information about pagination
    _numResults: undefined,
    _numPages: undefined,
    _loadedPages: [],

    // Did we load already all pages?
    isFullyLoaded: function () {
        return (this._numResults != undefined) && (this._numResults == this.models.length);
    },

    // parse data from server
    // This is specific overwritten to work with flask-restless / tornado-restless
    parse: function (response) {
        response.page = parseInt(response.page);
        if (this._loadedPages.indexOf(response.page) == -1) {
            this._loadedPages.push(response.page);
        }
        this._numPages = response.num_pages;
        this._numResults = response.num_results;

        if (this.isFullyLoaded()) {
            this.trigger("pagination:complete");
        } else {
            this.trigger("pagination:load");
        }

        return response.objects;
    },

    // fetches more results to collection
    fetchMore: function () {
        if (!this.isFullyLoaded()) {
            if (this._loadedPages.indexOf(1) == -1) {
                this.fetch();
            } else {
                var page = 1;
                while (this._loadedPages.indexOf(page) >= 0) {
                    page += 1;
                }
                if (page > this._numPages) {
                    return false;
                }
                this.fetch({data: {page: page}});
            }
            return true;
        }
        return false;
    },

    /**
     * Load all required foreign collections
     *
     */
    initialize: function () {
        this.deferred = new jQuery.Deferred();

        var dfd_count = {{ len(foreign_collections) }};

        {% for key, c in foreign_collections.items() %}
        var collection = this;
        require(["{{ own_url }}/{{ c }}"], function () {
            dfd_count--;
            collection.deferred.notify("{{ own_url }}/{{ c }}");

            collection.foreignCollections['{{ key }}'] = {{ c }};

            if (dfd_count == 0) {
                collection.deferred.resolve();
            }
        });
        {% end %}

        if (dfd_count == 0) {
            this.deferred.resolve();
        }
    }
});

{{ collection_name }} = new {{ collection_name }}Collection;