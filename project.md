Title
-----
Toward HyperLocation for Everyone



Short Description (500 chars)
-----------------------------

Precise agriculture makes possible new levels of efficiency in farming, with more controlled practices and ecological impact. Current technologies are [proprietary solutions that are expensive to acquire and maintain](link), so few farmers can afford their deployment. We propose the HyperLocation architecture and prototype, completely designed at ISAC2015, as an affordable solution. To this end, we bundle together standard technologies into a simple yet precise device.



Description
-----------

HyperLocation is a bundled technology for precise agriculture, using standard components and public positioning infrastructure such as GPS and GLONASS, at a fraction of the price of existing solutions.

The precision of HyperLocation relies on using the Real-Time Kinematics (RTK) approach to positioning, based on signals from GPS and GALILEO in our experiments. The cost of the prototype built during ISAC2015 amounts to about US$400, to be compared to US$6000 for existing solutions---an order of magnitude cheaper.

HyperLocation architecture consists of a good antena (the most expensive part!), a controller that processes RTK, and a wireless interface (WiFi, WiMAX, etc) to share information. The components are put together into a single box for ease of deployment. The wireless interface allows to access the position data stream from any compatible device, such as a smartphone or an automated actuator in a farm truck.

The HyperLocation prototype built during ISAC2015 is made of:
* A U-Blox 6 GPS/GALILEO antena, worth about US$300.
* A RaspberryPi board with a WiFi dongle, worth about US$70.
* An RTK process based on the open-source RTKLIB library.
* An API server that serves RTKLIB's results through a web-socket.
* A custom package designed and printed locally (the venue provided a 3D-printer).

RTKLIB collects the antena information (raw signal phase) and processes it on the RaspberryPi board. The results are passed through a TCP socket to the API server. When clients (browsers, smartphones, etc) connect to the API server, they first get a simple HTML file that triggers the setup of a web-socket with JavaScript. The current implementation then just prints the precise position information as they come, until the socket is closed.

Our evaluation of the prototype is very limited in the time allotted for the event. The main issue was to get GPS signal in the super-urban area where the event took place (Akihabara, Tokyo), and the security measures that allowed only a few slots to go out for testing. In short, we have evaluated the feasibility of partial integrations, but we could not complete full integration tests by the deadline. We expect to complete these tests in the weeks to come. Fortunately, our target are farms, where satellite signals are strong enough for the RTK approach with affordable devices.

We believe this approach can make possible precision agriculture at a larger scale than today. Beyond agriculture, we also believe it can serve in related applications, such as in the automotive sector and disaster recovery.
