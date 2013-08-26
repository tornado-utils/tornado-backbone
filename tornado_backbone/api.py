#!/usr/bin/python
# -*- encoding: utf-8 -*-
"""

"""
from tornado.web import Application, URLSpec

from .handler import BaseHandler

__author__ = 'Martin Martimeo <martin@martimeo.de>'
__date__ = '26.04.13 - 22:25'


class ApiManager(object):
    """
        Main Entry Point for creating routes to handle models

        create_api_blueprint creates a tornado.URLSpec for handling a model,
        that can then be added to a list of routes your application handles.

        create_api creates a URLSpec and directly adds it to the application.
    """

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
                             enforce_jssuffix: bool=None,
                             enforce_jsonsuffix: bool=None,
                             model_base: str='Tornado.Model',
                             collection_base: str='Tornado.Collection',
                             handler_class: BaseHandler=BaseHandler) -> URLSpec:
        """
        Register the model under collection_name or __tablename__

        Make sure to register all relationships of this model aswell if you want to access them in your backbone

        :param model: SQLALchemy Model
        :param url_prefix: Url prefix of this Api
        :param api_url: Url of the Restless Api
        :param collection_name: Name for this model to be registered and referenced, defaults to __tablename__
        :param blueprint_prefix: The Prefix that will be used to unique collection_name for named_handlers
        :param model_base: The javascript prototype to extend models from (for example Backbone.Model or Tornado.Model)
        :param collection_base: The javascript prototype to extend collections from (for example Backbone.Collection or Tornado.Collection)
                                If you want to use collection.js this should be Tornado.FilteredCollection
        :param enforce_jssuffix:    * True: the url is suffixed with .js
                                    * None: the url can be suffiexed with .js
                                    * False: the url may not be suffiexed with .js
        :param enforce_jsonsuffix:  * True: the url is suffixed with .json
                                    * None: the url can be suffiexed with .json
                                    * False: the url may not be suffiexed with .json
        :param handler_class: The Handler Class that will be registered
        :type handler_class: :class:`handler.handler`
        :return: :class:`tornado.web.URLSpec`
        :raise: IllegalArgumentError
        """
        model.__collectionname__ = collection_name if collection_name is not None else model.__tablename__
        model.__table__.__collectionname__ = model.__collectionname__

        kwargs = {'model': model,
                  'api_url': api_url,
                  'own_url': url_prefix,
                  'model_base': model_base,
                  'collection_base': collection_base,
                  'table_name': model.__collectionname__}

        if enforce_jssuffix is True:
            urlsuffix = r"(?P<ftype>\.js){1}"
        elif enforce_jsonsuffix is True:
            urlsuffix = r"(?P<ftype>\.json){1}"
        elif enforce_jssuffix is False or enforce_jssuffix is False:
            urlsuffix = r"$"
        else:
            urlsuffix = r"(?P<ftype>\.js|\.json)?"

        blueprint = URLSpec(
            r"%s/%s%s" % (url_prefix, model.__collectionname__, urlsuffix),
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