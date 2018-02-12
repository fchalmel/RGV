import argparse
import  sys,logging
import pickle, os, cPickle
import time 



def createIndex(file_in):
    """
    Create index file from FileList...
    Write dictionary in pickle file
    """
    try :
        fInput=open(file_in,"r")
        dIndex={'Clusters':0}
        lPosition = []
        while fInput.readline() != '':
            position = fInput.tell()
            lPosition.append(position)
        
        for iIndex in lPosition:    
            fInput.seek(iIndex)
            sIdList=fInput.readline().rstrip().split("\t")[0]
            dIndex[sIdList]=iIndex
        logging.info("Pickle dictionary")
        pickle.dump(dIndex, file(file_in+".pickle","w"))
        fInput.close()
        
    except IOError, e:
        print e

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Initialize database content.')
    parser.add_argument('--file')
    args = parser.parse_args()
    createIndex(args.file)