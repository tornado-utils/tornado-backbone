#!/usr/bin/python
# -*- encoding: utf-8 -*-
"""

"""
import hashlib
from sqlalchemy import Integer, Numeric
from tornado.escape import json_decode
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
        self.hash.update(self.api_url)
        self.hash.update(self.own_url)
        self.hash.update(pepper)

    def compute_etag(self):
        """
            Blueprints are pretty static, so they are aggresivly cached using etag

            :return:
        """
        return self.hash

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
        mwargs = {'urlRoot': self.api_url + "/" + self.model.__collectionname__}

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

        # Foreign Keys
        cwargs['foreignAttributes'] = []
        cwargs['foreignCollections'] = {}
        cwargs['foreignRequirements'] = set()
        for key, column in self.model.foreign_keys.items():
            if len(column.foreign_keys) > 1:
                raise Exception("Can't handle multiple foreign key columns")
            cwargs['foreignCollections'][key] = list(column.foreign_keys)[0].column.table.__collectionname__
            cwargs['foreignAttributes'].append(key)
            cwargs['foreignRequirements'].add(self.own_url + "/" + cwargs['foreignCollections'][key])

        # Columns
        for column in self.model.columns:
            mwargs.setdefault("columnAttributes", []).append(column.key)
            if column.default:
                mwargs.setdefault("defaults", {})[column.key] = column.default
            if isinstance(column.type, Integer):
                mwargs.setdefault("integerAttributes", []).append(column.key)
            if isinstance(column.type, Numeric):
                mwargs.setdefault("numericAttributes", []).append(column.key)
            if 'readonly' in column.info and column.info['readonly']:
                mwargs.setdefault("readonlyAttributes", []).append(column.key)

        # Relations
        for relation in self.model.relations:
            mwargs.setdefault("relationAttributes", []).append(relation.key)

        self.set_header("Content-Type", "application/javascript; charset=UTF-8")
        self.write('var %s = Tornado.Model.extend(%s);' % (cwargs["model"], json_decode(mwargs)))
        self.write('var %sCollection = Tornado.Collection.extend(%s);' % (cwargs["name"], json_decode(cwargs)))
        self.write('%s = new %sCollection;' % (self.table_name, cwargs["name"]))






