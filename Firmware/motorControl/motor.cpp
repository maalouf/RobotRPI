#include "motor.h"

Motor::Motor(int en1,int en2,int pm){
  pin_EN1 = en1;
  pin_EN2 = en2;
  pin_PM = pm;
}
void Motor::initMotor(){
  pinMode(pin_EN1, OUTPUT);
  pinMode(pin_EN2, OUTPUT);
  pinMode(pin_PM, OUTPUT);
  digitalWrite(pin_EN1, LOW);
  digitalWrite(pin_EN2, LOW);
   // analogWrite(pin_PM,100);

}

void Motor::runMotor(int spd){
  digitalWrite(pin_EN1, LOW);
  digitalWrite(pin_EN2, LOW);
  speed = spd;
  if (spd >= 0){
    digitalWrite(pin_EN1, HIGH);
  } else {
    speed = -spd;
    digitalWrite(pin_EN2, HIGH);
  }
  analogWrite(pin_PM,speed);

}

void Motor::stopMotor(){
  digitalWrite(pin_EN1, LOW);
  digitalWrite(pin_EN2, LOW);
  analogWrite(pin_PM, 0);
  speed = 0;
}

void Motor::updateSpeed(int spd){
  if (speed > 0){
    speed = speed + (spd - speed);
    analogWrite(pin_PM, spd);
  }
}
