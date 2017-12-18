**BETA - HEAVY API CHANGES MAY OCCUR**

# SATFORD - (Simple api testing for developers)

The idea behind this service is to provide a self hosted alternative to services like updown.io. Test your services, apis and hosts to know when they are not working as expected. In the current state this projects only provides tests for GET, POST and PING provided by a configuration file. Beside the console output, there are two webpages served as endpoints:

- /agenda

    Shows informations about sceduled job (Thanks to [Agendash](https://github.com/agenda/agendash)).

- /tests

    Shows a simple static html page including last test results.

To get notified about failing tests the idea is to configure one or more notification targets. Whenever a test failes or comes back to live, a notification will be send to the notification target. Actually there is only a **mattermost** target available.

# Getting started

## Create a configuration

The time intervall can be configured as follows:

>[Agenda](https://github.com/agenda/agenda) uses Human Interval for specifying the intervals. It supports the following units:
>seconds, minutes, hours, days,weeks, months -- assumes 30 days, years -- assumes 365 days

```json
config.json

{
    "tests": [{
        "isActive": true,
        "name": "service A",
        "endpoint": "http://serviceA.de",
        "type": "http-get",
        "expects": {
            "statusCode": 200
        },
        "frequency": "5 minutes"
    }, {
        "isActive": true,
        "name": "service B",
        "endpoint": "http://serviceB.de",
        "type": "http-post",
        "expects": {
            "statusCode": 200
        },
        "options": {} // request.post() options (https://github.com/request/request)
        "frequency": "30 minutes"
    }, {
        "isActive": true,
        "name": "host B",
        "endpoint": "hostB.mydomain",
        "type": "ping",
        "frequency": "30 minutes"
    }],
    "mattermost": {
        "url": "",
        "username": ""
    }
}
```

Create a docker-compose file:

```
version: '2'

services:
  app: 
    image: blural/satford
    restart: always
    ports: 
      - 80:80
    environment:
      - PORT=80
      - CONFIG_FILE=/config/config.json
      - MONGODB_URL=mongodb://mongo/agenda
    volumes:
      - ./config.json:/config/config.json
    depends_on: 
      - mongo

  mongo:
    image: mongo:latest
    volumes: 
      - '/srv/satford/mongodb/db:/data/db'
```

Start the service:
```
docker-compose up -d
```

# Roadmap
- [ ] Implement module system
- [ ] Configure tests in backend
- [ ] Live status page (socket.io)
- [ ] E-Mail notification target
- [ ] Slack notification target

# Development
Requirements:
- docker / docker-compose

```
npm install
npm run dev
```

# Release new versions
Releasing new versions means building and pushing docker images to the hub. There is one command which does exactly this. Increasing the version number is actually not included!
```
docker login
npm run release
```

# Execute manual tests
```
npm run build-manualtests
node tests/dist/tests/mattermost/index.js
```