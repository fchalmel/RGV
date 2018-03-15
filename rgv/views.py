# -*- coding: utf-8 -*-

from pyramid.view import view_config
from pyramid.httpexceptions import HTTPFound, HTTPNotFound, HTTPForbidden, HTTPUnauthorized
from pyramid.security import remember, forget
from pyramid.renderers import render_to_response
from pyramid.response import Response, FileResponse

import os
import time 
import json
import pickle, cPickle
import random
from bson import json_util
from bson.objectid import ObjectId
from bson.errors import InvalidId
import jwt
import datetime
import time
import urllib2
import bcrypt
import uuid
import shutil
import zipfile
import tempfile
import copy
import re
from collections import OrderedDict
import simplejson as json
import subprocess
from csv import DictWriter
import pandas as pd
import numpy as np
from collections import OrderedDict

import logging

import smtplib
import email.utils
import sys
if sys.version < '3':
    from email.MIMEText import MIMEText
else:
    from email.mime.text import MIMEText
from logging.handlers import RotatingFileHandler

# création de l'objet logger qui va nous servir à écrire dans les logs
logger = logging.getLogger()
# on met le niveau du logger à DEBUG, comme ça il écrit tout
logger.setLevel(logging.DEBUG)

# création d'un formateur qui va ajouter le temps, le niveau
# de chaque message quand on écrira un message dans le log
formatter = logging.Formatter('%(asctime)s :: %(levelname)s :: %(message)s')
# création d'un handler qui va rediriger une écriture du log vers
# un fichier en mode 'append', avec 1 backup et une taille max de 1Mo
file_handler = RotatingFileHandler('view.log', 'a', 1000000000, 1)
# on lui met le niveau sur DEBUG, on lui dit qu'il doit utiliser le formateur
# créé précédement et on ajoute ce handler au logger
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

# création d'un second handler qui va rediriger chaque écriture de log
# sur la console
steam_handler = logging.StreamHandler()
steam_handler.setLevel(logging.DEBUG)
logger.addHandler(steam_handler)

@view_config(route_name='read_file', renderer='json', request_method='POST')
def read_file(request):
    form = json.loads(request.body, encoding=request.charset)
    file_name = form['name']
    url_file = os.path.join(request.registry.dataset_path,file_name)
    d = {'line':[]}
    try:
        f = open(url_file, "r")
        for li in f.readlines():
            d["line"].append(li.rstrip())

        return {"data":d, "status":0}
    except:
        return {"data":d, "status":1}

@view_config(route_name='d_getter', renderer='json', request_method='POST')
def d_getter(request):
    form = json.loads(request.body, encoding=request.charset)
    file_name = form['name']
    url_file = os.path.join(request.registry.dataset_path,file_name)
    df = pd.read_csv(url_file,sep='\t')
    df_json = df.to_json(orient='records')
    final_df = json.loads(df_json)
    filters = []
    displays = []
    for el in request.registry.col_display:
        displays.append({'name':el})

    #Create Data treeview for filtering grid (Species, Technology...)
    df_filtered = df.Species.unique()
    data_filter = [{'selection':'Species','type':'species','$$treeLevel':0}]
    for spe in df_filtered :
        data_filter.append({'selection':spe,'type':'species','$$treeLevel':1})
    df_filtered = df.Technology.unique()
    data_filter.append({'selection':'Technologies','type':'technology','$$treeLevel':0})
    for techno in df_filtered :
        data_filter.append({'selection':techno,'type':'technology','$$treeLevel':1})

    return {'data':final_df,'filter':request.registry.filter,'display':displays,'data_filter':data_filter}

@view_config(route_name='autocomplete', renderer='json', request_method='POST')
def autocomplete(request):
    form = json.loads(request.body, encoding=request.charset)
    search = form['search']
    database = form['database']
    tax_id = form['tax_id']
    regx = re.compile(search, re.IGNORECASE)
    repos = request.registry.db_mongo[database].find({"$and":[{"$or":[{'Symbol':regx},{'Synonyms':regx}]},{'tax_id':tax_id}]})
    result = []
    for dataset in repos[:15]:
        result.append(dataset)
    return result

@view_config(route_name='genelevel', renderer='json', request_method='POST')
def genelevel(request):
    def getValue(file_in,selectedvalues):
        start_time = time.time()
        dIndex =  cPickle.load(open(file_in+".pickle"))
        fList = open(file_in,"r")
        result = {}
        for val in selectedvalues :
            if str(val) in dIndex:
                iPosition = dIndex[str(val)]
                fList.seek(iPosition)
                result[str(val)] = fList.readline().rstrip().split('\t')[1:]
            else:
                result[str(val)] = []
        interval = time.time() - start_time
        return result
    

    form = json.loads(request.body, encoding=request.charset)
    directories = form['directory']

    all_genes = form['genes']
    selected_genes = all_genes.keys()
    result = {'charts':[],'warning':[],'time':''}
    #print directories
    start_time = time.time()  

    for stud in directories:
        groups = getValue(os.path.join(request.registry.dataset_path,'Studies',stud,stud+'.txt'),['Clusters'])
        groups = np.array(groups['Clusters'])
        _, idx = np.unique(groups, return_index=True)
        uniq_groups = groups[np.sort(idx)[::-1]]
        
        samples = getValue(os.path.join(request.registry.dataset_path,'Studies',stud,stud+'.txt'),['Sample'])
        samples = np.array(samples['Sample'])

        genes = getValue(os.path.join(request.registry.dataset_path,'Studies',stud,stud+'.txt'),selected_genes)
        for i in range(0,len(selected_genes)):
            gene_name = all_genes[selected_genes[i]]
            chart = {}
            chart['config']={'displaylogo':False,'modeBarButtonsToRemove':['zoom2d','sendDataToCloud','pan2d','lasso2d','resetScale2d']}
            chart['data']=[]
            chart['description'] = ""
            chart['name'] = "%s in %s study" % (gene_name,stud)
            chart['title'] = ""
            chart['layout'] = {'width':575,'height':489,'showlegend': True, 'legend': {"orientation": "h", 'traceorder':'reversed'},'margin':{'l':200}}
            chart['gene'] = gene_name
            chart['msg'] = []
            chart['study'] = stud
            for cond in uniq_groups :
                val_gene = np.array(genes[str(selected_genes[i])])
                if len(val_gene) != 0 :
                    val = val_gene[np.where(groups == cond)[0]]
                    data_chart = {}
                    
                    data_chart['x'] = []
                    data_chart['x'].extend(val)
                    data_chart['name'] = cond
                    data_chart['hoverinfo'] = "all"
                    ratio_type = len(samples)/len(uniq_groups)
                    if ratio_type > 10 :
                        data_chart['type'] = 'violin'
                        data_chart['orientation'] = 'h'
                        data_chart['box'] = {'visible': True}
                        data_chart['boxpoints'] = False

                    else :
                        data_chart['type'] = 'box'
                    chart['data'].append(data_chart)
                else:
                    chart['msg'].append("No data available")
                    data_chart = {}
                    data_chart['study'] = stud
                    data_chart['x'] = []
                    data_chart['hoverinfo'] = "name"
                    chart['data'].append(data_chart)
            result['charts'].append(chart)

    interval = time.time() - start_time  
    result['time'] = interval 
    return result

@view_config(route_name='scDataGenes', renderer='json', request_method='POST')
def scDataGenes(request):
    def getValue(file_in,selectedvalues):
        start_time = time.time()
        dIndex =  cPickle.load(open(file_in+".pickle"))
        fList = open(file_in,"r")
        result = {}
        for val in selectedvalues :
            if str(val) in dIndex:
                iPosition = dIndex[str(val)]
                fList.seek(iPosition)
                result[str(val)] = fList.readline().rstrip().split('\t')[1:]
            else:
                result[str(val)] = []
        interval = time.time() - start_time
        return result
    
    def getClass(file_in):
        dIndex =  cPickle.load(open(file_in+".pickle"))
        fList = open(file_in,"r")
        result = []
        for index in dIndex :
            if "Class" in index :
                result.append(index)
        return result

    form = json.loads(request.body, encoding=request.charset)
    directories = form['directory']

    all_genes = form['genes']
    selected_genes = all_genes.keys()
    result = {'charts':[],'warning':[],'time':'','class':{}}
    selected_class = form['selected_class']
    #print directories
    start_time = time.time()  

    for stud in directories:
        result['class'][stud] = getClass(os.path.join(request.registry.dataset_path,'Studies',stud,stud+'.txt'))
        if selected_class == '':
            selected_class = result['class'][stud][0]
        groups = getValue(os.path.join(request.registry.dataset_path,'Studies',stud,stud+'.txt'),[selected_class])
        groups = np.array(groups[selected_class])
        _, idx = np.unique(groups, return_index=True)
        uniq_groups = groups[np.sort(idx)[::-1]]
        
        samples = getValue(os.path.join(request.registry.dataset_path,'Studies',stud,stud+'.txt'),['Sample'])
        samples = np.array(samples['Sample'])

        x = np.array(getValue(os.path.join(request.registry.dataset_path,'Studies',stud,stud+'.txt'),['x'])['x'])
        y = np.array(getValue(os.path.join(request.registry.dataset_path,'Studies',stud,stud+'.txt'),['y'])['y'])

        genes = getValue(os.path.join(request.registry.dataset_path,'Studies',stud,stud+'.txt'),selected_genes)
        for i in range(0,len(selected_genes)):
            gene_name = all_genes[selected_genes[i]]
            chart = {}
            chart['config']={'displaylogo':False,'modeBarButtonsToRemove':['zoom2d','sendDataToCloud','pan2d','lasso2d','resetScale2d']}
            chart['data']=[]
            chart['description'] = ""
            chart['name'] = "%s in %s study" % (gene_name,stud)
            chart['title'] = ""
            chart['layout'] = {'height':700,'showlegend': True, 'legend': {"orientation": "h", 'traceorder':'reversed'}}
            chart['gene'] = gene_name
            chart['msg'] = []
            chart['study'] = stud
            for cond in uniq_groups :
                val_gene = np.array(genes[str(selected_genes[i])])
                if len(val_gene) != 0 :
                    val = val_gene[np.where(groups == cond)[0]]
                    val_x= x[np.where(groups == cond)[0]]
                    val_y= y[np.where(groups == cond)[0]]
                    text = samples[np.where(groups == cond)[0]]
                    data_chart = {}
                    data_chart['type'] = 'scatter'
                    data_chart['mode']= 'markers'
                    data_chart['text'] = []
                    data_chart['text'].extend(text)
                    data_chart['x'] = []
                    data_chart['x'].extend(val_x)
                    data_chart['y'] = []
                    data_chart['y'].extend(val_y)
                    data_chart['name'] = cond
                    data_chart['hoverinfo'] = "all"
                    data_chart['marker']={'color':[]}
                    data_chart['marker']['color'].extend(val)
                    chart['data'].append(data_chart)
            result['charts'].append(chart)

    interval = time.time() - start_time  
    result['time'] = interval 
    return result

@view_config(route_name='scData', renderer='json', request_method='POST')
def scData(request):
    def getValue(file_in,selectedvalues):
        start_time = time.time()
        dIndex =  cPickle.load(open(file_in+".pickle"))
        fList = open(file_in,"r")
        result = {}
        for val in selectedvalues :
            if str(val) in dIndex:
                iPosition = dIndex[str(val)]
                fList.seek(iPosition)
                result[str(val)] = fList.readline().rstrip().split('\t')[1:]
            else:
                result[str(val)] = []
        interval = time.time() - start_time
        return result
    
    def getClass(file_in):
        dIndex =  cPickle.load(open(file_in+".pickle"))
        fList = open(file_in,"r")
        result = []
        for index in dIndex :
            if "Class" in index :
                result.append(index)
        return result

    form = json.loads(request.body, encoding=request.charset)
    directories = form['directory']
    selected_class = form['selected_class']

    result = {'charts':[],'warning':[],'time':'','class':{}}
    #print directories
    start_time = time.time()  

    for stud in directories:
        result['class'][stud] = getClass(os.path.join(request.registry.dataset_path,'Studies',stud,stud+'.txt'))
        if selected_class == '':
            selected_class = result['class'][stud][0]
        groups = getValue(os.path.join(request.registry.dataset_path,'Studies',stud,stud+'.txt'),[selected_class])
        groups = np.array(groups[selected_class])
        _, idx = np.unique(groups, return_index=True)
        uniq_groups = groups[np.sort(idx)[::-1]]
        
        samples = np.array(getValue(os.path.join(request.registry.dataset_path,'Studies',stud,stud+'.txt'),['Sample'])['Sample'])
        x = np.array(getValue(os.path.join(request.registry.dataset_path,'Studies',stud,stud+'.txt'),['x'])['x'])
        y = np.array(getValue(os.path.join(request.registry.dataset_path,'Studies',stud,stud+'.txt'),['y'])['y'])
        chart = {}
        chart['config']={'displaylogo':False,'modeBarButtonsToRemove':['zoom2d','sendDataToCloud','pan2d','lasso2d','resetScale2d']}
        chart['data']=[]
        chart['description'] = ""
        chart['study'] = stud
        chart['layout'] = {'height':700,'showlegend': True, 'legend': {"orientation": "h", 'traceorder':'reversed'}}
        chart['gene'] = ""
        chart['msg'] = []
        for cond in uniq_groups :
            val_x= x[np.where(groups == cond)[0]]
            val_y= y[np.where(groups == cond)[0]]
            text = samples[np.where(groups == cond)[0]]
            data_chart = {}
            data_chart['x'] = []
            data_chart['x'].extend(val_x)
            data_chart['y'] = []
            data_chart['y'].extend(val_y)
            data_chart['name'] = cond
            data_chart['text'] = []
            data_chart['text'].extend(text)
            data_chart['hoverinfo'] = "all"
            data_chart['type'] = 'scatter'
            data_chart['mode']= 'markers'
            chart['data'].append(data_chart)
        result['charts'].append(chart)

    interval = time.time() - start_time  
    result['time'] = interval 
    return result



@view_config(route_name='newsfeed', renderer='json', request_method='GET')
def getnews(request):
    """
        func: Lecture fichier json local
        return: Dico (fichier json)
        view: home.html
    """
    try:
        url_file = os.path.join(request.registry.news_path,"all_news.news")
        json_data=open(url_file,'r')

        data = json.load(json_data)
        return {'data':data,'msg':'OK','status':0}

    except:
        logger.error('Error in getnews - File missing ?')
        return {'data':'','msg':'Get newsfeed : something wrong','status':1}



@view_config(route_name='file_dataset', request_method='GET')
def file_dataset(request):
    #print "Get Dataset"
    directory = request.matchdict['dir']
    downfile = request.matchdict['file']
    url_file = os.path.join(request.registry.dataset_path,directory,downfile)
    (handle, tmp_file) = tempfile.mkstemp('.zip')
    z = zipfile.ZipFile(tmp_file, "w")
    z.write(url_file,os.path.basename(url_file))
    z.close()
    return FileResponse(tmp_file,
                        request=request,
                        content_type='application/zip')

@view_config(route_name='search', renderer='json', request_method='POST')
def search(request):
    form = json.loads(request.body, encoding=request.charset)
    request_query = form['query']
    if 'from' in form :
        from_val = form['from']
    else :
        from_val = 0

    page = request.registry.es.search(
    index = request.registry.es_db,
      search_type = 'query_then_fetch',
      size = 1000,
      body =  {"query" : { "query_string" : {"query" :request_query,"default_operator":"AND",'analyzer': "standard"}}})


    body = {"query" : { "query_string" : {"query" :request_query,"default_operator":"AND",'analyzer': "standard"}}}
    print body
    return page

    #page = request.registry.es.search(
    #index = request.registry.es_db,
    #  search_type = 'query_then_fetch',
    #  size = 100,
    #  from_= from_val,
    #  body = {"query" : { "query_string" : {"query" :request_query,"default_operator":"AND",'analyzer': "standard"}}})

    #return page

@view_config(route_name='home')
def my_view(request):
    return HTTPFound(request.static_url('rgv:webapp/app/'))


def send_mail(request, email_to, subject, message):
    if not request.registry.settings['mail.smtp.host']:
        logging.error('email smpt host not set')
        return
    port = 25
    if request.registry.settings['mail.smtp.port']:
        port = int(request.registry.settings['mail.smtp.port'])
    mfrom = request.registry.settings['mail.from']
    mto = email_to
    msg = MIMEText(message)
    msg['To'] = email.utils.formataddr(('Recipient', mto))
    msg['From'] = email.utils.formataddr(('Author', mfrom))
    msg['Subject'] = subject
    server = None
    try:
        server = smtplib.SMTP(request.registry.settings['mail.smtp.host'], request.registry.settings['mail.smtp.port'])
        #server.set_debuglevel(1)
        if request.registry.settings['mail.tls'] and request.registry.settings['mail.tls'] == 'true':
            server.starttls()
        if request.registry.settings['mail.user'] and request.registry.settings['mail.user'] != '':
            server.login(request.registry.settings['mail.user'], request.registry.settings['mail.password'])
        server.sendmail(mfrom, [mto], msg.as_string())
    except Exception as e:
            logging.error('Could not send email: '+str(e))
    finally:
        if server is not None:
            server.quit()

def is_authenticated(request):
    # Try to get Authorization bearer with jwt encoded user information
    if request.authorization is not None:
        try:
            (auth_type, bearer) = request.authorization
            secret = request.registry.settings['secret_passphrase']
            # If decode ok and not expired
            user = jwt.decode(bearer, secret, audience='urn:rgv/api')
            user_id = user['user']['id']
            user_in_db = request.registry.db_mongo['users'].find_one({'id': user_id})
        except Exception as e:
            return None
        return user_in_db
    return None


@view_config(route_name='user_info', renderer='json', request_method='GET')
def user_info(request):
    user = is_authenticated(request)
    if user is None:
        return HTTPUnauthorized('Not authorized to access this resource')
    if not (user['id'] == request.matchdict['id'] or user['id'] in request.registry.admin_list):
        return HTTPUnauthorized('Not authorized to access this resource')
    user_in_db = request.registry.db_mongo['users'].find_one({'id': request.matchdict['id']})
    return user_in_db

@view_config(route_name='user_info', renderer='json', request_method='POST')
def user_info_update(request):
    user = is_authenticated(request)
    if user is None or user['id'] not in request.registry.admin_list:
        return HTTPUnauthorized('Not authorized to access this resource')
    if user['id'] != request.matchdict['id'] and user['id'] not in request.registry.admin_list:
        return HTTPUnauthorized('Not authorized to access this resource')
    form = json.loads(request.body, encoding=request.charset)
    tid = form['_id']
    del form['_id']
    request.registry.db_mongo['users'].update({'id': request.matchdict['id']}, form)
    form['_id'] = tid
    return form

@view_config(route_name='user', renderer='json')
def user(request):
    user = is_authenticated(request)
    if user is None or user['id'] not in request.registry.admin_list:
        return HTTPUnauthorized('Not authorized to access this resource')
    users_in_db = request.registry.db_mongo['users'].find()
    users = []
    for user_in_db in users_in_db:
        users.append(user_in_db)
    return users

@view_config(route_name='user_register', renderer='json', request_method='POST')
def user_register(request):
    form = json.loads(request.body, encoding=request.charset)
    if not form['user_name'] or not form['user_password']:
        return {'msg': 'emtpy fields, user name and password are mandatory'}
    user_in_db = request.registry.db_mongo['users'].find_one({'id': form['user_name']})
    if user_in_db is None :
        if 'address' not in form :
            form['address'] = 'No address'
        secret = request.registry.settings['secret_passphrase']
        token = jwt.encode({'user': {'id': form['user_name'],
                                     'password': bcrypt.hashpw(form['user_password'].encode('utf-8'), bcrypt.gensalt()),
                                     'first_name': form['first_name'],
                                     'last_name': form['last_name'],
                                     'laboratory': form['laboratory'],
                                     'country': form['country'],
                                     'address': form['address'],
                                     },
                        'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=36000),
                        'aud': 'urn:rgv/api'}, secret)
        message = "You requested an account, please click on following link to validate it\n"
        message += request.host_url+'/app/index.html#/login?action=confirm_email&token='+token
        send_mail(request, form['user_name'], '[ToxSigN] Please validate your account', message)
        return {'msg': 'You will receive a confirmation email. Please click the link to verify your account.'}
    else :
        msg = 'This email is already taken.'
        return {'msg': msg}

@view_config(route_name='user_confirm_email', renderer='json', request_method='POST')
def confirm_email(request):
    form = json.loads(request.body, encoding=request.charset)
    if form and 'token' in form:
        secret = request.registry.settings['secret_passphrase']
        user_id = None
        user_password = None
        try:
            auth = jwt.decode(form['token'], secret, audience='urn:rgv/api')
            user_id = auth['user']['id']
            user_password = auth['user']['password']
        except Exception:
            return HTTPForbidden()
        status = 'approved'
        msg = 'Email validated, you can now access to your account.'
        if user_id in request.registry.admin_list:
            status = 'approved'
            msg = 'Email validated, you can now log into the application'
        request.registry.db_mongo['users'].insert({'id': user_id,
                                                    'status': status,
                                                    'password': user_password,
                                                    'first_name': auth['user']['first_name'],
                                                    'last_name': auth['user']['last_name'],
                                                    'laboratory': auth['user']['laboratory'],
                                                    'address': auth['user']['address'],
                                                    'avatar': "",
                                                    'selectedID':"",
                                                    })
        upload_path = os.path.join(request.registry.upload_path, user_id, 'dashboard')
        if not os.path.exists(upload_path):
            os.makedirs(upload_path)
        return {'msg': msg}
    else:
        return HTTPForbidden()

@view_config(route_name='user_validate', renderer='json')
def user_validate(request):
    session_user = is_authenticated(request)
    form = json.loads(request.body, encoding=request.charset)
    if session_user['id'] not in request.registry.admin_list:
        return HTTPForbidden()
    user_id = form['id']
    #print user_id
    request.registry.db_mongo['users'].update({'id': user_id},{'$set': {'status': 'approved'}})
    return {'msg': 'user '+user_id+'validated'}

@view_config(route_name='user_delete', renderer='json')
def user_delete(request):
    session_user = is_authenticated(request)
    form = json.loads(request.body, encoding=request.charset)
    if session_user['id'] not in request.registry.admin_list:
        return HTTPForbidden()
    user_id = form['id']
    if user_id in request.registry.admin_list:
        return {'msg': 'This user is an administrator. Please delete his administrator privileges before'}
    request.registry.db_mongo['users'].remove({'id': user_id})
    request.registry.db_mongo['datasets'].remove({'owner': user_id})
    request.registry.db_mongo['messages'].remove({'owner': user_id})
    return {'msg': 'user '+user_id+'validated'}

@view_config(route_name='user_confirm_recover', renderer='json', request_method='POST')
def user_confirm_recover(request):
    form = json.loads(request.body, encoding=request.charset)
    secret = request.registry.settings['secret_passphrase']
    try:
        auth = jwt.decode(form['token'], secret, audience='urn:rgv/recover')
        user_id = auth['user']['id']
        user_in_db = request.registry.db_mongo['users'].find_one({'id': user_id})
        if user_in_db is None:
            return HTTPNotFound('User does not exists')
        user_password = form['user_password']
        new_password = bcrypt.hashpw(form['user_password'].encode('utf-8'), bcrypt.gensalt())
        request.registry.db_mongo['users'].update({'id': user_id},{'$set': {'password': new_password}})
    except Exception:
        return HTTPForbidden()
    return {'msg': 'password updated'}

@view_config(route_name='user_recover', renderer='json', request_method='POST')
def user_recover(request):
    form = json.loads(request.body, encoding=request.charset)
    if form['user_name'] is None:
        return {'msg': 'Please fill your email first'}
    user_in_db = request.registry.db_mongo['users'].find_one({'id': form['user_name']})
    if user_in_db is None:
        return {'msg': 'User not found'}
    secret = request.registry.settings['secret_passphrase']
    del user_in_db['_id']
    token = jwt.encode({'user': user_in_db,
                        'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=36000),
                        'aud': 'urn:rgv/recover'}, secret)
    message = "You requested a password reset, please click on following link to reset your password:\n"
    message += request.host_url+'/app/index.html#/recover?token='+token
    send_mail(request, form['user_name'], '[ToxSigN] Password reset request', message)
    logging.info(message)
    return {'msg': 'You will receive an email you must acknowledge it to reset your password.'}


@view_config(route_name='login', renderer='json', request_method='POST')
def login(request):
    form = json.loads(request.body, encoding=request.charset)
    user_in_db = request.registry.db_mongo['users'].find_one({'id': form['user_name']})
    if user_in_db is None:
        return {'msg': 'Invalid email'}

    if bcrypt.hashpw(form['user_password'].encode('utf-8'), user_in_db['password'].encode('utf-8')) == user_in_db['password']:
        secret = request.registry.settings['secret_passphrase']
        del user_in_db['_id']
        token = jwt.encode({'user': user_in_db,
                            'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=36000),
                            'aud': 'urn:rgv/api'}, secret)
        return {'token': token}
    else:
        return {'msg': 'Invalid credentials'}

@view_config(route_name='logged', renderer='json')
def logged(request):
    user = is_authenticated(request)
    if user is None:
        form = json.loads(request.body, encoding=request.charset)
        if form and 'token' in form:
            secret = request.registry.settings['secret_passphrase']
            auth = None
            try:
                auth = jwt.decode(form['token'], secret, audience='urn:rgv/api')
            except Exception as e:
                return HTTPUnauthorized('Not authorized to access this resource')
            user = {'id': auth['user']['id'], 'token': auth}
            user_in_db = request.registry.db_mongo['users'].find_one({'id': user['id']})
            if user_in_db is None:
                # Create user
                user['status'] = 'pending_approval'
                if user['id'] in request.registry.admin_list:
                    user['status'] = 'approved'
                logging.info('Create new user '+user['id'])
                request.registry.db_mongo['users'].insert({'id': user['id'], 'status': user['status']})
            else:
                user_in_db['token'] = form['token']
                user = user_in_db
        else:
            return HTTPNotFound('Not logged')

    if user is not None and user['id'] in request.registry.admin_list:
        user['admin'] = True

    return user

@view_config(
    context='velruse.AuthenticationComplete',
)
def login_complete_view(request):
    context = request.context
    result = {
        'id': context.profile['verifiedEmail'],
        'provider_type': context.provider_type,
        'provider_name': context.provider_name,
        'profile': context.profile,
        'credentials': context.credentials,
    }
    secret = request.registry.settings['secret_passphrase']
    token = jwt.encode({'user': result,
                        'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=36000),
                        'aud': 'urn:rgv/api'}, secret)
    return HTTPFound(request.static_url('rgv:webapp/app/')+"index.html#login?token="+token)
