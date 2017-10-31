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

# Commands
##Database gestion

To reset database :

	mongo 'databasename' --eval "db.'db'.drop()"
	
To reset ElasticSearch indexes:
	
	curl -XDELETE localhost:9200/toxsign
