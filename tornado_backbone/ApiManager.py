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
                             url_prefix: str='/api/js',
                             api_url: str='/api',
                             collection_name: str=None,
                             blueprint_prefix: str='js/',
                             handler_class: BaseHandler=BaseHandler) -> URLSpec:
        """
        Register the model under collection_name or __tablename__

        Make sure to register all relationships of this model aswell if you want to access them in your backbone

        :param model:
        :param url_prefix:
        :param api_url: Url of the Restless Api
        :param collection_name:
        :param blueprint_prefix: The Prefix that will be used to unique collection_name for named_handlers
        :param handler_class: The Handler Class that will be registered, for customisation extend BaseHandler
        :return: tornado route
        :raise: IllegalArgumentError
        """
        model.__collectionname__ = collection_name if collection_name is not None else model.__tablename__
        model.__table__.__collectionname__ = model.__collectionname__

        kwargs = {'model': model,
                  'api_url': api_url,
                  'own_url': url_prefix,
                  'table_name': model.__collectionname__}

        blueprint = URLSpec(
            "%s/%s" % (url_prefix, model.__collectionname__),
            handler_class,
            kwargs,
            '%s%s' % (blueprint_prefix, model.__collectionname__))
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