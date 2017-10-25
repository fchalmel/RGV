FROM debian:stable
RUN apt-get update && apt-get install -y --force-yes mongodb openssl libpython-dev libffi-dev libssl-dev python python-dev python-pip
EXPOSE 6543
ADD chemsign /opt/toxsign/chemsign
ADD development.ini.* /opt/toxsign/
ADD CHANGES.txt README.md *.txt /opt/toxsign/
ADD *.py /opt/toxsign/
RUN cd /opt/toxsign && pip install -r requirements.txt
RUN cd /opt/toxsign && python setup.py develop
WORKDIR /opt/toxsign
RUN mkdir -p /opt/toxsign/var/upload
ENTRYPOINT ["pserve", "development.ini"]
