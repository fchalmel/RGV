import argparse
import  sys,logging
import pickle, os, cPickle
import mygene


def convertFile(file_to_convert,species):
    file_in = open(file_to_convert, 'r')
    mg = mygene.MyGeneInfo()
    strf = ""
    l_nongenes = ['Clusters','Sample','x','y','Class']
    file_out = open(file_to_convert+'_converted.txt','w')
    x = 1
    for lines in file_in.readlines():
        splitLine = lines.split('\t')
        if splitLine[0] not in l_nongenes :
            print x
            x += 1
            EnsemblSymbol = splitLine[0]
            mgquery = mg.query(EnsemblSymbol, species=species)
            for hits in mgquery['hits']:
                if 'entrezgene' in hits:
                    EntrezId = hits['entrezgene']
                    splitLine[0] = str(EntrezId)
                    strval = '\t'.join(splitLine)
                    file_out.write(strval)
        else :
            file_out.write(lines)
    
        

    file_in.close()
    file_out.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Convert Single-cell file using Ensembl Symboln to EntrezGene IDs')
    parser.add_argument('--file')
    parser.add_argument('--species')
    args = parser.parse_args()
    convertFile(args.file,args.species)

