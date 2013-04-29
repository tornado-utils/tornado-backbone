#!/usr/bin/python
# -*- encoding: utf-8 -*-
"""

"""
from tornado.web import Application, URLSpec

from .handler.BaseHandler import BaseHandler

__author__ = 'Martin Martimeo <martin@martimeo.de>'
__date__ = '26.04.13 - 22:25'


class ApiManager(object):
    def __init__(self,
                 application: Application):
        """

        :param application: is the tornado.web.Application object
        """
        self.application = application

    def create_api_blueprint(self,
                             model,
                             url_prefix='/api/js',
                             collection_name=None,
                             handler_class: BaseHandler=BaseHandler) -> URLSpec:
        """


        :param model:
        :param url_prefix:
        :param collection_name:
        :param handler_class: The Handler Class that will be registered, for customisation extend BaseHandler
        :return: tornado route
        :raise: IllegalArgumentError
        """
        table_name = collection_name if collection_name is not None else model.__tablename__

        kwargs = {'model': model}

        blueprint = URLSpec("%s/%s" % (url_prefix, table_name), handler_class, kwargs, table_name)
        return blueprint

    def create_api(self,
                   model,
                   virtualhost=r".*$", *args, **kwargs):
        """
        Creates and registers a route for the model

        The positional and keyword arguments are passed directly to the create_api_blueprint method

        :param model:
        :param virtualhost: bindhost for binding, .*$ in default
        """
        blueprint = self.create_api_blueprint(model, *args, **kwargs)

        for vhost, handlers in self.application.handlers:
            if vhost == virtualhost:
                handlers.append(blueprint)
                break
        else:
            self.application.add_handlers(virtualhost, [blueprint])

        self.application.named_handlers[blueprint.name] = blueprint