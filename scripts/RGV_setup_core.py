#!/usr/bin/env python
# -*- coding: utf-8 -*-

'''
Created on 29 jan. 2018

@author: tdarde
'''



"""
    Create RGV database.
    Called by setup.py
"""
import argparse
import sys
from hashlib import sha1
from random import randint
import bcrypt
import ConfigParser, os
from hashlib import sha1
from pymongo import MongoClient
import logging
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
file_handler = RotatingFileHandler('RGV_database_creation.log', 'a', 1000000000, 1)
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




#Functions used for data insertion
#This functions required information from config file
#By default all config information are load from ../tox_install.ini file
#To modifie information please set value in thise file
#DO NOT MODIFIE the tox_install.ini file location 
config = ConfigParser.ConfigParser()
config.readfp(open('install.ini'))

mongo = MongoClient(config.get('app:main','db_uri'))
db = mongo[config.get('app:main','db_name')]



def createCollections():
    try :
        logger.debug('CreateCollection - create RGV_geneDB collection')
        #Insert Allbank ID from TOXsIgN_geneDB file
        geneFile = open('genes_DB.rdb','r')
        for geneLine in geneFile.readlines():
            if geneLine[0] != '#':
                tax_id = geneLine.split('\t')[0]
                GeneID = geneLine.split('\t')[1]
                Symbol = geneLine.split('\t')[2] 
                Synonyms = geneLine.split('\t')[4] 
                description = geneLine.split('\t')[8]
                HID = geneLine.split('\t')[-1]
                db['genes'].insert({'GeneID': GeneID,
                                 'tax_id' : tax_id,
                                 'Symbol': Symbol,
                                 'Synonyms': Synonyms,
                                 'description': description,
                                 'HID':HID,
                                 })
        geneFile.close()
    except:
        logger.debug('CreateCollection - create RGV_geneDB collection')
        logger.error(sys.exc_info()[1])
    
    
  
        
        
        
        
