/**
 * User: Martin Martimeo
 * Date: 13.08.13
 * Time: 18:30
 *
 * Extension to backbone_forms
 */

require(["jquery", "underscore", "backbone", "backbone_forms"],function ($, _, Backbone, BackboneForm) {
    var self = this.Tornado || {};
    var Tornado = this.Tornado = self;

    Tornado.BackboneForm = function (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, Tornado.BackboneForm.DEFAULTS, options);

        if (this.options.model) {
            if (typeof this.options.model == "string") {
                this.model = this.options.model = new window[this.options.model]();
            } else {
                this.model = this.options.model;
            }
        }

        this.form = new Backbone.Form(this.options);
    };
    Tornado.BackboneForm.DEFAULTS = {};

    /**
     * (re)render the form
     *
     * Based on backbone-forms.js/render by Charles Davison
     */
    Tornado.BackboneForm.prototype.render = function () {
        var self = this.form,
            $form = this.$element,
            fields = this.form.fields;

        //Render standalone editors
        $form.find('[data-editors]').add($form).each(function (i, el) {
            var $container = $(el),
                selection = $container.attr('data-editors');

            if (_.isUndefined(selection)) {
                return;
            }

            //Work out which fields to include
            var keys = (selection == '*')
                ? self.selectedFields || _.keys(fields)
                : selection.split(',');

            //Add them
            _.each(keys, function (key) {
                var field = fields[key];

                $container.append(field.editor.render().el);
            });
        });

        //Render standalone fields
        $form.find('[data-fields]').add($form).each(function (i, el) {
            var $container = $(el),
                selection = $container.attr('data-fields');

            if (_.isUndefined(selection)) {
                return;
            }

            //Work out which fields to include
            var keys = (selection == '*')
                ? self.selectedFields || _.keys(fields)
                : selection.split(',');

            //Add them
            _.each(keys, function (key) {
                var field = fields[key];

                $container.append(field.render().el);
            });
        });

        //Render fieldsets
        $form.find('[data-fieldsets]').add($form).each(function (i, el) {
            var $container = $(el),
                selection = $container.attr('data-fieldsets');

            if (_.isUndefined(selection)) return;

            _.each(self.fieldsets, function (fieldset) {
                $container.append(fieldset.render().el);
            });
        });

        //Set the main element
        self.setElement($form);

        //Set class
        $form.addClass(self.className);

        return self;
    };

    /**
     * Allows to facility html elements with backbone-forms or model functionality
     *
     * @param option
     */
    $.fn.backbone = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('tb.backbone');

            var options = typeof option == 'object' && option;

            if (!data) {
                $this.data('tb.backbone', (data = new Tornado.BackboneForm(this, options)));
                $this.data('tb.backbone').render();
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };
    $.fn.backbone.Constructor = Tornado.BackboneForm;

    // Facile elements with backbone-forms
    $(window).on('load', function () {
        $('[data-model][data-require]').each(function () {
            var $form = $(this);

            require([$(this).data('require')], function () {
                $form.backbone($form.data())
            });
        });
        $('[data-model]:not([data-require])').each(function () {
            var $form = $(this);
            $form.backbone($form.data());
        });
    });

    return Tornado;
}).call(window);
