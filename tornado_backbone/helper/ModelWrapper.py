#!/usr/bin/python
# -*- encoding: utf-8 -*-
"""

"""
from collections import namedtuple
import inspect
import logging
from sqlalchemy import inspect as sqinspect
from sqlalchemy.exc import NoInspectionAvailable
from sqlalchemy.ext.associationproxy import AssociationProxy
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import ColumnProperty
from sqlalchemy.orm.attributes import QueryableAttribute
from sqlalchemy.orm.interfaces import MapperProperty
from sqlalchemy.orm.properties import RelationshipProperty
from sqlalchemy.util import memoized_property

__author__ = 'Martin Martimeo <martin@martimeo.de>'
__date__ = '27.04.13 - 00:14'


def _filter(instance, condition):
    """
        Filter properties of instace based on condition

        :param instance:
        :param condition:
        :rtype: dict
    """

    # Use iterate_properties when available
    if hasattr(instance, 'iterate_properties'):
        return {field.key: field for field in instance.iterate_properties
                if condition(field)}

    # Try sqlalchemy inspection
    try:
        return {field.key: field for key, field in sqinspect(instance).all_orm_descriptors.items()
                if condition(field)}

    # Use Inspect
    except NoInspectionAvailable:
        return {field.key: field for key, field in inspect.getmembers(instance)
                if condition(field)}


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
        return _filter(instance, lambda field: isinstance(field, ColumnProperty) and field.primary_key or (
            isinstance(field, QueryableAttribute) and isinstance(field.property, ColumnProperty) and field.property.columns[0].primary_key))

    @memoized_property
    def primary_keys(self):
        """
        @see get_primary_keys
        """
        return self.get_primary_keys(self.model)

    @staticmethod
    def get_unique_keys(instance) -> list:
        """
            Returns the primary keys

            Inspired by flask-restless.helpers.primary_key_names

            :param instance: Model ORM Instance
        """
        return _filter(instance, lambda field: isinstance(field, ColumnProperty) and field.unique or (
            isinstance(field, QueryableAttribute) and isinstance(field.property, ColumnProperty) and field.property.columns[0].unique))

    @memoized_property
    def unique_keys(self):
        """
        @see get_primary_keys
        """
        return self.get_unique_keys(self.model)

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

    @memoized_property
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
        return _filter(instance, lambda field: isinstance(field, ColumnProperty) or (
            isinstance(field, QueryableAttribute) and isinstance(field.property, ColumnProperty)))

    @memoized_property
    def columns(self):
        """
        @see get_columns
        """
        return self.get_columns(self.model)

    @staticmethod
    def get_attributes(instance) -> list:
        """
            Returns the attributes of the model

            :param instance: Model ORM Instance
        """
        return _filter(instance,
                       lambda field: isinstance(field, MapperProperty) or isinstance(field, QueryableAttribute))

    @memoized_property
    def attributes(self):
        """
        @see get_attributes
        """
        return self.get_attributes(self.model)

    @staticmethod
    def get_relations(instance) -> list:
        """
            Returns the relations objects of the model

            :param instance: Model ORM Instance
        """
        return _filter(instance, lambda field: isinstance(field, RelationshipProperty) or (
            isinstance(field, QueryableAttribute) and isinstance(field.property, RelationshipProperty)))

    @memoized_property
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

    @memoized_property
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

    @memoized_property
    def proxies(self):
        """
        @see get_proxies
        """
        return self.get_proxies(self.model)

