# -*- coding: utf-8 -*-

from pyramid.view import view_config
from pyramid.httpexceptions import HTTPFound, HTTPNotFound, HTTPForbidden, HTTPUnauthorized
from pyramid.security import remember, forget
from pyramid.renderers import render_to_response
from pyramid.response import Response, FileResponse

import os
import json
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
import xlrd
from collections import OrderedDict
import simplejson as json
import subprocess
from csv import DictWriter

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
            user = jwt.decode(bearer, secret, audience='urn:chemsign/api')
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
    form['_id'] = tid;
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
                        'aud': 'urn:chemsign/api'}, secret)
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
            auth = jwt.decode(form['token'], secret, audience='urn:chemsign/api')
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
        auth = jwt.decode(form['token'], secret, audience='urn:chemsign/recover')
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


@view_config(route_name='infodatabase', renderer='json', request_method='GET')
def infodatabase(request):
    user = is_authenticated(request)
    if user is None:
        return HTTPUnauthorized('Not authorized to access this resource')
    if not (user['id'] in request.registry.admin_list):
        return HTTPUnauthorized('Not authorized to access this resource')
    project_number = request.registry.db_mongo['projects'].find({'status' :'public'}).count()
    study_number = request.registry.db_mongo['studies'].find({'status' :'public'}).count()
    assay_number = request.registry.db_mongo['assays'].find({'status' :'public'}).count()
    signature_number = request.registry.db_mongo['signatures'].find({'status' :'public'}).count()
    user_request = request.registry.db_mongo['users'].find()
    users = []
    for user in user_request:
        users.append(user)
    pending_request = request.registry.db_mongo['projects'].find({'status' :'pending approval'})
    pendings = []
    for pending in pending_request:
        pendings.append(pending)
    return {'msg':'Database ok','project_number':project_number,'study_number':study_number,'assay_number':assay_number,'signature_number':signature_number,'users':users,'pendings':pendings}

@view_config(route_name='validate', renderer='json', request_method='POST')
def validate(request):
    user = is_authenticated(request)
    if user is None:
        return HTTPUnauthorized('Not authorized to access this resource')
    if not (user['id'] in request.registry.admin_list):
        return HTTPUnauthorized('Not authorized to access this resource')

    form = json.loads(request.body, encoding=request.charset)
    if form['project'] != "" and form['project'] != "gohomo" :
        project = form['project']
        pid = project['id']
        stid = project['studies'].split(',')
        aid = project['assays'].split(',')
        sid = project['signatures'].split(',')
        request.registry.db_mongo['projects'].update({'id' :pid},{'$set':{'status':'public'}})
        request.registry.db_mongo['studies'].update({'id':{ '$all': stid } },{'$set':{'status':'public'}})
        request.registry.db_mongo['assays'].update({'id':{ '$all': stid } },{'$set':{'status':'public'}})
        request.registry.db_mongo['signatures'].update({'id':{ '$all': stid } },{'$set':{'status':'public'}})
        cmd = "python %s --signature a --script gopublic --job b --user none" % (os.path.join(request.registry.script_path, 'jobLauncher.py'))
        os.system(cmd)

        proj = request.registry.db_mongo['projects'].find_one({'id' :pid})
        del proj['_id']
        es = elasticsearch.Elasticsearch([config.get('app:main','elastic_host')])
        bulk_insert = ''
        bulk_insert += "{ \"index\" : { \"_index\" : \"toxsign\", \"_type\": \"projects\" , \"_id\" : \""+proj['id']+"\" } }\n"
        bulk_insert += json.dumps(proj)+"\n"
        if bulk_insert:
            es.bulk(body=bulk_insert)

        for stud in stid:
            study = request.registry.db_mongo['studies'].find_one({'id' :stud})
            del study['_id']
            es = elasticsearch.Elasticsearch([config.get('app:main','elastic_host')])
            bulk_insert = ''
            bulk_insert += "{ \"index\" : { \"_index\" : \"toxsign\", \"_type\": \"studies\" , \"_id\" : \""+study['id']+"\" } }\n"
            bulk_insert += json.dumps(study)+"\n"
            if bulk_insert:
                es.bulk(body=bulk_insert)

        for ass in aid:
            assay = request.registry.db_mongo['assays'].find_one({'id' :ass})
            del assay['_id']
            es = elasticsearch.Elasticsearch([config.get('app:main','elastic_host')])
            bulk_insert = ''
            bulk_insert += "{ \"index\" : { \"_index\" : \"toxsign\", \"_type\": \"assays\" , \"_id\" : \""+assay['id']+"\" } }\n"
            bulk_insert += json.dumps(assay)+"\n"
            if bulk_insert:
                es.bulk(body=bulk_insert)

        for sign in sid:
            signature = request.registry.db_mongo['signatures'].find_one({'id' :sign})
            del signature['_id']
            es = elasticsearch.Elasticsearch([config.get('app:main','elastic_host')])
            bulk_insert = ''
            bulk_insert += "{ \"index\" : { \"_index\" : \"toxsign\", \"_type\": \"signatures\" , \"_id\" : \""+signature['id']+"\" } }\n"
            bulk_insert += json.dumps(signature)+"\n"
            if bulk_insert:
                es.bulk(body=bulk_insert)
        return {'msg':'Project status changed : Pending --> public'}

    if form['project'] == "gohomo" :
        cmd = "python %s --signature a --script gohomo --job b --user none" % (os.path.join(request.registry.script_path, 'jobLauncher.py'))
        os.system(cmd)
        return {'msg':'Create annotation file Done'}
    else :
        cmd = "python %s --signature a --script gopublic --job b --user none" % (os.path.join(request.registry.script_path, 'jobLauncher.py'))
        os.system(cmd)
        return {'msg':'Create public.RData Done'}


@view_config(route_name='unvalidate', renderer='json', request_method='POST')
def unvalidate(request):
    user = is_authenticated(request)
    if user is None:
        return HTTPUnauthorized('Not authorized to access this resource')
    if not (user['id'] in request.registry.admin_list):
        return HTTPUnauthorized('Not authorized to access this resource')

    form = json.loads(request.body, encoding=request.charset)
    project = form['project']
    pid = project['id']
    stid = project['studies'].split(',')
    aid = project['assays'].split(',')
    sid = project['signatures'].split(',')
    request.registry.db_mongo['projects'].update({'id' :pid},{'$set':{'status':'private'}})
    request.registry.db_mongo['studies'].update({'id':{ '$all': stid } },{'$set':{'status':'private'}})
    request.registry.db_mongo['assays'].update({'id':{ '$all': stid } },{'$set':{'status':'private'}})
    request.registry.db_mongo['signatures'].update({'id':{ '$all': stid } },{'$set':{'status':'private'}})
    return {'msg':'Project status changed : Pending --> private'}


@view_config(route_name='pending', renderer='json', request_method='POST')
def pending(request):
    user = is_authenticated(request)
    if user is None:
        return HTTPUnauthorized('Not authorized to access this resource')


    form = json.loads(request.body, encoding=request.charset)
    project = form['project']

    if user['id'] != project['owner']:
        return HTTPUnauthorized('Not authorized to access this resource')

    pid = project['id']
    stid = project['studies']
    aid = project['assays']
    sid = project['signatures']
    request.registry.db_mongo['projects'].update({'id' :pid},{'$set':{'status':'pending approval'}})
    request.registry.db_mongo['studies'].update({'id':{ '$all': stid } },{'$set':{'status':'pending approval'}})
    request.registry.db_mongo['assays'].update({'id':{ '$all': stid } },{'$set':{'status':'pending approval'}})
    request.registry.db_mongo['signatures'].update({'id':{ '$all': stid } },{'$set':{'status':'pending approval'}})
    return {'msg':'Your project is now pending approval.'}



@view_config(route_name='1', renderer='json', request_method='POST')
def getdata(request):
    form = json.loads(request.body, encoding=request.charset)
    collection = form['collection']
    select_filter = form['filter']
    field = form['field']
    project_number = 0
    study_number = 0
    assay_number = 0
    signature_number = 0
    if 'all_info' in form :
        project_number = request.registry.db_mongo['projects'].find({field :select_filter}).count()
        study_number = request.registry.db_mongo['studies'].find({field :select_filter}).count()
        assay_number = request.registry.db_mongo['assays'].find({field :select_filter}).count()
        signature_number = request.registry.db_mongo['signatures'].find({field :select_filter}).count() 
    if form['from'] == "None" :
        
        result = request.registry.db_mongo[collection].find_one({field :select_filter})
        if result is not None :
            if 'edges' in result:
                if result['edges'] is not None :
                    if result['edges'] != "" :
                        dico = json.loads(result['edges'])
                        for i in dico :
                            if dico[i] != [] :
                                dico[i] = dico[i][0].split(',')
                        result['edges'] = dico
            return {'msg':'','request':result}
    else :
        selected = []
        if int(form['from']) < 0 :
            form['from'] = 0
        result = request.registry.db_mongo[collection].find({field :select_filter})
        for res in result :
            selected.append(res)
        if len(selected) < int(form['from']) :
            form['from'] = len(selected) - 15
        if len(selected) < int(form['to']) :
            form['to'] = len(selected)
        return {'msg':'ok','request':selected[int(form['from']):int(form['to'])],'project_number':project_number,'study_number':study_number,'assay_number':assay_number,'signature_number':signature_number}

@view_config(route_name='ontologies', renderer='json', request_method='POST')
def ontologies(request):

    REST_URL = "http://data.bioontology.org"
    API_KEY = "27f3a22f-92f8-4587-a884-e81953e113e6"
    form = json.loads(request.body, encoding=request.charset)
    term = form['search'].replace(' ','%20')
    database = form['database']

    def get_json(url):
        opener = urllib2.build_opener()
        opener.addheaders = [('Authorization', 'apikey token=' + API_KEY)]
        return json.loads(opener.open(url).read())

    # Get list of search terms
    search_results = []
    print REST_URL + "/search?q=" + term+'&ontology=' + database
    #print get_json(REST_URL + "/search?q=" + term+'&ontology=' + database)
    search_results.append(get_json(REST_URL + "/search?q=" + term+'&ontologies=' + database)["collection"])
    #print search_results

    return search_results


@view_config(route_name='getjob', renderer='json', request_method='POST')
def getjob(request):
    form = json.loads(request.body, encoding=request.charset)
    job_list = form['job_list']
    if job_list != "" :
        flist = []
        for i in job_list :
            try:
                flist.append(int(i))
            except:
                continue
        running_job = list(request.registry.db_mongo['Jobs'].find( {"id": {'$in': flist}}))

        return {'jobs':running_job}
    if job_list == "" :
        job = request.registry.db_mongo['Jobs'].find_one( {'_id': ObjectId(form['jid'])})
        return {'jobs':job}

@view_config(route_name='convert', renderer='json', request_method='POST')
def convert(request):
    form = json.loads(request.body, encoding=request.charset)
    genes_list = form['genes'].split(',')
    print genes_list
    dataset_in_db = ""

    if form['way'] == 'None' or form['way'] == 'EntrezToHomo' :
        if 'species' in form :
            dataset_in_db = list(request.registry.db_mongo['homoloGene'].find( {"Gene_ID": {'$in': genes_list},'Taxonomy_ID':form['species']},{ "HID": 1, "Gene_ID": 1, "Gene_Symbol":1,'Taxonomy_ID':1,"_id": 0 } ))
            result = []
            for dataset in dataset_in_db:
                if 'NA' not in dataset["HID"]:
                    result.append(dataset)
            return {'converted_list':result}
        else :
            dataset_in_db = list(request.registry.db_mongo['genes'].find( {"GeneID": {'$in': genes_list}},{"HID":1, "_id": 0 } ))
            result = []
            for dataset in dataset_in_db:
                if 'NA' not in dataset["HID"]:
                    result.append(dataset["HID"].replace('\n',''))
            #print result
            return {'converted_list':result}
    else :
        dataset_in_db = list(request.registry.db_mongo['homoloGene'].find( {"HID": {'$in': genes_list},'Taxonomy_ID':form['species']},{ "HID": 1, "Gene_ID": 1, "Gene_Symbol":1,'Taxonomy_ID':1,"_id": 0 } ))
        result = []
        for dataset in dataset_in_db:
            if 'NA' not in dataset["Gene_ID"]:
                result.append(dataset)
        return {'converted_list':result}


@view_config(route_name='readresult', renderer='json', request_method='POST')
def readresult(request):
    form = json.loads(request.body, encoding=request.charset)
    jid = form['job']
    print "readresults"

    job_info = request.registry.db_mongo['Jobs'].find_one({'id':jid})
    result_file = job_info['result']
    param = job_info['arguments'].split(',')
    filter_val = param[0]
    arg_val = param[1]
    value = param[2]
    if job_info['tool'] == "distance analysis" :
        orgafile = {'pvalue':7,'zscore':6,'r':1}
        if os.path.getsize(result_file) == 0 :
            return {'msg':'No enrichment are available','Bp':[],'Disease': [],'Mf':[],'Cc':[] ,'status':"0"}
        else :
            lsg=[]
            fileGo = open(result_file,'r')
            L = fileGo.readlines()
            fileGo.close()

            R = [e.split('\t')  for e in L]#creation list fichier
            #print len(R)
            if arg_val == 'lt' :
                R = [x for x in R if float(x[orgafile[filter_val]])<=float(value)]
                    
            if arg_val == 'gt' :
                R = [x for x in R if float(x[orgafile[filter_val]])>=float(value)]


            for line in R :
                name_sig = request.registry.db_mongo['signatures'].find_one({'id':line[0]})
                dGo = {'name':line[0]+' - '+name_sig['title'],'signature':line[0],'r':int(line[1]),'R':int(line[2]),'n':int(line[3]),'N':int(line[4]),'rR':float(line[5]),'zscore':float(line[6]),'pvalue':float(line[7]),'euclid':float(line[8]),'cor':float(line[9]),'genes':line[10]}
                lsg.append(dGo)
            return {'msg':'Enrichment Done','results':lsg,'status':"0"}

    if job_info['tool'] == "functional analysis" :
        orgafile = {'pvalue':7,'pbh':8,'r':2,'n':4}
        lbp=[]
        lcc=[]
        lds=[]
        lmf=[]
        fileGo = open(result_file,'r')
        L = fileGo.readlines()
        fileGo.close()

        R = [e.split('\t')  for e in L]#creation list fichier
        #print len(R)
        if arg_val == 'lt' :
            R = [x for x in R if float(x[orgafile[filter_val]])<=float(value)]
            
        if arg_val == 'gt' :
            R = [x for x in R if float(x[orgafile[filter_val]])>=float(value)]
        #print len(R)
        for line in R :
            dGo = {'Term':line[1],'r':int(line[2]),'R':int(line[3]),'n':int(line[4]),'N':int(line[5]),'rR':float(line[6]),'pvalue':float(line[7]),'pbh':float(line[8])}
            #print dGo
            if line[0] == 'Process' :
                lbp.append(dGo)
            if line[0] == 'Component' :
                lcc.append(dGo)
            if line[0] == 'Phenotype' :
                lds.append(dGo)
            if line[0] == 'Function' :
                lmf.append(dGo)

        return {'msg':'Enrichment Done','Bp':lbp,'Disease': lds,'Mf':lmf,'Cc':lcc ,'status':"0"}

@view_config(route_name='run', renderer='json', request_method='POST')
def run(request):
    form = json.loads(request.body, encoding=request.charset)
    user_id = form['uid']
    arguments = form['arguments']
    tool = form['tool']
    name = form['name']
    signature = json.loads(form['signature'])


    dt = datetime.datetime.utcnow()
    sdt = time.mktime(dt.timetuple())


    if signature is None :
        return {'msg':'Error - TOXsIgN is not able to find your signature. If the problem persists, please contact administrators'}
    else :
        if signature['type'] != 'Genomic' :
            return {'msg':'Error - Your signature is not a genomic signature.','id':'None'}
        if signature['status'] == 'private' and signature['owner'] != user_id :
            return {'msg':'Error - You are not authorized to access this resource.','id':'None'}
        file_up = ""
        file_down = ""
        file_interogated =""
        request.registry.db_mongo['Jobs'].update({'id': 1}, {'$inc': {'val': 1}})
        repos = request.registry.db_mongo['Jobs'].find_one({'id': 1})
        jobID = repos['val']
        if name == "" :
            name = 'TOXsIgN job n°'+str(jobID)
        dico = {
            'id': jobID,
            'name':name,
            'status' : 'creating',
            'user': user_id,
            'tool': tool,
            'signature' :signature['id'],
            'time':sdt,
            'stderr':'',
            'arguments':arguments
        }
        request.registry.db_mongo['Jobs'].insert(dico)
        tool = tool.replace(" ","_")
        cmd = "--signature %s,--script %s,--job %s,--user %s" %(signature['id'],tool,jobID, user_id)
        subprocess.Popen(["python", os.path.join(request.registry.script_path, 'jobLauncher.py'),"--signature",str(signature['id']),'--script',tool,'--job',str(jobID),'--user',str(user_id)])
        return {'msg':'Job '+str(jobID)+' submitted','id':jobID}




@view_config(route_name='download', request_method='GET')
def download_data(request):
    session_user = is_authenticated(request)
    dataset_id = request.matchdict['dataset']
    
    result = request.registry.db_mongo['projects'].find_one({'id' :dataset_id})
    if result['status'] == 'public' :
        name = 'TOXsIgN_'+dataset_id+'.xlsx'
        url_file = os.path.join(request.registry.public_path,dataset_id,name)
        (handle, tmp_file) = tempfile.mkstemp('.zip')
        z = zipfile.ZipFile(tmp_file, "w")
        z.write(url_file,os.path.basename(url_file))
        z.close()
        return FileResponse(tmp_file,
                            request=request,
                            content_type='application/zip')

    if result['status'] == 'private':
        if session_user is None:
            token = None
            try:
                token = request.params['token']
                #print 'TOKEN'
                #print token
            except Exception:
                token = None
            auth = None
            try:
                secret = request.registry.settings['secret_passphrase']
                # If decode ok and not expired
                auth = jwt.decode(token, secret, audience='urn:chemsign/api')
            except Exception as e:
                return HTTPUnauthorized('Not authorized to access this resource')
            if auth is None:
                return HTTPForbidden()
        #print 'PRIVATE'
        #print result['owner']
        #print auth

        if auth['user']['id'] == result['owner'] :
            name = 'TOXsIgN_'+dataset_id+'.xlsx'
            url_file = os.path.join(request.registry.upload_path,result['owner'],dataset_id,name)
            (handle, tmp_file) = tempfile.mkstemp('.zip')
            z = zipfile.ZipFile(tmp_file, "w")
            z.write(url_file,os.path.basename(url_file))
            z.close()
            return FileResponse(tmp_file,
                                request=request,
                                content_type='application/zip')
        else :
            return {'msg':'You are not authorized to access this content'}

@view_config(route_name='file_dataset', request_method='GET')
def file_dataset(request):
    print "Get Dataset"
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

@view_config(route_name='file_signature', request_method='GET')
def file_signature(request):
    session_user = is_authenticated(request)
    dataset_id = request.matchdict['project']
    signature_id = request.matchdict['signature']
    file_id = request.matchdict['file']
    
    if signature_id == 'none':
        result = ""
        if 'project' in file_id :
            result = request.registry.db_mongo['projects'].find_one({'id' :dataset_id})
        if 'study' in file_id :
            result = request.registry.db_mongo['studies'].find_one({'id' :dataset_id})
        if 'assay' in file_id :
            result = request.registry.db_mongo['assays'].find_one({'id' :dataset_id})
        if 'signature' in file_id :
            result = request.registry.db_mongo['signatures'].find_one({'id' :dataset_id})
        

        name = file_id+'.csv'
        results = []
        results.append(result)
        header = result.keys()

        file_path = os.path.join(request.registry.upload_path,'tmp')

        if not os.path.exists(file_path):
            os.makedirs(file_path)

        with open(os.path.join(file_path,name),'w') as outfile:
            writer = DictWriter(outfile, header)
            writer.writeheader()
            writer.writerows(results)


        url_file = os.path.join(file_path,name)
        (handle, tmp_file) = tempfile.mkstemp('.zip')
        z = zipfile.ZipFile(tmp_file, "w")
        z.write(url_file,os.path.basename(url_file))
        z.close()
        return FileResponse(tmp_file,
                            request=request,
                            content_type='application/zip')



    result = request.registry.db_mongo['signatures'].find_one({'id' :signature_id})
    if result['status'] == 'public' :
        name = file_id
        url_file = os.path.join(request.registry.public_path,dataset_id,signature_id,name)
        (handle, tmp_file) = tempfile.mkstemp('.zip')
        z = zipfile.ZipFile(tmp_file, "w")
        z.write(url_file,os.path.basename(url_file))
        z.close()
        return FileResponse(tmp_file,
                            request=request,
                            content_type='application/zip')

    if result['status'] == 'private':
        if session_user is None:
            token = None
            try:
                token = request.params['token']
            except Exception:
                token = None
            auth = None
            try:
                secret = request.registry.settings['secret_passphrase']
                # If decode ok and not expired
                auth = jwt.decode(token, secret, audience='urn:chemsign/api')
            except Exception as e:
                return HTTPUnauthorized('Not authorized to access this resource')
            if auth is None:
                return HTTPForbidden()

        if auth['user']['id'] == result['owner'] :
            name = file_id
            url_file = os.path.join(request.registry.upload_path,result['owner'],dataset_id,signature_id,name)
            (handle, tmp_file) = tempfile.mkstemp('.zip')
            z = zipfile.ZipFile(tmp_file, "w")
            z.write(url_file,os.path.basename(url_file))
            z.close()
            return FileResponse(tmp_file,
                                request=request,
                                content_type='application/zip')
        else :
            return {'msg':'You are not authorized to access this content'}

@view_config(route_name='file_upload', renderer='json', request_method='POST')
def file_upload(request):
    session_user = is_authenticated(request)
    if session_user is None:
        return 'HTTPForbidden()'
    input_file = None
    try:
        input_file = request.POST['file'].file
    except Exception:
        return HTTPForbidden('no input file')

    signature_selected = request.registry.db_mongo['signatures'].find_one({'id' :request.POST['sid']})
    if signature_selected is None :
        return {'msg':'Something went wrong if the problem persists, please contact administrators'}
    if signature_selected['owner'] !=  request.POST['uid'] :
        return HTTPForbidden('Not authorized to access this resource')

    if signature_selected[request.POST['type']] == "" :
        request.registry.db_mongo['signatures'].update({'id' :request.POST['sid']},{'$set':{request.POST['type']:request.POST['name']}})
    else :
        if request.POST['name'] not in signature_selected[request.POST['type']].split(',') :
            return {'msg':'No file corresponding to your uploaded file. Please update the file name using project updating button'}
        else :
            print request.POST['name']
            print signature_selected[request.POST['type']].split()

    if request.POST['type'] == 'additional_file' :
        tmp_file_name = uuid.uuid4().hex
        file_path = os.path.join('/tmp', '%s.sig' % tmp_file_name)
        temp_file_path = file_path + '~'

        # Finally write the data to a temporary file
        with open(temp_file_path, 'wb') as output_file:
            shutil.copyfileobj(input_file, output_file)
        # Now that we know the file has been fully saved to disk move it into place.

        upload_path = os.path.join(request.registry.upload_path, request.params['uid'], request.params['dataset'], request.params['sid'])
        #print upload_path
        if not os.path.exists(upload_path):
            os.makedirs(upload_path)
        shutil.move(temp_file_path, os.path.join(upload_path, request.params['name']))
        print 'write file into : '+ upload_path
        return {'msg':'Upload complete'}
    else :
        if signature_selected[request.POST['type']] == "" :
            request.registry.db_mongo['signatures'].update({'id' :request.POST['sid']},{'$set':{request.POST['type']:request.POST['name']}})
        else :
            if request.POST['name'] not in signature_selected[request.POST['type']].split(',') :
                return {'msg':'No file corresponding to your uploaded file. Please update the file name using project updating button'}
            else :
                print request.POST['name']
                print signature_selected[request.POST['type']].split()
        try :
            if signature_selected['genes_identifier'] == 'Entrez genes' :

                tmp_file_name = uuid.uuid4().hex
                print tmp_file_name
                file_path = os.path.join('/tmp', '%s.sig' % tmp_file_name)
                temp_file_path = file_path + '~'

                # Finally write the data to a temporary file
                with open(temp_file_path, 'wb') as output_file:
                    shutil.copyfileobj(input_file, output_file)
                # Now that we know the file has been fully saved to disk move it into place.

                upload_path = os.path.join(request.registry.upload_path, request.params['uid'], 'tmp')
                if not os.path.exists(upload_path):
                    os.makedirs(upload_path)
                shutil.move(temp_file_path, os.path.join(upload_path, tmp_file_name))
                check_file = open(os.path.join(upload_path, tmp_file_name),'r')
                lId = []
                for lineID in check_file.readlines():
                    if lineID != '' and lineID != 'NA' and lineID != '-' and lineID != 'na' and lineID != ' ' and lineID != 'Na' :
                        IDs = lineID.replace('\n','\t').replace(',','\t').replace(';','\t')
                        lId.append(IDs.split('\t')[0])
                lId = list(set(lId))
                print lId
                check_file.close()
                dataset_in_db = list(request.registry.db_mongo['genes'].find( {"GeneID": {'$in': lId}},{ "GeneID": 1,"Symbol": 1,"HID":1, "_id": 0 } ))
                lresult = {}
                for i in dataset_in_db:
                    lresult[i['GeneID']]=[i['Symbol'],i['HID']]

                #Create 4 columns signature file
                print 'test si file'
                if os.path.isfile(os.path.join(request.registry.upload_path, request.params['uid'], request.params['dataset'], request.params['sid'],request.params['name'])):
                    print 'Remove car existes'
                    os.remove(os.path.join(request.registry.upload_path, request.params['uid'], request.params['dataset'], request.params['sid'],request.params['name']))

                print 'Remove tmp'
                os.remove(os.path.join(upload_path, tmp_file_name))

                print 'create directory'
                if not os.path.exists(os.path.join(request.registry.upload_path, request.params['uid'], request.params['dataset'], request.params['sid'])):
                    os.makedirs(os.path.join(request.registry.upload_path, request.params['uid'], request.params['dataset'], request.params['sid']))
                
                print 'Create final'
                check_files = open(os.path.join(request.registry.upload_path, request.params['uid'], request.params['dataset'], request.params['sid'],request.params['name']),'a')
                have_wrong = 0
                for ids in lId :
                    if ids in lresult :
                        check_files.write(ids+'\t'+lresult[ids][0]+'\t'+lresult[ids][1].replace('\n','')+'\t1\n')
                    else :
                        check_files.write(ids+'\t'+'NA\tNA'+'\t0\n')  
                        have_wrong = 1                  
                check_files.close()
                print "File checked and uploded !"
                if 'up' in request.params['type'] :
                    request.registry.db_mongo['signatures'].update({'id' :request.POST['sid']},{'$set':{'genes_up':','.join(lId)}})
                if 'down' in request.params['type'] :
                    request.registry.db_mongo['signatures'].update({'id' :request.POST['sid']},{'$set':{'genes_down':','.join(lId)}})
                if have_wrong == 0 :
                    return {'msg':"File checked and uploded !",'status': '0' }
                else : 
                    return {'msg':"Warning ! Some IDs are not EntrezGene ID or are desprecated",'status': '0' }
     
        except :
            print sys.exc_info()[1]
            return {'msg':"TOXsIgN can't read your file. Please make sure you use the correct format. If this error persists, please contact the site administrator.",'status': '1' }

        return {'msg': "TOXsIgN can't read your file. Please make sure you use the correct format. If this error persists, please contact the site administrator."}



    #print user
    #print signature_id



@view_config(route_name='excel_upload', renderer='json', request_method='POST')
def excel_signature_upload(request):
    session_user = is_authenticated(request)
    if session_user is None:
        return 'HTTPForbidden()'

    input_file = None
    try:
        input_file = request.POST['file'].file
    except Exception:
        return HTTPForbidden('no input file')

    try :
        tmp_file_name = uuid.uuid4().hex
        file_path = os.path.join('/tmp', '%s.sig' % tmp_file_name)
        temp_file_path = file_path + '~'

        # Finally write the data to a temporary file
        with open(temp_file_path, 'wb') as output_file:
            shutil.copyfileobj(input_file, output_file)
        # Now that we know the file has been fully saved to disk move it into place.

        upload_path = os.path.join(request.registry.upload_path, request.params['uid'], request.params['dataset'])
        #print upload_path
        if not os.path.exists(upload_path):
            os.makedirs(upload_path)
        shutil.move(temp_file_path, os.path.join(upload_path, tmp_file_name))
        print 'write file into : '+upload_path
    except:
        logger.warning("Error - Upload path")
        logger.warning(upload_path)
        logger.warning(sys.exc_info())
        return {'msg':'An error occurred while uploading your file. If the error persists please contact TOXsIgN support ','status':'1'}

    #Create error list
    project_error = {'Critical':[],'Warning':[],'Info':[]}
    study_error = {'Critical':[],'Warning':[],'Info':[]}
    assay_error = {'Critical':[],'Warning':[],'Info':[]}
    factor_error = {'Critical':[],'Warning':[],'Info':[]}
    signature_error = {'Critical':[],'Warning':[],'Info':[]}
    zorro = 1
    #Read excel file
    try :
        input_file.seek(0)
        wb = xlrd.open_workbook(os.path.join(upload_path, tmp_file_name),encoding_override="cp1251")
        #Read project
        sh = wb.sheet_by_index(0)
        projects={}
        critical = 0
        for rownum in range(5, sh.nrows):
            row_values = sh.row_values(rownum)
            if row_values [1] == "" and row_values [2] == "" and row_values [3] =="" :
                continue
            project_id = row_values[0]
            project_title = ""
            project_description = ""
            project_pubmed = ""
            project_contributors=""
            project_crosslink = ""

            if row_values[1] != "":
                project_title = row_values[1]
            else :
                project_error['Critical'].append("No project title ("+project_id+")")
                critical += 1

            if row_values[2] != "":
                project_description = row_values[2]
            else :
                project_error['Warning'].append("No project description ("+project_id+")")

            if row_values[3] != "" :
                if ';' in str(row_values[3]) or '|' in str(row_values[3]):
                    project_error['Critical'].append("Use comma to separate your pubmed ids ("+project_id+")")
                    critical += 1
                else :
                    project_pubmed = str(row_values[3])
            else :
                project_error['Info'].append("No associated pubmed Id(s)")

            if row_values[4] != "" :
                if ';' in row_values[4] or '|' in row_values[4]:
                    project_error['Critical'].append("Use comma to separate your contributors ("+project_id+")")
                    critical += 1
                else :
                    project_contributors = row_values[4]
            else :
                project_error['Info'].append("No associated contributors ("+project_id+")")

            if row_values[5] != "" :
                if ';' in row_values[5] or '|' in row_values[5]:
                    project_error['Critical'].append("Use comma to separate your links ("+project_id+")")
                    critical += 1
                else :
                    project_crosslink = row_values[5]
            else :
                project_error['Info'].append("No cross link(s) ("+project_id+")")


            #After reading line add all info in dico project
            dico ={
                'title' : project_title,
                'description' : project_description,
                'pubmed' : str(project_pubmed.split(',')),
                'contributor' : str(project_contributors.split(','))
            }
            projects[project_id] = dico

        # Check studies
        sh = wb.sheet_by_index(1)
        studies={}
        for rownum in range(6, sh.nrows):
                row_values = sh.row_values(rownum)
                if row_values [1] == "" and row_values [2] == "" and row_values [3] =="" :
                    continue
                study_id = row_values[0]
                study_projects = ""
                study_title = ""
                study_description=""
                study_experimental_design=""
                study_results=""
                study_type = ""
                study_inclusion_periode = ""
                study_inclusion = ""
                study_exclusion = ""
                study_followup = ""
                study_pubmed = ""
                study_pop_size = ""
                study_pubmed = ""



                if row_values[1] != "":
                    if row_values[1] in projects:
                        study_projects = row_values[1]
                    else :
                        study_error['Critical'].append("Project doesn't exists ("+study_id+")")
                        critical += 1
                else :
                    study_error['Critical'].append("No associated project ("+study_id+")")
                    critical += 1

                if row_values[2] != "":
                    study_title = row_values[2]
                else :
                    study_error['Critical'].append("No study title ("+study_id+")")
                    critical += 1

                if row_values[3] != "":
                    study_description = row_values[3]
                else :
                    study_error['Warning'].append("No study description ("+study_id+")")

                if row_values[4] != "":
                    study_experimental_design = row_values[4]
                else :
                    study_error['Warning'].append("No experimental design description ("+study_id+")")

                if row_values[5] != "":
                    study_results = row_values[5]
                else :
                    study_error['Info'].append("No study results ("+study_id+")")

                if row_values[6] != "":
                    if row_values[6] == 'Interventional' or row_values[6] == 'Observational' :
                        study_type = row_values[6]
                    else :
                        study_error['Critical'].append("Study type not available ("+study_id+")")
                        critical += 1
                else :
                    study_error['Critical'].append("No study type selected ("+study_id+")")
                    critical += 1

                if study_type == "Observational" :
                    if row_values[7] != "":
                        study_inclusion_periode = row_values[7]
                    else :
                        study_error['Warning'].append("No inclusion period ("+study_id+")")

                    if row_values[8] != "":
                        study_inclusion = row_values[8]
                    else :
                        study_error['Warning'].append("No inclusion criteria ("+study_id+")")

                    if row_values[9] != "":
                        study_exclusion = row_values[9]
                    else :
                        study_error['Warning'].append("No exclusion criteria ("+study_id+")")

                    if row_values[10] != "":
                        study_followup = row_values[10]
                    else :
                        study_error['Warning'].append("No follow up ("+study_id+")")

                    if row_values[11] != "":
                        study_pop_size = row_values[11]
                    else :
                        study_error['Warning'].append("No population size ("+study_id+")")

                    if row_values[12] != "":
                        study_pubmed = row_values[12]
                    else :
                        study_error['Info'].append("No pubmed ("+study_id+")")


                #After reading line add all info in dico project
                dico ={
                    'associated_project' : study_projects,
                    'title' : study_title,
                    'description' : study_description,
                    'experimental_design' : study_experimental_design,
                    'results' : study_results,
                    'study_type' : study_type 
                }
                studies[study_id] = dico

        # Check assay
        sh = wb.sheet_by_index(2)
        assays={}
        list_developmental_stage = ['Fetal','Embryonic','Larva','Neo-Natal','Juvenile','Pre-pubertal','Pubertal','Adulthood','Elderly','NA']
        list_generation = ['f0','f1','f2','f3','f4','f5','f6','f7','f8','f9','f10']
        list_experimental = ['in vivo','ex vivo','in vitro','other','NA']
        list_sex = ['Male','Female','Both','Other','NA']
        list_dose_unit = ['M','mM','µM','g/mL','mg/mL','µg/mL','ng/mL','mg/kg','µg/kg','µg/kg','ng/kg','%']
        list_exposure_duration_unit = ['week','day','hour','minute','seconde']
        list_exposition_factor = ['Chemical','Physical','Biological']
        list_signature_type = ['Physiological','Genomic','Molecular']
        list_observed_effect = ['Decrease','Increase','No effect','NA']
        for rownum in range(12, sh.nrows):
                row_values = sh.row_values(rownum)
                if row_values [1] == "" and row_values [2] == "" and row_values [3] =="" :
                    continue
                assay_id = row_values[0]
                assay_study = ""
                assay_title = ""
                assay_organism = ""
                assay_experimental_type = ""
                assay_developmental_stage = "" 
                assay_generation = ""
                assay_sex = ""
                assay_tissue = ""
                assay_cell = ""
                assay_cell_line = ""   
                assay_pop_age = ""
                assay_location = ""
                assay_reference = ""
                assay_matrice = "" 
                assay_additional_information = ""


                if row_values[1] != "":
                    if row_values[1] in studies:
                        assay_study = row_values[1]
                    else :
                        assay_error['Critical'].append("Studies doesn't exists ("+assay_id+")")
                        critical += 1
                else :
                    study_error['Critical'].append("No associated study ("+assay_id+")")
                    critical += 1

                if row_values[2] != "":
                    assay_title = row_values[2]
                else :
                    assay_error['Critical'].append("No study title ("+assay_id+")")
                    critical += 1

                if row_values[4] != "":
                    data = request.registry.db_mongo['species.tab'].find_one({'id': row_values[4]})
                    if data is None :
                        data =  'false'
                        if row_values[3] != "" :
                            data =  'ok'
                            assay_organism = row_values[3]
                    else :
                        data =  'true'
                    if data == 'true' :
                        assay_organism = row_values[4]
                    if data == 'false' :
                        assay_error['Critical'].append("Please select an organism in the TOXsIgN ontologies list ("+assay_id+")")
                else :
                    assay_error['Critical'].append("No organism selected ("+assay_id+")")
                    critical += 1

                if row_values[5] != "":
                    if row_values[5] in  list_developmental_stage :
                        assay_developmental_stage = row_values[5]
                    else :
                        assay_error['Warning'].append("Developmental stage not listed ("+assay_id+")")
                else :
                    assay_error['Info'].append("No developmental stage selected ("+assay_id+")")
                    

                if row_values[6] != "":
                    if row_values[6] in  list_generation :
                        assay_generation = row_values[6]
                    else :
                        assay_error['Warning'].append("Generation not listed ("+assay_id+")")
                else :
                    assay_error['Info'].append("No generation selected ("+assay_id+")")

                if row_values[7] != "":
                    if row_values[7] in  list_sex :
                        assay_sex = row_values[7]
                    else :
                        assay_error['Warning'].append("Sex not listed ("+assay_id+")")
                else :
                    assay_error['Info'].append("No sex selected ("+assay_id+")")

                if row_values[9] != "":
                    data = request.registry.db_mongo['tissue.tab'].find_one({'id': row_values[9]})
                    if data is None :
                        data =  'false'
                        if row_values[8] != "" :
                            data = 'ok'
                            assay_tissue = row_values[8]
                    else :
                        data = 'true'
                    if data == 'true' :
                        assay_tissue = row_values[9]
                    if data == 'false' :
                        if studies[assay_study]['study_type'] != "Observational":
                            assay_error['Warning'].append("Please select a tissue in the TOXsIgN ontologies list ("+assay_id+")")

                if row_values[11] != "":
                    data = request.registry.db_mongo['cell.tab'].find_one({'id': row_values[11]})
                    if data is None :
                        data =  'false'
                        if row_values[10] != "" :
                            data = 'ok'
                            assay_cell = row_values[10]
                    else :
                        data = 'true'
                    if data == 'true' :
                        assay_cell = row_values[11]
                    if data == 'false' :
                        assay_error['Warning'].append("Please select a cell in the TOXsIgN ontologies list ("+assay_id+")")


                if row_values[13] != "":
                    data = request.registry.db_mongo['cell_line.tab'].find_one({'id': row_values[13]})
                    if data is None :
                        data =  'false'
                        if row_values[12] != "" :
                            data = 'ok'
                            assay_cell_line = row_values[12]
                    else :
                        data = 'true'
                    if data == 'true' :
                        assay_cell_line = row_values[13]
                    if data == 'false' :
                        if studies[assay_study]['study_type'] != "Observational":
                            assay_error['Warning'].append("Please select a cell line in the TOXsIgN ontologies list ("+assay_id+")")

                # Check if at least tissue/cell or cell line are filled
                if assay_cell_line == "" and assay_cell == "" and assay_tissue =="" :
                    if studies[assay_study]['study_type'] != "Observational":
                        assay_error['Critical'].append("Please select at least a tissue, cell or cell line in the TOXsIgN ontologies list ("+assay_id+")")
                        critical += 1

                if row_values[14] != "":
                    if row_values[14] in  list_experimental :
                        assay_experimental_type = row_values[14]



                if studies[assay_study]['study_type'] =='Observational' :
                    if row_values[15] != "":
                        assay_pop_age = row_values[15]
                    else :
                        assay_error['Info'].append("No population age ("+assay_id+")")

                    if row_values[16] != "":
                        assay_location = row_values[16]
                    else :
                        assay_error['Info'].append("No geographical location ("+assay_id+")")

                    if row_values[17] != "":
                        assay_reference = row_values[17]
                    else :
                        assay_error['Info'].append("No controle / reference ("+assay_id+")")

                    if row_values[18] != "":
                        assay_matrice = row_values[18]
                    else :
                        assay_error['Info'].append("No matrice("+assay_id+")")

                if row_values[19] != "":
                    assay_additional_information = row_values[19]
                
                #After reading line add all info in dico project
                dico ={
                    'associated_studies' : assay_study,
                    'title' : assay_title,
                    'organism' : assay_organism,
                    'experimental_type' : assay_experimental_type,
                    'developmental_stage' : assay_developmental_stage,
                    'generation' : assay_generation,
                    'sex' : assay_sex,
                    'tissue' : assay_tissue,
                    'cell' : assay_cell,
                    'cell_line' : assay_cell_line,
                    'additional_information' : assay_additional_information
                }
                assays[assay_id] = dico


        # Check factor
        sh = wb.sheet_by_index(3)
        factors={}
        for rownum in range(5, sh.nrows):
                row_values = sh.row_values(rownum)
                if row_values [1] == "" and row_values [2] == "" and row_values [3] =="" and row_values [4] =="" and row_values [5] =="" :
                    continue
                factor_id = row_values[0]
                factor_type = ""
                factor_assay = ""
                factor_chemical = ""
                factor_physical = ""
                factor_biological = ""
                factor_route = ""
                factor_vehicle  = ""
                factor_dose = ""
                factor_dose_unit = ""
                factor_exposure_duration = ""
                factor_exposure_duration_unit = ""
                factor_exposure_frequecies = ""
                factor_additional_information = ""


                if row_values[1] != "":
                    if row_values[1] in assays:
                        factor_assay = row_values[1]
                    else :
                        factor_error['Critical'].append("Assay doesn't exists ("+factor_id+")")
                        critical += 1
                else :
                    factor_error['Critical'].append("No associated study ("+factor_id+")")
                    critical += 1

                if row_values[2] != "":
                    if row_values[2] in  list_exposition_factor :
                        factor_type = row_values[2]
                    else :
                        factor_error['Critical'].append("Exposition factor not listed ("+factor_id+")")
                        critical += 1
                else :
                    factor_error['Critical'].append("No exposition factor selected ("+factor_id+")")
                    critical += 1

                if row_values[4] != "":
                    data = request.registry.db_mongo['chemical.tab'].find_one({'id': row_values[4]})
                    if data is None :
                        data =  'false'
                        if row_values[3] != "":
                            data = 'ok'
                            factor_chemical = row_values[3]
                    else :
                        data = 'true'
                    if data == 'true' :
                        factor_chemical = row_values[4]
                    if data == 'false' :
                        factor_error['Warning'].append("Chemical not in the TOXsIgN ontologies list ("+factor_id+")")
                else :
                    assay_error['Warning'].append("No chemical selected ("+factor_id+")")

                if row_values[5] != "":
                    data = request.registry.db_mongo['chemical.tab'].find_one({'id': row_values[5]})
                    if data is None :
                        data =  'false'
                    else :
                        data = 'true'
                    if data == 'true' :
                        factor_physical = row_values[5]
                    if data == 'false' :
                        a =1
                        #factor_error['Warning'].append("Physical factor not in the TOXsIgN ontologies (not available yet) ("+factor_id+")")
                else :
                    a =1
                    #factor_error['Warning'].append("No physical factor selected (not available yet) ("+factor_id+")")

                if row_values[6] != "":
                    data = request.registry.db_mongo['chemical.tab'].find_one({'id': row_values[6]})
                    if data is None :
                        data =  'false'
                    else :
                        data = 'true'
                    if data == 'true' :
                        factor_biological = row_values[6]
                    if data == 'true' :
                        a=1
                        f#actor_error['Warning'].append("Biological factor notin the TOXsIgN ontologies (not available yet) ("+factor_id+")")
                else :
                    a=1
                    #factor_error['Warning'].append("No biological factor selected (not available yet) ("+factor_id+")")

                if row_values[7] != "":
                    factor_route = row_values[7]
                else :
                    factor_error['Info'].append("No route ("+factor_id+")")

                if row_values[8] != "":
                    factor_vehicle = row_values[8]
                else :
                    factor_error['Info'].append("No vehicle ("+factor_id+")")

                if row_values[9] != "":
                    factor_dose = row_values[9]
                else :
                    factor_error['Critical'].append("Factor dose required ("+factor_id+")")
                    critical += 1

                try :
                    if row_values[10] != "":
                        if str(row_values[10]) in list_dose_unit :
                            factor_dose_unit = str(row_values[10])
                        else :
                            factor_dose_unit = row_values[10]
                    else :
                        factor_error['Critical'].append("Factor dose unit required ("+factor_id+")")
                        critical += 1
                except :
                    factor_dose_unit = row_values[10]

                if row_values[11] != "":
                    factor_exposure_duration = row_values[11]
                else :
                    factor_error['Warning'].append("Factor exposure duration required ("+factor_id+")")
                    critical += 1

                if row_values[12] != "":
                    if row_values[12] in list_exposure_duration_unit :
                        factor_exposure_duration_unit = row_values[12]
                    else :
                        factor_exposure_duration_unit = row_values[12]
                else :
                    factor_error['Critical'].append("Factor dose unit required ("+factor_id+")")
                    critical += 1

                if row_values[13] != "":
                    factor_exposure_frequencies = row_values[13]
                
                if row_values[14] != "":
                    factor_additional_information = row_values[14]
              


                #After reading line add all info in dico project
                dico={
                'associated_assay' : factor_assay,
                'type' : factor_type,
                'chemical' : factor_chemical,
                'physical' : factor_physical,
                'biological' : factor_biological,
                'route' : factor_route,
                'vehicle' : factor_vehicle,
                'dose' : factor_dose,
                'dose_unit' : factor_dose_unit,
                'exposure_duration' : factor_exposure_duration,
                'exposure_duration_unit' : factor_exposure_duration_unit,
                'exposure_frequencies' : factor_exposure_frequecies,
                'additional_information' : factor_additional_information
                }
                factors[factor_id] = dico


        # Check signatures
        sh = wb.sheet_by_index(4)
        signatures={}
        for rownum in range(6, sh.nrows):
                row_values = sh.row_values(rownum)
                if row_values [1] == "" and row_values [2] == "" and row_values [3] =="" and row_values [4] =="" and row_values [5] =="" :
                    continue
                signature_id = row_values[0]
                signature_associated_study = ""
                signature_associated_assay = ""
                signature_title = ""
                signature_type = ""
                signature_organism = ""
                signature_developmental_stage = ""
                signature_generation = ""
                signature_sex = ""
                signature_tissue = ""
                signature_cell = "" 
                signature_cell_line = ""
                signature_molecule = ""
                signature_pathology = ""
                signature_technology = ""
                signature_plateform = ""
                signature_observed_effect = ""
                signature_control_sample = ""
                signature_treated_sample = ""
                signature_pvalue = ""
                signature_cutoff = "" 
                signature_satistical_processing = ""
                signature_additional_file = ""
                signature_file_up = "" 
                signature_file_down = ""
                signature_file_interrogated= ""
                signature_study_type= ""
                signature_genes_identifier = ""
                signature_description = ""

                signature_controle = ""
                signature_case = ""
                signature_significance = ""
                signature_stat_value = ""
                signature_stat_adjust = ""
                signature_stat_other = ""
                signature_group = ""
                signature_pop_age = ""

                if row_values[1] != "":
                    if row_values[1] in studies:
                        signature_associated_study = row_values[1]
                    else :
                        signature_error['Critical'].append("Study doesn't exists ("+signature_id+")")
                        critical += 1
                else :
                    signature_error['Critical'].append("No associated study ("+signature_id+")")
                    critical += 1

                if row_values[2] != "":
                    if row_values[2] in assays:
                        signature_associated_assay = row_values[2]
                    else :
                        signature_error['Critical'].append("Assay doesn't exists ("+signature_id+")")
                        critical += 1
                else :
                    signature_error['Critical'].append("No associated assay ("+signature_id+")")
                    critical += 1

                if row_values[3] != "":
                    signature_title = row_values[3]
                else :
                    signature_error['Critical'].append("No signature title ("+signature_id+")")
                    critical += 1

                if row_values[4] != "":
                    if row_values[4] in list_signature_type : 
                        signature_type = row_values[4]
                    else :
                        signature_error['Critical'].append("Signature title not in the list ("+signature_id+")")
                        critical += 1
                else :
                    signature_error['Critical'].append("No type of signature ("+signature_id+")")
                    critical += 1

                if row_values[6] != "":
                    data = request.registry.db_mongo['species.tab'].find_one({'id': row_values[6]})
                    if data is None :
                        data =  'false'
                        if row_values[5] != "":
                            data = 'ok'
                            signature_organism = row_values[5]
                    else :
                        data = 'true'
                    if data == 'true' :
                        signature_organism = row_values[6]
                    if data == 'false' :
                        signature_error['Critical'].append("Please select an organism in the TOXsIgN ontologies list ("+signature_id+")")
                else :
                    signature_error['Critical'].append("No organism selected ("+signature_id+")")
                    critical += 1

                if row_values[7] != "":
                    if row_values[7] in  list_developmental_stage :
                        signature_developmental_stage = row_values[7]
                    else :
                        signature_error['Warning'].append("Developmental stage not listed ("+signature_id+")")
                else :
                    signature_error['Info'].append("No developmental stage selected ("+signature_id+")")
                    

                if row_values[8] != "":
                    if row_values[8] in  list_generation :
                        signature_generation = row_values[8]
                    else :
                        signature_error['Warning'].append("Generation not listed ("+signature_id+")")
                else :
                    signature_error['Info'].append("No generation selected ("+signature_id+")")

                if row_values[9] != "":
                    if row_values[9] in  list_sex :
                        signature_sex = row_values[9]
                    else :
                        signature_error['Warning'].append("Sex not listed ("+signature_id+")")
                else :
                    signature_error['Info'].append("No sex selected ("+signature_id+")")

                if row_values[11] != "":
                    data = request.registry.db_mongo['tissue.tab'].find_one({'id': row_values[11]})
                    if data is None :
                        data =  'false'
                        if row_values[10] != "":
                            data = 'ok'
                            signature_tissue = row_values[10]
                    else :
                        data = 'true'
                    if data == 'true' :
                        signature_tissue = row_values[11]
                    if data == 'false' :
                        if studies[signature_associated_study]['study_type'] != 'Observational' :
                            signature_error['Warning'].append("Please select a tissue in the TOXsIgN ontologies list ("+signature_id+")")

                if row_values[13] != "":
                    data = request.registry.db_mongo['cell.tab'].find_one({'id': row_values[13]})
                    if data is None :
                        data =  'false'
                        if row_values[12] != "":
                            data = 'ok'
                            signature_cell = row_values[12]
                    else :
                        data = 'true'
                    if data == 'true' :
                        signature_cell = row_values[13]
                    if data == 'false' :
                        if studies[signature_associated_study]['study_type'] != 'Observational' :
                            signature_error['Warning'].append("Please select a cell in the TOXsIgN ontologies list ("+signature_id+")")


                if row_values[15] != "":
                    data = request.registry.db_mongo['cell_line.tab'].find_one({'id': row_values[15]})
                    if data is None :
                        data =  'false'
                        if row_values[14] != "":
                            data = 'ok'
                            signature_cell_line = row_values[14]
                    else :
                        data = 'true'
                    if data == 'true' :
                        signature_cell_line = row_values[15]
                    if data == 'false' :
                        if studies[signature_associated_study]['study_type'] != 'Observational' :
                            signature_error['Warning'].append("Please select a cell line in the TOXsIgN ontologies list ("+signature_id+")")

                # Check if at least tissue/cell or cell line are filled
                if signature_cell_line == "" and signature_cell == "" and signature_tissue =="" :
                    if studies[signature_associated_study]['study_type'] != 'Observational' :
                        signature_error['Critical'].append("Please select at least a tissue, cell or cell line in the TOXsIgN ontologies list ("+signature_id+")")
                        critical += 1

                if row_values[17] != "":
                    data = request.registry.db_mongo['chemical.tab'].find_one({'id': row_values[17]})
                    if data is None :
                        data =  'false'
                        if row_values[16] != "":
                            data = "ok"
                            signature_cell_line = row_values[16]
                    else :
                        data = 'true'
                    if data == 'true' :
                        signature_molecule = row_values[17]
                    if data == 'false' :
                        signature_error['Warning'].append("Molecule not in TOXsIgN ontology ("+signature_id+")")

                if row_values[18] != "":
                    signature_description = row_values[18]

                if row_values[19] != "":
                    data = request.registry.db_mongo['disease.tab'].find_one({'id': row_values[19]})
                    if data is None :
                        data =  'false'
                    else :
                        data = 'true'
                    if data == 'true' :
                        signature_pathology = row_values[19]
                    if data == 'false' :
                        signature_error['Warning'].append("Pathology / disease not in TOXsIgN ontology ("+signature_id+")")

                if row_values[21] != "":
                    data = request.registry.db_mongo['experiment.tab'].find_one({'id': row_values[21]})
                    if data is None :
                        data =  'false'
                        if row_values[20] != "":
                            data = 'ok'
                            signature_technology = row_values[20]
                    else :
                        data = 'true'
                    if data == 'true' :
                        signature_technology = row_values[21]
                    if data == 'false' :
                        if signature_type == "Genomic":
                            signature_error['Warning'].append("Technology not in TOXsIgN ontology ("+signature_id+")")
                else :
                    if signature_type == "Genomic":
                        signature_error['Warning'].append("No technology selected ("+signature_id+")")

                if row_values[22] != "":
                    signature_plateform = row_values[22]
                else :
                    if signature_type == "Genomic":
                        signature_error['Info'].append("No plateform selected ("+signature_id+")")

                if row_values[23] != "":
                    signature_controle = row_values[23]
                else :
                    if studies[signature_associated_study]['study_type'] == 'Observational':
                        signature_error['Info'].append("No controle ("+signature_id+")")

                if row_values[24] != "":
                    signature_case = row_values[24]
                else :
                    if studies[signature_associated_study]['study_type'] == 'Observational' :
                        signature_error['Info'].append("No case ("+signature_id+")")

                if row_values[25] != "":
                    signature_group = row_values[25]
                else :
                    if studies[signature_associated_study]['study_type'] == 'Observational' :
                        signature_error['Info'].append("No group ("+signature_id+")")

                if row_values[26] != "":
                    signature_group = row_values[26]
                else :
                    if studies[signature_associated_study]['study_type'] == 'Observational' :
                        signature_error['Info'].append("No population age ("+signature_id+")")



                if row_values[27] != "":
                    if row_values[27] in  list_observed_effect :
                        signature_observed_effect= row_values[27]
                    else :
                        signature_error['Warning'].append("Observed effect not listed ("+signature_id+")")

                else :
                    signature_error['Warning'].append("No observed effect selected ("+signature_id+")")

                if row_values[28] != "":
                    signature_significance = row_values[28]
                else :
                    if studies[signature_associated_study]['study_type'] == 'Observational' :
                        signature_error['Info'].append("No statistical significance ("+signature_id+")")

                if row_values[29] != "":
                    signature_stat_value = row_values[29]
                else :
                    if studies[signature_associated_study]['study_type'] == 'Observational' :
                        signature_error['Info'].append("No statistical value ("+signature_id+")")

                if row_values[30] != "":
                    signature_stat_adjust = row_values[30]
                else :
                    if studies[signature_associated_study]['study_type'] == 'Observational' :
                        signature_error['Info'].append("No statistical adjustment ("+signature_id+")")

                if row_values[31] != "":
                    signature_stat_other = row_values[31]
                else :
                    if studies[signature_associated_study]['study_type'] == 'Observational' :
                        signature_error['Info'].append("No statistical information ("+signature_id+")")




                if row_values[32] != "":
                    signature_control_sample = row_values[32]
                else :
                    if studies[signature_associated_study]['study_type'] != 'Observational' :
                        signature_error['Info'].append("No control sample ("+signature_id+")")

                if row_values[33] != "":
                    signature_treated_sample = row_values[33]
                else :
                    if studies[signature_associated_study]['study_type'] != 'Observational' :
                        signature_error['Info'].append("No treated sample ("+signature_id+")")

                if row_values[34] != "":
                    signature_pvalue = row_values[34]
                else :
                    if studies[signature_associated_study]['study_type'] != 'Observational' :
                        signature_error['Info'].append("No pvalue ("+signature_id+")")

                if row_values[35] != "":
                    signature_cutoff = row_values[36]
                else :
                    if studies[signature_associated_study]['study_type'] != 'Observational' :
                        signature_error['Info'].append("No cutoff ("+signature_id+")")

                if row_values[36] != "":
                    signature_satistical_processing = row_values[36]
                else :
                    if studies[signature_associated_study]['study_type'] != 'Observational' :
                        signature_error['Info'].append("No statistical processing ("+signature_id+")")

                if row_values[37] != "":
                    signature_additional_file = row_values[37]

                if row_values[38] != "":
                    signature_file_up = row_values[38]
                else :
                    if signature_type == "Genomic":
                        signature_error['Critical'].append("No signature file (up genes) ("+signature_id+")")
                        critical += 1

                if row_values[39] != "":
                    signature_file_down = row_values[39]
                else :
                    if signature_type == "Genomic":
                        signature_error['Critical'].append("No signature file (down genes) ("+signature_id+")")
                        critical +=1

                if row_values[40] != "":
                    signature_file_interrogated = row_values[40]
                else :
                    if signature_type == "Genomic":
                        signature_error['Critical'].append("No signature file (interrogated genes) ("+signature_id+")")
                        critical += 1

                if row_values[41] != "":
                    signature_genes_identifier = row_values[41]
                else :
                    if signature_type == "Genomic":
                        signature_error['Info'].append("No gene identifier selected ("+signature_id+")")
                        critical += 1


                
                signature_study_type = studies[signature_associated_study]
                #After reading line add all info in dico project
                dico={
                    'associated_study' : signature_associated_study,
                    'associated_assay' : signature_associated_assay,
                    'title' : signature_title,
                    'type' : signature_type,
                    'organism' : signature_organism,
                    'developmental_stage' : signature_developmental_stage,
                    'generation' : signature_generation,
                    'sex' : signature_sex,
                    'tissue' : signature_tissue,
                    'cell' : signature_cell,
                    'cell_line' : signature_cell_line,
                    'molecule' : signature_molecule,
                    'pathology' : signature_pathology,
                    'technology' : signature_technology,
                    'plateform' : signature_plateform,
                    'observed_effect' : signature_observed_effect,
                    'control_sample' : signature_control_sample,
                    'treated_sample' : signature_treated_sample,
                    'pvalue' : signature_pvalue,
                    'cutoff' : signature_cutoff,
                    'satistical_processing' : signature_satistical_processing,
                    'additional_file' : signature_additional_file,
                    'file_up' : signature_file_up,
                    'file_down' : signature_file_down,
                    'genes_up' : "",
                    'genes_down' : ""
                }
                signatures[signature_id] = dico
        


        # Iterate through each row in worksheet and fetch values into dict

        return {'msg':"File checked and uploded !", 'error_project':project_error, 'error_study':study_error, 'error_assay':assay_error, 'error_factor':factor_error, 'error_signature':signature_error, 'critical':str(critical),'file': os.path.join(upload_path, tmp_file_name),'status':'0' }
    except:
        logger.warning("Error - Read excel file")
        logger.warning(sys.exc_info())
        return {'msg':'An error occurred while saving your file. If the error persists please contact TOXsIgN support ','status':'1'}
    








@view_config(route_name='project_up', renderer='json', request_method='POST')
def save_excel(request):
    session_user = is_authenticated(request)
    if session_user is None:
        return 'HTTPForbidden()'

    input_file = None
    form = json.loads(request.body, encoding=request.charset)
    user = form['uid']
  
    try:
        input_file = form['file']
    except Exception:
        return HTTPForbidden('no input file')

    print 'write file into : '+input_file

    #Create error list
    
    asso_id = {}
    reverse_asso = {}

    #Read excel file
    wb = xlrd.open_workbook(input_file,encoding_override="cp1251")
    #Read project
    sh = wb.sheet_by_index(0)
    projects={}
    critical = 0
    dt = datetime.datetime.utcnow()
    sdt = time.mktime(dt.timetuple())

    try :
        for rownum in range(5, sh.nrows):
                row_values = sh.row_values(rownum)
                if row_values [1] == "" and row_values [2] == "" and row_values [3] =="" :
                    continue
                project_error = {'Critical':[],'Warning':[],'Info':[]}

                project_id = row_values[0]
                project_title = ""
                project_description = ""
                project_pubmed = ""
                project_contributors=""
                project_crosslink = ""

                if row_values[1] != "":
                    project_title = row_values[1]
                else :
                    project_error['Critical'].append("No project title ("+project_id+")")
                    critical += 1

                if row_values[2] != "":
                    project_description = row_values[2]
                else :
                    project_error['Warning'].append("No project description ("+project_id+")")

                if row_values[3] != "" :
                    if ';' in str(row_values[3]) or '|' in str(row_values[3]):
                        project_error['Critical'].append("Use comma to separate your pubmed ids ("+project_id+")")
                        critical += 1
                    else :
                        project_pubmed = str(row_values[3])
                else :
                    project_error['Info'].append("No associated pubmed Id(s)")

                if row_values[4] != "" :
                    if ';' in row_values[4] or '|' in row_values[4]:
                        project_error['Critical'].append("Use comma to separate your contributors ("+project_id+")")
                        critical += 1
                    else :
                        project_contributors = row_values[4]
                else :
                    project_error['Info'].append("No associated contributors ("+project_id+")")

                if row_values[5] != "" :
                    if ';' in row_values[5] or '|' in row_values[5]:
                        project_error['Critical'].append("Use comma to separate your links ("+project_id+")")
                        critical += 1
                    else :
                        project_crosslink = row_values[5]
                else :
                    project_error['Info'].append("No cross link(s) ("+project_id+")")


                #After reading line add all info in dico project
                request.registry.db_mongo['project'].update({'id': 1}, {'$inc': {'val': 1}})
                repos = request.registry.db_mongo['project'].find({'id': 1})
                id_p = ""
                for res in repos:
                    id_p = res

                #Excel id -> databas id
                asso_id[project_id] = 'TSP'+str(id_p['val'])
                reverse_asso[asso_id[project_id]] = project_id

                dico={
                    'id' : asso_id[project_id],
                    'title' : project_title,
                    'description' : project_description,
                    'pubmed' : project_pubmed,
                    'contributor' : project_contributors,
                    'assays' : "",
                    'cross_link' : project_crosslink,
                    'studies' : "",
                    'factors' : "",
                    'signatures' :"",
                    'last_update' : str(sdt),
                    'submission_date' : str(sdt),
                    'status' : 'private' ,
                    'owner' : user,
                    'author' : user ,
                    'tags' : "",
                    'edges' : "",
                    'info' : ','.join(project_error['Info']),
                    'warnings' : ','.join(project_error['Warning']),
                    'critical' : ','.join(project_error['Critical']),
                    'excel_id' : project_id
                }
                projects[project_id] = dico

        # Check studies
        sh = wb.sheet_by_index(1)
        studies={}
        for rownum in range(6, sh.nrows):
                row_values = sh.row_values(rownum)
                if row_values [1] == "" and row_values [2] == "" and row_values [3] =="" :
                    continue
                study_error = {'Critical':[],'Warning':[],'Info':[]}

                study_id = row_values[0]
                study_projects = ""
                study_title = ""
                study_description=""
                study_experimental_design=""
                study_results=""
                study_type = ""
                study_inclusion_periode = ""
                study_inclusion = ""
                study_exclusion = ""
                study_followup = ""
                study_pubmed = ""
                study_pop_size = ""
                study_pubmed = ""

                if row_values[1] != "":
                    if row_values[1] in projects:
                        study_projects = row_values[1]
                    else :
                        study_error['Critical'].append("Project doesn't exists ("+study_id+")")
                        critical += 1
                else :
                    study_error['Critical'].append("No associated project ("+study_id+")")
                    critical += 1

                if row_values[2] != "":
                    study_title = row_values[2]
                else :
                    study_error['Critical'].append("No study title ("+study_id+")")
                    critical += 1

                if row_values[3] != "":
                    study_description = row_values[3]
                else :
                    study_error['Warning'].append("No study description ("+study_id+")")

                if row_values[4] != "":
                    study_experimental_design = row_values[4]
                else :
                    study_error['Warning'].append("No experimental design description ("+study_id+")")

                if row_values[5] != "":
                    study_results = row_values[5]
                else :
                    study_error['Info'].append("No study results ("+study_id+")")

                if row_values[6] != "":
                    if row_values[6] == 'Interventional' or row_values[6] == 'Observational' :
                        study_type = row_values[6]
                    else :
                        study_error['Critical'].append("Study type not available ("+study_id+")")
                        critical += 1
                else :
                    study_error['Critical'].append("No study type selected ("+study_id+")")
                    critical += 1

                if study_type == "Observational" :
                    if row_values[7] != "":
                        study_inclusion_periode = row_values[7]
                    else :
                        study_error['Warning'].append("No inclusion period ("+study_id+")")

                    if row_values[8] != "":
                        study_inclusion = row_values[8]
                    else :
                        study_error['Warning'].append("No inclusion criteria ("+study_id+")")

                    if row_values[9] != "":
                        study_exclusion = row_values[9]
                    else :
                        study_error['Warning'].append("No exclusion criteria ("+study_id+")")

                    if row_values[10] != "":
                        study_followup = row_values[10]
                    else :
                        study_error['Warning'].append("No follow up ("+study_id+")")

                    if row_values[11] != "":
                        study_pop_size = row_values[11]
                    else :
                        study_error['Warning'].append("No population size ("+study_id+")")

                    if row_values[12] != "":
                        study_pubmed = row_values[12]
                    else :
                        study_error['Info'].append("No pubmed ("+study_id+")")


                #After reading line add all info in dico project
                request.registry.db_mongo['study'].update({'id': 1}, {'$inc': {'val': 1}})
                repos = request.registry.db_mongo['study'].find({'id': 1})
                id_s = ""
                for res in repos:
                    id_s = res
                
                #Excel id -> databas id
                asso_id[study_id] = 'TSE'+str(id_s['val'])
                reverse_asso[asso_id[study_id]] = study_id

                #Add studies id to associated project
                p_stud = projects[study_projects]['studies'].split()
                p_stud.append(asso_id[study_id])
                projects[study_projects]['studies'] = ','.join(p_stud)

                dico={
                    'id' : asso_id[study_id],
                    'owner' : user,
                    'projects' : asso_id[study_projects],
                    'assays' : "",
                    'factors' : "",
                    'signatures' : "",
                    'title' : study_title,
                    'description' : study_description,
                    'experimental_design' : study_experimental_design,
                    'results' : study_results,
                    'study_type' : study_type,
                    'last_update' : str(sdt),
                    'inclusion_period': study_inclusion_periode,
                    'inclusion': study_inclusion,
                    'status' : 'private',
                    'followup': study_followup,
                    'exclusion' : study_exclusion,
                    'pop_size' : study_pop_size,
                    'pubmed' : study_pubmed,
                    'tags' : "",
                    'info' : ','.join(study_error['Info']),
                    'warnings' : ','.join(study_error['Warning']),
                    'critical' : ','.join(study_error['Critical']),
                    'excel_id' : study_id
                }      
                studies[study_id]=dico

        # List of TOXsIgN 'ontologies'
        list_developmental_stage = ['Fetal','Embryonic','Larva','Neo-Natal','Juvenile','Pre-pubertal','Pubertal','Adulthood','Elderly','NA']
        list_generation = ['f0','f1','f2','f3','f4','f5','f6','f7','f8','f9','f10']
        list_experimental = ['in vivo','ex vivo','in vitro','other','NA']
        list_sex = ['Male','Female','Both','Other','NA']
        list_dose_unit = ['M','mM','µM','g/mL','mg/mL','µg/mL','ng/mL','mg/kg','µg/kg','µg/kg','ng/kg','%']
        list_exposure_duration_unit = ['week','day','hour','minute','seconde']
        list_exposition_factor = ['Chemical','Physical','Biological']
        list_signature_type = ['Physiological','Genomic','Molecular']
        list_observed_effect = ['Decrease','Increase','No effect','NA']
        

        # Check assay
        sh = wb.sheet_by_index(2)
        assays={}
        for rownum in range(12, sh.nrows):
                row_values = sh.row_values(rownum)
                if row_values [1] == "" and row_values [2] == "" and row_values [3] =="" :
                    continue
                assay_error = {'Critical':[],'Warning':[],'Info':[]}

                assay_id = row_values[0]
                assay_study = ""
                assay_title = ""
                assay_organism = ""
                assay_organism_name = ""
                assay_experimental_type = ""
                assay_developmental_stage = "" 
                assay_generation = ""
                assay_sex = ""
                assay_tissue = ""
                assay_tissue_name = ""
                assay_cell = ""
                assay_cell_name = ""
                assay_cell_line = ""
                assay_cell_line_name = ""   
                assay_additional_information = "" 
                tag = [] 
                assay_pop_age = ""
                assay_location = ""
                assay_reference = ""
                assay_matrice = "" 


                if row_values[1] != "":
                    if row_values[1] in studies:
                        assay_study = row_values[1]
                    else :
                        assay_error['Critical'].append("Studies doesn't exists ("+assay_id+")")
                        critical += 1
                else :
                    study_error['Critical'].append("No associated study ("+assay_id+")")
                    critical += 1

                if row_values[2] != "":
                    assay_title = row_values[2]
                else :
                    assay_error['Critical'].append("No study title ("+assay_id+")")
                    critical += 1

                if row_values[4] != "":
                    data = request.registry.db_mongo['species.tab'].find_one({'id': row_values[4]})
                    if data is None :
                        if row_values[3] == "" :
                            assay_organism = ""
                            assay_error['Critical'].append("Please select an organism in the TOXsIgN ontologies list ("+assay_id+")")
                            critical += 1
                        else :
                            assay_organism_name = row_values[3]
                            tag.append(row_values[3])
                    else :
                        assay_organism = data['name']
                        tag.append(data['name'])
                        tag.append(data['id'])
                        tag.extend(data['synonyms'])
                        tag.extend(data['direct_parent'])
                        tag.extend(data['all_parent'])
                        tag.extend(data['all_name'])
                        if row_values[3] != "" :
                            assay_organism_name = row_values[3]
                            tag.append(row_values[3])
                else :
                    assay_error['Critical'].append("No organism selected ("+assay_id+")")
                    critical += 1

                if row_values[5] != "":
                    if row_values[5] in  list_developmental_stage :
                        assay_developmental_stage = row_values[5]
                    else :
                        assay_error['Warning'].append("Developmental stage not listed ("+assay_id+")")
                else :
                    assay_error['Info'].append("No developmental stage selected ("+assay_id+")")
                    

                if row_values[6] != "":
                    if row_values[6] in  list_generation :
                        assay_generation = row_values[6]
                    else :
                        assay_error['Warning'].append("Generation not listed ("+assay_id+")")
                else :
                    assay_error['Info'].append("No generation selected ("+assay_id+")")

                if row_values[7] != "":
                    if row_values[7] in  list_sex :
                        assay_sex = row_values[7]
                    else :
                        assay_error['Warning'].append("Sex not listed ("+assay_id+")")
                else :
                    assay_error['Info'].append("No sex selected ("+assay_id+")")

                if row_values[9] != "":
                    data = request.registry.db_mongo['tissue.tab'].find_one({'id': row_values[9]})
                    if data is None :
                        if row_values[8] != "":
                            assay_tissue_name = row_values[8]
                            tag.append(assay_tissue_name)
                        else :
                            assay_tissue = ""
                            assay_error['Warning'].append("Please select a tissue in the TOXsIgN ontologies list ("+assay_id+")")
                    else :
                        assay_tissue = data['name']
                        tag.append(data['name'])
                        tag.append(data['id'])
                        tag.extend(data['synonyms'])
                        tag.extend(data['direct_parent'])
                        tag.extend(data['all_parent'])
                        tag.extend(data['all_name'])
                        if row_values[8] != "":
                            assay_tissue_name = row_values[8]
                            tag.append(assay_tissue_name)

                if row_values[11] != "":
                    data = request.registry.db_mongo['cell.tab'].find_one({'id': row_values[11]})
                    if data is None :
                        if row_values[10] != "":
                            assay_cell_name = row_values[10]
                            tag.append(assay_cell_name)
                        else :
                            assay_cell = ""
                            assay_error['Warning'].append("Please select a cell in the TOXsIgN ontologies list ("+assay_id+")")
                    else :
                        assay_cell = data['name']
                        tag.append(data['name'])
                        tag.append(data['id'])
                        tag.extend(data['synonyms'])
                        tag.extend(data['direct_parent'])
                        tag.extend(data['all_parent'])
                        tag.extend(data['all_name'])
                        if row_values[10] != "":
                            assay_cell_name = row_values[10]
                            tag.append(assay_cell_name)



                if row_values[13] != "":
                    data = request.registry.db_mongo['cell_line.tab'].find_one({'id': row_values[13]})
                    if data is None :
                        if row_values[12] != "":
                            assay_cell_line_name = row_values[12]
                            tag.append(assay_cell_line_name)
                        else :
                            assay_cell_line = ""
                            assay_error['Warning'].append("Please select a cell line in the TOXsIgN ontologies list ("+assay_id+")")
                    else :
                        assay_cell_line = data['name']
                        tag.append(data['name'])
                        tag.append(data['id'])
                        tag.extend(data['synonyms'])
                        tag.extend(data['direct_parent'])
                        tag.extend(data['all_parent'])
                        tag.extend(data['all_name'])
                        if row_values[12] != "":
                            assay_cell_line_name = row_values[12]
                            tag.append(assay_cell_line_name)

                # Check if at least tissue/cell or cell line are filled
                if assay_cell_line == "" and assay_cell == "" and assay_tissue =="" :
                    if studies[assay_study]['study_type'] !='Observational' :
                        assay_error['Critical'].append("Please select at least a tissue, cell or cell line in the TOXsIgN ontologies list ("+assay_id+")")
                        critical += 1

                if row_values[14] != "":
                    if row_values[14] in  list_experimental :
                        assay_experimental_type = row_values[14]


                if studies[assay_study]['study_type'] =='Observational' :
                    if row_values[15] != "":
                        assay_pop_age = row_values[15]
                    else :
                        assay_error['Info'].append("No population age ("+assay_id+")")

                    if row_values[16] != "":
                        assay_location = row_values[16]
                    else :
                        assay_error['Info'].append("No geographical location ("+assay_id+")")

                    if row_values[17] != "":
                        assay_reference = row_values[17]
                    else :
                        assay_error['Info'].append("No controle / reference ("+assay_id+")")

                    if row_values[18] != "":
                        assay_matrice = row_values[18]
                    else :
                        assay_error['Info'].append("No matrice("+assay_id+")")

                if row_values[19] != "":
                    assay_additional_information = row_values[19]

                #After reading line add all info in dico project
                request.registry.db_mongo['assay'].update({'id': 1}, {'$inc': {'val': 1}})
                repos = request.registry.db_mongo['assay'].find({'id': 1})
                id_a = ""
                for res in repos:
                    id_a = res
                
                #Excel id -> databas id
                asso_id[assay_id] = 'TSA'+str(id_a['val'])
                reverse_asso[asso_id[assay_id]] = assay_id

                #Add assay id to associated study
                s_assay = studies[assay_study]['assays'].split()
                s_assay.append(asso_id[assay_id])
                studies[assay_study]['assays'] = ','.join(s_assay)

                #Add assay to the associated project
                project_asso = reverse_asso[studies[assay_study]['projects']]

                p_assay = projects[project_asso]['assays'].split()
                p_assay.append(asso_id[assay_id])
                projects[project_asso]['assays'] = ','.join(p_assay)

                #After reading line add all info in dico project
                dico={
                    'id' : asso_id[assay_id] ,
                    'studies' : asso_id[assay_study],
                    'factors' : "",
                    'signatures' : "",
                    'projects' : studies[assay_study]['projects'],
                    'title' : assay_title,
                    'organism' : assay_organism,
                    'organism_name' : assay_organism_name,
                    'experimental_type' : assay_experimental_type,
                    'developmental_stage' : assay_developmental_stage,
                    'generation' : assay_generation,
                    'sex' : assay_sex,
                    'tissue' : assay_tissue,
                    'tissue_name' : assay_tissue_name,
                    'cell' : assay_cell,
                    'cell_name' : assay_cell_name,
                    'status' : 'private',
                    'last_update' : str(sdt),
                    'cell_line' : assay_cell_line,
                    'cell_line_name' : assay_cell_line_name,
                    'additional_information' : assay_additional_information,
                    'population_age' : assay_pop_age,
                    'geographical_location':assay_location,
                    'reference':assay_reference,
                    'matrice':assay_matrice,
                    'tags' : ','.join(tag),
                    'owner' : user,
                    'info' : ','.join(assay_error['Info']),
                    'warnings' : ','.join(assay_error['Warning']),
                    'critical' : ','.join(assay_error['Critical']),
                    'excel_id' : assay_id
                }
                assays[assay_id] = dico

        # Check factor
        sh = wb.sheet_by_index(3)
        factors={}
        for rownum in range(5, sh.nrows):
                row_values = sh.row_values(rownum)
                if row_values [1] == "" and row_values [2] == "" and row_values [3] =="" and row_values [4] =="" and row_values [5] =="" :
                    continue

                factor_error = {'Critical':[],'Warning':[],'Info':[]}
        
                factor_id = row_values[0]
                factor_type = ""
                factor_assay = ""
                factor_chemical = ""
                factor_chemical_name = ""
                factor_physical = ""
                factor_biological = ""
                factor_route = ""
                factor_vehicle  = ""
                factor_dose = ""
                factor_dose_unit = ""
                factor_exposure_duration = ""
                factor_exposure_duration_unit = ""
                factor_exposure_frequecies = ""
                factor_additional_information = ""
                tag = []


                if row_values[1] != "":
                    if row_values[1] in assays:
                        factor_assay = row_values[1]
                    else :
                        factor_error['Critical'].append("Assay doesn't exists ("+factor_id+")")
                        critical += 1
                else :
                    factor_error['Critical'].append("No associated study ("+factor_id+")")
                    critical += 1

                if row_values[2] != "":
                    if row_values[2] in  list_exposition_factor :
                        factor_type = row_values[2]
                    else :
                        factor_error['Critical'].append("Exposition factor not listed ("+factor_id+")")
                        critical += 1
                else :
                    factor_error['Critical'].append("No exposition factor selected ("+factor_id+")")
                    critical += 1

                if row_values[4] != "":
                    data = request.registry.db_mongo['chemical.tab'].find_one({'id': row_values[4]})
                    if data is None :
                        if row_values[3] != "":
                            factor_chemical_name = row_values[3]
                            tag.append(factor_chemical_name)
                        else :
                            factor_chemical = ""
                            factor_error['Warning'].append("Chemical not in the TOXsIgN ontologies list ("+factor_id+")")
                    else :
                        factor_chemical = data['name']
                        tag.append(data['name'])
                        tag.append(data['id'])
                        tag.extend(data['synonyms'])
                        tag.extend(data['direct_parent'])
                        tag.extend(data['all_parent'])
                        tag.extend(data['all_name'])
                        if row_values[3] != "":
                            factor_chemical_name = row_values[3]
                            tag.append(factor_chemical_name)      
                else :
                    assay_error['Warning'].append("No chemical selected ("+factor_id+")")

                if row_values[5] != "":
                    data = request.registry.db_mongo['chemical.tab'].find_one({'id': row_values[5]})
                    if data is None :
                        data =  'false'
                    else :
                        data = 'true'
                    if data == 'true' :
                        factor_physical = row_values[5]
                    else :
                        a =1
                        #factor_error['Warning'].append("Physical factor not in the TOXsIgN ontologies (not available yet) ("+factor_id+")")
                else :
                    a =1
                    #factor_error['Warning'].append("No physical factor selected (not available yet) ("+factor_id+")")

                if row_values[6] != "":
                    data = request.registry.db_mongo['chemical.tab'].find_one({'id': row_values[6]})
                    if data is None :
                        data =  'false'
                    else :
                        data = 'true'
                    if data == 'true' :
                        factor_biological = row_values[6]
                    else :
                        a=1
                        f#actor_error['Warning'].append("Biological factor notin the TOXsIgN ontologies (not available yet) ("+factor_id+")")
                else :
                    a=1
                    #factor_error['Warning'].append("No biological factor selected (not available yet) ("+factor_id+")")

                if row_values[7] != "":
                    factor_route = row_values[7]
                else :
                    factor_error['Info'].append("No route ("+factor_id+")")

                if row_values[8] != "":
                    factor_vehicle = row_values[8]
                else :
                    factor_error['Info'].append("No vehicle ("+factor_id+")")

                if row_values[9] != "":
                    factor_dose = row_values[9]
                else :
                    factor_error['Critical'].append("Factor dose required ("+factor_id+")")
                    critical += 1
                try :
                    if row_values[10] != "":
                        if str(row_values[10]) in list_dose_unit :
                            factor_dose_unit = str(row_values[10])
                        else :
                            factor_dose_unit = row_values[10]
                except:
                    factor_dose_unit = row_values[10]

                if row_values[11] != "":
                    factor_exposure_duration = row_values[11]
                else :
                    factor_error['Critical'].append("Factor exposure duration required ("+factor_id+")")
                    critical += 1

                if row_values[12] != "":
                    if row_values[12] in list_exposure_duration_unit :
                        factor_exposure_duration_unit = row_values[12]
                    else :
                        factor_exposure_duration_unit = row_values[12]

                if row_values[13] != "":
                    factor_exposure_frequecies = row_values[13]

                if row_values[14] != "":
                    factor_additional_information = row_values[14]
        


                #After reading line add all info in dico project
                request.registry.db_mongo['factor'].update({'id': 1}, {'$inc': {'val': 1}})
                repos = request.registry.db_mongo['factor'].find({'id': 1})
                id_a = ""
                for res in repos:
                    id_f = res
                
                #Excel id -> databas id
                asso_id[factor_id] = 'TSF'+str(id_f['val'])
                reverse_asso[asso_id[factor_id]] = factor_id

                #Add factor id to associated assay
                a_factor = assays[factor_assay]['factors'].split()
                a_factor.append(asso_id[factor_id])
                assays[factor_assay]['factors'] = ','.join(a_factor)

                #Add factor to the associated study
                study_asso = reverse_asso[assays[factor_assay]['studies']]

                s_factor = studies[study_asso]['factors'].split()
                s_factor.append(asso_id[factor_id])
                studies[study_asso]['factors'] = ','.join(s_factor)

                #Add factor to the associated project
                project_asso = reverse_asso[assays[factor_assay]['projects']]

                p_factor = projects[project_asso]['factors'].split()
                p_factor.append(asso_id[factor_id])
                projects[project_asso]['factors'] = ','.join(p_factor)

                #up factor tags to associated assy 
                tag_assay = assays[factor_assay]['tags'].split(',')
                tag_assay.extend(tag)
                assays[factor_assay]['tags'] = ','.join(tag_assay)

                #After reading line add all info in dico project
                try :
                    dico={
                        'id' : asso_id[factor_id],
                        'assays' : asso_id[factor_assay],
                        'studies' : assays[factor_assay]['studies'],
                        'project' : assays[factor_assay]['projects'],
                        'type' : factor_type,
                        'chemical' : factor_chemical,
                        'chemical_name' : factor_chemical_name,
                        'physical' : factor_physical,
                        'biological' : factor_biological,
                        'route' : factor_route,
                        'last_update' : str(sdt),
                        'status' : 'private',
                        'vehicle' : factor_vehicle,
                        'dose' : str(factor_dose) +" "+ factor_dose_unit,
                        'exposure_duration' : str(factor_exposure_duration) +" "+ factor_exposure_duration_unit,
                        'exposure_frequencies' : factor_exposure_frequecies,
                        'additional_information' : factor_additional_information,
                        'tags' : ','.join(tag),
                        'owner' : user,
                        'info' : ','.join(factor_error['Info']),
                        'warnings' : ','.join(factor_error['Warning']),
                        'critical' : ','.join(factor_error['Critical']),
                        'excel_id' : factor_id
                    }
                except :
                    dico={
                        'id' : asso_id[factor_id],
                        'assays' : asso_id[factor_assay],
                        'studies' : assays[factor_assay]['studies'],
                        'project' : assays[factor_assay]['projects'],
                        'type' : factor_type,
                        'chemical' : factor_chemical,
                        'chemical_name' : factor_chemical_name,
                        'physical' : factor_physical,
                        'biological' : factor_biological,
                        'route' : factor_route,
                        'last_update' : str(sdt),
                        'status' : 'private',
                        'vehicle' : factor_vehicle,
                        'dose' : factor_dose +" "+ factor_dose_unit,
                        'exposure_duration' : factor_exposure_duration +" "+ factor_exposure_duration_unit,
                        'exposure_frequencies' : factor_exposure_frequecies,
                        'additional_information' : factor_additional_information,
                        'tags' : ','.join(tag),
                        'owner' : user,
                        'info' : ','.join(factor_error['Info']),
                        'warnings' : ','.join(factor_error['Warning']),
                        'critical' : ','.join(factor_error['Critical']),
                        'excel_id' : factor_id
                    }
                factors[factor_id] = dico


        # Check signatures
        sh = wb.sheet_by_index(4)
        signatures={}
        for rownum in range(6, sh.nrows):
                row_values = sh.row_values(rownum)
                if row_values [1] == "" and row_values [2] == "" and row_values [3] =="" and row_values [4] =="" and row_values [5] =="" :
                    continue

                signature_error = {'Critical':[],'Warning':[],'Info':[]}

                signature_id = row_values[0]
                signature_associated_study = ""
                signature_associated_assay = ""
                signature_title = ""
                signature_type = ""
                signature_organism = ""
                signature_organism_name = ""
                signature_developmental_stage = ""
                signature_generation = ""
                signature_sex = ""
                signature_tissue = ""
                signature_tissue_name = ""
                signature_cell = ""
                signature_cell_name = "" 
                signature_cell_line = ""
                signature_cell_line_name = ""
                signature_molecule = ""
                signature_molecule_name = ""
                signature_pathology = ""
                signature_technology = ""
                signature_technology_name = ""
                signature_plateform = ""
                signature_observed_effect = ""
                signature_control_sample = ""
                signature_treated_sample = ""
                signature_pvalue = ""
                signature_cutoff = "" 
                signature_satistical_processing = ""
                signature_additional_file = ""
                signature_file_up = "" 
                signature_file_down = ""
                signature_file_interrogated = ""
                signature_genes_identifier = ""
                signature_study_type= ""
                signature_description = ""

                signature_controle = ""
                signature_case = ""
                signature_significance = ""
                signature_stat_value = ""
                signature_stat_adjust = ""
                signature_stat_other = ""
                signature_group = ""
                signature_pop_age = ""
                tag = []

                if row_values[1] != "":
                    if row_values[1] in studies:
                        signature_associated_study = row_values[1]
                    else :
                        signature_error['Critical'].append("Study doesn't exists ("+signature_id+")")
                        critical += 1
                else :
                    signature_error['Critical'].append("No associated study ("+signature_id+")")
                    critical += 1

                if row_values[2] != "":
                    if row_values[2] in assays:
                        signature_associated_assay = row_values[2]
                    else :
                        signature_error['Critical'].append("Assay doesn't exists ("+signature_id+")")
                        critical += 1
                else :
                    signature_error['Critical'].append("No associated assay ("+signature_id+")")
                    critical += 1

                if row_values[3] != "":
                    signature_title = row_values[3]
                else :
                    signature_error['Critical'].append("No signature title ("+signature_id+")")
                    critical += 1

                if row_values[4] != "":
                    if row_values[4] in list_signature_type : 
                        signature_type = row_values[4]
                    else :
                        signature_error['Critical'].append("Signature title not in the list ("+signature_id+")")
                        critical += 1
                else :
                    signature_error['Critical'].append("No type of signature ("+signature_id+")")
                    critical += 1

                if row_values[6] != "":
                    data = request.registry.db_mongo['species.tab'].find_one({'id': row_values[6]})
                    if data is None :
                        if row_values[5] != "":
                            signature_organism_name = row_values[5]
                            tag.append(signature_organism_name)
                        else :
                            signature_organism = ""
                            signature_error['Critical'].append("Please select an organism in the TOXsIgN ontologies list ("+signature_id+")")
                            critical += 1
                    else :
                        signature_organism = data['name']
                        tag.append(data['name'])
                        tag.append(data['id'])
                        tag.extend(data['synonyms'])
                        tag.extend(data['direct_parent'])
                        tag.extend(data['all_parent'])
                        tag.extend(data['all_name'])
                        if row_values[5] != "":
                            signature_organism = row_values[5]
                            tag.append(signature_organism_name)   
                else :
                    signature_error['Critical'].append("No organism selected ("+signature_id+")")
                    critical += 1

                if row_values[7] != "":
                    if row_values[7] in  list_developmental_stage :
                        signature_developmental_stage = row_values[7]
                    else :
                        signature_error['Warning'].append("Developmental stage not listed ("+signature_id+")")
                else :
                    signature_error['Info'].append("No developmental stage selected ("+signature_id+")")
                    

                if row_values[8] != "":
                    if row_values[8] in  list_generation :
                        signature_generation = row_values[8]
                    else :
                        signature_error['Warning'].append("Generation not listed ("+signature_id+")")
                else :
                    signature_error['Info'].append("No generation selected ("+signature_id+")")

                if row_values[9] != "":
                    if row_values[9] in  list_sex :
                        signature_sex = row_values[9]
                    else :
                        signature_error['Warning'].append("Sex not listed ("+signature_id+")")
                else :
                    signature_error['Info'].append("No sex selected ("+signature_id+")")

                if row_values[11] != "":
                    data = request.registry.db_mongo['tissue.tab'].find_one({'id': row_values[11]})
                    if data is None :
                        if row_values[10] != "":
                            signature_tissue_name = row_values[10]
                            tag.append(signature_tissue_name)
                        else :
                            signature_tissue = ""
                    else :
                        signature_tissue = data['name']
                        tag.append(data['name'])
                        tag.append(data['id'])
                        tag.extend(data['synonyms'])
                        tag.extend(data['direct_parent'])
                        tag.extend(data['all_parent'])
                        tag.extend(data['all_name'])
                        if row_values[10] != "":
                            signature_tissue_name = row_values[10]
                            tag.append(signature_tissue_name)  

                if row_values[13] != "":
                    data = request.registry.db_mongo['cell.tab'].find_one({'id': row_values[13]})
                    if data is None :
                        if row_values[12] != "":
                            signature_cell_name = row_values[12]
                            tag.append(signature_cell_name)
                        else :
                            signature_cell = ""
                    else :
                        signature_cell = data['name']
                        tag.append(data['name'])
                        tag.append(data['id'])
                        tag.extend(data['synonyms'])
                        tag.extend(data['direct_parent'])
                        tag.extend(data['all_parent'])
                        tag.extend(data['all_name']) 
                        if row_values[12] != "":
                            signature_cell_name = row_values[12]
                            tag.append(signature_cell_name)  

                if row_values[15] != "":
                    data = request.registry.db_mongo['cell_line.tab'].find_one({'id': row_values[15]})
                    if data is None :
                        if row_values[14] != "":
                            signature_cell_line_name = row_values[14]
                            tag.append(signature_cell_line_name)
                        else :
                            signature_cell_line = ''
                    else :
                        signature_cell_line = data['name']
                        tag.append(data['name'])
                        tag.append(data['id'])
                        tag.extend(data['synonyms'])
                        tag.extend(data['direct_parent'])
                        tag.extend(data['all_parent'])
                        tag.extend(data['all_name'])
                        if row_values[14] != "":
                            signature_cell_line_name = row_values[14]
                            tag.append(signature_cell_line_name)   

                # Check if at least tissue/cell or cell line are filled
                if signature_cell_line == "" and signature_cell == "" and signature_tissue =="" :
                    if studies[signature_associated_study]['study_type'] != 'Observational' :
                        signature_error['Critical'].append("Please select at least a tissue, cell or cell line in the TOXsIgN ontologies list ("+signature_id+")")
                        critical += 1

                if row_values[17] != "":
                    data = request.registry.db_mongo['chemical.tab'].find_one({'id': row_values[17]})
                    if data is None :
                        if row_values[16] != "" :
                            signature_molecule_name = row_values[16]
                            tag.append(signature_molecule_name)
                        else :
                            signature_molecule = ""
                    else :
                        signature_molecule = data['name']
                        tag.append(data['name'])
                        tag.append(data['id'])
                        tag.extend(data['synonyms'])
                        tag.extend(data['direct_parent'])
                        tag.extend(data['all_parent'])
                        tag.extend(data['all_name'])
                        if row_values[16] != "" :
                            signature_molecule_name = row_values[16]
                            tag.append(signature_molecule_name)   


                if row_values[18] != "":
                    signature_description = row_values[18]
                    tag.extend(signature_description)

                if row_values[19] != "":
                    data = request.registry.db_mongo['disease.tab'].find_one({'id': row_values[19]})
                    if data is None :
                        signature_pathology = ""
                        signature_error['Warning'].append("Pathology / disease not in TOXsIgN ontology ("+signature_id+")")
                    else :
                        signature_pathology = data['name']
                        tag.append(data['name'])
                        tag.append(data['id'])
                        tag.extend(data['synonyms'])
                        tag.extend(data['direct_parent'])
                        tag.extend(data['all_parent'])
                        tag.extend(data['all_name'])


                if row_values[21] != "":
                    data = request.registry.db_mongo['experiment.tab'].find_one({'id': row_values[21]})
                    if data is None :
                        if row_values[20] != "":
                            signature_technology_name = row_values[20]
                            tag.append(signature_technology_name)
                        else :
                            signature_technology = ""
                            if signature_type == "Genomic":
                                signature_error['Warning'].append("Technology not in TOXsIgN ontology ("+signature_id+")")
                    else :
                        signature_technology = data['name']
                        tag.append(data['name'])
                        tag.append(data['id'])
                        tag.extend(data['synonyms'])
                        tag.extend(data['direct_parent'])
                        tag.extend(data['all_parent'])
                        tag.extend(data['all_name'])
                        if row_values[20] != "":
                            signature_technology_name = row_values[20]
                            tag.append(signature_technology_name)              
                else :
                    if signature_type == "Genomic":
                        signature_error['Warning'].append("No technology selected ("+signature_id+")")

                if row_values[22] != "":
                    signature_plateform = row_values[22]
                else :
                    if signature_type == "Genomic":
                        signature_error['Info'].append("No plateform selected ("+signature_id+")")


                if row_values[23] != "":
                    signature_controle = row_values[23]


                if row_values[24] != "":
                    signature_case = row_values[24]


                if row_values[25] != "":
                    signature_group = row_values[25]


                if row_values[26] != "":
                    signature_group = row_values[26]


                if row_values[27] != "":
                    if row_values[27] in  list_observed_effect :
                        signature_observed_effect= row_values[27]
                    else :
                        signature_error['Warning'].append("Observed effect not listed ("+signature_id+")")

                if row_values[28] != "":
                    signature_significance = row_values[28]
                else :
                    if studies[signature_associated_study]['study_type'] == 'Observational' :
                        signature_error['Info'].append("No statistical significance ("+signature_id+")")

                if row_values[29] != "":
                    signature_stat_value = row_values[29]
                else :
                    if studies[signature_associated_study]['study_type'] == 'Observational' :
                        signature_error['Info'].append("No statistical value ("+signature_id+")")

                if row_values[30] != "":
                    signature_stat_adjust = row_values[30]
                else :
                    if studies[signature_associated_study]['study_type'] == 'Observational' :
                        signature_error['Info'].append("No statistical adjustment ("+signature_id+")")

                if row_values[31] != "":
                    signature_stat_other = row_values[31]





                if row_values[32] != "":
                    signature_control_sample = row_values[32]
                else :
                    if studies[signature_associated_study]['study_type'] != 'Observational' :
                        signature_error['Info'].append("No control sample ("+signature_id+")")

                if row_values[33] != "":
                    signature_treated_sample = row_values[33]
                else :
                    if studies[signature_associated_study]['study_type'] != 'Observational' :
                        signature_error['Info'].append("No treated sample ("+signature_id+")")

                if row_values[34] != "":
                    signature_pvalue = row_values[34]
                else :
                    if studies[signature_associated_study]['study_type'] != 'Observational' :
                        signature_error['Info'].append("No pvalue ("+signature_id+")")

                if row_values[35] != "":
                    signature_cutoff = row_values[36]
                else :
                    if studies[signature_associated_study]['study_type'] != 'Observational' :
                        signature_error['Info'].append("No cutoff ("+signature_id+")")

                if row_values[36] != "":
                    signature_satistical_processing = row_values[36]
                else :
                    if studies[signature_associated_study]['study_type'] != 'Observational' :
                        signature_error['Info'].append("No statistical processing ("+signature_id+")")

                if row_values[37] != "":
                    signature_additional_file = row_values[37]
                else :
                    signature_error['Info'].append("No additional file ("+signature_id+")")

                if row_values[38] != "":
                    signature_file_up = row_values[38]
                else :
                    if signature_type == "Genomic":
                        signature_error['Critical'].append("No signature file (up genes) ("+signature_id+")")
                        critical += 1

                if row_values[39] != "":
                    signature_file_down = row_values[39]
                else :
                    if signature_type == "Genomic":
                        signature_error['Critical'].append("No signature file (down genes) ("+signature_id+")")
                        critical +=1

                if row_values[40] != "":
                    signature_file_interrogated = row_values[40]
                else :
                    if signature_type == "Genomic":
                        signature_error['Critical'].append("No signature file (interrogated genes) ("+signature_id+")")
                        critical += 1

                if row_values[41] != "":
                    signature_genes_identifier = row_values[41]
                else :
                    if signature_type == "Genomic":
                        signature_error['Info'].append("No gene identifier selected ("+signature_id+")")
                        critical += 1

                #After reading line add all info in dico project
                #After reading line add all info in dico project
                request.registry.db_mongo['signature'].update({'id': 1}, {'$inc': {'val': 1}})
                repos = request.registry.db_mongo['signature'].find({'id': 1})
                id_a = ""
                for res in repos:
                    id_si = res
                
                #Excel id -> databas id
                asso_id[signature_id] = 'TSS'+str(id_si['val'])
                reverse_asso[asso_id[signature_id]] = signature_id

                #Add signature id to associated assay
                a_signature = assays[signature_associated_assay]['signatures'].split()

                a_signature.append(asso_id[signature_id])
                assays[signature_associated_assay]['signatures'] = ','.join(a_signature)

                #Add factor to the associated study

                s_signature = studies[signature_associated_study]['signatures'].split()
                s_signature.append(asso_id[signature_id])
                studies[signature_associated_study]['signatures'] = ','.join(s_signature)

                #Add factor to the associated project
                project_asso = reverse_asso[studies[signature_associated_study]['projects']]

                p_signature = projects[project_asso]['signatures'].split()
                p_signature.append(asso_id[signature_id])
                projects[project_asso]['signatures'] = ','.join(p_signature)

                #get factors
                tag.extend(assays[signature_associated_assay]['tags'].split(','))
                myset = list(set(tag))
                tag = myset
                
                signature_study_type = studies[signature_associated_study]['study_type']
                dico ={
                    'id' : asso_id[signature_id],
                    'studies' : asso_id[signature_associated_study],
                    'assays' : asso_id[signature_associated_assay],
                    'projects' : studies[signature_associated_study]['projects'] ,
                    'title' : signature_title,
                    'type' : signature_type,
                    'organism' : signature_organism,
                    'organism_name' : signature_organism_name,
                    'developmental_stage' : signature_developmental_stage,
                    'generation' : signature_generation,
                    'sex' : signature_sex,
                    'last_update' : str(sdt),
                    'tissue' : signature_tissue,
                    'tissue_name' : signature_tissue_name,
                    'cell' : signature_cell,
                    'cell_name' : signature_cell_name,
                    'status' : 'private',
                    'cell_line' : signature_cell_line,
                    'cell_line_name' : signature_cell_line_name,
                    'molecule' : signature_molecule,
                    'molecule_name' : signature_molecule_name,
                    'pathology' : signature_pathology,
                    'technology' : signature_technology,
                    'description' : signature_description,
                    'technology_name' : signature_technology_name,
                    'plateform' : signature_plateform,
                    'observed_effect' : signature_observed_effect,
                    'control_sample' : str(signature_control_sample),
                    'treated_sample' : str(signature_treated_sample),
                    'pvalue' : str(signature_pvalue),
                    'cutoff' : str(signature_cutoff),
                    'statistical_processing' : signature_satistical_processing,
                    'additional_file' : signature_additional_file,
                    'file_up' : signature_file_up,
                    'file_down' : signature_file_down,
                    'file_interrogated' : signature_file_interrogated,
                    'genes_identifier': signature_genes_identifier,
                    'controle':signature_controle,
                    'case':signature_case,
                    'significance':signature_significance,
                    'stat_val' : signature_stat_value,
                    'stat_adjust' : signature_stat_adjust,
                    'stat_other' : signature_stat_other,
                    'study_type' :signature_study_type,
                    'group' : signature_group,
                    'pop_age' : signature_pop_age,
                    'tags' : ','.join(tag),
                    'owner' : user,
                    'info' : ','.join(signature_error['Info']),
                    'warnings' : ','.join(signature_error['Warning']),
                    'critical' : ','.join(signature_error['Critical']),
                    'excel_id' : signature_id,
                    'genes_up' : "",
                    'genes_down' : ""
                }
                signatures[signature_id] = dico
        


        # Create user project directory + move tmp
        for proj in projects :
            ID = projects[proj]['id']
            projects[proj]['edges']  = {}
            for stud in studies:
                projects[proj]['edges'][studies[stud]['id']] = studies[stud]['assays'].split()
            for ass in assays:
                projects[proj]['edges'][assays[ass]['id']] = assays[ass]['signatures'].split()

            projects[proj]['edges'] = json.dumps(projects[proj]['edges'])
            upload_path = os.path.join(request.registry.upload_path, user, ID)
            final_file = 'TOXsIgN_'+ID+'.xlsx'
            if not os.path.exists(upload_path):
                os.makedirs(upload_path)
            os.rename(input_file, os.path.join(upload_path, final_file))
            request.registry.db_mongo['projects'].insert(projects[proj])

        for stud in studies:
            request.registry.db_mongo['studies'].insert(studies[stud])

        for ass in assays:
            request.registry.db_mongo['assays'].insert(assays[ass])

        for fac in factors:
            request.registry.db_mongo['factors'].insert(factors[fac])

        for sign in signatures:
            request.registry.db_mongo['signatures'].insert(signatures[sign])


        return {'msg':"File checked and uploded !", 'status':'0'}
    except:
        logger.warning("Error - Save excel file")
        logger.warning(sys.exc_info())
        return {'msg':'An error occurred while uploading your file. If the error persists please contact TOXsIgN support ','status':'1'}





@view_config(route_name='update_dataset', renderer='json', request_method='POST')
def update_dataset(request):
    session_user = is_authenticated(request)
    if session_user is None:
        return 'HTTPForbidden()'

    input_file = None
    form = json.loads(request.body, encoding=request.charset)
    user = form['uid']
  
    try:
        input_file = form['file']
    except Exception:
        return HTTPForbidden('no input file')
    try:
        pid = form['pid']
    except Exception:
        return HTTPForbidden('no project associated')
    studies = []
    assays = []
    factors = []
    signatres = []

    print 'update file'
    print form['pid']
    p_project = request.registry.db_mongo['projects'].find_one({'id': form['pid']})
    pstudies = p_project['studies'].split(',')
    passays = p_project['assays'].split(',')
    pfactors = p_project['factors'].split(',')
    psignatures = p_project['signatures'].split(',')

    asso_id = {}
    reverse_asso = {}

    #Read excel file
    wb = xlrd.open_workbook(input_file,encoding_override="cp1251")
    #Read project
    sh = wb.sheet_by_index(0)
    projects={}
    critical = 0
    dt = datetime.datetime.utcnow()
    sdt = time.mktime(dt.timetuple())
    try :
        for rownum in range(5, sh.nrows):
            row_values = sh.row_values(rownum)
            if row_values [1] == "" and row_values [2] == "" and row_values [3] =="" :
                continue
            project_error = {'Critical':[],'Warning':[],'Info':[]}

            project_id = row_values[0]
            project_title = ""
            project_description = ""
            project_pubmed = ""
            project_contributors=""
            project_crosslink = ""

            if row_values[1] != "":
                project_title = row_values[1]
            else :
                project_error['Critical'].append("No project title ("+project_id+")")
                critical += 1

            if row_values[2] != "":
                project_description = row_values[2]
            else :
                project_error['Warning'].append("No project description ("+project_id+")")

            if str(row_values[3]) != "" :
                if ';' in str(row_values[3]) or '|' in str(row_values[3]):
                    project_error['Critical'].append("Use comma to separate your pubmed ids ("+project_id+")")
                    critical += 1
                else :
                    project_pubmed = str(row_values[3])
            else :
                project_error['Info'].append("No associated pubmed Id(s)")

            if row_values[4] != "" :
                if ';' in row_values[4] or '|' in row_values[4]:
                    project_error['Critical'].append("Use comma to separate your contributors ("+project_id+")")
                    critical += 1
                else :
                    project_contributors = row_values[4]
            else :
                project_error['Info'].append("No associated contributors ("+project_id+")")

            if row_values[5] != "" :
                if ';' in row_values[5] or '|' in row_values[5]:
                    project_error['Critical'].append("Use comma to separate your links ("+project_id+")")
                    critical += 1
                else :
                    project_crosslink = row_values[5]
            else :
                project_error['Info'].append("No cross link(s) ("+project_id+")")


            #After reading line add all info in dico project

            #Excel id -> databas id
            asso_id[project_id] =  p_project['id']
            reverse_asso[asso_id[project_id]] = project_id

            dico={
                'id' : p_project['id'],
                'title' : project_title,
                'description' : project_description,
                'pubmed' : project_pubmed,
                'contributor' : project_contributors,
                'cross_link' : project_crosslink,
                'assays' : "",
                'studies' : "",
                'factors' : "",
                'signatures' :"",
                'last_update' : str(sdt),
                'submission_date' : str(sdt),
                'status' : 'private' ,
                'owner' : user,
                'author' : user ,
                'tags' : "",
                'edges' : "",
                'info' : ','.join(project_error['Info']),
                'warnings' : ','.join(project_error['Warning']),
                'critical' : ','.join(project_error['Critical']),
                'excel_id' : project_id
                }
            
            if p_project['excel_id'] == project_id :
                projects[project_id] = dico
            else :
                return {'msg':'Error in template format (project id ?) '}

        # Check studies
        sh = wb.sheet_by_index(1)
        studies={}
        l_excelId = []
        for stud in pstudies :
            study = request.registry.db_mongo['studies'].find_one({'id': stud})
            if study is not None :
                l_excelId.append(study['excel_id'])


        for rownum in range(6, sh.nrows):
                row_values = sh.row_values(rownum)
                if row_values [1] == "" and row_values [2] == "" and row_values [3] =="" :
                    continue
                study_error = {'Critical':[],'Warning':[],'Info':[]}

                study_id = row_values[0]
                study_projects = ""
                study_title = ""
                study_description=""
                study_experimental_design=""
                study_results=""
                study_type = ""
                study_inclusion_periode = ""
                study_inclusion = ""
                study_exclusion = ""
                study_followup = ""
                study_pubmed = ""
                study_pop_size = ""
                study_pubmed = ""

                if row_values[1] != "":
                    if row_values[1] in projects:
                        study_projects = row_values[1]
                    else :
                        study_error['Critical'].append("Project doesn't exists ("+study_id+")")
                        critical += 1
                else :
                    study_error['Critical'].append("No associated project ("+study_id+")")
                    critical += 1

                if row_values[2] != "":
                    study_title = row_values[2]
                else :
                    study_error['Critical'].append("No study title ("+study_id+")")
                    critical += 1

                if row_values[3] != "":
                    study_description = row_values[3]
                else :
                    study_error['Warning'].append("No study description ("+study_id+")")

                if row_values[4] != "":
                    study_experimental_design = row_values[4]
                else :
                    study_error['Warning'].append("No experimental design description ("+study_id+")")

                if row_values[5] != "":
                    study_results = row_values[5]
                else :
                    study_error['Info'].append("No study results ("+study_id+")")

                if row_values[6] != "":
                    if row_values[6] == 'Interventional' or row_values[6] == 'Observational' :
                        study_type = row_values[6]
                    else :
                        study_error['Critical'].append("Study type not available ("+study_id+")")
                        critical += 1
                else :
                    study_error['Critical'].append("No study type selected ("+study_id+")")
                    critical += 1

                if study_type == "Observational" :
                    if row_values[7] != "":
                        study_inclusion_periode = row_values[7]
                    else :
                        study_error['Warning'].append("No inclusion period ("+study_id+")")

                    if row_values[8] != "":
                        study_inclusion = row_values[8]
                    else :
                        study_error['Warning'].append("No inclusion criteria ("+study_id+")")

                    if row_values[9] != "":
                        study_exclusion = row_values[9]
                    else :
                        study_error['Warning'].append("No exclusion criteria ("+study_id+")")

                    if row_values[10] != "":
                        study_followup = row_values[10]
                    else :
                        study_error['Warning'].append("No follow up ("+study_id+")")

                    if row_values[11] != "":
                        study_pop_size = row_values[11]
                    else :
                        study_error['Warning'].append("No population size ("+study_id+")")

                    if row_values[12] != "":
                        study_pubmed = row_values[12]
                    else :
                        study_error['Info'].append("No pubmed ("+study_id+")")

                if study_id in l_excelId :
                    for stud in pstudies :
                        if study is not None :
                            study = request.registry.db_mongo['studies'].find_one({'id': stud})
                            if study['excel_id'] == study_id :

                                asso_id[study_id] = study['id']
                                reverse_asso[asso_id[study_id]] = study_id 

                                #Add studies id to associated project
                                p_stud = projects[study_projects]['studies'].split()
                                p_stud.append(asso_id[study_id])
                                p_stud = list(set(p_stud))
                                projects[study_projects]['studies'] = ','.join(p_stud)

                                dico={
                                    'id' : study['id'],
                                    'owner' : user,
                                    'projects' : asso_id[study_projects],
                                    'assays' : "",
                                    'factors' : "",
                                    'status' : 'private' ,
                                    'signatures' : study['signatures'],
                                    'title' : study_title,
                                    'description' : study_description,
                                    'experimental_design' : study_experimental_design,
                                    'results' : study_results,
                                    'study_type' : study_type,
                                    'last_update' : str(sdt),
                                    'inclusion_period': study_inclusion_periode,
                                    'inclusion': study_inclusion,
                                    'followup': study_followup,
                                    'exclusion' : study_exclusion,
                                    'pop_size' : study_pop_size,
                                    'pubmed' : study_pubmed,
                                    'tags' : "",
                                    'info' : ','.join(study_error['Info']),
                                    'warnings' : ','.join(study_error['Warning']),
                                    'critical' : ','.join(study_error['Critical']),
                                    'excel_id' : study_id
                                } 
                                    
                                studies[study_id] = dico
                else : 

                    #After reading line add all info in dico project
                    request.registry.db_mongo['study'].update({'id': 1}, {'$inc': {'val': 1}})
                    repos = request.registry.db_mongo['study'].find({'id': 1})
                    id_s = ""
                    for res in repos:
                        id_s = res
                    
                    #Excel id -> databas id
                    asso_id[study_id] = 'TSE'+str(id_s['val'])
                    reverse_asso[asso_id[study_id]] = study_id

                    p_stud = projects[study_projects]['studies'].split()
                    p_stud.append(asso_id[study_id])
                    p_stud = list(set(p_stud))
                    projects[study_projects]['studies'] = ','.join(p_stud)

                   #Excel id -> databas id


                    dico={
                        'id' : asso_id[study_id],
                        'owner' : user,
                        'projects' : asso_id[study_projects],
                        'assays' : "",
                        'factors' : "",
                        'status' : 'private' ,
                        'signatures' : "",
                        'title' : study_title,
                        'description' : study_description,
                        'experimental_design' : study_experimental_design,
                        'results' : study_results,
                        'study_type' : study_type,
                        'last_update' : str(sdt),
                        'inclusion_period': study_inclusion_periode,
                        'inclusion': study_inclusion,
                        'followup': study_followup,
                        'exclusion' : study_exclusion,
                        'pop_size' : study_pop_size,
                        'pubmed' : study_pubmed,
                        'tags' : "",
                        'info' : ','.join(study_error['Info']),
                        'warnings' : ','.join(study_error['Warning']),
                        'critical' : ','.join(study_error['Critical']),
                        'excel_id' : study_id
                    }      
                    studies[study_id]=dico

        # List of TOXsIgN 'ontologies'
        list_developmental_stage = ['Fetal','Embryonic','Larva','Neo-Natal','Juvenile','Pre-pubertal','Pubertal','Adulthood','Elderly','NA']
        list_generation = ['f0','f1','f2','f3','f4','f5','f6','f7','f8','f9','f10']
        list_experimental = ['in vivo','ex vivo','in vitro','other','NA']
        list_sex = ['Male','Female','Both','Other','NA']
        list_dose_unit = ['M','mM','µM','g/mL','mg/mL','µg/mL','ng/mL','mg/kg','µg/kg','µg/kg','ng/kg','%']
        list_exposure_duration_unit = ['week','day','hour','minute','seconde']
        list_exposition_factor = ['Chemical','Physical','Biological']
        list_signature_type = ['Physiological','Genomic','Molecular']
        list_observed_effect = ['Decrease','Increase','No effect','NA']

        # Check assay
        sh = wb.sheet_by_index(2)
        assays={}
        assays_up = {}
        l_excelId = []
        for ass in passays :
            assay = request.registry.db_mongo['assays'].find_one({'id': ass})
            if assay is not None :
                if assay['excel_id'] is not None :
                    l_excelId.append(assay['excel_id'])
        for rownum in range(12, sh.nrows):
            row_values = sh.row_values(rownum)
            if row_values [1] == "" and row_values [2] == "" and row_values [3] =="" :
                continue
            assay_error = {'Critical':[],'Warning':[],'Info':[]}

            assay_id = row_values[0]
            assay_study = ""
            assay_title = ""
            assay_organism = ""
            assay_organism_name = ""
            assay_experimental_type = ""
            assay_developmental_stage = "" 
            assay_generation = ""
            assay_sex = ""
            assay_tissue = ""
            assay_tissue_name = ""
            assay_cell = ""
            assay_cell_name = ""
            assay_cell_line = ""
            assay_cell_line_name = ""   
            assay_additional_information = "" 
            tag = [] 
            assay_pop_age = ""
            assay_location = ""
            assay_reference = ""
            assay_matrice = "" 


            if row_values[1] != "":
                if row_values[1] in studies:
                    assay_study = row_values[1]
                else :
                    assay_error['Critical'].append("Studies doesn't exists ("+assay_id+")")
                    critical += 1
            else :
                study_error['Critical'].append("No associated study ("+assay_id+")")
                critical += 1

            if row_values[2] != "":
                assay_title = row_values[2]
            else :
                assay_error['Critical'].append("No study title ("+assay_id+")")
                critical += 1

            if row_values[4] != "":
                data = request.registry.db_mongo['species.tab'].find_one({'id': row_values[4]})
                if data is None :
                    if row_values[3] == "" :
                        assay_organism = ""
                        assay_error['Critical'].append("Please select an organism in the TOXsIgN ontologies list ("+assay_id+")")
                        critical += 1
                    else :
                        assay_organism_name = row_values[3]
                        tag.append(row_values[3])
                else :
                    assay_organism = data['name']
                    tag.append(data['name'])
                    tag.append(data['id'])
                    tag.extend(data['synonyms'])
                    tag.extend(data['direct_parent'])
                    tag.extend(data['all_parent'])
                    tag.extend(data['all_name'])
                    if row_values[3] != "" :
                        assay_organism_name = row_values[3]
                        tag.append(row_values[3])
            else :
                assay_error['Critical'].append("No organism selected ("+assay_id+")")
                critical += 1

            if row_values[5] != "":
                if row_values[5] in  list_developmental_stage :
                    assay_developmental_stage = row_values[5]
                else :
                    assay_error['Warning'].append("Developmental stage not listed ("+assay_id+")")
            else :
                assay_error['Info'].append("No developmental stage selected ("+assay_id+")")
                

            if row_values[6] != "":
                if row_values[6] in  list_generation :
                    assay_generation = row_values[6]
                else :
                    assay_error['Warning'].append("Generation not listed ("+assay_id+")")
            else :
                assay_error['Info'].append("No generation selected ("+assay_id+")")

            if row_values[7] != "":
                if row_values[7] in  list_sex :
                    assay_sex = row_values[7]
                else :
                    assay_error['Warning'].append("Sex not listed ("+assay_id+")")
            else :
                assay_error['Info'].append("No sex selected ("+assay_id+")")

            if row_values[9] != "":
                data = request.registry.db_mongo['tissue.tab'].find_one({'id': row_values[9]})
                if data is None :
                    if row_values[8] != "":
                        assay_tissue_name = row_values[8]
                        tag.append(assay_tissue_name)
                    else :
                        assay_tissue = ""
  
                else :
                    assay_tissue = data['name']
                    tag.append(data['name'])
                    tag.append(data['id'])
                    tag.extend(data['synonyms'])
                    tag.extend(data['direct_parent'])
                    tag.extend(data['all_parent'])
                    tag.extend(data['all_name'])
                    if row_values[8] != "":
                        assay_tissue_name = row_values[8]
                        tag.append(assay_tissue_name)


            if row_values[11] != "":
                data = request.registry.db_mongo['cell.tab'].find_one({'id': row_values[11]})
                if data is None :
                    if row_values[10] != "":
                        assay_cell_name = row_values[10]
                        tag.append(assay_cell_name)
                    else :
                        assay_cell = ""

                else :
                    assay_cell = data['name']
                    tag.append(data['name'])
                    tag.append(data['id'])
                    tag.extend(data['synonyms'])
                    tag.extend(data['direct_parent'])
                    tag.extend(data['all_parent'])
                    tag.extend(data['all_name'])
                    if row_values[10] != "":
                        assay_cell_name = row_values[10]
                        tag.append(assay_cell_name)



            if row_values[13] != "":
                data = request.registry.db_mongo['cell_line.tab'].find_one({'id': row_values[13]})
                if data is None :
                    if row_values[12] != "":
                        assay_cell_line_name = row_values[12]
                        tag.append(assay_cell_line_name)
                    else :
                        assay_cell_line = ""
                else :
                    assay_cell_line = data['name']
                    tag.append(data['name'])
                    tag.append(data['id'])
                    tag.extend(data['synonyms'])
                    tag.extend(data['direct_parent'])
                    tag.extend(data['all_parent'])
                    tag.extend(data['all_name'])
                    if row_values[12] != "":
                        assay_cell_line_name = row_values[12]
                        tag.append(assay_cell_line_name)

            # Check if at least tissue/cell or cell line are filled
            if assay_cell_line == "" and assay_cell == "" and assay_tissue =="" :
                if studies[assay_study]['study_type'] =='Observational' :
                    assay_error['Critical'].append("Please select at least a tissue, cell or cell line in the TOXsIgN ontologies list ("+assay_id+")")
                    critical += 1

            if row_values[14] != "":
                if row_values[14] in  list_experimental :
                    assay_experimental_type = row_values[14]
                else :
                    assay_error['Warning'].append("Experimental type not listed ("+assay_id+")")


            if studies[assay_study]['study_type'] =='Observational' :
                if row_values[15] != "":
                    assay_pop_age = row_values[15]
                else :
                    assay_error['Info'].append("No population age ("+assay_id+")")

                if row_values[16] != "":
                    assay_location = row_values[16]
                else :
                    assay_error['Info'].append("No geographical location ("+assay_id+")")

                if row_values[17] != "":
                    assay_reference = row_values[17]
                else :
                    assay_error['Info'].append("No controle / reference ("+assay_id+")")

                if row_values[18] != "":
                    assay_matrice = row_values[18]
                else :
                    assay_error['Info'].append("No matrice("+assay_id+")")

            if row_values[19] != "":
                assay_additional_information = row_values[19]
            else :
                assay_error['Info'].append("No additional information ("+assay_id+")")

            if assay_id in l_excelId :
                for ass in passays :
                    assay = request.registry.db_mongo['assays'].find_one({'id': ass})
                    if assay is not None :
                        if assay['excel_id'] == assay_id :

                            asso_id[assay_id] = assay['id']
                            reverse_asso[asso_id[assay_id]] = assay_id

                            #Add assay id to associated study
                            s_assay = studies[assay_study]['assays'].split()
                            s_assay.append(asso_id[assay_id])
                            s_assay = list(set(s_assay))
                            studies[assay_study]['assays'] = ','.join(s_assay)

                            #Add assay to the associated project
                            project_asso = reverse_asso[studies[assay_study]['projects']]

                            p_assay = projects[project_asso]['assays'].split()
                            p_assay.append(asso_id[assay_id])
                            p_assay = list(set(p_assay))
                            projects[project_asso]['assays'] = ','.join(p_assay)

                            dico={
                                'id' : assay['id'] ,
                                'studies' : asso_id[assay_study],
                                'factors' : "",
                                'signatures' : "",
                                'status' : 'private' ,
                                'projects' : studies[assay_study]['projects'],
                                'title' : assay_title,
                                'organism' : assay_organism,
                                'organism_name' : assay_organism_name,
                                'experimental_type' : assay_experimental_type,
                                'developmental_stage' : assay_developmental_stage,
                                'generation' : assay_generation,
                                'sex' : assay_sex,
                                'tissue' : assay_tissue,
                                'tissue_name' : assay_tissue_name,
                                'cell' : assay_cell,
                                'cell_name' : assay_cell_name,
                                'last_update' : str(sdt),
                                'cell_line' : assay_cell_line,
                                'cell_line_name' : assay_cell_line_name,
                                'additional_information' : assay_additional_information,
                                'population_age' : assay_pop_age,
                                'geographical_location':assay_location,
                                'reference':assay_reference,
                                'matrice':assay_matrice,
                                'tags' : ','.join(tag),
                                'owner' : user,
                                'info' : ','.join(assay_error['Info']),
                                'warnings' : ','.join(assay_error['Warning']),
                                'critical' : ','.join(assay_error['Critical']),
                                'excel_id' : assay_id
                            }
                            assays[assay_id] = dico
            else :

                #After reading line add all info in dico project
                request.registry.db_mongo['assay'].update({'id': 1}, {'$inc': {'val': 1}})
                repos = request.registry.db_mongo['assay'].find({'id': 1})
                id_a = ""
                for res in repos:
                    id_a = res
                
                #Excel id -> databas id
                asso_id[assay_id] = 'TSA'+str(id_a['val'])
                reverse_asso[asso_id[assay_id]] = assay_id


                #Add assay id to associated study
                s_assay = studies[assay_study]['assays'].split()
                s_assay.append(asso_id[assay_id])
                s_assay = list(set(s_assay))
                studies[assay_study]['assays'] = ','.join(s_assay)

                #Add assay to the associated project
                project_asso = reverse_asso[studies[assay_study]['projects']]

                p_assay = projects[project_asso]['assays'].split()
                p_assay.append(asso_id[assay_id])
                p_assay = list(set(p_assay))
                projects[project_asso]['assays'] = ','.join(p_assay)

                #After reading line add all info in dico project
                dico={
                    'id' : asso_id[assay_id] ,
                    'studies' : asso_id[assay_study],
                    'factors' : "",
                    'signatures' : "",
                    'projects' : studies[assay_study]['projects'],
                    'title' : assay_title,
                    'organism' : assay_organism,
                    'organism_name' : assay_organism_name,
                    'experimental_type' : assay_experimental_type,
                    'developmental_stage' : assay_developmental_stage,
                    'generation' : assay_generation,
                    'sex' : assay_sex,
                    'tissue' : assay_tissue,
                    'tissue_name' : assay_tissue_name,
                    'cell' : assay_cell,
                    'cell_name' : assay_cell_name,
                    'status' : 'private',
                    'last_update' : str(sdt),
                    'cell_line' : assay_cell_line,
                    'cell_line_name' : assay_cell_line_name,
                    'additional_information' : assay_additional_information,
                    'population_age' : assay_pop_age,
                    'geographical_location':assay_location,
                    'reference':assay_reference,
                    'matrice':assay_matrice,
                    'tags' : ','.join(tag),
                    'owner' : user,
                    'info' : ','.join(assay_error['Info']),
                    'warnings' : ','.join(assay_error['Warning']),
                    'critical' : ','.join(assay_error['Critical']),
                    'excel_id' : assay_id
                }
                assays[assay_id] = dico




        # Check factor
        sh = wb.sheet_by_index(3)
        factors={}

        l_excelId = []
        for fact in pfactors :
            factor = request.registry.db_mongo['factors'].find_one({'id': fact})
            l_excelId.append(factor['excel_id'])

        for rownum in range(5, sh.nrows):
            row_values = sh.row_values(rownum)
            if row_values [1] == "" and row_values [2] == "" and row_values [3] =="" and row_values [4] =="" and row_values [5] =="" :
                continue

            factor_error = {'Critical':[],'Warning':[],'Info':[]}

            factor_id = row_values[0]
            factor_type = ""
            factor_assay = ""
            factor_chemical = ""
            factor_chemical_name = ""
            factor_physical = ""
            factor_biological = ""
            factor_route = ""
            factor_vehicle  = ""
            factor_dose = ""
            factor_dose_unit = ""
            factor_exposure_duration = ""
            factor_exposure_duration_unit = ""
            factor_exposure_frequecies = ""
            factor_additional_information = ""
            tag = []


            if row_values[1] != "":
                if row_values[1] in assays:
                    factor_assay = row_values[1]
                else :
                    factor_error['Critical'].append("Assay doesn't exists ("+factor_id+")")
                    critical += 1
            else :
                factor_error['Critical'].append("No associated study ("+factor_id+")")
                critical += 1

            if row_values[2] != "":
                if row_values[2] in  list_exposition_factor :
                    factor_type = row_values[2]
                else :
                    factor_error['Critical'].append("Exposition factor not listed ("+factor_id+")")
                    critical += 1
            else :
                factor_error['Critical'].append("No exposition factor selected ("+factor_id+")")
                critical += 1

            if row_values[4] != "":
                data = request.registry.db_mongo['chemical.tab'].find_one({'id': row_values[4]})
                if data is None :
                    if row_values[3] != "":
                        factor_chemical_name = row_values[3]
                        tag.append(factor_chemical_name)
                    else :
                        factor_chemical = ""
                else :
                    factor_chemical = data['name']
                    tag.append(data['name'])
                    tag.append(data['id'])
                    tag.extend(data['synonyms'])
                    tag.extend(data['direct_parent'])
                    tag.extend(data['all_parent'])
                    tag.extend(data['all_name'])
                    if row_values[3] != "":
                        factor_chemical_name = row_values[3]
                        tag.append(factor_chemical_name)      

            if row_values[5] != "":
                data = request.registry.db_mongo['chemical.tab'].find_one({'id': row_values[5]})
                if data is None :
                    data =  'false'
                else :
                    data = 'true'
                if data == 'true' :
                    factor_physical = row_values[5]
                else :
                    a =1
                    #factor_error['Warning'].append("Physical factor not in the TOXsIgN ontologies (not available yet) ("+factor_id+")")
            else :
                a =1
                #factor_error['Warning'].append("No physical factor selected (not available yet) ("+factor_id+")")

            if row_values[6] != "":
                data = request.registry.db_mongo['chemical.tab'].find_one({'id': row_values[6]})
                if data is None :
                    data =  'false'
                else :
                    data = 'true'
                if data == 'true' :
                    factor_biological = row_values[6]
                else :
                    a=1
                    f#actor_error['Warning'].append("Biological factor notin the TOXsIgN ontologies (not available yet) ("+factor_id+")")
            else :
                a=1
                #factor_error['Warning'].append("No biological factor selected (not available yet) ("+factor_id+")")

            if row_values[7] != "":
                factor_route = row_values[7]
            else :
                factor_error['Info'].append("No route ("+factor_id+")")

            if row_values[8] != "":
                factor_vehicle = row_values[8]
            else :
                factor_error['Info'].append("No vehicle ("+factor_id+")")

            if row_values[9] != "":
                factor_dose = row_values[9]
            else :
                factor_error['Critical'].append("Factor dose required ("+factor_id+")")
                critical += 1

            try :
                if row_values[10] != "":
                    if str(row_values[10]) in list_dose_unit :
                        factor_dose_unit = row_values[10]
                    else :
                        factor_error['Warning'].append("Dose unit not in list ("+factor_id+")")
                else :
                    factor_error['Critical'].append("Factor dose unit required ("+factor_id+")")
                    critical += 1
            except : 
                 factor_dose_unit = row_values[10]

            if row_values[11] != "":
                factor_exposure_duration = row_values[11]
            else :
                factor_error['Critical'].append("Factor exposure duration required ("+factor_id+")")
                critical += 1

            try : 
                if row_values[12] != "":
                    if str(row_values[12]) in list_exposure_duration_unit :
                        factor_exposure_duration_unit = row_values[12]
                    else :
                        factor_error['Critical'].append("Exposure duration unit not in list ("+factor_id+")")
                        critical += 1
                else :
                    factor_error['Critical'].append("Factor dose unit required ("+factor_id+")")
                    critical += 1
            except :
                factor_exposure_duration_unit = row_values[12]

            if row_values[13] != "":
                factor_exposure_frequecies = row_values[13]
            else :
                factor_error['Warning'].append("No exposure frequencies ("+factor_id+")")

            if row_values[14] != "":
                factor_additional_information = row_values[14]
            else :
                factor_error['Info'].append("No additional information ("+factor_id+")")

            if factor_id in l_excelId :
                for fact in pfactors :
                    factor = request.registry.db_mongo['factors'].find_one({'id': fact})
                    if factor['excel_id'] == factor_id :

                        asso_id[factor_id] = factor['id']
                        reverse_asso[asso_id[factor_id]] = factor_id

                        #Add factor id to associated assay
                        a_factor = assays[factor_assay]['factors'].split()
                        a_factor.append(asso_id[factor_id])
                        a_factor = list(set(a_factor))
                        assays[factor_assay]['factors'] = ','.join(a_factor)

                        #Add factor to the associated study
                        study_asso = reverse_asso[assays[factor_assay]['studies']]

                        s_factor = studies[study_asso]['factors'].split()
                        s_factor.append(asso_id[factor_id])
                        s_factor = list(set(s_factor))
                        studies[study_asso]['factors'] = ','.join(s_factor)

                        #Add factor to the associated project
                        project_asso = reverse_asso[assays[factor_assay]['projects']]

                        p_factor = projects[project_asso]['factors'].split()
                        p_factor.append(asso_id[factor_id])
                        p_factor = list(set(p_factor))
                        projects[project_asso]['factors'] = ','.join(p_factor)

                        #up factor tags to associated assy 
                        tag_assay = assays[factor_assay]['tags'].split(',')
                        tag_assay.extend(tag)
                        tag_assay = list(set(tag_assay))
                        assays[factor_assay]['tags'] = ','.join(tag_assay)

                        dico={
                            'id' : factor['id'],
                            'assays' : asso_id[factor_assay],
                            'studies' : assays[factor_assay]['studies'],
                            'project' : assays[factor_assay]['projects'],
                            'type' : factor_type,
                            'status' : 'private' ,
                            'chemical' : factor_chemical,
                            'chemical_name' : factor_chemical_name,
                            'physical' : factor_physical,
                            'biological' : factor_biological,
                            'route' : factor_route,
                            'last_update' : str(sdt),
                            'vehicle' : factor_vehicle,
                            'dose' : str(factor_dose) +" "+ factor_dose_unit,
                            'exposure_duration' : str(factor_exposure_duration) +" "+ factor_exposure_duration_unit,
                            'exposure_frequencies' : factor_exposure_frequecies,
                            'additional_information' : factor_additional_information,
                            'tags' : ','.join(tag),
                            'owner' : user,
                            'info' : ','.join(factor_error['Info']),
                            'warnings' : ','.join(factor_error['Warning']),
                            'critical' : ','.join(factor_error['Critical']),
                            'excel_id' : factor_id
                        }
                        
                        factors[factor_id] = dico

            else : 

                #After reading line add all info in dico project
                request.registry.db_mongo['factor'].update({'id': 1}, {'$inc': {'val': 1}})
                repos = request.registry.db_mongo['factor'].find({'id': 1})
                id_a = ""
                for res in repos:
                    id_f = res
                
                #Excel id -> databas id
                asso_id[factor_id] = 'TSF'+str(id_f['val'])
                reverse_asso[asso_id[factor_id]] = factor_id

                #Add factor id to associated assay
                a_factor = assays[factor_assay]['factors'].split()
                a_factor.append(asso_id[factor_id])
                a_factor = list(set(a_factor))
                assays[factor_assay]['factors'] = ','.join(a_factor)

                #Add factor to the associated study
                study_asso = reverse_asso[assays[factor_assay]['studies']]

                s_factor = studies[study_asso]['factors'].split()
                s_factor.append(asso_id[factor_id])
                s_factor = list(set(s_factor))
                studies[study_asso]['factors'] = ','.join(s_factor)

                #Add factor to the associated project
                project_asso = reverse_asso[assays[factor_assay]['projects']]

                p_factor = projects[project_asso]['factors'].split()
                p_factor.append(asso_id[factor_id])
                p_factor = list(set(p_factor))
                projects[project_asso]['factors'] = ','.join(p_factor)

                #up factor tags to associated assy 
                tag_assay = assays[factor_assay]['tags'].split(',')
                tag_assay.extend(tag)
                tag_assay = list(set(tag_assay))
                assays[factor_assay]['tags'] = ','.join(tag_assay)

                #After reading line add all info in dico project
                try :
                    dico={
                        'id' : asso_id[factor_id],
                        'assays' : asso_id[factor_assay],
                        'studies' : assays[factor_assay]['studies'],
                        'project' : assays[factor_assay]['projects'],
                        'type' : factor_type,
                        'chemical' : factor_chemical,
                        'chemical_name' : factor_chemical_name,
                        'physical' : factor_physical,
                        'biological' : factor_biological,
                        'route' : factor_route,
                        'last_update' : str(sdt),
                        'status' : 'private',
                        'vehicle' : factor_vehicle,
                        'dose' : str(factor_dose) +" "+ factor_dose_unit,
                        'exposure_duration' : str(factor_exposure_duration) +" "+ factor_exposure_duration_unit,
                        'exposure_frequencies' : factor_exposure_frequecies,
                        'additional_information' : factor_additional_information,
                        'tags' : ','.join(tag),
                        'owner' : user,
                        'info' : ','.join(factor_error['Info']),
                        'warnings' : ','.join(factor_error['Warning']),
                        'critical' : ','.join(factor_error['Critical']),
                        'excel_id' : factor_id
                    }
                except:
                    dico={
                        'id' : asso_id[factor_id],
                        'assays' : asso_id[factor_assay],
                        'studies' : assays[factor_assay]['studies'],
                        'project' : assays[factor_assay]['projects'],
                        'type' : factor_type,
                        'chemical' : factor_chemical,
                        'chemical_name' : factor_chemical_name,
                        'physical' : factor_physical,
                        'biological' : factor_biological,
                        'route' : factor_route,
                        'last_update' : str(sdt),
                        'status' : 'private',
                        'vehicle' : factor_vehicle,
                        'dose' : factor_dose +" "+ factor_dose_unit,
                        'exposure_duration' : factor_exposure_duration +" "+ factor_exposure_duration_unit,
                        'exposure_frequencies' : factor_exposure_frequecies,
                        'additional_information' : factor_additional_information,
                        'tags' : ','.join(tag),
                        'owner' : user,
                        'info' : ','.join(factor_error['Info']),
                        'warnings' : ','.join(factor_error['Warning']),
                        'critical' : ','.join(factor_error['Critical']),
                        'excel_id' : factor_id
                    }
                factors[factor_id] = dico


        # Check signatures
        sh = wb.sheet_by_index(4)
        signatures={}
        l_excelId = []
        for sign in psignatures :
            signature = request.registry.db_mongo['signatures'].find_one({'id': sign})
            l_excelId.append(signature['excel_id'])
        for rownum in range(6, sh.nrows):
            row_values = sh.row_values(rownum)
            if row_values [1] == "" and row_values [2] == "" and row_values [3] =="" and row_values [4] =="" and row_values [5] =="" :
                continue

            signature_error = {'Critical':[],'Warning':[],'Info':[]}

            signature_id = row_values[0]
            signature_associated_study = ""
            signature_associated_assay = ""
            signature_title = ""
            signature_type = ""
            signature_organism = ""
            signature_organism_name = ""
            signature_developmental_stage = ""
            signature_generation = ""
            signature_sex = ""
            signature_tissue = ""
            signature_tissue_name = ""
            signature_cell = ""
            signature_cell_name = "" 
            signature_cell_line = ""
            signature_cell_line_name = ""
            signature_molecule = ""
            signature_molecule_name = ""
            signature_pathology = ""
            signature_technology = ""
            signature_technology_name = ""
            signature_plateform = ""
            signature_observed_effect = ""
            signature_control_sample = ""
            signature_treated_sample = ""
            signature_pvalue = ""
            signature_cutoff = "" 
            signature_satistical_processing = ""
            signature_additional_file = ""
            signature_file_up = "" 
            signature_file_down = ""
            signature_file_interrogated = ""
            signature_genes_identifier = ""
            signature_study_type= ""
            signature_description = ""

            signature_controle = ""
            signature_case = ""
            signature_significance = ""
            signature_stat_value = ""
            signature_stat_adjust = ""
            signature_stat_other = ""
            signature_group = ""
            signature_pop_age = ""
            tag = []

            if row_values[1] != "":
                if row_values[1] in studies:
                    signature_associated_study = row_values[1]
                else :
                    signature_error['Critical'].append("Study doesn't exists ("+signature_id+")")
                    critical += 1
            else :
                signature_error['Critical'].append("No associated study ("+signature_id+")")
                critical += 1

            if row_values[2] != "":
                if row_values[2] in assays:
                    signature_associated_assay = row_values[2]
                else :
                    signature_error['Critical'].append("Assay doesn't exists ("+signature_id+")")
                    critical += 1
            else :
                signature_error['Critical'].append("No associated assay ("+signature_id+")")
                critical += 1

            if row_values[3] != "":
                signature_title = row_values[3]
            else :
                signature_error['Critical'].append("No signature title ("+signature_id+")")
                critical += 1

            if row_values[4] != "":
                if row_values[4] in list_signature_type : 
                    signature_type = row_values[4]
                else :
                    signature_error['Critical'].append("Signature title not in the list ("+signature_id+")")
                    critical += 1
            else :
                signature_error['Critical'].append("No type of signature ("+signature_id+")")
                critical += 1

            if row_values[6] != "":
                data = request.registry.db_mongo['species.tab'].find_one({'id': row_values[6]})
                if data is None :
                    if row_values[5] != "":
                        signature_organism_name = row_values[5]
                        tag.append(signature_organism_name)
                    else :
                        signature_organism = ""
                        signature_error['Critical'].append("Please select an organism in the TOXsIgN ontologies list ("+signature_id+")")
                        critical += 1
                else :
                    signature_organism = data['name']
                    tag.append(data['name'])
                    tag.append(data['id'])
                    tag.extend(data['synonyms'])
                    tag.extend(data['direct_parent'])
                    tag.extend(data['all_parent'])
                    tag.extend(data['all_name'])
                    if row_values[5] != "":
                        signature_organism = row_values[5]
                        tag.append(signature_organism_name)   
            else :
                signature_error['Critical'].append("No organism selected ("+signature_id+")")
                critical += 1

            if row_values[7] != "":
                if row_values[7] in  list_developmental_stage :
                    signature_developmental_stage = row_values[7]
                else :
                    signature_error['Warning'].append("Developmental stage not listed ("+signature_id+")")
            else :
                signature_error['Info'].append("No developmental stage selected ("+signature_id+")")
                

            if row_values[8] != "":
                if row_values[8] in  list_generation :
                    signature_generation = row_values[8]
                else :
                    signature_error['Warning'].append("Generation not listed ("+signature_id+")")
            else :
                signature_error['Info'].append("No generation selected ("+signature_id+")")

            if row_values[9] != "":
                if row_values[9] in  list_sex :
                    signature_sex = row_values[9]
                else :
                    signature_error['Warning'].append("Sex not listed ("+signature_id+")")
            else :
                signature_error['Info'].append("No sex selected ("+signature_id+")")

            if row_values[11] != "":
                data = request.registry.db_mongo['tissue.tab'].find_one({'id': row_values[11]})
                if data is None :
                    if row_values[10] != "":
                        signature_tissue_name = row_values[10]
                        tag.append(signature_tissue_name)
                    else :
                        signature_tissue = ""
                        if studies[signature_associated_study]['study_type'] != 'Observational' :
                            signature_error['Warning'].append("Please select a tissue in the TOXsIgN ontologies list ("+signature_id+")")
                else :
                    signature_tissue = data['name']
                    tag.append(data['name'])
                    tag.append(data['id'])
                    tag.extend(data['synonyms'])
                    tag.extend(data['direct_parent'])
                    tag.extend(data['all_parent'])
                    tag.extend(data['all_name'])
                    if row_values[10] != "":
                        signature_tissue_name = row_values[10]
                        tag.append(signature_tissue_name)  
            else :
                if studies[signature_associated_study]['study_type'] != 'Observational' :
                    signature_error['Warning'].append("No tissue selected ("+signature_id+")")

            if row_values[13] != "":
                data = request.registry.db_mongo['cell.tab'].find_one({'id': row_values[13]})
                if data is None :
                    if row_values[12] != "":
                        signature_cell_name = row_values[12]
                        tag.append(signature_cell_name)
                    else :
                        signature_cell = ""
                        if studies[signature_associated_study]['study_type'] != 'Observational' :
                            signature_error['Warning'].append("Please select a cell in the TOXsIgN ontologies list ("+signature_id+")")
                else :
                    signature_cell = data['name']
                    tag.append(data['name'])
                    tag.append(data['id'])
                    tag.extend(data['synonyms'])
                    tag.extend(data['direct_parent'])
                    tag.extend(data['all_parent'])
                    tag.extend(data['all_name']) 
                    if row_values[12] != "":
                        signature_cell_name = row_values[12]
                        tag.append(signature_cell_name)  
            else :
                if studies[signature_associated_study]['study_type'] != 'Observational' :
                    signature_error['Warning'].append("No cell selected ("+signature_id+")")


            if row_values[15] != "":
                data = request.registry.db_mongo['cell_line.tab'].find_one({'id': row_values[15]})
                if data is None :
                    if row_values[14] != "":
                        signature_cell_line_name = row_values[14]
                        tag.append(signature_cell_line_name)
                    else :
                        signature_cell_line = 'No cell line'
                        if studies[signature_associated_study]['study_type'] != 'Observational' :
                            signature_error['Warning'].append("Please select a cell line in the TOXsIgN ontologies list ("+signature_id+")")
                else :
                    signature_cell_line = data['name']
                    tag.append(data['name'])
                    tag.append(data['id'])
                    tag.extend(data['synonyms'])
                    tag.extend(data['direct_parent'])
                    tag.extend(data['all_parent'])
                    tag.extend(data['all_name'])
                    if row_values[14] != "":
                        signature_cell_line_name = row_values[14]
                        tag.append(signature_cell_line_name)   
            else :
                if studies[signature_associated_study]['study_type'] != 'Observational' :
                    signature_error['Warning'].append("No cell line selected ("+signature_id+")")

            # Check if at least tissue/cell or cell line are filled
            if signature_cell_line == "" and signature_cell == "" and signature_tissue =="" :
                if studies[signature_associated_study]['study_type'] != 'Observational' :
                    signature_error['Critical'].append("Please select at least a tissue, cell or cell line in the TOXsIgN ontologies list ("+signature_id+")")
                    critical += 1

            if row_values[17] != "":
                data = request.registry.db_mongo['chemical.tab'].find_one({'id': row_values[17]})
                if data is None :
                    if row_values[16] != "" :
                        signature_molecule_name = row_values[16]
                        tag.append(signature_molecule_name)
                    else :
                        signature_molecule = ""
                        if studies[signature_associated_study]['study_type'] != 'Observational' :
                            if signature_type == "Molecular":
                                signature_error['Warning'].append("Molecule not in TOXsIgN ontology ("+signature_id+")")
                else :
                    signature_molecule = data['name']
                    tag.append(data['name'])
                    tag.append(data['id'])
                    tag.extend(data['synonyms'])
                    tag.extend(data['direct_parent'])
                    tag.extend(data['all_parent'])
                    tag.extend(data['all_name'])
                    if row_values[16] != "" :
                        signature_molecule_name = row_values[16]
                        tag.append(signature_molecule_name)   
            else :
                if studies[signature_associated_study]['study_type'] != 'Observational' :
                    if signature_type == "Molecular":
                        signature_error['Warning'].append("No molecule selected ("+signature_id+")")

            if row_values[18] != "":
                signature_description = row_values[18]

            if row_values[19] != "":
                data = request.registry.db_mongo['disease.tab'].find_one({'id': row_values[19]})
                if data is None :
                    signature_pathology = ""
                    signature_error['Warning'].append("Pathology / disease not in TOXsIgN ontology ("+signature_id+")")
                else :
                    signature_pathology = data['name']
                    tag.append(data['name'])
                    tag.append(data['id'])
                    tag.extend(data['synonyms'])
                    tag.extend(data['direct_parent'])
                    tag.extend(data['all_parent'])
                    tag.extend(data['all_name'])
                          
            else :
                signature_error['Warning'].append("No pathology / disease selected ("+signature_id+")")

            if row_values[21] != "":
                data = request.registry.db_mongo['experiment.tab'].find_one({'id': row_values[21]})
                if data is None :
                    if row_values[20] != "":
                        signature_technology_name = row_values[20]
                        tag.append(signature_technology_name)
                    else :
                        signature_technology = ""
                        if signature_type == "Genomic":
                            signature_error['Warning'].append("Technology not in TOXsIgN ontology ("+signature_id+")")
                else :
                    signature_technology = data['name']
                    tag.append(data['name'])
                    tag.append(data['id'])
                    tag.extend(data['synonyms'])
                    tag.extend(data['direct_parent'])
                    tag.extend(data['all_parent'])
                    tag.extend(data['all_name'])
                    if row_values[20] != "":
                        signature_technology_name = row_values[20]
                        tag.append(signature_technology_name)              
            else :
                if signature_type == "Genomic":
                    signature_error['Warning'].append("No technology selected ("+signature_id+")")

            if row_values[22] != "":
                signature_plateform = row_values[22]
            else :
                if signature_type == "Genomic":
                    signature_error['Info'].append("No plateform selected ("+signature_id+")")


            if row_values[23] != "":
                signature_controle = row_values[23]
            else :
                if studies[signature_associated_study]['study_type'] == 'Observational':
                    signature_error['Info'].append("No controle ("+signature_id+")")

            if row_values[24] != "":
                signature_case = row_values[24]
            else :
                if studies[signature_associated_study]['study_type'] == 'Observational':
                    signature_error['Info'].append("No case ("+signature_id+")")

            if row_values[25] != "":
                signature_group = row_values[25]
            else :
                if studies[signature_associated_study]['study_type'] == 'Observational' :
                    signature_error['Info'].append("No group ("+signature_id+")")

            if row_values[26] != "":
                signature_group = row_values[26]
            else :
                if studies[signature_associated_study]['study_type'] == 'Observational' :
                    signature_error['Info'].append("No population age ("+signature_id+")")


            if row_values[27] != "":
                if row_values[27] in  list_observed_effect :
                    signature_observed_effect= row_values[27]
                else :
                    signature_error['Warning'].append("Observed effect not listed ("+signature_id+")")

            else :
                signature_error['Warning'].append("No observed effect selected ("+signature_id+")")

            if row_values[28] != "":
                signature_significance = row_values[28]
            else :
                if studies[signature_associated_study]['study_type'] == 'Observational' :
                    signature_error['Info'].append("No statistical significance ("+signature_id+")")

            if row_values[29] != "":
                signature_stat_value = row_values[29]
            else :
                if studies[signature_associated_study]['study_type'] == 'Observational' :
                    signature_error['Info'].append("No statistical value ("+signature_id+")")

            if row_values[30] != "":
                signature_stat_adjust = row_values[30]
            else :
                if studies[signature_associated_study]['study_type'] == 'Observational' :
                    signature_error['Info'].append("No statistical adjustment ("+signature_id+")")

            if row_values[31] != "":
                signature_stat_other = row_values[31]
            else :
                if studies[signature_associated_study]['study_type'] == 'Observational' :
                    signature_error['Info'].append("No statistical information ("+signature_id+")")




            if row_values[32] != "":
                signature_control_sample = row_values[32]
            else :
                if studies[signature_associated_study]['study_type'] != 'Observational' :
                    signature_error['Info'].append("No control sample ("+signature_id+")")

            if row_values[33] != "":
                signature_treated_sample = row_values[33]
            else :
                if studies[signature_associated_study]['study_type'] != 'Observational' :
                    signature_error['Info'].append("No treated sample ("+signature_id+")")

            if row_values[34] != "":
                signature_pvalue = row_values[34]
            else :
                if studies[signature_associated_study]['study_type'] != 'Observational' :
                    signature_error['Info'].append("No pvalue ("+signature_id+")")

            if row_values[35] != "":
                signature_cutoff = row_values[36]
            else :
                if studies[signature_associated_study]['study_type'] != 'Observational' :
                    signature_error['Info'].append("No cutoff ("+signature_id+")")

            if row_values[36] != "":
                signature_satistical_processing = row_values[36]
            else :
                if studies[signature_associated_study]['study_type'] != 'Observational' :
                    signature_error['Info'].append("No statistical processing ("+signature_id+")")

            if row_values[37] != "":
                signature_additional_file = row_values[37]
            else :
                signature_error['Info'].append("No additional file ("+signature_id+")")

            if row_values[38] != "":
                signature_file_up = row_values[38]
            else :
                if signature_type == "Genomic":
                    signature_error['Critical'].append("No signature file (up genes) ("+signature_id+")")
                    critical += 1

            if row_values[39] != "":
                signature_file_down = row_values[39]
            else :
                if signature_type == "Genomic":
                    signature_error['Critical'].append("No signature file (down genes) ("+signature_id+")")
                    critical +=1

            if row_values[40] != "":
                signature_file_interrogated = row_values[40]
            else :
                if signature_type == "Genomic":
                    signature_error['Critical'].append("No signature file (interrogated genes) ("+signature_id+")")
                    critical += 1

            if row_values[41] != "":
                signature_genes_identifier = row_values[41]
            else :
                if signature_type == "Genomic":
                    signature_error['Info'].append("No gene identifier selected ("+signature_id+")")
                    critical += 1

            signature_study_type = studies[signature_associated_study]
            if signature_id in l_excelId :
                for sign in psignatures :
                    signature = request.registry.db_mongo['signatures'].find_one({'id': sign})
                    if signature['excel_id'] == signature_id :

                        asso_id[signature_id] = signature['id']
                        reverse_asso[asso_id[signature_id]] = signature_id

                        a_signature = assays[signature_associated_assay]['signatures'].split()

                        a_signature.append(asso_id[signature_id])
                        a_signature = list(set(a_signature))
                        assays[signature_associated_assay]['signatures'] = ','.join(a_signature)

                        #Add factor to the associated study

                        s_signature = studies[signature_associated_study]['signatures'].split()
                        s_signature.append(asso_id[signature_id])
                        s_signature = list(set(s_signature))
                        studies[signature_associated_study]['signatures'] = ','.join(s_signature)

                        #Add factor to the associated project
                        project_asso = reverse_asso[studies[signature_associated_study]['projects']]

                        p_signature = projects[project_asso]['signatures'].split()
                        p_signature.append(asso_id[signature_id])
                        p_signature = list(set(p_signature))
                        projects[project_asso]['signatures'] = ','.join(p_signature)

                        #get factors
                        tag.extend(assays[signature_associated_assay]['tags'].split(','))
                        myset = list(set(tag))
                        tag = myset


                        dico={
                        'id' : signature['id'],
                        'studies' : asso_id[signature_associated_study],
                        'assays' : asso_id[signature_associated_assay],
                        'projects' : studies[signature_associated_study]['projects'] ,
                        'title' : signature_title,
                        'type' : signature_type,
                        'organism' : signature_organism,
                        'organism_name' : signature_organism_name,
                        'developmental_stage' : signature_developmental_stage,
                        'generation' : signature_generation,
                        'sex' : signature_sex,
                        'last_update' : str(sdt),
                        'tissue' : signature_tissue,
                        'tissue_name' : signature_tissue_name,
                        'cell' : signature_cell,
                        'cell_name' : signature_cell_name,
                        'status' : 'private',
                        'cell_line' : signature_cell_line,
                        'cell_line_name' : signature_cell_line_name,
                        'molecule' : signature_molecule,
                        'molecule_name' : signature_molecule_name,
                        'pathology' : signature_pathology,
                        'technology' : signature_technology,
                        'description' : signature_description,
                        'technology_name' : signature_technology_name,
                        'plateform' : signature_plateform,
                        'observed_effect' : signature_observed_effect,
                        'control_sample' : str(signature_control_sample),
                        'treated_sample' : str(signature_treated_sample),
                        'pvalue' : str(signature_pvalue),
                        'cutoff' : str(signature_cutoff),
                        'statistical_processing' : signature_satistical_processing,
                        'additional_file' : signature_additional_file,
                        'file_up' : signature_file_up,
                        'file_down' : signature_file_down,
                        'file_interrogated' : signature_file_interrogated,
                        'genes_identifier': signature_genes_identifier,
                        'controle':signature_controle,
                        'case':signature_case,
                        'significance':signature_significance,
                        'stat_val' : signature_stat_value,
                        'stat_adjust' : signature_stat_adjust,
                        'stat_other' : signature_stat_other,
                        'study_type' :signature_study_type,
                        'group' : signature_group,
                        'pop_age' : signature_pop_age,
                        'tags' : ','.join(tag),
                        'owner' : user,
                        'info' : ','.join(signature_error['Info']),
                        'warnings' : ','.join(signature_error['Warning']),
                        'critical' : ','.join(signature_error['Critical']),
                        'excel_id' : signature_id,
                        'genes_up' : "",
                        'genes_down' : ""
                        }
                        
                        signatures[signature_id] = dico

            else : 
                #After reading line add all info in dico project
                request.registry.db_mongo['signature'].update({'id': 1}, {'$inc': {'val': 1}})
                repos = request.registry.db_mongo['signature'].find({'id': 1})
                id_a = ""
                for res in repos:
                    id_si = res
                
                #Excel id -> databas id
                asso_id[signature_id] = 'TSS'+str(id_si['val'])
                reverse_asso[asso_id[signature_id]] = signature_id

                a_signature = assays[signature_associated_assay]['signatures'].split()

                a_signature.append(asso_id[signature_id])
                a_signature = list(set(a_signature))
                assays[signature_associated_assay]['signatures'] = ','.join(a_signature)

                #Add factor to the associated study

                s_signature = studies[signature_associated_study]['signatures'].split()
                s_signature.append(asso_id[signature_id])
                s_signature = list(set(s_signature))
                studies[signature_associated_study]['signatures'] = ','.join(s_signature)

                #Add factor to the associated project
                project_asso = reverse_asso[studies[signature_associated_study]['projects']]

                p_signature = projects[project_asso]['signatures'].split()
                p_signature.append(asso_id[signature_id])
                p_signature = list(set(p_signature))
                projects[project_asso]['signatures'] = ','.join(p_signature)

                #get factors
                tag.extend(assays[signature_associated_assay]['tags'].split(','))
                myset = list(set(tag))
                tag = myset

                dico ={
                    'id' : asso_id[signature_id],
                    'studies' : asso_id[signature_associated_study],
                    'assays' : asso_id[signature_associated_assay],
                    'projects' : studies[signature_associated_study]['projects'] ,
                    'title' : signature_title,
                    'type' : signature_type,
                    'organism' : signature_organism,
                    'organism_name' : signature_organism_name,
                    'developmental_stage' : signature_developmental_stage,
                    'generation' : signature_generation,
                    'sex' : signature_sex,
                    'last_update' : str(sdt),
                    'tissue' : signature_tissue,
                    'tissue_name' : signature_tissue_name,
                    'cell' : signature_cell,
                    'cell_name' : signature_cell_name,
                    'status' : 'private',
                    'cell_line' : signature_cell_line,
                    'cell_line_name' : signature_cell_line_name,
                    'molecule' : signature_molecule,
                    'molecule_name' : signature_molecule_name,
                    'pathology' : signature_pathology,
                    'technology' : signature_technology,
                    'description' : signature_description,
                    'technology_name' : signature_technology_name,
                    'plateform' : signature_plateform,
                    'observed_effect' : signature_observed_effect,
                    'control_sample' : str(signature_control_sample),
                    'treated_sample' : str(signature_treated_sample),
                    'pvalue' : str(signature_pvalue),
                    'cutoff' : str(signature_cutoff),
                    'statistical_processing' : signature_satistical_processing,
                    'additional_file' : signature_additional_file,
                    'file_up' : signature_file_up,
                    'file_down' : signature_file_down,
                    'file_interrogated' : signature_file_interrogated,
                    'genes_identifier': signature_genes_identifier,
                    'controle':signature_controle,
                    'case':signature_case,
                    'significance':signature_significance,
                    'stat_val' : signature_stat_value,
                    'stat_adjust' : signature_stat_adjust,
                    'stat_other' : signature_stat_other,
                    'study_type' :signature_study_type,
                    'group' : signature_group,
                    'pop_age' : signature_pop_age,
                    'tags' : ','.join(tag),
                    'owner' : user,
                    'info' : ','.join(signature_error['Info']),
                    'warnings' : ','.join(signature_error['Warning']),
                    'critical' : ','.join(signature_error['Critical']),
                    'excel_id' : signature_id,
                    'genes_up' : "",
                    'genes_down' : ""
                }
                signatures[signature_id] = dico

        


        # Create user project directory + move tmp
        for proj in projects :
            ID = projects[proj]['id']
            projects[proj]['edges']  = {}
            for stud in studies:
                projects[proj]['edges'][studies[stud]['id']] = studies[stud]['assays'].split()
            for ass in assays:
                projects[proj]['edges'][assays[ass]['id']] = assays[ass]['signatures'].split()

            projects[proj]['edges'] = json.dumps(projects[proj]['edges'])
            request.registry.db_mongo['projects'].update({'id': projects[proj]['id']},projects[proj])

        upload_path = os.path.join(request.registry.upload_path, user, form['pid'])
        final_file = 'TOXsIgN_'+form['pid']+'.xlsx'
        if not os.path.exists(upload_path):
            os.makedirs(upload_path)
        os.rename(input_file, os.path.join(upload_path, final_file))

        for stud in studies:
            get = request.registry.db_mongo['studies'].find_one({'id': studies[stud]['id']})
            if get is None :
                request.registry.db_mongo['studies'].insert(studies[stud])
            else :
                request.registry.db_mongo['studies'].update({'id': studies[stud]['id']},studies[stud])

        for ass in assays:
            get = request.registry.db_mongo['assays'].find_one({'id': assays[ass]['id']})
            if get is None :
                request.registry.db_mongo['assays'].insert(assays[ass])
            else :
                request.registry.db_mongo['assays'].update({'id': assays[ass]['id']},assays[ass])

        for fac in factors:
            get = request.registry.db_mongo['factors'].find_one({'id': factors[fac]['id']})
            if get is None :
                request.registry.db_mongo['factors'].insert(factors[fac])
            else :
                request.registry.db_mongo['factors'].update({'id': factors[fac]['id']},factors[fac])

        for sign in signatures:
            get = request.registry.db_mongo['signatures'].find_one({'id': signatures[sign]['id']})
            if get is None :
                request.registry.db_mongo['signatures'].insert(signatures[sign])
            else :
                request.registry.db_mongo['signatures'].update({'id': signatures[sign]['id']},signatures[sign])


        return {'msg':"File checked and update !" }

    except:
        logger.warning("Error - Upadate excel file")
        logger.warning(sys.exc_info())
        return {'msg':'An error occurred while updating your file. If the error persists please contact TOXsIgN support ','status':'1'}
    











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
                        'aud': 'urn:chemsign/recover'}, secret)
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
                            'aud': 'urn:chemsign/api'}, secret)
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
                auth = jwt.decode(form['token'], secret, audience='urn:chemsign/api')
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
                        'aud': 'urn:chemsign/api'}, secret)
    return HTTPFound(request.static_url('chemsign:webapp/app/')+"index.html#login?token="+token)


