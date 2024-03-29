#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

AUTHOR = 'Drew Malone'
SITENAME = 'Tactical Programming'
SITEURL = 'https://www.tacticalprogramming.com'

PATH = 'content'

TIMEZONE = 'America/New_York'

THEME='pelican-blueidea'

DEFAULT_LANG = 'en'

GOOGLE_ANALYTICS = 'UA-126652865-1'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Blogroll
#LINKS = (('Pelican', 'http://getpelican.com/'),
#         ('Python.org', 'http://python.org/'),
#         ('Jinja2', 'http://jinja.pocoo.org/'),
#         ('You can modify those links in your config file', '#'),)

# Social widget
#SOCIAL = (('You can add links in your config file', '#'),
#          ('Another social link', '#'),)

DEFAULT_PAGINATION = 10

# Uncomment following line if you want document-relative URLs when developing
RELATIVE_URLS = True
STATIC_PATHS = ['../CNAME', 'images']
EXTRA_PATH_METADATA = {'../CNAME': {'path': 'CNAME'}}
