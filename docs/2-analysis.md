---
title: Analysis
layout: default
---

# Analysis

In the following section we formally define system's requirements, alongside
user stories, personas and scenarios analysis which will result crucial in the
definition of our Domain, by means of Domain Driven Design.

## Requirements Analysis

In the following section, we will distinguish between system requirements,
functional and non functional requirements in order to assess right away which
key elements must be considered during the analysis of our domain in a later DDD
stage.

### System Requirements

1. The system must provide a way for *registration* and *login*.
    1. The system must provide a way for logging in *admins*.
2. The system must let a user access weather/atmospheric conditions' data.
3. The system must let a user filter weather/atmospheric conditions' data by *type*.
4. The system must let a user filter weather/atmospheric conditions' data by *location*.
5. The system must keep track of *at least* one week of weather/atmospheric conditions' data.
6. The system must allow users to *subscribe* to certain weather/atmospheric conditions' *events*.
7. The system must alert users who are subscribed to certain weather/atmospheric conditions' events.
8. The system must allow users to *unsubscribe* to certain weather/atmospheric conditions' *events*.
9. The system must allow *admins* to *manage* sensors deployed in the region.
   1. The system must allow admins to shut down sensors.
   2. The system must allow admins to rename sensors.
   3. The system must allow admins to change sensors' network parameters.
10. The system must let a user or admin to *logout*.
12. The system should let *non-logged* users to visualise access weather/atmospheric conditions' data.
13. The system should *not* let *non-logged* users to *subscribe* to certain weather/atmospheric conditions' *events*.
14. The system should *not* let logged or non-logged users who are not admins to *manage* sensors deployed in the region.

### Functional Requirements
Alongside the vast majority of system requirements, we can further refine functional requirements to the followings.

1. The system must provide a *secure* way to register, login and logout.
2. The system must provide *real-time* weather/atmospheric conditions' data.
3. The system must provide a notification dashboard for logged-in users in order to manage:
   1. Subscriptions (add or remove).
   2. Notifications (mark as read and expand details).
4. The system must detect and alert users subscribed to certain weather/atmospheric conditions' event through:
   1. Website notifications
   2. Email alerting system
5. The system must provide weather/atmospheric conditions' data of the types listed in the table below:

| **Name** | **Unit** | **Description** |
| ---------| ---------| ----------------|
| Hydrometric Level | meters | Measures the level (height) of rivers |
| Temperature | °C | Measures the temperature |
| Humidity | % | Measures the absolute humidity |
| Wind | m/s | Measures the average wind speed (excludes wind gusts) |
| Rain | mm | Measures local rainfalls |


### Non-functional Requirements

The website to be developed must meet a set of non-functional requirements. Below are all the non-functional requirements that our project must fulfil.

#### Requirement Number 1

The first non-functional requirement is **speed**. The website must provide data to users quickly, avoiding long wait times.  
**Quality Attribute Scenario**: Our website will receive a request to display sensors installed in Emilia-Romagna related to a specific category of weather events. The source of this request is a generic user, User A. Once the request is accepted, the system will return a list of sensors related to the selected event category. Response times must be under 2 seconds to ensure a seamless user experience. This allows User A to view and interact with the displayed sensors on a map.

#### Requirement Number 2

The second non-functional requirement is **accessibility**. The system must be usable by anyone, regardless of their disabilities.  
**Quality Attribute Scenario**: Since the system provides data useful to the entire community, it must ensure accessible data access. Suppose User B, who is totally blind, requests sensor data for a specific event category. The system must return data formatted in a way that is fully accessible, enabling User B to interact with the sensors and monitor the data. This ensures that all users, regardless of their disabilities, can access the system.

#### Requirement Number 3

The third non-functional requirement concerns the ability to make **modifications** to the system easily and quickly, avoiding a rigid structure. This allows future developments to be implemented smoothly.  
**Quality Attribute Scenario**: As with any service, future changes are inevitable. Suppose a new API needs to be added for users. Engineer X is tasked with implementing this new functionality. The website should evolve over time, with the new feature added within 40 work hours. This keeps development agile and responsive to new needs.

#### Requirement Number 4

The fourth requirement is **security**. Specifically, access to sensitive information must be granted only to authorized users.  
**Quality Attribute Scenario**: As mentioned earlier, some users are designated as *admins*, with more privileges than regular users. Suppose User X requests an admin login. The system will check whether the user has the 'admin' role. If unauthorized, the system will notify the user and redirect them to a part of the site that contains no sensitive information. Otherwise, the user will gain access to sensitive data zones. Every request for sensitive data must verify that the user is authorized. This ensures secure isolation of sensitive information.

#### Requirement Number 5

The fifth and final requirement is **efficiency**. The website should avoid consuming excessive computational resources of the device on which it runs.  
**Quality Attribute Scenario**: Since the site offers real-time data visualization, it must do so in the most efficient way possible. Suppose User Y requests real-time data from a specific sensor. The website must activate a logic to display real-time sensor data without consuming more than 10% of CPU resources. This allows for smooth navigation, especially for users accessing the site from older or less powerful devices.

---

## User Analysis: Personas and Scenarios

Before system development began, we conducted a preliminary investigation based on **Personas** and **Usage Scenarios**. This strategy helps clearly define who will use the site, their goals, and the challenges they might face. All gathered information will guide the design and development of the website.

### Personas

Personas represent typical users of our website, based on research and assumptions.
1. **Personas 1**: The first persona is Stefano Vincenzi, aged 29, a university student. He has a high level of digital literacy and frequently uses websites and apps. His goal is to accurately check the weather conditions in his home region, Emilia-Romagna. His main frustration is the lack of a website providing detailed information about different weather events. He mainly uses a computer.
2. **Personas 2**: The second persona is Ester Alfano, aged 39, who works in hospital cleaning and sanitation. Her goal is to monitor the weather in Emilia-Romagna, which is often affected by floods and overflows, to travel to and from work safely. Her frustration is the lack of a site that keeps her constantly updated with notifications about weather events. She primarily uses a smartphone.
3. **Personas 3**: The third and final persona is Mario Le Pinze, aged 27, who monitors atmospheric sensors across Emilia-Romagna. He has permission to interact with installed sensors, including modifying them. His frustration is the absence of a website offering a simple interface for managing and filtering sensors. He mainly uses a computer.

### Usage Scenarios

Usage scenarios illustrate typical situations in which users interact with the website.
1. **Scenario 1**: Real-time monitoring of the situation. The personas involved here are Stefano Vincenzi and Ester Alfano. The scenario involves planning a trip or visit within Emilia-Romagna. They use the website to monitor rainfall, temperature, and other data along their route. The site must provide simple and effective access to data.
2. **Scenario 2**: Receiving notifications. This scenario involves Ester Alfano. Every morning, she commutes to work, but Emilia-Romagna is increasingly affected by severe storms leading to floods. Since she travels near rivers, she needs real-time notifications (e.g., "if more than X mm of rain falls") to avoid blocked roads or unsafe conditions. The website must provide a real-time notification system with options for push notifications such as email.
3. **Scenario 3**: Sensor maintenance by Admins. This final scenario applies to a limited group of users—**Admins**. For example, Mario Le Pinze can interact with sensors to change sampling parameters, schedules, and even shut them down. In addition to these functions, the website must also offer an efficient sensor search mechanism with filtering capabilities.

--- 

## Domain Driven Design

DDD has been the main analysis and design driver in this project. Once the definition of requirements,
personas and scenarios has been made, DDD comes to the rescue in defining bounded contexts and subdomain
capable of properly separate the domain into smaller chunks manageable by different teams (in our case,
an individual of a subset of individuals). 

### The Ubiquitous Language

| **Name** | **Description** |
| ---------| ----------------|
| **Web-Interface** | Actual application, accessible via the web |
| **User** | Generic term referring to an entity consuming a limited set of the system's capabilities |
| **Logged User** | Users registered into the system, can subscribe and receive alerts |
| **Admin** | Special kind of Logged Users that, having all functionalities of every logged users, can manage sensors deployed in the region |
| **Weather** | Generic term referring to an environmental atmospheric condition or measurements |
| **Weather Event** | A Weather Event is emitted when an environment atmospheric condition is met |
| **Alert** | A Weather Event triggers Alerts on the user's end |
| **Notification** | An Alert is reified on the user's end by means of a notification on the web-interface or by email |
| **Detection** | A single measurement of a specific weather/atmospheric phenomena |
| **Sensor** | An IoT device which is capable of measuring a specific weather/atmospheric phenomena, i.e. produces Detections |

---

<div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9em;">
  <a href="/er-climate-monitor/1-introduction.html">&laquo; Previous</a>
  <a href="/er-climate-monitor/index.html" style="text-align: center;">Home</a>
  <a href="/er-climate-monitor/3-design.html">Next &raquo;</a>
</div>

