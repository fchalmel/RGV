import argparse
import  sys,logging
import pickle, os, cPickle
import time 

def ConvertGeneName(fileIn,species,gene2ensembl,fileOut):
    file_gene2ensembl = open(gene2ensembl,'r')
    dico_gene2ensembl = {}
    for gene in file_gene2ensembl.readlines():
        if gene.split('\t')[1] == species:
            dico_gene2ensembl[gene.split('\t')[4]] = gene.split('\t')[3]
    
    file_gene2ensembl.close()

    file_to_convert = open(fileIn,'r')
    file_converted = open(fileOut,'a')

    lConservedLines = ['Sample','X','Y']
    no_converted = 0
    
    for info_line in file_to_convert.readlines():
        if info_line.split('\t')[0] in lConservedLines :
            file_converted.write(info_line)
            continue

        if 'Class' in info_line.split('\t')[0] :
            file_converted.write(info_line)
            continue
        
        if info_line.split('\t')[0] in dico_gene2ensembl :
            if dico_gene2ensembl[info_line.split('\t')[0]] != 'NA':
                all_info = info_line.split('\t')
                all_info[0] = dico_gene2ensembl[info_line.split('\t')[0]]
                file_converted.write('\t'.join(all_info))
            else :
                file_converted.write(info_line)
                no_converted += 1
        else :
            file_converted.write(info_line)
            no_converted += 1
    print "Conversion done"
    print str(no_converted) + " no converted IDs"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Create RGV user')
    parser.add_argument('--file', action='store', dest='fileIn')
    parser.add_argument('--species', action='store', dest='species')
    parser.add_argument('--gene2ensembl', action='store', dest='gene2ensembl')
    parser.add_argument('--out', action='store', dest='fileOut',)

    parser.add_argument('--version', action='version', version='%(prog)s 1.0')
    args = parser.parse_args()
    ConvertGeneName(args.fileIn,args.species,args.gene2ensembl,args.fileOut)