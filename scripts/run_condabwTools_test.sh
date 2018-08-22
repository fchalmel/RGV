#! /bin/bash

. /local/env/envconda.sh

conda create -p /home/genouest/irset/tdarde/bw_test_env -c pwwang bwtool
source activate /home/genouest/irset/tdarde/bw_test_env
cd projects/RGV/20180105/data/
time bwtool lift sample.forward.bw /groups/irset/archives/genomes/hg38/liftover/hg38ToRn6.over.chain sample.forward.h38ToRn6.bw