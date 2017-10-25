Le dossier chainfileCreation contient toutes les etapes necessaires a la creation de chainfile, fichiers permettants un liftover de coordonnees d'un genome a un autre.
Pour obtenir toutes les commandes necessaires, il suffit d'executer le script createChainFile.sh avec les arguments suivant :
-o ( ou --old ) : le chemin vers le fichier .fa du genome de reference
-n ( ou --new ) : le chemin vers le fichier .fa du genome cible
Optionel : -p (ou --path) : le chemin de sortie

exemple :
./createChainFile.sh -o /home/genouest/irset/tdarde/RGV2/database/RGV/Genome_sequences/rn6/genome.fa -n /home/genouest/irset/tdarde/RGV2/database/RGV/Genome_sequences/hg19/genome.fa -p /home/genouest/inserm625/rcharles/RGV2/chains/


##################################################


Afin de lancer le pipeline de conversion RGV, 2 commandes sont possibles :

./RGV_ConversionFiles.sh : pour lancer la conversion pour les fichiers dans le dossier demande
Arguments :
	-p : chemin des fichiers a convertir
	-g : genome des fichiers a convertir
	-e : genome(s) vers le(s)quel(s) on ne veut pas convertir, eventuellement separes par une virgule.
	-o : permet de convertir uniquement vers ce genome
exemple :
./RGV_ConversionFiles.sh -p /home/genouest/irset/tdarde/RGV2/database/RGV/Raw_data/Published/Erkek_etal_2013_StructMolBiol/mm9/GEO/ -g mm9 -e mm10,hg19


./Pipeline.sh : pour lancer la conversion dans tous les sous-dossiers presents
dans le dossier donne en argument (si le nom de ces dossier correspond a un
genome, par exemple mm9)
Arguments :
        -p : chemin des dossiers a convertir
        -e : genome(s) vers le(s)quel(s) on ne veut pas convertir,
eventuellement separes par une virgule.
        -o : permet de convertir uniquement vers ce genome

exemple :
./Pipeline -p /home/genouest/irset/tdarde/RGV2/database/RGV/Raw_data/Published/Necsulea_etal_2014_Nature/GEO/ -o mm10

###

testJobs.sh permet de verifier si les jobs sont lancables (cad si les fichiers
sont bien dans le fichier tracksConf)
