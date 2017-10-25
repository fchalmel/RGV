#!/bin/bash

function usage {
echo -e "\nUsage : $(basename $0) takes 2 to 4 arguments :\n-p (--path) : Input path to convert (required)\n-g (--genome) : Genome of input file (required)\n-e : Genomes to not convert into (separated with a coma.  ex : '-e mm10,hg19' (optional)\n-o (--only) : Allow to convert into only one genome (if it exists on the authorized list) optional\n"
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

if [ -z $genome ]
	then
		echo "Genome of input file not indicated"
		genome=$(basename $path)
		#exit #exit the script if the genome of the input file was not indicated
fi


if [ -n $except ]
	then
		exceptArr=$(echo $except | tr "," " ")
fi

lGenome="galGal3 gorGor3 hg19 mm10 monDom5 ornAna1 rheMac3 bosTau7 canFam3 rn6 susScr3 danRer7 xenTro3" #list of genomes we want our files to be converted into

for x in $exceptArr
do
	lGenome=${lGenome/$x/""} #Allows to delete the genomes we do not want our files to be translated into from the list of genomes
done

if [ -n $only ]
	then
		bis=$lGenome
		for x in $lGenome
		do
			if [[ "$x" == "$only" ]]
				then
					lGenome=$only
			fi
		done
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

nomSub=$(echo $path | sed -e 's/^.*Published\/\|^.*Ongoing\///')
nomSub=${nomSub/"/"*}
nomSub=$nomSub"_"$genome"_"

i=0
index=1

for refGe in $lGenome
do
	declare -A dicNameGenome
	dicNameGenome=( ["hg19"]="Human" ["gorGor3"]="Gorilla" ["rheMac3"]="Macaque" ["mm10"]="Mouse" ["rn6"]="Rat" ["bosTau7"]="Cow" ["canFam3"]="Dog" ["monDom5"]="Opossum" ["ornAna1"]="Platypus" ["susScr3"]="Pig" ["danRer3"]="Zebrafish" ["galGal3"]="Chicken" ["xenTro3"]="Frog" )
	outPath1=${path/"/home/genouest/irset/tdarde/RGV2/database/RGV/Raw_data/"/"/home/genouest/irset/tdarde/RGV/sample_data/raw/"}
	outPath=$outPath1"_"$genome"To"$refGe #Creates a path where the results will be put 
	echo $outPath
	#mkdir -p $outPath
	Files=$(ls $path)
	#Files=$(ls $path | grep ".*bw$\|.*[Bb]ig[Ww]ig$\|.*bed$\|.*wig$\|.*bed[gG]raph$\|.*bam$")
	for file in $Files
		do
			if grep -q "$file" /home/genouest/inserm625/rcharles/RGV2/tracksConf.txt
			then
				let "i = $i + 1"
				echo $file
				time=$(date +"%s")
				if (( $i % 10 == 0))
				then
					let "index = $i -1"
				fi
				#echo "index : "$index
				nomSubmit=$nomSub$i
				workdir="/home/genouest/inserm625/rcharles/workDir/"$time #Creates a temporary working directory
				#mkdir $workdir
				#cp $path$file $workdir
				echo $i
				if (( $index == 1 ))
					then
						echo "qsub -N 'cp$nomSub$i' cp $path$file $workdir"
						echo "qsub -N '$nomSubmit' -hold_jid cp$nomSub$i /home/genouest/inserm625/rcharles/RGV_test/wrapperConvert.sh $workdir/$file $workdir $outPath $genome $refGe"
					else
						lastJob=$nomSub$index
						echo "qsub -N 'cp$nomSub$i' -hold_jid $lastJob cp $path$file $workdir"
						echo "qsub -N '$nomSubmit' -hold_jid cp$nomSub$i /home/genouest/inserm625/rcharles/RGV_test/wrapperConvert.sh $workdir/$file $workdir $outPath $genome $refGe"
				fi
				ext=${file##*.}
				if [[ $ext == [Gg][tTFf][fF] ]]
					then
						nameGenome="${dicNameGenome["$refGe"]}"
						outFile=$outPath"/"$file"_"$genome"To"$refGe"."$ext
						trackLabel=$(echo "$file" | tr . _)
						jsonKey=$(awk -v file="$file" 'BEGIN {FS="\t"} $2 == file {print $1}' /home/genouest/inserm625/rcharles/RGV2/tracksConf.txt)
						echo "qsub -N 'Json$nomSubmit' -hold_jid $nomSubmit /home/genouest/inserm625/rcharles/RGV/wrapperGTF.sh /home/genouest/irset/tdarde/RGV/sample_data/json/$nameGenome/$refGe/ $outFile $trackLabel '$jsonKey'" #etc...
						
				fi
			fi
		done
done

echo "All jobs submitted"
exit 0
