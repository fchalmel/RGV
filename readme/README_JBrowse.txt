# JBrowse est installé dans le répertoire : /mnt/c/xampp/webdav/JBrowse-1.12.3
# Les données pour JBrowse seront stock&es dans : /mnt/c/Projects/RGV_data
# Attention, les répertoires des différents génomes doivent respecter l'organisation imposée par
# JBrowse
#http://gmod.org/wiki/JBrowse_FAQ
#http://jbrowse.org/code/JBrowse-1.12.3/docs/tutorial/
#-----------------------------------------#

FAFILE="/mnt/c/Projects/RGV_data/hg38/genome.2bit.fa"
GFFFILE="/mnt/c/Projects/RGV_data/hg38/RefSeq.complete.gtf.gff"
#-----------------------------------------#
# How do I load my genome as a FASTA file?
# If you have JBrowse installed to your web folder and have run setup.sh, then you can download a FASTA file for your genome and run
# >bin/prepare-refseqs.pl --fasta yourfile.fasta
# This will setup a "data" subfolder inside your jbrowse subdirectory with your genome prepared to view. You can investigate data/trackList.json and other files in this "data" folder to see what it generated.
# Then just open up "http://yourserver.com/jbrowse" and it should be visible with the reference sequence as a track. By default, visiting "http://yourserver.com/jbrowse" will read files from that generated "data" folder. Other configurations are possible, but this is the easiest one.
# ex for hg38 in RGV
# Attention copie dans le répertoire courant
cd /mnt/c/Projects/RGV_data/hg38
/mnt/c/xampp/webdav/JBrowse-1.12.3/bin/prepare-refseqs.pl --fasta $FAFILE








/mnt/c/xampp/webdav/JBrowse-1.12.3/bin/flatfile-to-json.pl --gff $GFFFILE --trackType CanvasFeatures --trackLabel mygff