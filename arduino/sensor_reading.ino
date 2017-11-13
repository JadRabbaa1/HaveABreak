/*
 * Creation & Computation - Digital Futures, OCAD University
 * Kate Hartman / Nick Puckett
 * 
 * Read an Ultrasonic Proximity Sensor using the NewPing Library https://bitbucket.org/teckel12/arduino-new-ping/downloads/
 * print the value to Serial and scale it using a timer
 * 
 * 
 */
#include <NewPing.h>   //include the library


int triggerPin = 12;   //pin conneccted to the Trig pin on the sensor
int echoPin = 11;       //pin connected to the Echo pin on the sensor
int maxDistance = 200;  //set the max distance for the sensor to read (helps with errors)
int distanceVal;        //variable to hold the distance val
int threshold = 35;     //variable to hold the threshold val

int sampleRate = 200;   //how fast to sample the value
long lastReading;       //used for the timer
long lastReset;         //used for the reset

NewPing proximity1(triggerPin, echoPin, maxDistance);   //sets up the sensor object

void setup() 
{
  Serial.begin(9600);  //start the serial port

}

void loop() 
{
  int now = millis();
  if( (now - lastReading) >= sampleRate ) //this very simple statement is the timer,
  { 
    distanceVal = proximity1.ping_cm();  //get the distance value in centimeters
    lastReading = now;

    if (distanceVal > threshold) 
    {
      lastReset = now;
    }

    Serial.print("Distance Reading CM : ");  //print the value to the Serial monitor
    Serial.print(distanceVal);
    Serial.print(", Seconds Above Threshold: ");
    Serial.println((now - lastReset) / 1000);
  }
}
