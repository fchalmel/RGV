FROM debian:stable
RUN apt-get update && apt-get install -y --force-yes mongodb openssl libpython-dev libffi-dev libssl-dev python python-dev python-pip
EXPOSE 6543
COPY rgv/ /opt/rgv/rgv/
ADD development.ini /opt/rgv/
ADD CHANGES.txt README.md *.txt /opt/rgv/
ADD *.py /opt/rgv/
RUN cd /opt/rgv && pip install -r requirements.txt
RUN cd /opt/rgv && python setup.py develop
WORKDIR /opt/rgv
RUN mkdir -p /opt/rgv/var/upload
ENTRYPOINT ["pserve", "development.ini"]