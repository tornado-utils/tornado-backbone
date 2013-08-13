tornado-backbone
================

Create backbone models from sqlalchemy models.

Backbone allows to represent your data as models in JavaScript.
However you may not want to do your modeling twice in sqlalchemy aswell in backbone.
Tornado-Backbone approaches to generate the JavaScript models from your sqlalchemy orm.

It's main intention is to work with tornado-restless (and is compatible with flask-restless as api backend),
so there are some specific 'hacks' for them.

Development Status
==================

The implementation is currently still a bleeding edge without many documentation,
but I hope to provide a meaningful documentation and release soon.

require
=======

Tornado Backbone uses require.js for his depencies and for loading required models.

The shim we use in production looks like:

    require.config({
        baseUrl: '/static/',
        paths: {
            underscore: "{{ handler.request.method }}://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min",
            backbone: "{{ handler.request.method }}://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min",
            backbone_forms: "{{ handler.request.method }}://cdnjs.cloudflare.com/ajax/libs/backbone-forms/0.12.0/backbone-forms"
        },
        shim: {
            underscore: {
                exports: '_'
            },
            backbone: {
                deps: ["underscore", "jquery"],
                exports: "Backbone"
            },
            backbone_forms: {
                deps: ["backbone"]
            }
        }
    });


backbone-forms
==============

The Tornado.Model exposes all information of the `info` dict as schema attribute in the backbone model.
So for interaction with backbone-forms you can define for example your column like:

    class User(Base):
        email = Column(String, info={'type': 'Text', 'dataType': 'email', 'validators': ['email']})

And then create a form like:

    require('/api/js/user');
    var user = new UserModel();

    var form = new Backbone.Form({
        model: user
    }).render();
    $('body').append(form.el);

Or directly use a bootstrap similiar approach:

    <form data-require="/api/js/user" data-model="UserModel">
      <legend>User Form</legend>

      <!-- Form content will be injecked here, any existing content is preserved and used as template -->
    </form>

All options for Backbone.Form can be passed as data-\* attributes.

Copyright license
=================

tornado-backbone is licensed under the GNU Affero General Public License, for more information see the LICENSE.txt.

Installing
==========

tornado-backbone was developed under python3.3, sqlalchemy0.8 and tornado3.0

It may work with previous python3.X versions and sqlalchemy 2.7 (and maybe even with python2.7) but I did not test it at all.

To install this libary as an egg use:

    python setup.py install


