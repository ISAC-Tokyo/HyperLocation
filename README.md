# Toward HyperLocation for Everyone

Precise agriculture makes possible new levels of efficiency in farming, with more controlled practices and ecological impact. Current technologies are proprietary solutions that are expensive to acquire and maintain, so few farmers can afford their deployment. We propose the HyperLocation architecture and prototype, completely designed at ISAC2015, as an affordable solution. To this end, we bundle together standard technologies into a simple yet precise device.

More description you can see [./project.md](./project.md)

## Overview

```
 +------------------+          +--------------------------------------+                            
 | Smartphone       |          | RaspberryPi                          |                            
 | +--------------+ |   HTTP   |  +------------+  TCP  +-----------+  |         +-----------------+
 | |   Browser    <---------------+ API Server <-------+  RTKLIB   <------------+ GNSS/GPS Device |
 | +------^-------+ |          |  +------------+       +-----^-----+  |         +-----------------+
 +--------|---------+          +-----------------------------|--------+                            
          |                                                  |                                     
          |                                                  |                                     
          |                                                  |                                     
+---------+---------+                               +--------+---------+                           
| Web Server        |                               |  Base Station    |                           
| HTML, JavaScript  |                               |                  |                           
+-------------------+                               +------------------+                           
```
## Required Devices

- GPS/GNSS Device
  - [Ublox-m8](http://www.u-blox.com/en/u-blox-6-the-next-generation-gps-platform.html)
- Caluculate RTK positioning
  - [Raspberry Pi](https://www.raspberrypi.org/)

## Development Setup

Requirements
- Vagrant

```
$ vagrant up
$ vagrant ssh
```

## Production setup

```
$ git clone git@github.com:ISAC-Tokyo/HyperLocation.git
$ cd HyperLocation
$ make setup
$ make retkrcv
```
