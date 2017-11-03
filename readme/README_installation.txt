# Installation du bash ubuntu et de l'environnement pour le développement web
cd
sudo apt-get update
sudo apt-get install python-pip
sudo apt-get install mongodb
sudo service mongodb start
wget https://download.elastic.co/elasticsearch/release/org/elasticsearch/distribution/deb/elasticsearch/2.3.1/elasticsearch-2.3.1.deb
sudo dpkg -i elasticsearch-2.3.1.deb
sudo apt-get install build-essential
sudo apt-get install libssl-dev
sudo apt-get install libffi-dev
sudo apt-get install python-dev
sudo pip install xlrd
sudo pip install simplejson
sudo apt-get install default-jre

# Pour jBrowse
# installer XAMPP (windows)

# Pour lancer le serveur web avant de tester
# Ouvrir XAMPP
# "Start" sur module Apache ==> Serveur tourne
# Chrome ==> URL = http://localhost (correspond à "c:/xampp/htdocs" qui contient le dossier jBrowse-1.12.3)
# Chrome ==> URL http://localhost/JBrowse-1.12.3
cd /mnt/c/Tools/GitHub/RGV
sudo service mongodb start
sudo service elasticsearch start
pserve development.ini

# Adresse de RGV en local host, à lancer plutôt en mode privée
URL: "localhost:6543"


