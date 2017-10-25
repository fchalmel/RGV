#!/bin/bash

echo 'Insert RefSeq'

/home/genouest/irset/tdarde/JBrowse-1.11.5/bin/flatfile-to-json.pl  \
    --out $1 \
    --gff /home/genouest/irset/tdarde/RGV/sample_data/raw/Genes_and_gene_prediction/$2/$2_RefSeq.complete.gtf.gff \
    --trackLabel $2_RefSeq  \
    --key 'RefSeq' \
    --metadata '{"category": "1- Genes and gene predictions"}' \
    --trackType "JBrowse/View/Track/CanvasFeatures" \
    ;

echo 'Insert Ensembl'

/home/genouest/irset/tdarde/JBrowse-1.11.5/bin/flatfile-to-json.pl  \
    --out $1 \
    --gff /home/genouest/irset/tdarde/RGV/sample_data/raw/Genes_and_gene_prediction/$2/$2_Ensembl.complete.gtf.gff \
    --trackLabel $2_Ensembl  \
    --metadata '{"category": "1- Genes and gene predictions"}' \
    --key 'Ensembl' \
    --trackType "JBrowse/View/Track/CanvasFeatures" \
    ;
