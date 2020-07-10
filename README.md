Robot RPI 1.0

This is a project for creating a robot based on TP100 tank chassis and 6 DOF motorized hand.
you can use any other hardware you need. the project can handle 2 DC motors and 6 servos.

Back-end:
the back-end is a nodejs project using typescript. it is an express server for an API,
on start up the system try to connect to a wifi, if non existent, an access point is automatically created.
(AP: 192.168.44.1) by connecting on this access point, the robot can be controlled. or wifi network can be scanned and new SSID selected for connection.

all information are displayed (including current IP) on a 128x64 small OLED LCD.

the camera feed is sent over a MJPEG server <ip:4000>

Frontend:

frontend is an Angular 9.x project, create a small web for connecting to the robot, scanning wifi, creating AP and controlling the robot using a game pad.

Firmware:

Arduino project to upload to the motor controller based on Arduino nano.

Hardware connection:

Power supply must be >= 9V, two distinct Buck converters to 5V must be used, one for RPI and the other to supply power to the servos array.

(refer to schematic)

J4 : Battery power supply;
J3 : Servos power supply;
J1, J2 : DC motors

Conn J1 : 6 pins x 3 connectors for Servos
conn j2 : 4 pins - connect to RPI for UART and VCC 5v and GND
conn j5 : I2C connector for possible extension (range finder).
