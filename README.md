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

The implementation is currently still a bleeding edge without a documentation,
but I hope to provide a meaningful documentation and release soon.

Copyright license
=================

tornado-backbone is licensed under the GNU Affero General Public License, for more information see the LICENSE.txt.

Installing
==========

tornado-backbone was developed under python3.3, sqlalchemy0.8 and tornado3.0

It may work with previous python3.X versions and sqlalchemy 2.7 (and maybe even with python2.7) but I did not test it at all.

To install this libary as an egg use:

    python setup.py install


