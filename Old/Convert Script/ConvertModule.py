# -----------------------------------------------------------
#
#  Project : RGV2
#  GenOuest / IRSET
#  35000 Rennes
#  France
#
# -----------------------------------------------------------
#  Created on 17 dec. 2014
#  Author: tdarde <thomas.darde@inria.fr>

########################################################################
#                                Import                                #
########################################################################
import os
import argparse
import confFileCreator as conf

print "Start RGV ConvertModule"

########################################################################
#                                Functions                             #
########################################################################

root_dir = "/home/genouest/irset/tdarde"

def getChromInfo(genome):
    """
    return ChromInfo files of genome
    """
    #######   /!\ Configure path   #######
    return root_dir + "/RGV2/database/RGV/Genome_sequences/"+genome+"/ChromInfo.txt"

def source():
    """
    source env needed
    """
    cmdSource="source /local/env/envucsc; source /local/env/envbedtools-2.19.0; source /local/env/envpython-2.7"
    os.system(cmdSource)
    
def BedToBigWig(bedFile,genome,format=True):
    """
    Convert sorted bedFile in BigWig file
    use ucsc command bedGraphToBigWig
    """
    #source()
    print "BedToBigWig"
    chromInfo = getChromInfo(genome)
    if format == True :
        bedFile = Format(bedFile,genome)
    bedFileTmp = os.path.abspath(bedFile)+"_tmp.bed"
    preparCmd = "sort -k1,1 -k2,2n %s |awk -v OFS=\"\\t\" '{print $1,$2,$3,NR,$4}' |bedtools merge -d -1 -scores mean > %s \n" % (bedFile,bedFileTmp)
    print "[CMD] "+preparCmd 
    os.system(preparCmd)
    BwigFile = bedFile+".bw"
    cmd = "bedGraphToBigWig %s %s %s \n" % (bedFileTmp,chromInfo,BwigFile)
    print "[CMD] "+cmd 
    os.system(cmd)
    rmTmp = "rm %s \n" % (bedFileTmp)
    print "[CMD] "+rmTmp
    os.system(rmTmp)
    return BwigFile

def WigToBed(wigFile):
    """
    Convert sorted wig File in Bed file
    use bedops command wig2bed
    """
    BedFile = os.path.abspath(wigFile)+".bed"
    cmd = "wig2bed < %s > %s" % (wigFile,BedFile)
    print "[CMD] "+cmd
    os.system(cmd)
    BedFile=Bed6ToBed4(BedFile)
    return BedFile

def BamToBigWig(bamFile,genome):
    """
    Convert bam File in BigWig file
    use ucsc command wigToBigWig and bedtools
    """
    #source()
    print "Convert from Bam to BigWig"
    #BedFile = bamFile.replace('.bam','.bed')
    BedFile = os.path.abspath(bamFile)+".bed"
    cmdConvert = "bedtools bamtobed -i %s > %s" % (bamFile,BedFile)
    print "[CMD] "+cmdConvert 
    os.system(cmdConvert)
    Bed4 = Bed6ToBed4(BedFile)
    finalBed = Format(Bed4,genome)
    fileBw = BedToBigWig(finalBed, genome,False)
    return fileBw

def BwToBed(bwFile):
    """
    Convert a BigWig file in a Bed file
    use ucsc command bigWigToBedGraph
    """
    print "Convert bw to bed"
    bedFile = os.path.abspath(bwFile)+".bed"
    cmd="bigWigToBedGraph %s %s" % (bwFile, bedFile)
    print "[CMD] "+cmd 
    os.system(cmd)
    return bedFile    
    
def Bed6ToBed4(bedfile):
    """
    Convert all bed6 file in bed4 file
    """
    print "Convert all bed6 file in bed4 file"
    extFile = bedfile.split('.')[-1]
    if extFile == 'bed':
        cmd="awk -v OFS=\"\\t\" '{print $1,$2,$3,$5}' %s > %s" % (bedfile,bedfile+'.bed6to4.bed')
        print "[CMD] "+cmd
        os.system(cmd)    
    return bedfile+'.bed6to4.bed'
    
def BamToBed(bamFile):
    """
    Convert a bam file in a bed file
    """
    print "Convert from bam to bed"
    bedFile = os.path.abspath(bamFile)+".bed"
    cmd="bedtools bamtobed -i %s > %s" % (bamFile,bedFile)
    print "[CMD] "+cmd
    os.system(cmd)
    bedFile=Bed6ToBed4(bedFile)
    return bedFile

def Format(noFormatFile,genome): ###Bed4= bedgraph
    """
    Format a file into a bed4 one (with values)
    Remove all information not in relation with ChromInfo
    """
    ext = noFormatFile.split('.')[-1]
    if ext.lower() == "bed" or ext.lower() == "bedgraph": #check if this is a bed file
        lChr={} #Dictionnary containing the name of chromosomes
        listChr=[] #List containing the 
        chromInfo = open(getChromInfo(genome),'r') #open the file containing the names of the chromosomes for the genome
        fileOut = open(os.path.abspath(noFormatFile)+".format.bed",'w') #output file
        for chrlines in chromInfo : #fill the chromosomes dictionnary
            chrName = chrlines.split('\t')[0]
            chrNum=chrName[3:]
            maxChr = chrlines.split('\t')[1]
            if chrName not in lChr :
                lChr[chrName]=maxChr
            if chrNum not in listChr :
                try :
                    listChr.append(int(chrNum)) #To enter the number of the chromsome as an integer
                except ValueError:
                    listChr.append(chrNum)
        chromInfo.close()
        fileIn = open(noFormatFile,'r') #open the file to convert
        for line in fileIn.readlines():
            if "track" not in line.split()[0] and "browser" not in line.split()[0] and "#" not in line.split()[0]: #we check if the line is not a header line (normaly a header for a bedgraph file starts with 'track', 'browser or #)
                chrom=line.split()[0]
                if chrom not in lChr:
                    if "chr" in chrom: #if the chromosome is written like "chrZ"
                        try :
                            if int(chrom[3:]) in listChr:    #in the case of the name of the chromosome being written like : '1' or '01'
                                chrom = "chr"+str(int(chrom[3:])) #allow to convert 01 to 1 for exemple
                        except ValueError:
                            if chrom.upper() in lChr :
                                chrom = "chr"+chrom[3:].upper() #in the case where the chromosome is written like "chrx" instead of "chrX"
                    else: #chromosome written like 1
                        try:                            
                            if int(chrom) in listChr:
                                chrom = "chr"+str(int(chrom)) #allow to convert 01 to 1 for exemple
                        except ValueError:
                            if chrom.upper() in listChr:
                                chrom="chr"+chrom.upper()
                start = line.split("\t")[1]
                end = line.split("\t")[2]
		try:
                	val = line.split("\t")[3]
		except:
			val = "1"
                if chrom in lChr:
                    if int(start)<int(lChr[chrom]) and int(end)<int(lChr[chrom]): #Check if the values are still on the range of the chromosome
                        fileOut.write(chrom+"\t"+start+"\t"+end+"\t"+val)   #write on the output file under the bed4 format
        fileIn.close()
        fileOut.close()
        return os.path.abspath(noFormatFile)+".format.bed"
    elif ext.lower() == "wig":
        return Format(WigToBed(noFormatFile),genome)
    elif ext.lower() == "bam":
        return Format(BamToBed(noFormatFile),genome)
    elif ext.lower() == "bw" or ext.lower() == "bigwig":
        return Format(BwToBed(noFormatFile),genome)
    


#def Format(noFormatFile,genome):
#    """
#    Format all file in path like ucsc ChromInfo
#    Remove all information not in relation with ChromInfo
#    """
#    print "Format: "+getChromInfo(genome)
#    chromInfo = open(getChromInfo(genome),'r')
#    lChr={}
#    lChrom=str(range(25))
#    for chrlines in chromInfo :
#        chrName = chrlines.split('\t')[0]
#        maxChr = chrlines.split('\t')[1]
#        if chr not in lChr :
#            lChr[chrName]=maxChr
#
#    ext = noFormatFile.split('.')[-1]
#    if ext == "bed":
#        fileIn = open(noFormatFile,'r')
#        fileOut = open(os.path.basename(noFormatFile)+".format.bed","w")
#        for lines in fileIn.readlines():
#            chrom = lines.split("\t")[0]
#            if chrom not in lChr :
#                if lines[0] == "M" :
#                    chrom = "chrM"
#                elif lines[0] in lChrom :
#                    chrom = "chr"+str(chrom)
#
#            deb = lines.split("\t")[1]
#            fin = lines.split("\t")[2]
#            val = lines.split("\t")[3]
#            if chrom in lChr :
#                if int(deb)<int( lChr[chrom]) and int(fin)<int( lChr[chrom]):
#                    fileOut.write(chrom+"\t"+deb+"\t"+fin+"\t"+val)
#        fileIn.close()
#        fileOut.close()
#        print file
#        #rm = "rm %s" % (file)
#        #os.system(rm)
#    return os.path.basename(file)+".format.bed"

def liftOver(fileIn,genome1,genome2):
    """
    Use Crossmap to mapped genome of species 1 to genome of species 2 for bedgraph files
    """
    outFile=fileIn+"_"+genome1+"To"+genome2+".bed"
    if genome1 == genome2 :
        mvcmd = "mv %s %s" % (fileIn,outFile)
        os.system(mvcmd)
        return outFile
    dChain = chainReaction(genome1,genome2)
    inputF = fileIn
    for chainFile in dChain :
        output = inputF+"."+chainFile
        chain = getChain(chainFile)
        cmd = " CrossMap.py bed  %s %s %s 2>&1" % (chain,inputF,output) 
        inputF = output
        print "[CMD] "+cmd
        os.system(cmd)
    mvcmd = "mv %s %s" % (inputF,outFile)
    os.system(mvcmd)
    return outFile

def liftOverGtf(fileIn,genome1,genome2):
    """
    Use Crossmap to mapped genome of species 1 to genome of species 2 for gtf files
    """
    outFile=fileIn+"_"+genome1+"To"+genome2+".gtf"
    if genome1 == genome2 :
        mvcmd = "mv %s %s" % (fileIn,outFile)
	os.system(mvcmd)
	return outFile
    dChain = chainReaction(genome1,genome2)
    inputF = fileIn
    for chainFile in dChain :
        output = inputF+"."+chainFile
        chain = getChain(chainFile)
        cmd = " CrossMap.py gff  %s %s %s 2>&1" % (chain,inputF,output) 
        inputF = output
        print "[CMD] "+cmd
        os.system(cmd)
    mvcmd = "mv %s %s" % (inputF,outFile)
    os.system(mvcmd)
    return outFile

def chainReaction(genome1,genome2):
    """
    Return list of chain file need to use to convert genome1 to genome 2
    :Parameters:
        genome1 : string
            genome to convert
        
        genome2 : string
            genome converted
    
    :Return:
        chainList : list
            list of chain file need to use 
    """
    chainIndex = root_dir + "/RGV2/ChainConvert.dat"
    dChain={}
    assoName = genome1+'To'+genome2.upper()[0]+genome2[1:]
    fileIn = open(chainIndex,'r')
    for lines in fileIn.readlines():
        fileName = lines.split('\t')[0]
        dChain[fileName] = []
        lfilesUsed = lines.split('\t')[1]
        if ';' in lfilesUsed :
            for files in lfilesUsed.split(';'):
                dChain[fileName].append(files.replace("\n",""))
        else :
            dChain[fileName].append(lfilesUsed.replace("\n",""))
    fileIn.close()
    return dChain[assoName]

def getChain(convert):
    """
    get chain file for conversion
    """
    #######   /!\ Configure path   #######
    pathChainFile = root_dir + "/RGV2/database/RGV/Chains/"
    return pathChainFile+convert+".over.chain"


def runConvert(inputFile,workdir,genome,genomeFinal,finaldir):
    '''
    Recognize file extension and launch appropriate conversion
    '''
    extFile = inputFile.split('.')[-1]
     
    if extFile.lower() == 'bed' or extFile.lower() == 'bedgraph' or extFile.lower() == 'wig' or extFile.lower() == 'bam' or extFile.lower() == 'bw' or extFile.lower() == 'bigwig':
        finalBed=Format(inputFile,genome) #Convert to a bedgraph format and noramlize the file
        finalFile = liftOver(finalBed,genome,genomeFinal) #Convert the coordinates into the genome wanted
        fileBW = BedToBigWig(finalFile,genomeFinal) #Convert the bedgraph file into a bw file (for easier storage)
        cmd1="mv %s %s" % (fileBW,finaldir+fileBW.replace(workdir,""))
        print "[CMD] "+cmd1
        os.system(cmd1) #Put the .bw file into the final directory
        cmd2 = "rm -rf %s" % (workdir)
        print "[CMD] "+cmd2
        os.system(cmd2) #Delete the temporary working directory
        conf.confCreatorBW(finaldir,os.path.basename(fileBW),os.path.basename(inputFile)) #Call the script confCreator to create the conf file
        print "conf file created"
        return "Conversion DONE"
    
    if extFile.lower() == 'gtf' or extFile.lower() == 'gff':
        print "Gtf File"
        finalFile = liftOverGtf(inputFile,genome,genomeFinal) #Convert the coordinates into the genome wanted
        cmd1="mv %s %s" % (finalFile,finaldir+finalFile.replace(workdir,""))
        print "[CMD] "+cmd1
        os.system(cmd1) #Put the file into the final directory
        cmd2 = "rm -rf %s" % (workdir)
        print "[CMD] "+cmd2
        os.system(cmd2) #Delete the temporary working directory
        conf.confCreatorGTF(finaldir,os.path.basename(finalFile),os.path.basename(inputFile)) #Call the script confCreator to create the conf file and convert the gtf/gff file into a json format
        return "Conversion DONE"
            
           


########################################################################
#                                Main                                  #
########################################################################

def usage():
    print """ 
              Convert files for RGV
              -h or --help        show this message
              -c                  format files
              --file              file to convert
              --genome            genome of source file
              --genomeOut         genome of output file
              
                  Created by Toma
    
          """
def main():
    """
    
    Main function
    
    """
    parser = argparse.ArgumentParser()

    parser.add_argument('-f','--file', action='store', dest='file_value',help='File to convert',required=True)

    parser.add_argument('-g','--genome', action='store', dest='genome_value',help='Genome of input file',required=True)

    parser.add_argument('-c','--genomeOut', action='store',dest='convertgenome_value',help='Genome of converted file',required=True)

    parser.add_argument('-w','--workdir', action='store',dest='workdir',help='Work directory', required=True)
    
    parser.add_argument('-p','--pathOut', action='store', dest='poutput_value', help='Output path name')

    try:
        results = parser.parse_args()
        #print results.file_value,results.genome_value,results.convertgenome_value,results.output_value
        runConvert(results.file_value,results.workdir,results.genome_value,results.convertgenome_value,results.poutput_value)
    except IOError, msg:
        parser.error(str(msg))

if __name__ == "__main__":
    main()
