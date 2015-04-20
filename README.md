# HyperLocation

Low cost RTK-GNSS for Smartphone.

## Overview

```
--------------              ---------------             ---------------
| Smartphone | <-- HTTP --> | RaspberryPi | <-- USB --> | GNSS Device |
--------------              ---------------             ---------------
                                   |
                                   |                    ----------------
                                   -------- HTTP -----> | Base Station |
                                                        ----------------
```
## Required Devices

- GNSS Device
  - [Ublox-m8](http://www.u-blox.com/en/u-blox-6-the-next-generation-gps-platform.html)
- For caluculate RTK positioning
  - [Raspberry Pi](https://www.raspberrypi.org/)
