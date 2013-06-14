#!/usr/bin/python
# -*- encoding: utf-8 -*-
"""

"""
from sqlalchemy import Integer, Numeric
from tornado.web import RequestHandler, os

from ..helper.ModelWrapper import ModelWrapper

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

        # Template Path
        self.template_path = os.path.join(os.path.dirname(__file__), "..", "templates")

    def get_template_path(self):
        """
            Overwritten template path for not using the application setting
        """
        return self.template_path

    def get(self):
        """
            GET request
        """

        kwargs = {}

        # Settings
        kwargs['api_url'] = self.api_url
        kwargs['own_url'] = self.own_url

        # Model
        kwargs['model'] = self.model

        # Name of the Collection
        kwargs['model_name'] = self.model.__name__
        kwargs['table_name'] = self.model.__tablename__
        kwargs['collection_name'] = self.model.__collectionname__

        # Primary Key Names
        kwargs['primary_keys'] = self.model.primary_keys

        # Foreign Key Names
        kwargs['foreign_keys'] = self.model.foreign_keys
        kwargs['foreign_collections'] = {}
        for key, column in kwargs['foreign_keys'].items():
            if len(column.foreign_keys) > 1:
                raise Exception("Can't handle multiple foreign key columns")
            foreign_key = list(column.foreign_keys)[0]
            kwargs['foreign_collections'][key] = foreign_key.column.table.__collectionname__

        # Relation Key Names
        kwargs['relation_key_names'] = [p.key for p in self.model.relations]

        # Relations
        kwargs['relations'] = self.model.relations
        kwargs['relation_columns'] = {relation.key: [c.key for c in relation.property.local_columns]
                                      for relation in kwargs['relations']}

        # Columns
        kwargs['columns'] = self.model.columns

        # Readonly Columns
        kwargs['readonly_columns'] = [c for c in kwargs['columns'] if 'readonly' in c.info and c.info['readonly']]

        # Integer Columns
        kwargs['integer_columns'] = [c for c in kwargs['columns'] if isinstance(c.type, Integer)]

        # Numeric Columns
        kwargs['numeric_columns'] = [c for c in kwargs['columns'] if isinstance(c.type, Numeric)]

        self.set_header("Content-Type", "application/javascript; charset=UTF-8")
        self.render('collection.tpl.js', **kwargs)






