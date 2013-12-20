/**
 * User: Martin Martimeo
 * Date: 08.08.13
 * Time: 14:48
 *
 * Core Lib
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
        element_of: ["in", "element_of"],
        not_element_of: ["not_in", "not_element_of"],
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
         * Information about the defined relations for the model
         */
        relations: [],

        /**
         * Bunch of information about the model
         */
        columnAttributes: [], //! All columns
        relationAttributes: [], //! All relations
        readonlyAttributes: [], //! Columns with 'readonly' in column.info

        /**
         * Guess the type based on the schema
         *
         * @param attribute
         */
        is_numeric: function (attribute) {
            if (this.schema.hasOwnProperty(attribute)) {
                if (this.schema[attribute].type == "Number") {
                    return true;
                }
                if (this.schema[attribute].type == "Text" && this.schema[attribute].dataType == "number") {
                    return true;
                }
            }
            return false;
        },

        /**
         * Guess the type based on the schema
         *
         * @param attribute
         */
        is_datetime: function (attribute) {
            if (this.schema.hasOwnProperty(attribute)) {
                if (this.schema[attribute].type == "DateTime") {
                    return true;
                }
                if (this.schema[attribute].type == "Text" && this.schema[attribute].dataType == "datetime") {
                    return true;
                }
            }
            return false;
        },

        /**
         * Resolve all attributes that are datetimes
         *
         * @returns {*}
         */
        getDatetimeAttributes: function () {
            if (this.hasOwnProperty("datetimeAttributes")) {
                return this.datetimeAttributes;
            }
            var i, l, attribute, attributes = [];
            for (i = 0, l = this.columnAttributes.length; i < l; i++) {
                attribute = this.columnAttributes[i];
                if (this.is_datetime(attribute)) {
                    attributes.push(attribute);
                }
            }
            this.datetimeAttributes = attributes;
            return attributes;
        },

        /**
         * Overwriten parse to support datetime strings
         * @param response
         * @param options
         * @returns attributes
         */
        parse: function (response, options) {
            var attributes = Backbone.Model.prototype.parse.call(this, response, options);

            var i, l, attribute;
            for (i = 0, l = this.getDatetimeAttributes().length; i < l; i++) {
                attribute = this.datetimeAttributes[i];
                attributes[attribute] = new Date(attributes[attribute])
            }
            return attributes;
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
        },

        /**
         * If the model provides a __str__ attribute
         * this will be used to displays in like backbone.forms
         */
        toString: function () {
            var rtn = this.get('__str__');
            if (rtn) {
                return rtn;
            }
            return "[object Tornado.Model at " + this.url() + "]";
        }


    });

    Tornado.Collection = Backbone.Collection.extend({

        // Objects on page
        page: 0,
        page_length: null,
        num_results: null,

        /**
         * Is this Collection fully loaded?
         */
        hasMore: function () {
            return this.num_results < this.models.length;
        },

        /**
         * Multiple call of fetch will increase in page count
         */
        fetch: function (options) {
            var collection = this;

            options = options ? _.clone(options) : {};
            options.data = options.data ? options.data : {};
            if (this.page_length) {
                options.data["results_per_page"] = this.page_length;
            }
            options.data["page"] = options.reset || !collection.page ? undefined : collection.page + 1;

            this.trigger("tb.load", "fetch");

            return Backbone.Collection.prototype.fetch.call(collection, options);
        },

        // parse data from server
        // This is specific overwritten to work with flask-restless / tornado-restless
        parse: function (data) {
            var objects = data.objects || data;

            this.num_results = data.num_results || data.length;
            this.page = data.page || 1;
            this.total_pages = data.total_pages || 0;
            if (this.num_results < this.models.length + objects.length) {
                this.trigger("tb.pagination", "load");
            } else {
                this.trigger("tb.pagination", "complete");
            }

            this.trigger("tb.load", "complete");

            return objects;
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
         * List of applied filters
         */
        filters: [],

        /**
         * Apply a filter
         *
         * filter: [list|object]: The filter
         * [options]: update: Update an existing filter
         *            nofetch: Do not fetch collection (useful for bulk updating)
         */
        filterBy: function (filter, options) {
            var collection = this;

            if (_.isArray(filter)) {
                if (filter.length > 2) {
                    filter = {'name': filter[0], 'op': filter[1], 'val': filter[2]};
                } else {
                    filter = {'name': filter[0], 'val': filter[2]};
                }
            } else if (_.isString(filter)) {
                filter = {'name': arguments[0], 'op': arguments[1], 'val': arguments[2]};
                options = arguments[3];
            }

            _.defaults(filter, {'op': 'eq'});

            if (options.update) {
                collection.filters = _.reject(collection.filters, function (f) {
                    return f.name == filter['name']
                });
            }
            collection.filters.push(filter);
            if (!options.nofetch) {
                collection.fetch({reset: true});
            }
        },

        /**
         * Remove a filter
         *
         * filter: [list|object|string]: The filter
         * [options]: nofetch: Do not fetch collection (useful for bulk updating)
         */
        removeFilter: function (filter, options) {
            var collection = this;

            if (_.isString(filter)) {
                collection.filters = _.reject(collection.filters, function (f) {
                    return f.name == filter
                });
            } else {
                collection.filters = _.reject(collection.filters, function (f) {
                    return f == filter
                });
            }
            if (!options.nofetch) {
                collection.fetch({reset: true});
            }
        },

        /**
         * Augment Fetch with all information
         */
        fetch: function (options) {
            var collection = this;

            options = options ? _.clone(options) : {};
            options.data = options.data ? options.data : {};
            options.data["q"] = JSON.stringify({"filters": collection.filters});

            return Tornado.Collection.prototype.fetch.call(collection, options);
        }

    });

    return Tornado;
}).call(window);
