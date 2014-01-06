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

            // Create Template (@TODO there must be something better than unescaping the escaped < & > tags)
            this.template = _.template(this.$el.html().replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"));
            this.$el.empty();

            // Listen to model events
            this.listenTo(this.collection, 'all', this.handleEvent);

            // And add the css
            this.$el.addClass("tb-collection");

        },

        handleEvent: function (event) {
            var self = this;

            if (event == "tb.load") {
                this.$el.attr("data-tb-load", arguments[1]);
            }

            if ((event == "hide" || event == "show") && arguments[1]) {
                var model = arguments[1];
                var $el = self.$el.find("> [name='" + model.id + "']");
                $el[event]();
            }

            if (event == "reset") {
                this.$el.empty();
                this.render({reset: true});
                this.$el.trigger('tb.reset', [this.collection]);
            }
        },

        render: function (options) {
            var $el = this.$el,
                self = this,
                collection = this.collection;

            options = _.extend(this.options, options || {});

            if (collection.length > 0 || options.reset) {
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

        renderElements: function (options) {
            var self = this,
                collection = this.collection;

            collection.each(function (model) {
                var $el = self.$el.find("> [name='" + model.id + "']");
                if ($el.length == 0) {
                    $el = $("<div></div>");
                    $el.attr("name", model.id);
                    self.$el.append($el);
                }
                $el.html(self.template(model.attributes));
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
                page: collection.page || 1,
                page_length: collection.page_length,
                total_pages: collection.total_pages || 0
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

            if (info.page >= info.total_pages) {
                $footer.find(".btn-fast-forward").addClass("disabled");
                $footer.find(".btn-step-forward").addClass("disabled");
            } else if (info.page > info.total_pages) {
                $footer.find(".btn-fast-forward").addClass("disabled");
            }
        }

    }, {
        /* STATICS */

        footerTemplate: _.template('\
            <footer class="pagination">\
              <a class="btn btn-page btn-fast-backward"><i class="glyphicon glyphicon-fast-backward"></i></a>\
              <a class="btn btn-page btn-step-backward"><i class="glyphicon glyphicon-step-backward"></i></a>\
              <% if (page > 1) { %><a class="btn btn-page btn-page-number">1</a><% } %>\
              <% if (page >= 6) { %><span class="btn btn-page btn-page-ellipses">...</span><% } %>\
              <% if (page == 5) { %><a class="btn btn-page btn-page-number">2</a><% } %>\
              <% if (page > 3) { %><a class="btn btn-page btn-page-number"><%= (page-2) %></a><% } %>\
              <% if (page > 2) { %><a class="btn btn-page btn-page-number"><%= (page-1) %></a><% } %>\
              <a class="btn btn-page btn-page-number btn-page-active"><%= page %></a>\
              <% if (page < total_pages-1) { %><a class="btn btn-page btn-page-number"><%= (page+1) %></a><% } %>\
              <% if (page < total_pages-2) { %><a class="btn btn-page btn-page-number"><%= (page+2) %></a><% } %>\
              <% if (page == total_pages-3) { %><a class="btn btn-page btn-page-number"><%= (total_pages-1) %></a><% } %>\
              <% if (page <= total_pages-4) { %><span class="btn btn-page btn-page-ellipses">...</span><% } %>\
              <% if (page < total_pages) { %><a class="btn btn-page btn-page-number"><%= (total_pages) %></a><% } %>\
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
        var args = Array.prototype.slice.call(arguments, 1);

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
                data[option].apply(data, args);
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
