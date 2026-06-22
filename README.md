<p align="center">
  <img src="https://github.com/jcausse-itba/BD2-TPO/blob/main/assets/itba_logo.png?raw=true" height="120"/>
</p>
<h1 align="center">Base de Datos 2</h1>
<h2 align="center">Trabajo Práctico Obligatorio</h2>

* Fecha de entrega: 12/Junio/2026
* Fecha de defensa: 22/Junio/2026

## Grupo 10

* **61105**: **Causse**, Juan Ignacio
* **64332**: **Liu**, Javier
* **64292**: **Rivas**, Nicolás

## 📚 Documentos Importantes 📚

En el directorio `docs` se encuentran los siguientes documentos:

* [`Enunciado.pdf`](./docs/Enunciado.pdf) - Enunciado del trabajo práctico.
* [`Informe.pdf`](./docs/Informe.pdf) - Informe de entrega.
* [`docker-compose.md`](./docs/docker-compose.md) - Documentación de la arquitectura en Docker Compose.
* [`Defensa.pdf`](./docs/Defensa.pdf) - Presentación utilizada en la defensa oral del TPO.

## 🌐 Rutas 🌐

A continuación se detallan los servicios disponibles, sus rutas y puertos.

Servicio                 | Ruta                                           | Puerto
-------------------------|------------------------------------------------|--------
Frontend                 | `/`                                            | 8080   
Documentación Swagger    | `/api-docs`                                    | 3000   

## 🛠️ Construcción y Ejecución 🛠️

Para construir y ejecutar el proyecto es necesario contar con [Docker Engine](https://docs.docker.com/engine/install/) y [Docker Compose](https://docs.docker.com/compose/install/) instalados.

Una vez instalados, se puede construir y ejecutar el proyecto ejecutando el siguiente comando en la raíz del proyecto:

```bash
docker compose up -d --build
```

Una vez finalizada la ejecución, se puede detener el proyecto y eliminar los volúmenes ejecutando el siguiente comando en la raíz del proyecto:

```bash
docker compose down -v
```
