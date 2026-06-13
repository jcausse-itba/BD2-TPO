# 🐋 Acerca de la arquitectura en Docker Compose 🐋

Docker Compose es utilizado para orquestar los siguientes contenedores, _networks_ y volúmenes:

Contenedores:
* **bd2-tpo-g10-cassandra**: Apache Cassandra.
* **bd2-tpo-g10-cassandra-init**: Script de inicialización de Cassandra. Se detendrá automáticamente luego de completar la inicialización.
* **bd2-tpo-g10-mongo**: MongoDB.
* **bd2-tpo-g10-api**: API con Express.js.
* **bd2-tpo-g10-frontend**: Frontend con servidor NGINX.

_Networks_:
* **bd2-tpo_default**: Network que permite la comunicación entre todos los contenedores.

Volúmenes:
* **cassandra_data**: Volumen que persiste los datos de Cassandra.
* **mongo_data**: Volumen que persiste los datos de MongoDB.
