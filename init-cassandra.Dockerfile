FROM python:3.14-slim

RUN pip install --no-cache-dir cqlsh

ENTRYPOINT ["/bin/bash", "/init-cassandra.sh"]
