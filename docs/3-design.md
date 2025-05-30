---
title: Design
layout: default
---
# Design

## Architecture Overview

The developed system is based on a *client-server* architecture, where the `Frontend` communicates with a centralized `Backend` to interact with the website itself. The Backend in turn can be broken down into smaller parts, as a microservices development approach was adopted. Each of the various microservices represents a subdomain of the entire system, each defining its own *bounded context*. In addition to the various developed microservices, the Backend also includes a main transit component, the API Gateway. All requests coming from the Frontend arrive at the API Gateway, which is then responsible for routing the client's request to a specific service. The identified microservices are as follows:
- **Authentication Service**
- **Notification Service**
- **Detection Service**
- **Sensor Registry Service**

To function, each of the identified microservices requires a database. To meet this need, it was decided to use a NoSQL database like MongoDB. Finally, to enable communication between the various services, REST APIs were used, using JSON as the data type exchanged between various requests.  
The system was developed using microservices in order to increase its scalability and ease of maintenance.

![Architecture Overview](./images/Arch/General%20Architecture.drawio.png)

### Microservices and Bounded Contexts

In the previous chapter four bounded contexts have been identified. We can define a sort of 1-1 mapping with small tweaks in names
when it comes to microservices:
- User Management &rarr; Authentication Service
- Sensors &rarr; Sensor Registry
- Detections Management &rarr; Detection Service
- Alerts &rarr; Notification Service

Sensors' bounded context is actually further divided into the actual service
responsible for the creation of actual sensors and its functionalities to
communicate with the outside world, and the registry which will be used mainly
by administrators (more in the following sections).

### Authentication Service

The first microservice we are going to describe is the authentication service. The bounded context it covers concerns the management of various users, both registered and unregistered, and the generation of tokens to verify whether the user is authenticated or not (the authentication function will then intersect with the API Gateway). As previously described, this service has its own database, in which all users belonging to the domain are stored. Two different categories of users can be distinguished: regular users and admins. This difference then reflects on the various functionalities that the system provides.

### Notification Service

The notification system is mainly composed of two components:

- A `MessageBroker`, capable of handling the arrival of events within an event bus sent by the Detection Service ([Detection Service](#detection-service)).
- A `SocketManager`, capable of establishing and managing persistent connections with users who request subscription to a specific event, and thus the relative *routing* based on it.

Regarding *events*, they originate from the sensors themselves and are propagated via the measurement service, which in turn publishes the events through an event bus, in order to maintain asynchronous communication with a *best effort* QoS (as the content of the notifications is not of critical importance). The notification service extracts fundamental information from *Detection* for constructing the notification that will be sent to the client, in particular extracting the *type* of the event, the *sensor name*, and the *query* related to the event: this last one may represent a threshold value, such as the river capacity exceeding 75%, or a simple nominal value like *severe wind gusts*. In this way, notification routing is performed based on the `topic` to which users subscribe. Specifically, the topic is of the form `notifications.<type>.<sensor-name?>.<query?>`, where the sensor name and query can be replaced by wildcards (`#` or `*`), in order to provide coarse to increasingly fine-grained mechanisms regarding the type of notifications a user wants to receive. Regarding these, the connections are persistent to have a *real-time* behavior without the need for polling mechanisms to the server.

Finally, the service has a document-based database containing two types of documents: the first contains information regarding user subscriptions, while the second stores the serialized events sent through the event bus by the detection service. In conclusion, it is possible to dynamically configure the behavior of the `notification-service` upon receiving a new event, through the addition of a `notificationCallback`, i.e., the action that is executed upon arrival of each notification from the event bus. In this way, it is possible to define more articulated mechanisms for sending notifications, such as sending emails, emitting an event via the WebSocket channel, or reporting to other services.

### Detection Service

The Detection Service is responsible for managing and making available the detections coming from the various sensors present in the system. This service provides an interface for storing and retrieving detections and a real-time connection via socket for immediate reception of detections generated by the sensors.

In particular, the detection service provides a series of routes to interact with the system, each allowing different operations on the data regarding detections.

The service allows saving the various detections produced by active sensors, will also allow obtaining the position of all available sensors filtered by type of sensor, and finally it will be possible to obtain a detection history of a specific sensor.

The detection service offers "real-time" communication through the use of a socket connection to allow the sending of detections received by the service to clients who subscribe to receive updates for a single sensor, this communication will be useful for real-time updates of graphs showing the detection values of a single sensor.

### Sensor Registry Service

As described earlier, each microservice refers to a specific bounded context; in particular, the Sensor Registry Service allows interaction with the various sensors installed in the territory. This microservice in particular acts as the main registry, within which all references of the various sensors are maintained, including their IP address and Port. In this way, in case an admin needs to stop a sensor, they would use this service. Also in this case, all various sensors are stored in a database that refers solely and exclusively to this service.

### API Gateway
Finally, the last developed service is the API Gateway, whose task is to collect all client requests and redirect them to the appropriate service. Subsequently, once it receives the response from the queried service, it will return the response to the client. Another of the main functionalities of this system is the authentication service. To do this, this service uses the Authentication Service, which, once it returns a token, the API Gateway stores it in a repository to allow optimized searches to validate the permissions and responsibilities of the user who made the request. The API gateway is developed to be agnostic from every type of technology to use for HTTP communication between the API Gateway and a Generic Service, this was achieved by working heavily with Inheritance and Generics. It is also important to say that we used the *Circuit Breaker* pattern, in this way our gateway can automatically decide if it can or not send a request to one of the other services.

## Technologies Used
Various technologies were used to develop this project. Below, they are separated into Frontend and Backend technologies.

### Frontend Technologies
The first technologies we will list concern all the development of the user interface. First of all, we started by choosing the programming language, in this case we relied on `Typescript`, in order to obtain the advantages of `Javascript` and the safety of defining variable types thanks to `Typescript`. Once the programming language was chosen, we moved on to selecting the development framework; among the various possibilities we chose to use `Vue.js`, which through the `Composition API` and ease of supporting `Typescript` allowed us to develop interfaces easily and quickly. Along with this framework, several libraries were used to enable interaction between client and server such as the `Axios` library and the `Socket.io` library to allow communication via **socket**. Subsequently, as a CSS framework, we chose `Tailwind`, since it can be adopted in `Vue.js` in an intuitive way. Once all these dependencies were defined, we also introduced a set of functionalities that allow us to maintain high code quality. For example, as described in the non-functional requirements, one of the main qualities that our interfaces must meet concerns accessibility; to verify that the pages of our website are always accessible, we used the `eslit-plugin-vuejs-accessibility` library, which combined with the `linter` allowed us to correct and make the pages accessible. In addition, to ensure that component definitions are error-free, we used the `eslit` library.

### Backend Technologies

As for the entire backend side, we chose to use `NodeJS` with the use of the `Express` library. All code was written using `Typescript`, in order to maintain type safety and code extensibility. In some of the implemented microservices, the `Socket.io` library is used to create and maintain communications through the WebSocket protocol. As mentioned earlier, each microservice has its own `Mongodb` NoSQL database, used together with the `Mongoose` library for the definition and interaction with various documents. Finally, each of the various microservices was tested using specific libraries for creating tests, including: `Mocha`, `Supertest`, and `Jest`. Each test uses a dedicated database to avoid interfering with production databases. Below, some technologies referring only to specific implemented services will be specified.

#### Authentication Service

The authentication service, as previously described, also handles the creation and validation of Tokens. To perform this task, the `jwt` and `jwt-decode` libraries are used.

#### API Gateway

Within the API Gateway, `Redis` is used as a repository in which to store the tokens received from the Authentication Service. Moreover, to route client requests to other services, the `Axios` library is used. It is also used the `opossum` library for implementing the circuit breaker pattern.

#### Notification Service

The notification service, to maintain asynchronous communication with the event producer (detection service), uses a RabbitMQ broker for receiving messages from the latter. Their communication takes place through a single *exchange*, while the routing of the various events takes place through the appropriate *routing key*, composed similarly to the *topic*, i.e., `<type>.<sensor-name>.<query>`, with the difference that all parameters are mandatory. In this way, it is possible to create a dynamic number of queues based on the type of sensors, their name, or the queries they expose, since the queues are generated based on the *routing key* specified in the event. Thanks to this mechanism, the entire notification service is agnostic with respect to the diversity of the sensors, with the limitation that the *routing key* is always in the required format.

## Sensor Overview

Another necessary part that we had to develop, concerned the sensor. This object, is the agent that sends detections (by using the Its sensors) towards our services. Each sensor is scheduled for perioding detections, and every time It senses new data, It will send them to the Detection Service. The definition of a single sensor, can be done by using an internal DSL that we made, in this way the creation of a sensor is fast and simple.

### Sensor Technologies

We choose Python3 as the programming language for implementing a sensor, in this way we were capable of creating a complex architecture easily. The sensor, in order to be able to receive messages from the outside, It is implemented using *FastApi*, by doing so the sensor is a http server, that exposes some routes for interacting with the outside world and for making the interaction with the sensor accessible from remote. We also used *apscheduler* for automatizing the scheduling of a task in specific intervals of time, and finally we used the library *uvicorn* for starting the http server.

---

## DSL Overview

The last important aspect to discuss is our Domain Specific Language (DSL). We introduced an internal DSL to assist users in creating their own sensors easily by providing a human-readable language. This DSL guides users through the definition of sensor parameters and automatically generates a corresponding Python 3 file that represents the configured sensor. Here it is an example of our language: 

```yaml
{
    name "Cesena"
    infos {
        description "Sensore idrometrico fiume Savio, Cesena (Ponte Nuovo)"
        type idro_level
        queries [
            - threshold "thr10%" > "1.0"
            - threshold "thr100%" > "7.8"
        ]
    }

    network {
        port 1926
        ip "10.21.239.11"
    }

    gateway {
        url "api-gateway-17633123551.europe-west8.run.app"
        port 8080
        registerRoute "/register"
        shutdownRoute "/shutdown"
        detectionRoute "/detection"
        alertRoute "/alert"
    }

    registry {
        registryUrl "https://sensor-registry-17633123551.europe-west8.run.app/v0/sensor"
        key "secretKey"
    }

    cronjob {
        from monday to saturday at "12":"30"
    }
}

```

The DSL significantly streamlines the process of creating sensors for system administrators. It enforces strict typing on all parameters, ensuring that every sensor is defined with complete accuracy. For instance, it validates that network.port values fall within the allowed range [0, 65,535] and that network.ip entries are valid IP addresses. This built-in validation reduces errors and improves reliability across the system. Additionally, the DSL simplifies cron job scheduling by allowing administrators to define schedules using a human-readable syntax, which is then automatically converted into the appropriate Python-compatible format.

The DSL let users define correct sensor's configurations. The key components of sensors can be summarised as follows:
- `infos`: this set of configurations contains sensor's main information along with the definition of queries
  - `queries` are defined as predicates with the following form:
    `<query_name> [>|<] "value"`, where value can be a floating point value or an integer.
- `network` defines sensor's specific network information, namely its
    ip and port. For local testing and configuration, this must be set to a local
    network interface (i.e. `127.0.0.1`).
- `gateway` block specifies the network location of the api-gateway along with:
    - sensor's registering route
    - sensor's shutdown route
    - sensor's detection route
    - sensor's alert route
- `registry` contains similar information of gateway, with the
    exception that URL and the secret token must be specified for the registry
    component.
- `cronjob` specifies the frequency of detection sending to the
    detection service. You can define cronjobs in the following manners:
    - `every [DAY] at <hour>:<minutes>` runs the given day at specific hour and minutes;
    - `every [DAY] every <value> [hours|minutes]` runs every day every X hours or minutes;
    - `from [DAY] to [DAY] at <hour>:<minutes>` runs for the given range of days at specific hour and minutes;
    - `from [DAY] to [DAY] every <value> [hours|minutes]` runs for the given range of days every X hours or minutes;
`

### DSL Technologies

The Domain Specific Language was created using XText with Java, and also in
order to improve the usability of the system, the DSL project is also
decomposed and deployed into two useful components: a dockerised web
editor and an all in one generator that from DSL code produces a
sensor's python script ready to be run.

#### Web Editor
The web editor has been deployed in dockerhub, and you can run an instance of it with:

```bash
docker run -p 8080:8080 --name dsl-editor sfuri/er-climate-monitor-dsl-editor:1.0.4
```

Using this service, the administrator can define a sensor and check if there are
no errors in its definition, after doing so the admin has to create a file
"<my-sensor-config>.uanciutri" that will be given as input to the sensor
generator software for the real sensor creation.

#### Sensor Generator

Actual sensor's code is a simple python web server which, for testing purposes,
it is backed by a scraper in order to provide real data about Emilia Romagna
weather conditions. In a real word scenario, this web server will be backed by
the actual sensor deployed in the environment.
Having said that, the generator simply parses a configuration file written
with the DSL and produces a valid sensor web server ready to be deployed.
This generator is released as a jar in our repository, making it suitable
to use it as a simple tool for fast conversion.

Having the latest version of the jar, you can easily run the generation with:

```bash
java -jar sensorDsl-v0.2.6.jar <absolute_dsl_file_path> <absolute_output_path>
```

#### All-in-one solution

A simple web interface has been created in order to provide this two functionalities
in the same place, reducing the time required for building new sensors.

You can find the dsl-sensor-generator [here](https://github.com/ER-climate-monitor/er-climate-monitor-sensors/tree/main/dsl-sensor-generator).

Further refinements of this simple application can be made, but they're left for
future developments.

---

<div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9em;">
  <a href="/er-climate-monitor/2-analysis.html">&laquo; Previous</a>
  <a href="/er-climate-monitor/index.html" style="text-align: center;">Home</a>
  <a href="/er-climate-monitor/4-devops.html">Next &raquo;</a>
</div>

