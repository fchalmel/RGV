import os
from ftplib import FTP 

root_dir = "/home/genouest/irset/tdarde"

def checkChain():
    chainIndex = root_dir + "/RGV2/ChainConvert.dat"
    pathChainFile = root_dir + "/RGV2/database/RGV/Chains/"
    fileIn=open(chainIndex,'r')
    listChain=[]
    for line in fileIn.readlines(): #list all the chains supposed to be able to be used
        chains=line.split()[1]
        for i in range(len(chains.split(";"))):
            if chains.split(";")[i] not in listChain:
                listChain.append(chains.split(";")[i])
    fileIn.close()
    i=0
    ftp=FTP('hgdownload.cse.ucsc.edu') #Connection to the ftp server to eventually check the existance of some chains
    ftp.login()
    for ch in listChain:
        if os.path.isfile(pathChainFile+ch+".over.chain.gz")==False and os.path.isfile(pathChainFile+ch+".over.chain")==False: #We check if the file exists in the chains folder 
            ftp.cwd('/goldenPath/'+ch.split("To")[0]+'/liftOver/')
            files_list=ftp.nlst()
            if ch+".over.chain.gz" in files_list: #check if the file exists in the ucsc ftp
                cmd="wget -O "+pathChainFile+ch+".over.chain.gz 'ftp://hgdownload.cse.ucsc.edu/goldenPath/"+ch.split("To")[0]+"/liftOver/"+ch+".over.chain.gz'" #download the missing file
                print cmd                
                os.system(cmd)
                cmd="gunzip "+pathChainFile+ch+".over.chain.gz"
                os.system(cmd)
            else:
                print ch+" does not exists"
    ftp.quit()

def main():
    print "Check if all the chain files exists and are downloaded ..."
    checkChain()

    
if __name__ == "__main__":
    main()
