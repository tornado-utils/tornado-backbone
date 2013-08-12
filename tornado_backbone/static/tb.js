/**
 * User: Martin Martimeo
 * Date: 08.08.13
 * Time: 14:48
 */

require(["jquery", "underscore", "backbone"],function ($, _, Backbone) {
    var self = this.Tornado || {};
    var Tornado = this.Tornado = self;

    /**
     * Operator defined by restless
     *
     * @TODO Add Tornado Restless Operators
     */
    Tornado.Operator = {
        equals: ["==", "eq", "equals", "equals_to"],
        unequals: ["!=", "ne", "neq", "does_not_equal", "not_equal_to"],
        gt: [">", "gt"],
        lt: ["<", "lt"],
        gte: [">=", "ge", "gte", "geq"],
        lte: ["<=", "le", "lte", "leq"],
        in: ["in"],
        not_in: ["not_in"],
        is_null: ["is_null"],
        is_not_null: ["is_not_null"],
        like: ["like"],
        has: ["has"],
        any: ["any"]
    };

    /**
     * If set, all sync calls will be enriched with this token
     */
    Tornado.xsrf_token = null;

    /**
     * Enriched Backbone model with a lot of information about the sqlalchemy model
     *
     * @type Tornado.Model
     */
    Tornado.Model = Backbone.Model.extend({

        /**
         * Schema for use with backbone-forms
         */
        schema: {},

        /**
         * List of default values
         */
        defaults: {},

        /**
         * Collection URL entry point
         */
        urlRoot: null,

        /**
         * Either idAttribute (if one pk) or idAttributes (more than one pk) for referencing the model
         */
        idAttribute: null,
        idAttributes: null,

        /**
         * Bunch of information about the model
         */
        columnAttributes: [], //! All columns
        relationAttributes: [], //! All relations
        integerAttributes: [], //! Columns represented as int
        numericAttributes: [], //! Columns represented as float
        readonlyAttributes: [], //! Columns with 'readonly' in column.info

        /**
         * Set deferred for chaining actions on fully loaded models & collections
         */
        initialize: function () {
            var dfd = this.deferred = new jQuery.Deferred();
            if (this.hasOwnProperty("collection")) {
                this.collection.deferred.done(function () {
                    dfd.resolve();
                });
            } else {
                dfd.resolve();
            }
        },

        /**
         * Sync method with adds xsrf_token if available
         *
         * @param method
         * @param model
         * @param options
         * @returns {*}
         */
        sync: function (method, model, options) {
            if (Tornado.xsrf_token) {
                options = options || {};
                options.headers = options.headers || {};
                options.headers['X-XSRFToken'] = Tornado.xsrf_token;
            }
            return Backbone.sync(method, model, options);
        }

    });

    Tornado.Collection = Backbone.Collection.extend({

        // Objects on page
        page_length: 25,
        num_results: null,

        /**
         * References of the collection based on the sqlalchemy model
         */
        foreignAttributes: [],
        foreignCollections: {},
        foreignRequirements: [],

        /**
         * Is this Collection fully loaded?
         */
        hasMore: function () {
            return this.num_results < this.models.length;
        },

        /**
         * Load more
         */
        fetchMore: function () {
            if (self.hasMore()) {
                // @TODO Implement
            }
        },

        // parse data from server
        // This is specific overwritten to work with flask-restless / tornado-restless
        parse: function (data) {
            var objects = data.objects || data;

            this.num_results = data.num_results || data.length;
            if (this.num_results < this.models.length + objects.length) {
                this.trigger("pagination:load");
            } else {
                this.trigger("pagination:complete");
            }

            return objects;
        },

        /**
         * Load all required foreign collections
         */
        initialize: function () {
            var dfd = this.deferred = new jQuery.Deferred();

            require(this.foreignRequirements, function () {
                dfd.resolve();
            });
        }
    });

    /**
     * A FilteredCollection
     *
     * It preserves a list of filters that are maintained for all queries
     *
     * @type Tornado.FilteredCollection
     */
    Tornado.FilteredCollection = Tornado.Collection.extend({

        /**
         * Is this Collection fully loaded?
         */
        hasMore: function () {
            return this.results[this.query]['num_results'] < this.results[this.query]['objects'].length;
        },

        /**
         * Load more
         *
         * @TODO offset is visible count (because of filters)
         */
        fetchMore: function () {
            if (this.hasMore()) {
                this.getResults(this.query, this.results[this.query]['objects'].length);
            }
        },

        /**
         * List of applied filters
         */
        filters: [],

        /**
         * apply a filter
         */
        addFilter: function (filter) {
            this.filters.push(filter);
            this.update(true);
        },

        /**
         * remove a filter
         *
         * @param filter Filter to be removed
         * @returns filter
         */
        removeFilter: function (filter) {
            var pos = this.filters.indexOf(filter);
            if (pos >= 0) {
                var rtn = this.filters.splice(pos, 1);
                if (rtn.length > 0) {
                    this.update(false);
                }
                return rtn[0];
            } else {
                return null;
            }
        },

        /**
         * Is the model visible according current filters?
         *
         * @param model
         */
        isv: function (model) {
            var collection = this;

            if (this.results[this.query]['objects'].indexOf(model) === -1) {
                return false;
            }

            var i, l, filter;
            for (i = 0, l = collection.filters.length; i < l; i++) {
                filter = collection.filters[i];

                var value = model.get(filter["name"]);
                var other = filter["val"] || model.get(filter["field"]);
                var rtn;

                if (filter["op"] in Tornado.Operator.equals) {
                    rtn = value == other;
                } else if (filter["op"] in Tornado.Operator.unequals) {
                    rtn = value != other;
                } else if (filter["op"] in Tornado.Operator.gt) {
                    rtn = value > other;
                } else if (filter["op"] in Tornado.Operator.lt) {
                    rtn = value < other;
                } else if (filter["op"] in Tornado.Operator.gte) {
                    rtn = value >= other;
                } else if (filter["op"] in Tornado.Operator.lte) {
                    rtn = value <= other;
                } else if (filter["op"] in Tornado.Operator.in) {
                    rtn = value in other;
                } else if (filter["op"] in Tornado.Operator.not_in) {
                    rtn = !(value in other);
                } else if (filter["op"] in Tornado.Operator.is_null) {
                    rtn = !value;
                } else if (filter["op"] in Tornado.Operator.is_not_null) {
                    rtn = !!value
                } else if (filter["op"] in Tornado.Operator.like) {
                    // @TODO Implement this
                    throw "Unimplemented operator: " + filter["op"];
                } else if (filter["op"] in Tornado.Operator.has) {
                    // @TODO Implement this
                    throw "Unimplemented operator: " + filter["op"];
                } else if (filter["op"] in Tornado.Operator.any) {
                    // @TODO Implement this
                    throw "Unimplemented operator: " + filter["op"];
                } else {
                    throw "Unexpected operator: " + filter["op"];
                }

                if (!rtn) {
                    return false;
                }
            }

            return true;
        },

        /**
         * Update visibility
         * @param vis
         */
        update: function (vis) {
            var collection = this;

            // Show hidden elements if they do not match a filter
            if (vis === true || vis !== false) {
                collection.each(function (object) {
                    if (object.hidden !== false) {
                        if (collection.isv(object)) {
                            object.trigger('show');
                            object.hidden = false;
                        }
                    }
                });
            }

            // Hide visible elements if they match a filter
            if (vis === false || vis !== true) {
                collection.each(function (object) {
                    if (object.hidden !== true) {
                        if (!collection.isv(object)) {
                            object.trigger('hide');
                            object.hidden = true;
                        }
                    }
                });
            }

        },

        /**
         * Cache of results
         */
        results: {},

        /**
         * Get the result list for a query
         * @param search
         * @param offset
         * @returns {$.Deferred}
         */
        getResults: function (search, offset) {
            var dfd = new $.Deferred();
            var collection = this;

            // Check whether this query was already asked
            if (self.results[search]) {
                dfd.resolve({'results': self.results[search]['objects']});
                return dfd;
            }

            // Create it
            var results = self.results[search] = {'num_results': null, 'objects': []};
            var query = {"search": search, "filters": collection.filters};

            // Apply an offset
            if (offset) {
                query["offset"] = offset;
            }

            // Fetch Objects
            this.curl(query).done(function (objects, num_results) {
                results['num_results'] = num_results;
                results['objects'].push.apply(results['objects'], objects.map(function (object) {
                    collection.add(object)
                }));
                dfd.resolve({'results': results['objects']});
            }).fail(function (jqXHR, textStatus, errorThrown) {
                    dfd.reject(jqXHR, textStatus, errorThrown);
                });

            return dfd;
        },

        /**
         * Wrapper for ajax query
         * @param query
         * @returns {jQuery.Deferred}
         */
        curl: function (query) {
            var dfd = new jQuery.Deferred();

            Backbone.ajax({
                url: this.url,
                data: {"q": JSON.stringify(query)},
                dataType: "json",
                contentType: "application/json",
                success: function (data) {
                    dfd.resolve(data.objects || data, data.num_results || data.length)
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    dfd.reject(jqXHR, textStatus, errorThrown);
                }
            });
            return dfd;
        },

        /**
         * Actually running query
         */
        query: null,

        /**
         * Do a search
         *
         * @param search search query
         * @returns {jQuery.Deferred}
         */
        doSearch: function (search) {
            var dfd = new jQuery.Deferred();
            var collection = this;

            // Store query
            collection.query = search;

            // Ask the search engine for the results
            self.getResults(search).done(function (objects) {
                // Scan which objects need to be resolved and which to be hidden
                var i, l, p, object;
                collection.each(function (object) {
                    object.hidden = object.hidden || 'a';
                });
                for (i = 0, l = objects.length, p = self.page_length; i < l && i < p; i++) {
                    object = self.get(objects[i]);
                    object.trigger('show');
                    object.hidden = false;
                }
                collection.each(function (object) {
                    if (object.hidden == 'a') {
                        object.trigger('hide');
                        object.hidden = true;
                    }
                });
            }).fail(function (jqXHR, textStatus, errorThrown) {
                    dfd.reject(jqXHR, textStatus, errorThrown);
                });

            return dfd;
        }





    });

    return Tornado;
}).call(window);
