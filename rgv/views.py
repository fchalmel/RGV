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
    if file_name != "dfghjkltyuio":
        url_file = os.path.join(request.registry.dataset_path,file_name)
        d = {'line':[]}
        try:
            f = open(url_file, "r")
            for li in f.readlines():
                d["line"].append(li.rstrip())

            return {"data":d, "status":0}
        except:
            return {"data":d, "status":1}
    else :
        result = {}
        lspecies = ["bosTau8","canFam3","danRer10","galGal5","hg38","mm10","rheMac8","rn6","susScr3"]
        for species in lspecies:
            result[species] = {}
            url_file = os.path.join(request.registry.jbrowse_path,species,"metadata.csv")
            df = pd.read_csv(url_file,sep=',')
            study_number = len(df.article.unique())
            df = df[df.sample_ID.notnull()]
            sample_liste = df.sample_ID.unique()
            sample_number = 0
            for i in sample_liste:
                sample_number = sample_number + len(i.split('|'))
            result[species] = {"study_number":study_number,"sample_number":sample_number}
        return result

def browser_stat(request):
    form = json.loads(request.body, encoding=request.charset)
    

@view_config(route_name='d_getter', renderer='json', request_method='POST')
def d_getter(request):
    form = json.loads(request.body, encoding=request.charset)
    file_name = form['name']
    url_file = os.path.join(request.registry.dataset_path,'metadata.csv')
    df = pd.read_csv(url_file,sep=',')
    df_json = df.to_json(orient='records')
    final_df = json.loads(df_json)
    filters = []
    displays = []

    #Create Data treeview for filtering grid (Species, Technology...)
    df_species = df.species.unique().tolist()
    df_ome = df.ome.unique().tolist()
    df_technology = df.technology.unique().tolist()
    df_sex = df.sex.unique().tolist()

    if 'stat' in form:
        number_of_species = len(df.species.unique())
        number_of_ome = len(df.ome.unique())
        number_of_technology = len(df.technology.unique())
        result = {}
        lspecies = ['Mus musculus', 'Homo sapiens', 'Rattus norvegicus', 'Gallus gallus', 'Macaca mulatta', 'Canis lupus familiaris','Danio rerio', 'Bos taurus', 'Sus scrofa']
        for species in lspecies:
            result[species] = {}
            nb_studies = len(df.loc[df["species"] == species,"PubMedID"].unique())
            lOme = []
            ome = df.loc[df["species"] == species,"technology"].unique()
            for i in ome :
                if '|' in i :
                    for z in i.split('|'):
                        if z not in lOme :
                            lOme.append(z)
                else :
                    if i not in lOme:
                        lOme.append(i)
            number_of_techno = len(lOme)

            ltopics = []
            topics = df.loc[df["species"] == species,"biological_topics"].unique()
            for i in topics :
                if '|' in i :
                    for z in i.split('|'):
                        if z not in ltopics :
                            ltopics.append(z)
                else :
                    if i not in ltopics:
                        ltopics.append(i)
            number_of_topics = len(ltopics)
            result[species] = {"study_number":nb_studies,"techno_number":number_of_techno,'number_of_topics':number_of_topics}
        
        #Get general stat
        nb_techno_chart = []
        for tech in df_technology :
            nb_techno_chart.append(len(df.loc[df["technology"] == tech]))
        chart_techno = {}
        chart_techno['config']={'displaylogo':False,'modeBarButtonsToRemove':['toImage','zoom2d','pan2d','lasso2d','resetScale2d']}
        chart_techno['data']=[]
        chart_techno['description'] = ""
        chart_techno['name'] = "Technologies informations"
        chart_techno['title'] = "Technologies informations"
        chart_techno['layout'] = { 'showlegend': True, 'legend': {'traceorder':'reversed','x':-100,'y':-100},"title":'',}
        chart_techno['msg'] = ""

        data_chart = {}
        data_chart['x'] = df_technology
        data_chart['y'] = nb_techno_chart
        data_chart['name'] = "Technologies informations"
        data_chart['hoverinfo'] = "all"
        data_chart['type'] = 'bar'
        data_chart['box'] = {'visible': True}
        data_chart['boxpoints'] = 'all'
        data_chart['meanline'] = {'visible': True}
        chart_techno['data']=[data_chart]

        #techno
        result["chart_techno"] = chart_techno

        return result


    #return {'data':final_df,'filter':request.registry.filter,'display':displays,'data_filter':data_filter}
    # Test new table 
    return {'data':final_df,'species':df_species,'ome':df_ome,'technology':df_technology}

@view_config(route_name='checkgene', renderer='json', request_method='POST')
def check(request):
    form = json.loads(request.body, encoding=request.charset)
    gene_list = form['list']
    tax_id = form['tax_id']
    result = []
    print tax_id
    for gene in gene_list :
        repos = request.registry.db_mongo['genes'].find_one({"$and":[{"$or":[{"GeneID":gene},{"EnsemblID":gene}]},{'tax_id':tax_id}]})
        if repos is not None :
            d = {"id":gene,"geneID":repos["GeneID"],"name":repos["Symbol"],"ensembl":repos["EnsemblID"],"status":"Used"}
            result.append(d)
        else :
            d = {"id":gene,"geneID":"NA","name":"NA","status":"Not used","ensembl":"NA"}
            result.append(d)
    return {"data":result}

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
        return result
    
    def getClass(file_in):
        dIndex =  cPickle.load(open(file_in+".pickle"))
        result = []
        for index in dIndex :
            if "Class" in index :
                result.append(index)
        return result
    
    def getGene(file_in):
        dIndex =  cPickle.load(open(file_in+".pickle"))
        result = []
        allIndex = list(dIndex.keys())
        result.append(allIndex[4])
        return result

    form = json.loads(request.body, encoding=request.charset)
    directories = form['directory']

    all_genes = form['genes']
    if all_genes == '':
        all_genes  = {}
        for study in directories :
            all_genes[study] =  getGene(os.path.join(request.registry.studies_path,study))

    if "model" in form :
        model = form['model']
    else :
        model = {}

    ensemblgenes = []
    selected_genes = []
    result = {'time':''}
    #print directories
    start_time = time.time()  
    div = 0
    for study in directories :
        result[study] = {}
        
        if study in all_genes :
            for gene in all_genes[study]:
                if gene['stud_name'] == study:
                    result[study][gene['Symbol']] = {}
                    result[study][gene['Symbol']]['charts'] = []
                    chart = {}
                    result[study][gene['Symbol']]['class'] = getClass(os.path.join(request.registry.studies_path,study))
                    selected_genes.append(gene['GeneID'])
                    ensemblgenes.append(gene['EnsemblID'])
                    if study in model :
                        if gene['Symbol'] in model[study] :
                            selected_class = model[study][gene['Symbol']]
                    else : 
                        selected_class = result[study][gene['Symbol']]['class'][0]
                    groups = getValue(os.path.join(request.registry.studies_path,study),[selected_class])
                    groups = np.array(groups[selected_class])
                    _, idx = np.unique(groups, return_index=True)
                    uniq_groups = groups[np.sort(idx)[::-1]]
                    
                    samples = getValue(os.path.join(request.registry.studies_path,study),['Sample'])
                    samples = np.array(samples['Sample'])

                    genes = getValue(os.path.join(request.registry.studies_path,study),selected_genes)
                    ensembl_genes = getValue(os.path.join(request.registry.studies_path,study),ensemblgenes)

                    #ADD VIOLIN PLOT FOR GENE
                    gene_name = gene['Symbol']
                    chart['config']={'displaylogo':False,'modeBarButtonsToRemove':['toImage','zoom2d','pan2d','lasso2d','resetScale2d']}
                    chart['data']=[]
                    chart['div']=str(div)
                    div += 1
                    chart['description'] = ""
                    chart['dir'] = study
                    chart['selected'] = selected_class
                    chart['name'] = gene_name
                    chart['title'] = "violin"
                    chart['selected'] = selected_class
                    chart['layout'] = { 'showlegend': True, 'legend': {'traceorder':'reversed','x':-100,'y':-100},"title":'',}
                    chart['gene'] = gene_name
                    chart['msg'] = ""
                    chart['study'] = study

                    #EntrezGenes
                    val_gene = np.array(genes[str(gene['GeneID'])])
                    #Ensembl IDs
                    val_gene_ensembl = np.array(ensembl_genes[str(gene['EnsemblID'])])
        
                    for cond in uniq_groups :
                        if len(val_gene) != 0 :
                            val = val_gene[np.where(groups == cond)[0]]
                        elif len(val_gene_ensembl) != 0 :
                            val = val_gene_ensembl[np.where(groups == cond)[0]]
                        else :
                            chart['msg'] = "No data available for %s" % (gene_name)

                        median = np.median(val.astype(np.float))
                        data_chart = {}
                        data_chart['x'] = []
                        data_chart['x'].extend(val)
                        data_chart['name'] = cond
                        data_chart['hoverinfo'] = "all"
                        ratio_type = len(samples)/len(uniq_groups)
                        if ratio_type > 10 and median > 0:
                            data_chart['type'] = 'violin'
                            data_chart['orientation'] = 'h'
                            data_chart['box'] = {'visible': True}
                            data_chart['boxpoints'] = False

                        else :
                            data_chart['type'] = 'box'
                            data_chart['box'] = {'visible': True}
                            data_chart['boxpoints'] = 'all'
                            data_chart['meanline'] = {'visible': True}
                        
                        chart['data'].append(data_chart)
                    result[study][gene['Symbol']]['charts'].append(chart)
                else :
                    result[study][gene['Symbol']] = {}
                    result[study][gene['Symbol']]['charts'] = []
                    chart = {}
                    chart['config']={'displaylogo':False,'modeBarButtonsToRemove':['toImage','zoom2d','pan2d','lasso2d','resetScale2d']}
                    chart['data']=[]
                    chart['dir'] = study
                    chart['description'] = ""
                    chart['name'] = "No selected gene"
                    chart['title'] = "violin"
                    chart['selected'] = ''
                    chart['layout'] = {'showlegend': True, 'legend': {'traceorder':'reversed','x':-100,'y':-100},"title":''}
                    chart['gene'] = ""
                    chart['msg'] = "Please select at least one gene"
                    chart['study'] = study
                    result[study][gene['Symbol']]['charts'].append(chart)
        else :
            result[study]["No selected gene"] = {}
            result[study]["No selected gene"]['charts'] = []
            result[study]["No selected gene"]['class'] = getClass(os.path.join(request.registry.studies_path,study))
            chart = {}
            chart['config']={'displaylogo':False,'modeBarButtonsToRemove':['toImage','zoom2d','pan2d','lasso2d','resetScale2d']}
            chart['data']=[]
            chart['dir'] = study
            chart['description'] = ""
            chart['name'] = "No selected gene"
            chart['title'] = "violin"
            chart['selected'] = ''
            chart['layout'] = {'showlegend': True, 'legend': {'traceorder':'reversed','x':-100,'y':-100},"title":''}
            chart['gene'] = ""
            chart['msg'] = "Please select at least one gene"
            chart['study'] = study
            result[study]["No selected gene"]['charts'].append(chart)

    interval = time.time() - start_time  
    result['time'] = interval
    return result                

@view_config(route_name='scDataGenes', renderer='json', request_method='POST')
def scDataGenes(request):

    # Read file
    def getValue(file_in,selectedvalues):
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
        return result
    
    #get all classes
    def getClass(file_in):
        dIndex =  cPickle.load(open(file_in+".pickle"))
        result = []
        for index in dIndex :
            if "Class" in index :
                result.append(index)
        return result

    form = json.loads(request.body, encoding=request.charset)
    directories = form['directory']

    all_genes = form['genes']
    selected_genes = all_genes.keys()
    ensemblgenes = []
    for i in all_genes :
        ensemblgenes.append(all_genes[i]['ensembl'])
    result = {'charts':[],'warning':[],'time':''}
    studies = form['studies']
    start_time = time.time()  

    # Read studies
    for stud in directories:
        if len(form['model']) !=0 :
            if stud in form['model'] :
                selected_class =  form['model'][stud]
            else :
                selected_class = form['class']
        else :
            selected_class = form['class']
        
        #Create Study chart
        chart = {}
        chart['class'] = getClass(os.path.join(request.registry.studies_path,stud))
        
        #Get selected classes for each studies
        if selected_class == '':
            selected_class = chart['class'][0]
        groups = getValue(os.path.join(request.registry.studies_path,stud),[selected_class])
        groups = np.array(groups[selected_class])
        _, idx = np.unique(groups, return_index=True)
        uniq_groups = groups[np.sort(idx)[::-1]]
        
        samples = getValue(os.path.join(request.registry.studies_path,stud),['Sample'])
        samples = np.array(samples['Sample'])

        x = np.array(getValue(os.path.join(request.registry.studies_path,stud),['X'])['X'])
        y = np.array(getValue(os.path.join(request.registry.studies_path,stud),['Y'])['Y'])

        genes = getValue(os.path.join(request.registry.studies_path,stud),selected_genes)
        ensembl_genes = getValue(os.path.join(request.registry.studies_path,stud),ensemblgenes)

        #For selected gene
        for i in range(0,len(selected_genes)):
            if all_genes[selected_genes[i]]['study'] == stud :
                gene_name = all_genes[selected_genes[i]]['symbol']
                chart['config']={'displaylogo':False,'modeBarButtonsToRemove':['toImage','zoom2d','pan2d','lasso2d','resetScale2d']}
                chart['data']=[]
                chart['description'] = ""
                chart['name'] = "Expression of: %s " % (gene_name)
                chart['title'] = ""
                chart['dir'] = stud
                chart['selected'] = selected_class
                chart['layout'] = {'height': 770,'showlegend': False, 'legend': {"orientation": "h", 'traceorder':'reversed','x':-100,'y':-400},"title":''}
                chart['gene'] = gene_name
                chart['msg'] = ""
                chart['study'] = stud

                max_val = 0
                min_val = 0
                #EntrezGenes
                val_gene = np.array(genes[str(selected_genes[i])])
                if len(val_gene) != 0 :
                    max_val =  np.max(val_gene.astype(np.float))
                    min_val =  np.min(val_gene.astype(np.float))

                #Ensembl IDs
                val_gene_ensembl = np.array(ensembl_genes[all_genes[selected_genes[i]]['ensembl']])
                if len(val_gene_ensembl) != 0 :
                    max_val =  np.max(val_gene_ensembl.astype(np.float))
                    min_val =  np.min(val_gene_ensembl.astype(np.float))

                #Add condition information according selected the class
                for cond in uniq_groups :
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
                        data_chart['marker']={'color':[],'cmax':max_val,'cmin':min_val,'colorbar': {}}
                        data_chart['marker']['color'].extend(val)
                        chart['data'].append(data_chart)
                    elif len(val_gene_ensembl) != 0 :
                        val = val_gene_ensembl[np.where(groups == cond)[0]]
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
                        data_chart['marker']={'color':[],'cmax':max_val,'cmin':min_val,'colorbar': {}}
                        data_chart['marker']['color'].extend(val)
                        chart['data'].append(data_chart)
                    else :
                        chart['msg'] = "No data available for %s gene" % (gene_name)

                #ADD VIOLIN PLOT FOR GENE
                chart['violin'] = {}
                gene_name = all_genes[selected_genes[i]]['symbol']
                chart['violin']['config']={'displaylogo':False,'modeBarButtonsToRemove':['toImage','zoom2d','pan2d','lasso2d','resetScale2d']}
                chart['violin']['data']=[]
                chart['violin']['description'] = ""
                chart['violin']['name'] = "Violin plot of: %s " % (gene_name)
                chart['violin']['title'] = "violin"
                chart['violin']['selected'] = selected_class
                chart['violin']['layout'] = {'showlegend': True, 'legend': {'traceorder':'reversed','x':-100,'y':-100},"title":''}
                chart['violin']['gene'] = gene_name
                chart['violin']['msg'] = ""
                chart['violin']['study'] = stud
                for cond in uniq_groups :
                    if len(val_gene) != 0 :
                        val = val_gene[np.where(groups == cond)[0]]
                    elif len(val_gene_ensembl) != 0 :
                        val = val_gene_ensembl[np.where(groups == cond)[0]]
                    median = np.median(val.astype(np.float))
                    data_chart = {}
                    data_chart['x'] = []
                    data_chart['x'].extend(val)
                    data_chart['name'] = cond
                    data_chart['hoverinfo'] = "all"
                    ratio_type = len(samples)/len(uniq_groups)
                    if ratio_type > 10 and median > 0:
                        data_chart['type'] = 'violin'
                        data_chart['orientation'] = 'h'
                        data_chart['box'] = {'visible': True}
                        data_chart['boxpoints'] = False

                    else :
                        data_chart['type'] = 'box'
                        data_chart['box'] = {'visible': True}
                        data_chart['boxpoints'] = 'all'
                        data_chart['meanline'] = {'visible': True}
                    chart['violin']['data'].append(data_chart)
                result['charts'].append(chart)
        
        # If no gene selected for the study
        if stud not in studies:
            if len(form['model']) !=0 :
                if stud in form['model'] :
                    selected_class =  form['model'][stud]
                else :
                    selected_class = form['class']
            else :
                selected_class = form['class']
                
            chart = {}
            chart['class'] = getClass(os.path.join(request.registry.studies_path,stud))
            
            if selected_class == '':
                selected_class =  chart['class'][0]
            groups = getValue(os.path.join(request.registry.studies_path,stud),[selected_class])
            groups = np.array(groups[selected_class])
            _, idx = np.unique(groups, return_index=True)
            uniq_groups = groups[np.sort(idx)[::-1]]

            samples = np.array(getValue(os.path.join(request.registry.studies_path,stud),['Sample'])['Sample'])
            x = np.array(getValue(os.path.join(request.registry.studies_path,stud),['X'])['X'])
            y = np.array(getValue(os.path.join(request.registry.studies_path,stud),['Y'])['Y'])
            
            
            chart['config']={'displaylogo':False,'modeBarButtonsToRemove':['toImage','zoom2d','pan2d','lasso2d','resetScale2d']}
            chart['data']=[]
            chart['description'] = ""
            chart['name'] = "Classification by: %s" % (selected_class)
            chart['selected'] = selected_class
            chart['dir'] = stud
            chart['layout'] = {'height': 770,'showlegend': True, 'legend': {"orientation": "h", 'traceorder':'reversed','x':-100,'y':-400},"title":''}
            chart['gene'] = ""
            chart['msg'] = []
            for cond in uniq_groups :
                val_x= x[np.where(groups == str(cond))[0]]
                val_y= y[np.where(groups == cond)[0]]
                text = samples[np.where(groups == cond)[0]]
                data_chart = {}
                data_chart['x'] = []
                data_chart['x'].extend(val_x)
                data_chart['y'] = []
                data_chart['y'].extend(val_y)
                if len(data_chart['x']) == 0 and len(data_chart['y']) == 0 :
                    chart['layout']['title'] = "No available data for %s" % (selected_class)
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
    result['selected'] = selected_class
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
    
    name = form['name']
    result = {'charts':[],'warning':[],'time':''}
    #print directories
    start_time = time.time()  

    for stud in directories:
        if len(form['model']) !=0 :
            if stud in form['model'] :
                selected_class =  form['model'][stud]
            else :
                selected_class = form['class']
        else :
            selected_class = form['class']
            
        chart = {}
        chart['class'] = getClass(os.path.join(request.registry.studies_path,stud))
        
        if selected_class == '':
            selected_class =  chart['class'][0]
        groups = getValue(os.path.join(request.registry.studies_path,stud),[selected_class])
        groups = np.array(groups[selected_class])
        _, idx = np.unique(groups, return_index=True)
        uniq_groups = groups[np.sort(idx)[::-1]]

        samples = np.array(getValue(os.path.join(request.registry.studies_path,stud),['Sample'])['Sample'])
        x = np.array(getValue(os.path.join(request.registry.studies_path,stud),['X'])['X'])
        y = np.array(getValue(os.path.join(request.registry.studies_path,stud),['Y'])['Y'])
        
        chart['config']={'displaylogo':False,'modeBarButtonsToRemove':['toImage','zoom2d','pan2d','lasso2d','resetScale2d']}
        chart['data']=[]
        chart['description'] = ""
        chart['selected'] = selected_class
        chart['study'] = name
        chart['name'] = "Classification by: %s" % (selected_class)
        chart['dir'] = stud
        chart['layout'] = {'height': 770,'showlegend': True, 'legend': {"orientation": "h", 'traceorder':'reversed','x':-100,'y':-400},"title":''}
        chart['gene'] = ""
        chart['msg'] = []
        for cond in uniq_groups :
            val_x= x[np.where(groups == str(cond))[0]]
            val_y= y[np.where(groups == cond)[0]]
            text = samples[np.where(groups == cond)[0]]
            data_chart = {}
            data_chart['x'] = []
            data_chart['x'].extend(val_x)
            data_chart['y'] = []
            data_chart['y'].extend(val_y)
            if len(data_chart['x']) == 0 and len(data_chart['y']) == 0 :
                 chart['layout']['title'] = "No available data for %s" % (selected_class)
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


@view_config(route_name='hmtData', renderer='json', request_method='POST')
def heatmap(request):
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
    
    name = form['name']
    result = {'charts':[],'warning':[],'time':''}
    #print directories
    start_time = time.time() 

    selected_genes = []
    selected_ensembl = []
    selected_genes_names = []
    selected_ensembl_names = []

    for i in form['genes'] :
        if i["geneID"] != "NA":
            selected_genes.append(i["geneID"])
            selected_genes_names.append(i["name"])
        if i["ensembl"] != "NA":
            selected_ensembl.append(i["ensembl"])
            selected_ensembl_names.append(i["name"])

    for stud in directories:
        if len(form['model']) !=0 :
            if stud in form['model'] :
                selected_class =  form['model'][stud]
            else :
                selected_class = form['class']
        else :
            selected_class = form['class']
            
        chart = {}
        chart['class'] = getClass(os.path.join(request.registry.studies_path,stud))
        
        if selected_class == '':
            selected_class =  chart['class'][0]
        groups = getValue(os.path.join(request.registry.studies_path,stud),[selected_class])
        groups = np.array(groups[selected_class])

        samples = getValue(os.path.join(request.registry.studies_path,stud),['Sample'])['Sample']

        genes = getValue(os.path.join(request.registry.studies_path,stud),selected_genes)
        genes2 =  dict((k, v) for k, v in genes.iteritems() if v)
        ensembl_genes = getValue(os.path.join(request.registry.studies_path,stud),selected_ensembl)
        ensembl_genes2 = dict((k, v) for k, v in ensembl_genes.iteritems() if v)

 
        chart['config']={'displaylogo':False,'modeBarButtonsToRemove':['toImage','zoom2d','pan2d','lasso2d','resetScale2d']}
        chart['data']=[]
        chart['description'] = ""
        chart['selected'] = selected_class
        chart['study'] = name
        chart['name'] = "Heatmap visualisation: %s" % (selected_class)
        chart['dir'] = stud
        chart['layout'] = {"width": "100%",'height':800,'showlegend': True,"title":''}
        chart['gene'] = ""
        chart['msg'] = []
        data_chart={}
        data_chart['y'] =[]
        data_chart['x'] = samples
        if len(genes2) != 0 :
            data_chart['y'] = selected_genes_names
        if len(ensembl_genes2) != 0 :
            data_chart['y'] = selected_ensembl_names
        data_chart['z'] = []
        if len(genes2) != 0 :
            for gene in selected_genes :
                val_z= genes[gene]
                data_chart['z'].append(val_z)
        if len(ensembl_genes2) != 0 :
            for gene in selected_ensembl :
                val_z= ensembl_genes[gene]
                data_chart['z'].append(val_z)
        data_chart['name'] = "Heatmap"
        data_chart['hoverinfo'] = "all"
        data_chart['type'] = 'heatmap'
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


@view_config(route_name='studyfeed', renderer='json', request_method='GET')
def getstudies(request):
    """
        func: Lecture fichier json local
        return: Dico (fichier json)
        view: home.html
    """
    try:
        url_file = os.path.join(request.registry.dataset_path,"studies.txt")
        file_data=open(url_file,'r')
        data = {}
        for lines in file_data.readlignes():
            studyName = lines.split('\t')[2] #uniq PMID
            data[studyName]['Date'] = lines.split('\t')[0]
            data[studyName]['Name'] = lines.split('\t')[1]
            data[studyName]['PubmedID'] = lines.split('\t')[2]
            data[studyName]['Description'] = lines.split('\t')[3]
            data[studyName]['Topics'] = lines.split('\t')[4]
            data[studyName]['Species'] = lines.split('\t')[5]
            data[studyName]['Techno'] = lines.split('\t')[6]
            data[studyName]['Samples'] = lines.split('\t')[7]
            data[studyName]['Links'] = lines.split('\t')[8]

        return {'data':data,'msg':'OK','status':0}

    except:
        logger.error('Error in getstudy - File missing ?')
        return {'data':'','msg':'Get studyfeed : something wrong','status':1}



@view_config(route_name='file_dataset', request_method='GET')
def file_dataset(request):
    directory = request.matchdict['dir']
    downfile = request.matchdict['file']
    url_file = os.path.join(request.registry.download_path,directory,downfile)
    (handle, tmp_file) = tempfile.mkstemp('.zip')
    z = zipfile.ZipFile(tmp_file, "w")
    z.write(url_file,os.path.basename(url_file)+'.zip')
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
    print form
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
