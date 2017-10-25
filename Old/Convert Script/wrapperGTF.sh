#!/bin/bash

/home/genouest/irset/tdarde/JBrowse-1.11.5/bin/flatfile-to-json.pl  \
    --out $1 \
    --gff $2 \
    --trackLabel $3  \
    --key $4 \
    ;
