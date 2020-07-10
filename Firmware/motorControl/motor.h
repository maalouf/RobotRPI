#ifndef __MOTOR__
#define __MOTOR__
#include "Arduino.h"
class Motor {
  private:
    int pin_EN1;
    int pin_EN2;
    int pin_PM;
    int speed;  
  public:
    Motor(int,int,int);
    void initMotor();
    void runMotor(int);
    void stopMotor();
    void updateSpeed(int);
};



#endif
