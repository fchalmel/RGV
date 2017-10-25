#-*- coding: utf-8 -*-
# -----------------------------------------------------------
#
#  Project : RGV
#  GenOuest / IRSET
#  35000 Rennes
#  France
#
# -----------------------------------------------------------
"""
Created on Thu Apr 28 16:26:55 2016
Author: tdarde <thomas.darde@inria.fr>
Last Update : 28/04/2016
"""


########################################################################
#                                                                      #
#    Complete script description here                                  #
#    Don't forget to change the main function arguments                #
#                                                                      #
########################################################################

########################################################################
#                                Import                                #
########################################################################
import argparse
import os,shutil,logging
########################################################################
#                                Functions                             #
# Use this format :                                                    #
#def CreateVersusFile(1,2,3):                                          #
#    """                                                               #
#    Main fonction                                                     #
#    For each projects list all conditions and CAS, create directory   #
#    for condition.                                                    #
#    Create CAS file and treatment.info files                          #
#                                                                      #
#    :param 1: project's path                                          #
#    :param 2: tissue where the studie is performed                    #
#    :param 3: file with a celfile to remove per ligne                 #
#    :type 1: string                                                   #
#    :type 2: string                                                   #
#    :type 3: string                                                   #
#    :return: Condition status                                         #
#    :rtype: string                                                    #
#                                                                      #
#                                                                      #
#    .. todo:: fix error with multi txt files and CAS files            #
#    """                                                               #
#                                                                      #
########################################################################
def makeDir(path,directory):
    """
    Make directory
    :param path:project path 
    :param directory: final project path to create
    :type directory: string
    :type path: string
    """
    try :
        if not os.path.exists(directory):
            os.makedirs(directory)
    except IOError, e:
        logging.info("RGV ERROR :: makeDir ::") 
        logging.debug(e)



########################################################################
#                                Main                                  #
########################################################################
def main():
    """
    
    Main function
    
    """
    parser = argparse.ArgumentParser()

    parser.add_argument('-t','--tissue', action='store', dest='tissue_value',help='Tissue',required=True)

    parser.add_argument('-p','--path', action='store', dest='path_value',help='Output path',required=True)
    
    parser.add_argument('-e','--except', action='store', dest='e_value',help='Except file',required=True)

    try:
        results = parser.parse_args()
        CreateVersusFile(results.path_value,results.tissue_value,results.e_value)
    except IOError, msg:
        parser.error(str(msg))

if __name__ == "__main__":
    main()        

