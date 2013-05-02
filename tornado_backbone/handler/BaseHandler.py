#!/usr/bin/python
# -*- encoding: utf-8 -*-
"""

"""
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
                   api_url,
                   table_name):
        """

        :param model: The Model for which this handler has been created
        :param api_url: Location of the restless Api
        :param table_name: How we named the collection
        """
        super().initialize()

        self.model = ModelWrapper(model)
        self.table_name = table_name

        self.api_url = api_url

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

        # Model
        kwargs['model'] = self.model

        # Name of the Collection
        kwargs['model_name'] = self.table_name.capitalize()
        kwargs['collection_name'] = self.table_name

        # Primary Key Name
        kwargs['primary_key_names'] = [p.key for p in self.model.primary_keys]

        # Columns
        kwargs['relations'] = self.model.relations

        # Columns
        kwargs['columns'] = self.model.columns

        self.set_header("Content-Type", "application/javascript; charset=UTF-8")
        self.render('collection.tpl.js', **kwargs)






