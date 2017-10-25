# -----------------------------------------------------------
#
#  Project : RGV2
#  GenOuest / IRSET
#  35000 Rennes
#  France
#
# -----------------------------------------------------------
#  Created on 13 janv. 2015
#  Author: tdarde <thomas.darde@inria.fr>

########################################################################
#                                Import                                #
########################################################################

import os
import json

########################################################################
#                               functions                              #
########################################################################
tplDensity="""\n[ tracks . %s ]
style.pos_color = red
style.neg_color = white
style.bg_color = rgba(256,256,256,0.6)
bicolor_pivot = 3
scale =log
key = %s<br>(%s)
storeClass = JBrowse/Store/BigWig
urlTemplate = %s     
type = JBrowse/View/Track/Wiggle/Density
category = %s
metadata.Description = %s \n\n"""


tplXY = """\n[ tracks . %s ]
key = %s<br>(%s)
storeClass = JBrowse/Store/BigWig
urlTemplate = %s
type = JBrowse/View/Track/Wiggle/XYPlot
category = %s
scale = log        
metadata.Description = %s \n\n"""

tplTrackList ="""    {
        "style" : {
            "className" : "feature"
        },
        "key" : "%s<br>(%s)",
        "storeClass" : "JBrowse/Store/SeqFeature/NCList",
        "trackType" : null,
        "urlTemplate" : "%s",
        "compress" : 0,
        "type" : "FeatureTrack",
        "label" : "%s",
        "category" : "%s"
    },
"""


tplTopic="4- Biological topics/%s/%s/%s/%s"
tplTechno = "5- Technologies/%s/%s/%s/%s"
tplSpecies = "7- Species/%s/%s/%s/%s/%s"
tplPubli="6- Publications/%s/%s/%s"


def confCreatorBW(path,fileIn,fileName):
    confFile = "/home/genouest/irset/tdarde/RGV2/tracksConf.txt" #path of the file used to create conf files
    dLignes={}
    infoTrack = open(confFile,'r')
    lignes = infoTrack.readlines()

    
    
    for i in range(1,len(lignes)):
        #print i
        name = lignes[i].split('\t')[1].strip()
        #print name
        dLignes[name]=i

    speciesDic={"hg":"Human","gorGor":"Gorilla","rheMac":"Macaque","mm":"Mouse","rn":"Rat","bosTau":"Cow","canFam":"Dog","monDom":"Opossum","ornAna":"Platypus","susScr":"Pig","danRer":"Zebrafish","galGal":"Chicken","xenTro":"Frog","sacCer":"Yeast"}
    nameDir=os.path.basename(os.path.abspath(path))
    #spFrom=nameDir.split("To")[0].replace("_","") #get the name of the original species
    spTo=nameDir.split("To")[1] #get the name of the species into the file was converted
    spTo_withoutdigit=''.join(i for i in spTo if not i.isdigit()) #strip the version of the genome (to compare it to the speciesDic)
    spName=speciesDic[spTo_withoutdigit] #get the name of the species (ex. "Human")
    fileout=os.path.abspath(path)+"/"+fileName+"_track.txt"
    confFile = open(fileout,'w') #creation of the track file, which will be copied on another file later    

    nbLigne = dLignes[fileName]
    infoLigne = lignes[nbLigne]
    trackName = infoLigne.split('\t')[0].rstrip()
    Publi = infoLigne.split('\t')[2].rstrip()
    Topic = infoLigne.split('\t')[3].rstrip()
    techno = infoLigne.split('\t')[4].rstrip()
    technoGlob = infoLigne.split('\t')[5].rstrip()
    year = infoLigne.split('\t')[6].rstrip()
    other = infoLigne.split('\t')[7].rstrip()
    species = infoLigne.split('\t')[8].rstrip()
    meta = infoLigne.split('\t')[9].rstrip()
    types = infoLigne.split('\t')[10].rstrip()
    Key=Publi.split("(")[0].rstrip()+" "+year.replace("-","")
    url = path.replace("/home/genouest/irset/tdarde/RGV/sample_data/","")+"/"+fileIn
    
    if other != "NA":
        infoTopic = tplTopic % (Topic,techno,year,Publi+"/"+other)
        infoTechno = tplTechno % (technoGlob,techno,year,Publi+"/"+other)
        infoSpecies = tplSpecies % (species,Topic,techno,year,Publi+"/"+other)
        infoPubli = tplPubli % (year,Publi,techno+"/"+other)
    else :
        infoTopic = tplTopic % (Topic,techno,year,Publi)
        infoTechno = tplTechno % (technoGlob,techno,year,Publi)
        infoSpecies = tplSpecies % (species,Topic,techno,year,Publi)
        infoPubli = tplPubli % (year,Publi,techno)
        
    lCategories = [infoTopic,infoTechno,infoSpecies,infoPubli]
    dCategories = {infoTopic:"_topics",infoTechno:"_techno",infoSpecies:"_species",infoPubli:"_publi"}
    
    for catego in lCategories :
        if "Density" in types :
            if meta == "NONE" :
                meta = ""
            tplFinal = tplDensity % (fileName.replace('.','_')+dCategories[catego],trackName,Key,url,catego,meta)
            confFile.write(tplFinal)
        else :
            if meta == "NONE" :
                meta = ""
            tplFinal = tplXY % (fileName.replace('.','_')+dCategories[catego],trackName,Key,url,catego,meta)
            confFile.write(tplFinal)
         
    infoTrack.close()
    confFile.close()
    cmd = "cat "+fileout+" >> /home/genouest/irset/tdarde/RGV/sample_data/json/"+spName+"/"+spTo+"/tracks.conf"
    print "[CMD] "+cmd
    os.system(cmd)


def confCreatorGTF(path,fileIn,fileName):
    confFile = "/home/genouest/irset/tdarde/RGV2/tracksConf.txt" #path of the file used to create conf files
    dLignes={}
    infoTrack = open(confFile,'r')
    fileout=os.path.abspath(path)+"/track.json"
    confFile = open(fileout,'w') #creation of the track file, which will be copied on another file later
    lignes = infoTrack.readlines()
    for i in range(1,len(lignes)): #Creation dictionnary containing the files names and their lines in the trackConf file
        name = lignes[i].split("\t")[1].strip()
        #print name
        dLignes[name]=i
    speciesDic={"hg":"Human","gorGor":"Gorilla","rheMac":"Macaque","mm":"Mouse","rn":"Rat","bosTau":"Cow","canFam":"Dog","monDom":"Opossum","ornAna":"Platypus","susScr":"Pig","danRer":"Zebrafish","galGal":"Chicken","xenTro":"Frog","sacCer":"Yeast"}
    nameDir=os.path.basename(os.path.abspath(path))
    #spFrom=nameDir.split("To")[0].replace("_","") #get the name of the original species
    spTo=nameDir.split("To")[1] #get the name of the species into the file was converted
    spTo_withoutdigit=''.join(i for i in spTo if not i.isdigit()) #strip the version of the genome (to compare it to the speciesDic)
    spName=speciesDic[spTo_withoutdigit] #get the name of the species (ex. "Human")
    startJson="""{
    "tracks" : [
"""
    confFile.write(startJson)
    tplFinal=""
    nbLigne = dLignes[fileName]
    infoLigne = lignes[nbLigne]
    trackName = infoLigne.split('\t')[0].rstrip()
    Publi = infoLigne.split('\t')[2].rstrip()
    Topic = infoLigne.split('\t')[3].rstrip()
    techno = infoLigne.split('\t')[4].rstrip()
    technoGlob = infoLigne.split('\t')[5].rstrip()
    year = infoLigne.split('\t')[6].rstrip()
    other = infoLigne.split('\t')[7].rstrip()
    species = infoLigne.split('\t')[8].rstrip()
    Key=Publi.split("(")[0].rstrip()+" "+year.replace("-","")
    track="tracks/"+fileName.replace('.','_')+"/{refseq}/trackData.json"
    print track
    if other != "NA":
        infoTopic = tplTopic % (Topic,techno,year,Publi+"/"+other)
        infoTechno = tplTechno % (technoGlob,techno,year,Publi+"/"+other)
        infoSpecies = tplSpecies % (species,Topic,techno,year,Publi+"/"+other)
        infoPubli = tplPubli % (year,Publi,techno+"/"+other)
    else :
        infoTopic = tplTopic % (Topic,techno,year,Publi)
        infoTechno = tplTechno % (technoGlob,techno,year,Publi)
        infoSpecies = tplSpecies % (species,Topic,techno,year,Publi)
        infoPubli = tplPubli % (year,Publi,techno)  
    lCategories = [infoTopic,infoTechno,infoSpecies,infoPubli]
    dCategories = {infoTopic:"_Topics",infoTechno:"_Techno",infoSpecies:"_Species",infoPubli:"_Publi"}
    for catego in lCategories :
        tplFinal += tplTrackList % (trackName,Key,track,fileName.replace('.','_')+dCategories[catego],catego)
    cmd = "qsub /home/genouest/irset/tdarde/dev/Script/RGV/Scripts/wrapperGTF.sh /home/genouest/irset/tdarde/RGV/sample_data/json/"+spName+"/"+spTo+"/ "+os.path.abspath(fileIn)+" "+fileName.replace('.','_')+" '"+trackName+"'"
    print "[CMD] "+cmd
    #os.system(cmd)
    tplFinal=tplFinal[:-2]
    tplFinal+="\n    ]\n}"
    confFile.write(tplFinal)
    infoTrack.close()
    confFile.close()
    JsonFile = "/home/genouest/irset/tdarde/RGV/sample_data/json/"+spName+"/"+spTo+"/trackList.json"
    oldJson=open(JsonFile,'r')
    update=open(fileout,'r')
    old=json.load(oldJson)
    up=json.load(update)
    old["tracks"].extend(up["tracks"])
    newJson=open(os.path.abspath(path)+"/newTrack"+fileName+".json","w")
    json.dump(old,newJson,indent=5)
    oldJson.close()
    update.close()
    newJson.close()    
    
    cmd = "cp "+os.path.abspath(path)+"/newTrack"+fileName+".json /home/genouest/irset/tdarde/RGV/sample_data/json/"+spName+"/"+spTo+"/trackList.json"
    print "[CMD] "+cmd
    os.system(cmd)


#def main():
#    """
#    
#    Main function
#    
#    """
#    parser = argparse.ArgumentParser()
#
#    parser.add_argument('-p','--path', action='store', dest='file_value',help='path to convert',required=True)
#    
#    parser.add_argument('-o','--out', action='store', dest='outpath_value',help='output path')
#    
#    parser.add_argument('-t','--type', action='store', dest='type_value',help='type of files', required=True)
#
#    
#
#    try:
#        results = parser.parse_args()
#        #print results.file_value,results.genome_value,results.convertgenome_value
#        if results.type_value=="gtf" or results.type_value==".gtf":
#            confCreatorGTF(confFile,results.file_value)
#        elif results.type_value=="bw" or results.type_value==".bw":
#            confCreatorBW(confFile,results.file_value)
#    except IOError, msg:
#        parser.error(str(msg))
#
#
#if __name__ == "__main__":
#    main()
