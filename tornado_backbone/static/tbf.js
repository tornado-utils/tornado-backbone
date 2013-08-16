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
            if (_.isString(this.options.model)) {
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
                selection = $container.data('editors');

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

                var $el, el = field.editor.render().el;
                if ($.webshims) {
                    $el = $container.appendPolyfill(el);
                } else {
                    $el = $container.append(el);
                }
            });

            $container.removeAttr('data-editors');
        });

        //Render standalone fields
        $form.find('[data-fields]').add($form).each(function (i, el) {
            var $container = $(el),
                selection = $container.data('fields');

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

                field.schema = field.schema || {};
                field.schema = _.extend(field.schema, $container.data("schema"));

                var $el, el = field.render().el;
                if ($.webshims) {
                    $el = $container.appendPolyfill(el);
                } else {
                    $el = $container.append(el);
                }

                // Update editor Attrs
                field.schema.editorAttrs = field.schema.editorAttrs || {};
                field.schema.editorAttrs = _.extend(field.schema.editorAttrs, $container.data("editorAttrs"));
                $el.find("[data-editor] input").attr(field.schema.editorAttrs);

            });

            $container.removeAttr('data-fields');
        });

        //Render fieldsets
        $form.find('[data-fieldsets]').add($form).each(function (i, el) {
            var $container = $(el),
                selection = $container.data('fieldsets');

            if (_.isUndefined(selection)) return;

            _.each(self.fieldsets, function (fieldset) {

                var $el, el = fieldset.render().el;
                if ($.webshims) {
                    $el = $container.appendPolyfill(el);
                } else {
                    $el = $container.append(el);
                }

                // Update editor Attrs
                fieldset.schema.editorAttrs = fieldset.schema.editorAttrs || {};
                fieldset.schema.editorAttrs = _.extend(fieldset.schema.editorAttrs, $container.data("editorAttrs"));
                $el.find("[data-editor] input").attr(fieldset.schema.editorAttrs);
            });

            $container.removeAttr('data-fieldsets');
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
    $('[data-model][data-require]').each(function () {
        var $form = $(this);

        require($(this).data('require').split(" "), function () {
            $form.backbone($form.data())
        });
    });
    $('[data-model]:not([data-require])').each(function () {
        var $form = $(this);
        $form.backbone($form.data());
    });

    return Tornado;
}).call(window);
