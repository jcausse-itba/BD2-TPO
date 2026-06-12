<p align="center">
  <img src="https://github.com/jcausse-itba/BD2-TPO/blob/main/assets/itba_logo.png?raw=true" height="120"/>
</p>
<h1 align="center">Base de Datos 2</h1>
<h2 align="center">Trabajo Práctico Obligatorio</h2>

## Grupo 10

* **61105**: **Causse**, Juan Ignacio
* **64332**: **Liu**, Javier
* **64292**: **Rivas**, Nicolás

## Documentos Importantes

## 🛠️ Instrucciones de ejecución 🛠️

Para ejecutar el proyecto es necesario contar con [Docker Engine](https://docs.docker.com/engine/install/) y [Docker Compose](https://docs.docker.com/compose/install/) instalados.

Una vez instalados, ejecutar el siguiente comando en la raíz del proyecto:

```bash
docker compose up -d --build
```

## 🐋 Docker Compose 🐋

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
