from pyramid.config import Configurator
from pyramid.renderers import JSON
from pyramid.events import BeforeRender
from pyramid.authentication import AuthTktAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy
from pyramid_beaker import session_factory_from_settings

import os
import sys
import json
import datetime
from bson import json_util
from bson.objectid import ObjectId
from pymongo import MongoClient
from elasticsearch import Elasticsearch

def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    config.include('pyramid_chameleon')

    config.include('velruse.providers.google_oauth2')
    config.add_google_oauth2_login_from_settings()
    config.add_subscriber(before_render, BeforeRender)

    my_session_factory = session_factory_from_settings(settings)
    config.set_session_factory(my_session_factory)

    authentication_policy = AuthTktAuthenticationPolicy('seekrit',
        callback=None, hashalg='sha512')
    authorization_policy = ACLAuthorizationPolicy()

    config.set_authentication_policy(authentication_policy)
    config.set_authorization_policy(authorization_policy)

    mongo = MongoClient(settings['db_uri'])
    db = mongo[settings['db_name']]
    config.registry.db_mongo = db
    config.registry.admin_list = settings['admin'].split(',')
    config.registry.upload_path = settings['upload_path']
    config.registry.news_path = settings['news_path']
    config.registry.admin_path = settings['admin_path']
    config.registry.public_path = settings['public_path']
    config.registry.dataset_path = settings['dataset_path']
    config.registry.script_path = settings['script_path']
    config.registry.download_path = settings['download_path']
    config.registry.studies_path = settings['studies_path']
    config.registry.jbrowse_path = settings['jbrowse_path']


    # by default we don't sniff, ever
    #config.registry.es = Elasticsearch( [settings['elastic_host']])
    #config.registry.es_db = settings['elastic_db']
    #config.registry.es.indices.create(index=settings['elastic_db'], ignore=400)

    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_static_view('app', 'rgv:webapp/app')
    config.add_route('autocomplete', '/autocomplete')
    config.add_route('checkgene', '/checkgene')
    config.add_route('d_getter', '/data_frame')
    config.add_route('file_dataset','/dataset_download/{dir}/{file}')
    config.add_route('genelevel', '/genelevel')
    config.add_route('home', '/')
    config.add_route('hmtData', '/hmtData')
    config.add_route('login', '/user/login')
    config.add_route('logged', '/user/logged')
    config.add_route('newsfeed', '/newsfeed')
    config.add_route('scData', '/scData')
    config.add_route('scDataGenes', '/scDataGenes')
    config.add_route('studyfeed', '/studyfeed')
    config.add_route('user', '/user')
    config.add_route('user_register', '/user/register')
    config.add_route('user_recover', '/user/recover')
    config.add_route('user_confirm_recover', '/user/confirm_recover')
    config.add_route('user_confirm_email', '/user/confirm_email')
    config.add_route('user_validate', '/user/validate')
    config.add_route('user_delete', '/user/delete')
    config.add_route('user_info', '/user/{id}')
    config.add_route('read_file','/browser_genelevel_init')
    config.add_route('read_stat','/read_stat')
    config.add_route('search', '/search')


    config.scan()

    # automatically serialize bson ObjectId and datetime to Mongo extended JSON
    json_renderer = JSON()
    def pymongo_adapter(obj, request):
        return json_util.default(obj)
    json_renderer.add_adapter(ObjectId, pymongo_adapter)
    json_renderer.add_adapter(datetime.datetime, pymongo_adapter)

    config.add_renderer('json', json_renderer)

    return config.make_wsgi_app()

def before_render(event):
    event["username"] = event['request'].authenticated_userid
