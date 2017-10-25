#!/bin/bash

function usage {
echo -e "\nUsage : $(basename $0) takes 2 to 4 arguments :\n-p (--path) : Input path to convert (required)\n
-g (--genome) : Genome of input file (required)\n-e : Genomes to not convert into (separated with a coma.  e
x : '-e mm10,hg19' (optional)\n-o (--only) : Allow to convert into only one genome (if it exists on the auth
orized list) optional\n"
}

if [ "$1" == "-h" ] || [ "$1" == "--help" ]
        then
                usage
                exit
fi


while (( $# > 1 ))
        do key="$1"
        case $key in
                -p|--path)
                path="$2"
                shift
                ;;
                -g|--genome)
                genome="$2"
                shift
                ;;
                -e)
                except="$2"
                shift
                ;;
                -o|--only)
                only="$2"
                shift
                ;;
                *)
                echo "unknown option"
                usage
                exit
                ;;
        esac
        shift
done

if [ -z $path ]
        then
                echo "Path not indicated"
                usage
                exit #exit the script if the genome of the input file was not indicated
fi


if [ ! -d $path ] #check if the path exists
        then
                echo "the path does not exists"
                exit
fi

if [[ "${path: -1}" != "/" ]]
        then
                path=$path"/"
fi

               

for i in $path*
	do
		if [ -d $i ]
			then
				if [ -n "$only" ]
					then
						/home/genouest/inserm625/rcharles/scriptsRGV/RGV_ConversionFiles.sh -p $i -o $only
					else
						if [ -n "$except" ]
							then
								/home/genouest/inserm625/rcharles/scriptsRGV/RGV_ConversionFiles.sh -p $i -e $except
								else
									/home/genouest/inserm625/rcharles/scriptsRGV/RGV_ConversionFiles.sh -p $i
						fi
				fi
		fi
	sleep 1
	done
