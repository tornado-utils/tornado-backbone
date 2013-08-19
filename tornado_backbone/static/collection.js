/**
 * User: Martin Martimeo
 * Date: 18.08.13
 * Time: 14:58
 *
 * Add filtered collection in html
 */

require(["jquery", "underscore", "backbone"],function ($, _, Backbone) {
    var self = this.Tornado || {};
    var Tornado = this.Tornado = self;

    Tornado.BackboneCollection = Backbone.View.extend({

        initialize: function () {

            // Set collection
            if (this.options.collection) {
                if (_.isString(this.options.collection)) {
                    this.collection = this.options.collection = new window[this.options.collection]();
                } else {
                    this.collection = this.options.collection;
                }
            }

            // Create Template (@TODO there must be something better than backplacing the escaped <%= %> tags)
            this.template = _.template(this.$el.html().replace(/&lt;%/g, "<%").replace(/%&gt;/g, "%>"));
            this.$el.empty();

        },

        render: function () {
            var $el = this.$el,
                options = this.options,
                self = this,
                collection = this.collection;

            if (collection.length > 0) {
                self.renderElements(options);
                self.renderFooter(options);
            } else {
                collection.fetch({
                    success: function () {
                        self.renderElements(options);
                        self.renderFooter(options);
                    }
                });
            }

            //Set the main element
            self.setElement($el);

            //Set class
            $el.addClass(self.className);

            return self;
        },

        filter: function (key, value, operator) {
            var self = this,
                collection = this.collection;

            this.collection.filterBy(key, value, operator);

            return self;
        },

        renderElements: function (options) {
            var self = this,
                collection = this.collection;

            collection.each(function (model) {
                var $el = self.$el.find("> [name=" + model.cid + "]");
                if ($el.length == 0) {
                    $el = self.$el.prepend(self.template(model.attributes));
                } else {
                    $el = $el.replaceWith(self.template(model.attributes));
                }
                $el.attr("name", model.cid);
            });
        },

        /**
         * Renders the pagination layer
         *
         * Inspired by https://gist.github.com/io41/838460
         * @param options
         */
        renderFooter: function (options) {
            var self = this,
                collection = this.collection;

            var info = {
                page: this.collection.page || 1,
                page_length: this.collection.page_length,
                pages: Math.ceil(this.collection.num_results / this.collection.page_length)
            };

            var $footer = self.$el.find("footer");
            if ($footer.length) {
                $footer.replaceWith(self.constructor.footerTemplate(info));
            } else {
                $footer = self.$el.append(self.constructor.footerTemplate(info));
            }

            if (info.page < 2) {
                $footer.find(".btn-fast-backward").addClass("disabled");
                $footer.find(".btn-step-backward").addClass("disabled");
            } else if (info.page < 3) {
                $footer.find(".btn-fast-backward").addClass("disabled");
            }

            if (info.page > info.total - 2) {
                $footer.find(".btn-fast-forward").addClass("disabled");
                $footer.find(".btn-step-forward").addClass("disabled");
            } else if (info.page > info.total - 3) {
                $footer.find(".btn-fast-forward").addClass("disabled");
            }
        }

    }, {
        /* STATICS */

        footerTemplate: _.template('\
            <footer>\
              <a class="btn btn-page btn-fast-backward"><i class="glyphicon glyphicon-fast-backward"></i></a>\
              <a class="btn btn-page btn-step-backward"><i class="glyphicon glyphicon-step-backward"></i></a>\
              <% if (page > 1) { %><a class="btn btn-page btn-page-number">1</a><% } %>\
              <% if (page >= 6) { %><span class="btn btn-page btn-page-ellipses">...</span><% } %>\
              <% if (page == 5) { %><a class="btn btn-page btn-page-number">2</a><% } %>\
              <% if (page > 3) { %><a class="btn btn-page btn-page-number"><%= (page-2) %></a><% } %>\
              <% if (page > 2) { %><a class="btn btn-page btn-page-number"><%= (page-1) %></a><% } %>\
              <a class="btn btn-page btn-page-number btn-page-active"><%= page %></a>\
              <% if (page < pages-1) { %><a class="btn btn-page btn-page-number"><%= (page+1) %></a><% } %>\
              <% if (page < pages-2) { %><a class="btn btn-page btn-page-number"><%= (page+2) %></a><% } %>\
              <% if (page == pages-3) { %><a class="btn btn-page btn-page-number"><%= (pages-1) %></a><% } %>\
              <% if (page <= pages-4) { %><span class="btn btn-page btn-page-ellipses">...</span><% } %>\
              <% if (page < pages) { %><a class="btn btn-page btn-page-number"><%= (pages) %></a><% } %>\
              <a class="btn btn-page btn-step-forward"><i class="glyphicon glyphicon-step-forward"></i></a>\
              <a class="btn btn-page btn-fast-forward"><i class="glyphicon glyphicon-fast-forward"></i></a>\
            </footer>\
        ')
    });

    /**
     * Allows to facility html elements with backbone-forms or model functionality
     *
     * @param option
     */
    $.fn.tbcollection = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('tb.collection');

            var options = typeof option == 'object' && option;

            if (!data) {
                options["el"] = $this;
                $this.data('tb.collection', (data = new Tornado.BackboneCollection(options)));
                $this.data('tb.collection').render();
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };
    $.fn.tbcollection.Constructor = Tornado.BackboneCollection;

    // Facile elements with backbone-forms
    $('[data-collection][data-require]').each(function () {
        var $view = $(this);

        require($(this).data('require').split(" "), function () {
            $view.tbcollection($view.data())
        });
    });
    $('[data-collection]:not([data-require])').each(function () {
        var $view = $(this);
        $view.tbcollection($view.data());
    });

    return Tornado;
}).call(window);
