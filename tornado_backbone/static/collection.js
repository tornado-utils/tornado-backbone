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
            } else {
                collection.fetch({
                    success: function () {
                        self.renderElements(options);
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
                var $el = self.$el.find("> [name=" + model.cid + "]");
                if ($el.length == 0) {
                    $el = self.$el.append(self.template(model.attributes));
                } else {
                    $el = $el.replaceWith(self.template(model.attributes));
                }
                $el.attr("name", model.cid);
            });
        }

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
