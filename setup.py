#!/usr/bin/python
# -*- encoding: utf-8 -*-
"""

"""
__author__ = 'Martin Martimeo <martin@martimeo.de>'
__date__ = '29.04.13 - 15:34'

from distutils.core import setup

setup(
    name='Tornado-Backbone',
    version='0.2.1',
    author='Martin Martimeo',
    author_email='martin@martimeo.de',
    url='https://github.com/MartinMartimeo/tornado-backbone',
    packages=['tornado_backbone'],
    license='GNU AGPLv3+',
    platforms='any',
    description='backbone models from sqlalchemy orm for tornado-restless',
    long_description=open('README.md').read(),
    install_requires=open('requirements.txt').readlines(),
    download_url='http://pypi.python.org/pypi/Tornado-Backbone',
    classifiers=[
        'Development Status :: 4 - Beta',
        'Environment :: Web Environment',
        'License :: OSI Approved :: GNU Affero General Public License v3 or later (AGPLv3+)',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: JavaScript',
        'Topic :: Software Development :: Libraries :: Python Modules'
    ],
)