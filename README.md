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
but I hope to provide a meaningful documentation soon.

require
=======

Tornado Backbone uses require.js for his depencies and for loading required models.

The shim we use in production looks like:

    require.config({
        baseUrl: '/static/',
        paths: {
            underscore: "{{ handler.request.protocol }}://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min",
            backbone: "{{ handler.request.protocol }}://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min",
            "backbone-forms": "{{ handler.request.protocol }}://cdnjs.cloudflare.com/ajax/libs/backbone-forms/0.12.0/backbone-forms",
            "backbone-relational": "{{ handler.request.protocol }}://cdnjs.cloudflare.com/ajax/libs/backbone-relational/0.8.5/backbone-relational"
        },
        shim: {
            underscore: {
                exports: '_'
            },
            backbone: {
                deps: ["underscore", "jquery"],
                exports: "Backbone"
            },
            "backbone-forms": {
                deps: ["backbone"]
            },
            "backbone-relational": {
                deps: ["backbone"]
            }
        }
    });


backbone-forms
==============

If you want to have support for backbone-forms include the `form.js`.
Tornado Backbone exposes all information of the `info` dict as schema attribute in the backbone model
 and falls back on some defaults if there is no information (like for integer).
For interaction with backbone-forms you can define for example your column like:

    class User(Base):
        email = Column(String, info={'type': 'Text', 'dataType': 'email', 'validators': ['email']})

And then create a form like:

    require(['/api/js/user'], function () {
        var user = new UserModel();

        var form = new Backbone.Form({
            model: user
        }).render();
        $('body').append(form.el);
    }

Or directly use a bootstrap similiar approach:

    <form data-require="/api/js/user" data-model="UserModel">
      <legend>User Form</legend>

      <!-- Form content will be injecked here, any existing content is preserved -->
      <div data-fields="email"></div>
    </form>

All options for Backbone.Form can be passed as data-\* attributes.
If you have relations in your model that you want to use, it may require to load the depencies:

    class UserTitle(Base):
        id: Column(Integer)
        title: Column(String)

    class User(Base):
        title_id = Column(ForeignId(UserTitle.id))
        title = relationship(UserTitle)
        email = Column(String, info={'type': 'Text', 'dataType': 'email', 'validators': ['email']})

Leads to displaying a form with email and title:

    <form data-require="/api/js/user_title /api/js/user" data-model="UserModel">
      <legend>User Form</legend>

      <div data-fields="title"></div> <!-- Select Box with Title -->
      <div data-fields="email"></div> <!-- Text Box with Validator for email -->
    </form>

backbone-relations
==================

Tornado Backbone exposes relations in a backbone-relations compatible way.
If you include `relations.js` in your project all models will be based on Backbone.RelationalModel

Copyright license
=================

tornado-backbone is licensed under the GNU Affero General Public License, for more information see the LICENSE.txt.

Installing
==========

tornado-backbone was developed under python3.3, sqlalchemy0.9 and tornado3.1

It may work with sqlalchemy 0.8 and older tornado releases but I did not test it at all.

To install this libary as an egg use:

    python setup.py install


