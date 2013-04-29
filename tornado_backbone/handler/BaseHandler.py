#!/usr/bin/python
# -*- encoding: utf-8 -*-
"""

"""
from tornado.web import RequestHandler

__author__ = 'Martin Martimeo <martin@martimeo.de>'
__date__ = '26.04.13 - 22:09'


class BaseHandler(RequestHandler):
    """
        Basic Blueprint for a sqlalchemy model
    """

    # noinspection PyMethodOverriding
    def initialize(self,
                   model):
        """

        :param model: The Model for which this handler has been created
        """
        super().initialize()

        self.model = model

    def get(self):
        """
            GET request
        """
        pass






