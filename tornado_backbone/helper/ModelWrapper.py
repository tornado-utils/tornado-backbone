#!/usr/bin/python
# -*- encoding: utf-8 -*-
"""

"""
from collections import namedtuple
import inspect
import logging
from sqlalchemy import inspect as sqinspect
from sqlalchemy.ext.associationproxy import AssociationProxy
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import ColumnProperty
from sqlalchemy.orm.attributes import QueryableAttribute
from sqlalchemy.orm.properties import RelationProperty

__author__ = 'Martin Martimeo <martin@martimeo.de>'
__date__ = '27.04.13 - 00:14'


class ModelWrapper(object):
    """
        Wrapper around sqlalchemy model for having some easier functions
    """

    def __init__(self, model):
        self.model = model

    @property
    def __name__(self):
        return self.model.__name__

    @property
    def __tablename__(self):
        return self.model.__tablename__

    @property
    def __collectionname__(self):
        try:
            return self.model.__collectionname__
        except AttributeError:
            logging.warning("Missing collection name for %s using tablename" % self.model.__name__)
            return self.model.__tablename__

    @staticmethod
    def get_primary_keys(instance) -> list:
        """
            Returns the primary keys

            Inspired by flask-restless.helpers.primary_key_names

            :param instance: Model ORM Instance
        """
        return {field.key: field for key, field in inspect.getmembers(instance)
                if isinstance(field, QueryableAttribute)
                   and isinstance(field.property, ColumnProperty)
        and field.property.columns[0].primary_key}

    @property
    def primary_keys(self):
        """
        @see get_primary_keys
        """
        return self.get_primary_keys(self.model)

    @staticmethod
    def get_foreign_keys(instance) -> list:
        """
            Returns the foreign keys

            Inspired by flask-restless.helpers.primary_key_names

            :param instance: Model ORM Instance
        """
        return {field.key: field for key, field in inspect.getmembers(instance)
                if isinstance(field, QueryableAttribute)
                   and isinstance(field.property, ColumnProperty)
        and field.foreign_keys}

    @property
    def foreign_keys(self):
        """
        @see get_foreign_keys
        """
        return self.get_foreign_keys(self.model)

    @staticmethod
    def get_columns(instance) -> list:
        """
            Returns the columns objects of the model

            :param instance: Model ORM Instance
        """
        if hasattr(instance, 'iterate_properties'):
            return [field for field in instance.iterate_properties
                    if isinstance(field, ColumnProperty)]
        else:
            return [field for key, field in inspect.getmembers(instance)
                    if isinstance(field, QueryableAttribute)
                and isinstance(field.property, ColumnProperty)]

    @property
    def columns(self):
        """
        @see get_columns
        """
        return self.get_columns(self.model)

    @staticmethod
    def get_relations(instance) -> list:
        """
            Returns the relations objects of the model

            :param instance: Model ORM Instance
        """
        if hasattr(instance, 'iterate_properties'):
            return [field for field in instance.iterate_properties
                    if isinstance(field, RelationProperty)]
        else:
            return [field for key, field in inspect.getmembers(instance)
                    if isinstance(field, QueryableAttribute)
                and isinstance(field.property, RelationProperty)]

    @property
    def relations(self):
        """
        @see get_relations
        """
        return self.get_relations(self.model)

    @staticmethod
    def get_hybrids(instance) -> list:
        """
            Returns the relations objects of the model

            :param instance: Model ORM Instance
        """
        Proxy = namedtuple('Proxy', ['key', 'field'])
        if hasattr(instance, 'iterate_properties'):
            return [Proxy(key, field) for key, field in sqinspect(instance).all_orm_descriptors.items()
                    if isinstance(field, hybrid_property)]
        else:
            return [Proxy(key, field) for key, field in inspect.getmembers(instance)
                    if isinstance(field, hybrid_property)]

    @property
    def hybrids(self):
        """
        @see get_hybrids
        """
        return self.get_hybrids(self.model)

    @staticmethod
    def get_proxies(instance) -> list:
        """
            Returns the proxies objects of the model

            Inspired by https://groups.google.com/forum/?fromgroups=#!topic/sqlalchemy/aDi_M4iH7d0

            :param instance: Model ORM Instance
        """
        Proxy = namedtuple('Proxy', ['key', 'field'])
        if hasattr(instance, 'iterate_properties'):
            return [Proxy(key, field) for key, field in sqinspect(instance).all_orm_descriptors.items()
                    if isinstance(field, AssociationProxy)]
        else:
            return [Proxy(key, field) for key, field in inspect.getmembers(instance)
                    if isinstance(field, AssociationProxy)]

    @property
    def proxies(self):
        """
        @see get_proxies
        """
        return self.get_proxies(self.model)

