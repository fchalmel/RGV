#!/bin/bash

. /local/env/envpython-2.7.sh
. /local/env/envucsc.sh
. /local/env/envbedtools-2.19.0.sh
. /local/env/envbedops-2.4.2.sh

cd /home/genouest/irset/tdarde/dev/Script/RGV/Scripts/

echo 'Conversion'

python ConvertModule.py -f $1 -w $2 -p $3 -g $4 -c $5

echo 'Conversion from '$4' to '$5' complete.'
