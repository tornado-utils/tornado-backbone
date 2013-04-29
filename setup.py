#!/usr/bin/python
# -*- encoding: utf-8 -*-
"""

"""
__author__ = 'Martin Martimeo <martin@martimeo.de>'
__date__ = '29.04.13 - 15:34'

from distutils.core import setup

setup(
    name='tornado-backbone',
    version='0.1.0',
    author='Martin Martimeo',
    author_email='martin@martimeo.de',
    packages=['tornado_backbone'],
    license='LICENSE.txt',
    description='backbone models from sqlalchemy orm',
    long_description=open('README.md').read(),
    install_requires=open('requirements.txt').readlines()
)