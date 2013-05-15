#!/usr/bin/python
# -*- encoding: utf-8 -*-
"""

"""
from collections import namedtuple
import inspect
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

    def primary_key_names(self):
        """
            Returns the names of all primary keys

            Inspired by flask-restless.helpers.primary_key_names
        """
        return [key for key, field in inspect.getmembers(self.model)
                if isinstance(field, QueryableAttribute)
                   and isinstance(field.property, ColumnProperty)
            and field.property.columns[0].primary_key]

    @staticmethod
    def get_primary_keys(instance):
        """
            Returns the primary keys

            Inspired by flask-restless.helpers.primary_key_names

            :param instance: Model ORM Instance
        """
        return [field for key, field in inspect.getmembers(instance)
                if isinstance(field, QueryableAttribute)
                   and isinstance(field.property, ColumnProperty)
            and field.property.columns[0].primary_key]

    @property
    def primary_keys(self):
        return self.get_primary_keys(self.model)

    @staticmethod
    def get_columns(instance):
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
        return self.get_columns(self.model)

    @staticmethod
    def get_relations(instance):
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
        return self.get_relations(self.model)

    @staticmethod
    def get_hybrids(instance):
        """
            Returns the relations objects of the model

            :param instance: Model ORM Instance
        """
        if hasattr(instance, 'iterate_properties'):
            Proxy = namedtuple('Proxy', ['key', 'field'])
            return [Proxy(key, field) for key, field in sqinspect(instance).all_orm_descriptors.items()
                    if isinstance(field, hybrid_property)]
        else:
            return [field for key, field in inspect.getmembers(instance)
                    if isinstance(field, hybrid_property)]

    @property
    def hybrids(self):
        return self.get_hybrids(self.model)

    @staticmethod
    def get_proxies(instance):
        """
            Returns the proxies objects of the model

            Inspired by https://groups.google.com/forum/?fromgroups=#!topic/sqlalchemy/aDi_M4iH7d0

            :param instance: Model ORM Instance
        """
        if hasattr(instance, 'iterate_properties'):
            Proxy = namedtuple('Proxy', ['key', 'field'])
            return [Proxy(key, field) for key, field in sqinspect(instance).all_orm_descriptors.items()
                    if isinstance(field, AssociationProxy)]
        else:
            return [field for key, field in inspect.getmembers(instance)
                    if isinstance(field, AssociationProxy)]

    @property
    def proxies(self):
        return self.get_proxies(self.model)

