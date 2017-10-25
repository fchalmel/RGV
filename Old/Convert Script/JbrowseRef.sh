#!/bin/bash

lGenome="galGal3 gorGor3 hg19 mm10 monDom5 ornAna1 rheMac3 bosTau7 canFam3 rn6 susScr3 danRer7 xenTro3 sacCer3"

for genome in $lGenome
do
	outPath="/home/genouest/irset/tdarde/myOGV/"
	fasta="/home/genouest/irset/tdarde/RGV2/database/RGV/Genome_sequences/"
	refseq="/home/genouest/irset/tdarde/RGV2/database/RGV/Genes_and_gene_predictions/"
	case $genome in
		"galGal3")
		org="Chicken"
		;;
		"gorGor3")
		org="Gorilla"
		;;
		"mm10")
		org="Mouse"
		;;
		"ornAna1")
		org="Platypus"
		;;
		"rheMac3")
		org="Macaque"
		;;
		"sacCer3")
		org="Yeast"
		;;
		"xenTro3")
		org="Frog"
		;;
		"canFam3")
		org="Dog"
		;;
		"hg19")
		org="Human"
		;;
		"monDom5")
		org="Opossum"
		;;
		"rn6")
		org="Rat"
		;;
		"susScr3")
		org="Pig"
		;;
		"bosTau7")
		org="Cow"
		;;
		"danRer7")
		org="Zebrafish"
		;;
	esac
	outPath=$outPath"json/"$org"/"$genome"/"
	fasta=$fasta$genome"/genome.fa"
	#echo "outpath : "$outPath
	#echo "fasta : "$fasta
	qsub -N "Jbrowse myogv Seq" /home/genouest/inserm625/rcharles/scriptsRGV/prepSeq.sh $fasta $outPath
	qsub -N "Jbowse myogv Gff" /home/genouest/inserm625/rcharles/scriptsRGV/insertJB.sh $outPath $genome
done
