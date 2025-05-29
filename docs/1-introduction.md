---
title: Introduction
layout: default
---
# Requirements

## Introduction

The goal of this phase within the project is to understand the context and various requirements that are part of our project. This phase is vitally important as it allows us to identify the needs that our website will address in order to provide an optimal experience to its users.
### Problem Description
The issue we aim to address relates to a topic that has become a key concern for the future of our planet: the climate. More specifically, our project will focus on the Emilia-Romagna region. This way, users will be able to monitor the weather situation in our area in real-time, with the ability to filter based on various atmospheric phenomena. Currently, our users need a platform capable of providing them with real-time data while also ensuring a clear and effective display. Moreover, some users may require notifications about specific atmospheric events. In addition to regular users, there may also be admins whose task is to interact with the installed sensors to modify some of their parameters or, in extreme cases, to shut down the sensors.
### Project Objectives
Our project aims to:
* Improve access to data related to various atmospheric phenomena;
* Implement a notification system regarding different weather events;
* Provide real-time access to data visualization;
* Make the site responsive to ensure access across different devices;

### Context and Stakeholders

Our website will primarily be used by the citizens of the Emilia-Romagna region. In addition to residents, the site will also be useful for those transiting or staying temporarily in the area.

### Technologies

Several technologies will be used to develop this website, including:
* **Frontend**: Vue.js, Tailwind
* **Backend**: Node.js, Express, Socket.io, Redis
* **Database**: MongoDB, Mongoose, Atlas  
The website must be accessible and compliant with WCAG standards.

## Non-functional Requirements

The website to be developed must meet a set of non-functional requirements. Below are all the non-functional requirements that our project must fulfill.

### Requirement Number 1

The first non-functional requirement is **speed**. The website must provide data to users quickly, avoiding long wait times.  
**Quality Attribute Scenario**: Our website will receive a request to display sensors installed in Emilia-Romagna related to a specific category of weather events. The source of this request is a generic user, User A. Once the request is accepted, the system will return a list of sensors related to the selected event category. Response times must be under 2 seconds to ensure a seamless user experience. This allows User A to view and interact with the displayed sensors on a map.

### Requirement Number 2

The second non-functional requirement is **accessibility**. The system must be usable by anyone, regardless of their disabilities.  
**Quality Attribute Scenario**: Since the system provides data useful to the entire community, it must ensure accessible data access. Suppose User B, who is totally blind, requests sensor data for a specific event category. The system must return data formatted in a way that is fully accessible, enabling User B to interact with the sensors and monitor the data. This ensures that all users, regardless of their disabilities, can access the system.

### Requirement Number 3

The third non-functional requirement concerns the ability to make **modifications** to the system easily and quickly, avoiding a rigid structure. This allows future developments to be implemented smoothly.  
**Quality Attribute Scenario**: As with any service, future changes are inevitable. Suppose a new API needs to be added for users. Engineer X is tasked with implementing this new functionality. The website should evolve over time, with the new feature added within 40 work hours. This keeps development agile and responsive to new needs.

### Requirement Number 4

The fourth requirement is **security**. Specifically, access to sensitive information must be granted only to authorized users.  
**Quality Attribute Scenario**: As mentioned earlier, some users are designated as *admins*, with more privileges than regular users. Suppose User X requests an admin login. The system will check whether the user has the 'admin' role. If unauthorized, the system will notify the user and redirect them to a part of the site that contains no sensitive information. Otherwise, the user will gain access to sensitive data zones. Every request for sensitive data must verify that the user is authorized. This ensures secure isolation of sensitive information.

### Requirement Number 5

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
