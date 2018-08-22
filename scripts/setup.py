#!/usr/bin/env python
# -*- coding: utf-8 -*-
'''
Created on 29 jan. 2018

@author: tdarde
'''



"""
    Create Toxsign database.
    Allow to create projects,studies,conditions and signatures collection.
    Also give the opportunity to fill database with ChemPSy Data
    Upload GeneInfo,HomoloGenes and all_info files data
    Use tox_core.py file  
"""

__version__ = "0.1.8"

import RGV_setup_core as rgv
import argparse
import sys
import ConfigParser, os

import logging

"""
Create RGV setup log file
"""
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
file_handler = RotatingFileHandler('TOXsIgN_database_creation.log', 'a', 1000000, 1)
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
 




if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Initialize RGV database content.')
    parser.add_argument('-i', action='store', dest='gene_info',default="",
                    help='NCBI gene_info file')

    parser.add_argument('-e', action='store', dest='gene2ensembl',
                        default="", help='NCBI gene2ensemble file')

    parser.add_argument('-o', action='store', dest='homologene',default="",
                        help='NCBI homologene.data file')

    parser.add_argument('-d', action='store_false', default=True,
                        help='Download files directly from NCBI ftp server')

    parser.add_argument('--version', action='version', version='%(prog)s 1.0')
    args = parser.parse_args()

    if args.gene_info != "" and args.gene2ensembl != "" and args.homologene != "":
        dirpath = os.getcwd()
        geneFile = rgv.Concat_files("",use_dl=False,file_list=[args.gene2ensembl,args.gene_info,args.homologene])
        rgv.InsertCollections(geneFile)
    else :
        dirpath = rgv.Download_datafiles()
        geneFile = rgv.Concat_files(dirpath,use_dl=True,file_list=[])
        print geneFile
        rgv.InsertCollections(geneFile)
    