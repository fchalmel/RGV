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
import ConfigParser, os
from pymongo import MongoClient
import logging
from logging.handlers import RotatingFileHandler
import tempfile
import shutil
import urllib2
from zipfile import ZipFile
import gzip
from time import gmtime, strftime

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


def Download_datafiles():
    """
    Download gene2ensembl, gene_info and homologene.data files and unzip them
    """

    dirpath = tempfile.mkdtemp()
    print dirpath
    

    urls = ["ftp://ftp.ncbi.nih.gov/gene/DATA/gene2ensembl.gz","ftp://ftp.ncbi.nih.gov/gene/DATA/gene_info.gz","ftp://ftp.ncbi.nih.gov/pub/HomoloGene/build68/homologene.data"]

    for url in urls :
        print url
        file_name = url.split('/')[-1]
        u = urllib2.urlopen(url)
        f = open(os.path.join(dirpath,file_name), 'wb')
        meta = u.info()
        file_size = int(meta.getheaders("Content-Length")[0])
        print "Downloading: %s Bytes: %s" % (file_name, file_size)

        file_size_dl = 0
        block_sz = 8192
        while True:
            buffer = u.read(block_sz)
            if not buffer:
                break

            file_size_dl += len(buffer)
            f.write(buffer)
            status = r"%10d  [%3.2f%%]" % (file_size_dl, file_size_dl * 100. / file_size)
            status = status + chr(8)*(len(status)+1)
            print status,

        f.close()
        if ".gz" in file_name :
            with gzip.open(os.path.join(dirpath,file_name), 'rb') as f_in:
                with open(os.path.join(dirpath,file_name.replace('.gz','')), 'wb') as f_out:
                    shutil.copyfileobj(f_in, f_out)
    return dirpath
        
    #shutil.rmtree(dirpath)

def Concat_files(dirpath,use_dl=False,file_list=[]):
    """
    Concat gene2ensembl, gene_info and homologene.data in the same file according to EntrezGene IDs
    """

    gene2ensembl = gene_info = homologene = ""
    lTaxID=["9606","9598","9544","9615","9913","10090","10116","9031","8364","7955","7227","7165","6239","4932","28985","33169","4896","318829","5141","3702","4530"]

    if use_dl not in (True,False):
        raise ValueError("'use_dl' can only be either True or False")
    try :
        if use_dl :
            gene2ensembl = os.path.join(dirpath,'gene2ensembl')
            gene_info = os.path.join(dirpath,'gene_info')
            homologene = os.path.join(dirpath,'homologene.data')
        elif len(file_list) == 3 :
            gene2ensembl = file_list[0]
            gene_info = file_list[1]
            homologene = file_list[2]
        else:
            return "ERROR - Not enougth file provided"
    except IOError as e:
        print("args: ", e.args)
        print("errno: ", e.errno)
        print("filename: ", e.filename)
        print("strerror: ", e.strerror)
    
    dData_organized = {}
    # Init dico with gene_info file
    print "INDEX gene_info"
    try :
        fGene_info = open(gene_info,'r')
        for gene_ligne in fGene_info.readlines():
            if gene_ligne[0] != '#':
                line_split = gene_ligne.split('\t')
                tax_id = line_split[0]
                GeneID = line_split[1]
                symbol = line_split[2] 
                synonyms = line_split[4] 
                description = line_split[8]
                if tax_id in lTaxID :
                    if GeneID not in dData_organized :
                        dData_organized[GeneID] = {'tax_id':tax_id,'symbol':symbol,'synonyms':synonyms,'description':description,'homologene':'NA','ensembl':'NA'}
        fGene_info.close()
    except IOError as e:
        print("args: ", e.args)
        print("errno: ", e.errno)
        print("filename: ", e.filename)
        print("strerror: ", e.strerror)

    #Add Ensembl ID informations
    print "INDEX gene2ensembl"
    try :
        fgene2ensembl = open(gene2ensembl,'r')
        for geneensemble_ligne in fgene2ensembl.readlines():
            if geneensemble_ligne[0] != '#':
                line_split = geneensemble_ligne.split('\t')
                tax_id = line_split[0]
                GeneID = line_split[1]
                ensemblID = line_split[2]
                if GeneID in dData_organized :
                    dData_organized[GeneID]['ensembl'] = ensemblID
        
        fgene2ensembl.close()
    except IOError as e:
        print("args: ", e.args)
        print("errno: ", e.errno)
        print("filename: ", e.filename)
        print("strerror: ", e.strerror)

    #Add Homologenes ID informations
    print "INDEX homologene"
    try :
        fhomologene = open(homologene,'r')
        for genehomo_ligne in fhomologene.readlines():
            if genehomo_ligne[0] != '#':
                line_split = genehomo_ligne.split('\t')
                tax_id = line_split[1]
                GeneID = line_split[2]
                homologeID = line_split[0]
                symbol = line_split[3]
                if GeneID in dData_organized :
                    if dData_organized[GeneID]['tax_id'] == tax_id :
                        dData_organized[GeneID]['homologene'] = homologeID
        
        fhomologene.close()
        
    except IOError as e:
        print("args: ", e.args)
        print("errno: ", e.errno)
        print("filename: ", e.filename)
        print("strerror: ", e.strerror)

    print "writting file"
    try :
        resultFile = open(os.path.join(dirpath,'RGV_database_genes.txt'),'a')
        for geneID in dData_organized:
            resultFile.write(geneID+'\t'+dData_organized[geneID]['tax_id']+'\t'+dData_organized[geneID]['homologene']+'\t'+dData_organized[geneID]['ensembl']+'\t'+dData_organized[geneID]['symbol']+'\t'+dData_organized[geneID]['synonyms']+'\t'+dData_organized[geneID]['description']+'\n')
        resultFile.close()
        return [dirpath,os.path.join(dirpath,'RGV_database_genes.txt')]
    except IOError as e:
        print("args: ", e.args)
        print("errno: ", e.errno)
        print("filename: ", e.filename)
        print("strerror: ", e.strerror)
    

def InsertCollections(genefile):
    try :
        logger.debug('CreateCollection - create RGV_geneDB collection')
        #Insert Allbank ID from TOXsIgN_geneDB file
        os.system('mongo rgv --eval "db.dropDatabase()"')
        geneFile = open(genefile[1],'r')
        print "Insert file: " + genefile[1]
        for geneLine in geneFile.readlines():
            if geneLine[0] != '#':
                GeneID = geneLine.split('\t')[0]
                tax_id = geneLine.split('\t')[1]
                homologeneID = geneLine.split('\t')[2]
                ensembleID = geneLine.split('\t')[3]
                Symbol = geneLine.split('\t')[4]
                Synonyms = geneLine.split('\t')[5]
                description = geneLine.split('\t')[6]
                db['genes'].insert({'GeneID': GeneID,
                                 'tax_id' : tax_id,
                                 'Symbol': Symbol,
                                 'Synonyms': Synonyms,
                                 'description': description,
                                 'HID':homologeneID,
                                 'EnsemblID':ensembleID
                                 })
        geneFile.close()
        print "File close"
        shutil.rmtree(genefile[0])

    except IOError as e:
        print("args: ", e.args)
        print("errno: ", e.errno)
        print("filename: ", e.filename)
        print("strerror: ", e.strerror)


