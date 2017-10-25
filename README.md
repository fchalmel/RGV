# Status

In development

# Installation

Download the code, then

    python setup.py develop

# Configuration

Copy development.ini.template to development.ini then fill app:main section parameters

*admin* contains the list of site administrators (emails, comma separated)

# Run

## Development

    pserve development.ini

## Production

	pserve production.ini

# Create a user

It is possible to create a user via command line to avoid email validation

    python create_user.py --config development.ini --email test@test1 --pwd test

# Docker

Start mongodb, then the toxsign container. In development.ini, set mongodb
hostname to corresponding mongo container name (here toxsign-mongo)
     
    docker run --name toxsign-mongo -d mongo
    docker run --name toxsign-elasticsearch -d elasticsearch
    docker run --name toxsign-web --link toxsign-elasticsearch:toxsign-elasticsearch  --link toxsign-mongo:toxsign-mongo -v path_to/development.ini:/opt/toxsign/development.ini -p 6543:6543 osallou/toxisgn:dev

For data persistency, you should mount a volume to :

	/opt/toxsign/var/upload ( -v path_to_storage:/opt/toxsign/var/upload )

To create a user:

    docker exec toxsign-web python create_user.py --config development.ini --email test@test --pwd test

Manual:

    docker run --link toxsign-mongo:mongo -v path_to/development.ini:/opt/toxsign/development.inii -it -p 6543:6543 --entrypoint /bin/bash osallou/toxisgn:dev
    #>pserve development.ini


# Commands
##Database gestion

To reset database :

	mongo chemsign2 --eval "db.signature.drop()"
	
To reset ElasticSearch indexes:
	
	curl -XDELETE localhost:9200/toxsign
	
##Upload website
Docker run :

	docker -H 127.0.0.1:2375 run -d -p 6543:6543 -v /home/genouest/bioinfo/irset/toxsign:/opt/toxsign  --link toxsign-elasticsearch:toxsign-elasticsearch --link toxsign-mongo:toxsign-mongo --name toxsign-webapp toxsign-web gunicorn  -p toxsign.pid --log-config=/opt/toxsign/production.ini --paste /opt/toxsign/production.ini

Execute commands in container:

    docker -H 127.0.0.1:2375 exec -it 6ac4fbd53605 /bin/bash
    
##Local access
192.168.1.218

#Prepare Ontologies
Use .obo files  and run :

	wish8.6 convert_OBO.tcl fileIN FileOut

Special process for ChEBI (download chebi_core.obo): next run 

	python formatChebi.py

For other files : 

	python prepOnto.py