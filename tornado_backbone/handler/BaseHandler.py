#!/usr/bin/python
# -*- encoding: utf-8 -*-
"""

"""
import hashlib
from sqlalchemy import Integer, Numeric
from tornado.escape import json_encode
from tornado.web import RequestHandler

from ..helper.ModelWrapper import ModelWrapper
from . import _pepper as pepper

__author__ = 'Martin Martimeo <martin@martimeo.de>'
__date__ = '26.04.13 - 22:09'


class BaseHandler(RequestHandler):
    """
        Basic Blueprint for a sqlalchemy model
    """

    # noinspection PyMethodOverriding
    def initialize(self,
                   model,
                   api_url: str,
                   own_url: str,
                   table_name: str):
        """

        :param model: The Model for which this handler has been created
        :param api_url: Location of the restless Api
        :param own_url: Location of ourself
        :param table_name: How we named the collection
        """
        super().initialize()

        self.model = ModelWrapper(model)
        self.table_name = table_name

        self.api_url = api_url
        self.own_url = own_url

        self.hash = hashlib.md5()
        self.hash.update(self.api_url.encode("utf-8"))
        self.hash.update(self.own_url.encode("utf-8"))
        self.hash.update(("%u" % pepper).encode("utf-8"))

    def compute_etag(self):
        """
            Blueprints are pretty static, so they are aggresivly cached using etag

            :return:
        """
        return self.hash.hexdigest()

    def get(self):
        """
            GET request
        """

        # Code from us is pretty static
        self.set_etag_header()
        if self.check_etag_header():
            self.set_status(304)
            return

        # Args to build model
        mwargs = {'urlRoot': self.api_url + "/" + self.model.__collectionname__,
                  'schema': {}}

        # Args to build collection
        cwargs = {'url': self.api_url + "/" + self.model.__collectionname__,
                  'model': "%sModel" % self.model.__collectionname__,
                  'name': self.model.__collectionname__}

        # Primary Keys
        l_primary_keys = list(self.model.primary_keys)
        if l_primary_keys == 1:
            mwargs["idAttribute"] = l_primary_keys[0]
        else:
            mwargs["idAttributes"] = l_primary_keys

        # Columns
        for key, field in self.model.attributes.items():
            mwargs.setdefault("columnAttributes", []).append(field.key)
            mwargs['schema'][field.key] = {}
            mwargs['schema'][field.key].update(field.property.info)
            mwargs['schema'][field.key].update(field.info)
            if hasattr(field, "default") and field.default:
                mwargs.setdefault("defaults", {})[field.key] = "%s" % field.default.arg
            if hasattr(field, "type") and isinstance(field.type, Integer):
                mwargs.setdefault("integerAttributes", []).append(field.key)
            if hasattr(field, "type") and isinstance(field.type, Numeric):
                mwargs.setdefault("numericAttributes", []).append(field.key)
            if 'readonly' in field.info and field.info['readonly']:
                mwargs.setdefault("readonlyAttributes", []).append(field.key)

        # Foreign Keys
        cwargs['foreignAttributes'] = []
        cwargs['foreignCollections'] = {}
        cwargs['foreignRequirements'] = []
        for key, column in self.model.foreign_keys.items():
            mwargs['schema'][column.key].update({'type': 'NestedModel', 'model': '%sModel' % list(column.foreign_keys)[
                0].column.table.__collectionname__})
            if len(column.foreign_keys) > 1:
                raise Exception("Can't handle multiple foreign key columns")
            cwargs['foreignCollections'][key] = list(column.foreign_keys)[0].column.table.__collectionname__
            cwargs['foreignAttributes'].append(key)
            cwargs['foreignRequirements'].append(self.own_url + "/" + cwargs['foreignCollections'][key])

        # Relations
        for relation in self.model.relations:
            mwargs.setdefault("relationAttributes", []).append(relation.key)

        self.set_header("Content-Type", "application/javascript; charset=UTF-8")
        self.write('var %s = Tornado.Model.extend(%s);' % (cwargs["model"], json_encode(mwargs)))
        self.write('var %sCollection = Tornado.Collection.extend(%s);' % (cwargs["name"], json_encode(cwargs)))
        self.write('%s = new %sCollection;' % (self.table_name, cwargs["name"]))






