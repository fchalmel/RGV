#!/usr/bin/env python
# -*- coding: utf-8 -*-


import bcrypt
from time import gmtime, strftime
import argparse
import sys
import ConfigParser, os
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


def CreateNewUser(username,email,metadata,lab,country,password):
    try :
        user_id = email
        logger.debug('Create User')
        db['users'].insert({'id': user_id,
                            'username' : username,
                            'email': email,
                            'password': bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()),
                            'metadata': metadata,
                            'laboratory': lab,
                            'country':country,
                            'creation':strftime("%Y-%m-%d %H:%M:%S", gmtime())})
    except IOError as e:
        print("args: ", e.args)
        print("errno: ", e.errno)
        print("filename: ", e.filename)
        print("strerror: ", e.strerror)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Create RGV user')
    parser.add_argument('--username', action='store', dest='username')
    parser.add_argument('--email', action='store', dest='email')
    parser.add_argument('--metadata', action='store', dest='metadata',default="")
    parser.add_argument('--lab', action='store', dest='lab',default="")
    parser.add_argument('--country', action='store', dest='country',default="")
    parser.add_argument('--password', action='store', dest='password',default="")

    parser.add_argument('--version', action='version', version='%(prog)s 1.0')
    args = parser.parse_args()
    CreateNewUser(args.username,args.email,args.metadata,args.lab,args.country,args.password)
