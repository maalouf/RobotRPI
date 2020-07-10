#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Servo.h>
#include "motor.h"
#include "defs.h"

const int BatPin = A0;
float batValue = 0;
int batRaw = 0;
Adafruit_SSD1306 display(128, 64, &Wire,-1);
char buffer[40];
bool cleared;
/**  MOTOR **/
Motor aMotor(3,4,6);
Motor bMotor(2,7,5);
int speed = 0;
int moving = 0;


Servo servos[6];
//clunch,head,wrist,elbo,shoulder, base;
float servoStep[6];    // variable to store the servo position
int pos[6];    // variable to store the servo position
int initialPos[6]= {25,30,170,150,90,70};
unsigned long lastTick;
unsigned long currentTick;
unsigned long updateThreshold = 80;
unsigned int stepDeg = 10;


void goInitialServo(){
  for (int i =0; i < 6; i++){
    pos[i] = initialPos[i];
  }
}

bool setMotorInitialTick(int ind){
  if (pos[ind] != initialPos[ind]){
    pos[ind] = pos[ind] + ((pos[ind] > initialPos[ind])? -1 : 1);
    return false;
  }
  return true;
}
void initializeMotors(){
  bool done = false;
  while (done == false){
    done = true;
    for (int i = 0; i < 6; i++){
      done = done && setMotorInitialTick(i);
      servos[i].write(pos[i]);
    }
    delay(25);
  }
}

void setup() {
   Serial.begin(115200);
   speed = 100;
   aMotor.initMotor();
   bMotor.initMotor();
   for(int i = 0; i < 6; i++){
    servos[i].attach(8+i);
    servoStep[i] = 0;
   }

   goInitialServo();
 
   if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C));
   display.clearDisplay();
   cleared = true;
   display.display();
}

void handleBat(){
  int sensorValue = analogRead(BatPin);
  if ((abs(batRaw - sensorValue) > 60) || cleared){
    batRaw = sensorValue;
    batValue = 0.01232 * sensorValue; 
    drawBattery();
    if(cleared) cleared = false;
  }
}

void drawBattery(){
  display.fillRect(0,0,127,8, SSD1306_BLACK); 
  display.display(); 
  display.setTextSize(1);
  display.setTextColor(WHITE); 
  display.setCursor(0,0);
  display.println("Battery Level: "+ String(batValue,2)+"V");
  display.display();
}
void clearLine(int y,int nb){
  display.fillRect(0,y,127,y + (7*nb), SSD1306_BLACK); 
  display.display(); 
}
void drawInfo(int x, int y, char * str){
  clearLine(y, ((int)strlen(str) *0.05) +1); 
  display.setTextSize(1);
  display.setTextColor(WHITE); 
  display.setCursor(x,y);
  display.println(str);
  display.display();
}


char * getArgs(char * cmd,float * vals,int n){
   char *str;
   char *p = cmd;
   for(int i = 0; i < n; i++){
     str = strtok_r(p, ";", &p) ;
     vals[i] = (str != NULL) ? strtod(str,NULL): 0;
   }
   return p ;
}


void handleCommand(){
 char command = buffer[0];
 switch(command) {
  case move : {
    if (buffer[1] == forward){
      aMotor.runMotor(speed);
      bMotor.runMotor(speed);
      moving = 1;
    } else {
      aMotor.runMotor(-speed);
      bMotor.runMotor(-speed);
      moving = -1;
    }

    break;
  }
  case stop : {
    if (buffer[1] == move){
      aMotor.stopMotor();
      bMotor.stopMotor();
      moving = 0;
    } else {
      aMotor.runMotor(moving * speed);
      bMotor.runMotor(moving * speed); 
    }
    break;
  }
  case speedv : {
    if (buffer[1] == '+'){
      speed = min(speed+50,255);
    } else {
      speed = max(speed - 50,50);
    }
    aMotor.updateSpeed(speed);
    bMotor.updateSpeed(speed);

    break;
  }
  case steer : {
     int t1 = min(255,(moving * speed)+50);
     int t2 = (t1 == 255)?t1-100:(moving * speed)-50;
     if (buffer[1] == right){
       
       aMotor.runMotor(t1);
       bMotor.runMotor(t2);
     } else {
       aMotor.runMotor(t2);
       bMotor.runMotor(t1);
     }
     break;
  }
  case axisv : {
    getArgs(&buffer[1],servoStep,6);
    break;
  }
  case setv : {
    float pos[2];
    if (buffer[1] == '$'){
      getArgs(&buffer[2],pos,2);
      clearLine((int)pos[0],(int)pos[1]);
    } else if (buffer[1] == '%'){
      display.clearDisplay();
      display.display();
      cleared = true;
    } else {
      char * vv = getArgs(&buffer[1],pos,2);
      drawInfo((int)pos[0],(int)pos[1],vv);
    }
    break;
  }
  case getv : {
    if (buffer[1] == 'T'){
      Serial.println(batValue);
    }
    if (buffer[1] == 'V'){
      Serial.println("V1:0#V2:0");
    }
    break;
  }
  case initM : {
    initializeMotors();
    Serial.println("ok");
    break;
  }
 }
}

void updateServos(){
  currentTick = millis();
  if (lastTick < 0) lastTick = currentTick;
  if (currentTick - lastTick >= updateThreshold){
    for (int i = 0; i < 6; i++){
      pos[i] = constrain(pos[i] + (stepDeg * servoStep[i]),(i==1)?30:0,180);
      servos[i].write(pos[i]);
    }
    currentTick = millis();
    lastTick = currentTick;
  }
}


void loop() {
  handleBat();
  if (Serial.available()){
    memset(buffer, 0, sizeof(buffer));
    Serial.readBytesUntil('#',buffer,sizeof(buffer));
    handleCommand();
  }
  updateServos();
}
