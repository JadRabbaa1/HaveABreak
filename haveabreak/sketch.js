var img;  // Declare variable 'img' for the interface design after trigger
var gif;  // Declare variable 'gif' for the loader animation before trigger

var stillImage; // Variable To Store The Snapshot
var userCam; // Declare variable 'userCam'.
var button; // Declare variable 'button'.

var triggered=false;    // we start this variable with false = user is not on computer
var thresholdLevel = 5; // Declare the time for a break

var distance;                           // distance of the user from the arduino proximity sensor
var threshold;                          // this is the increasing value of how long the user has been coninuously sitting facing the sensor
var portName = '/dev/cu.usbmodem1411';  // fill in your serial port name here
var inData;                             // for incoming serial data
var xPos = 0;                           // x position of the graph

var baseUrl = "https://maker.ifttt.com/trigger/kitkat_image/with/key/"; //call for IFTTT throuhg a key
var iftttKey = "PUT YOUR KEY HERE";       // This is my personal maker channel on IFTTT
var iftttEnabled = true;                  // If this is true, then we call IFTTT, otherwise we don't

function setup() {
  createCanvas(windowWidth,windowHeight);  // creating a responsive canvas that fits all screens
  background(color('#d4011f'));       // setting the color of the canvas background
  serial = new p5.SerialPort();       // make a new instance of the serialport library
  serial.on('connected', serverConnected); // callback for connecting to the server
  serial.on('open', portOpen);        // callback for the port opening
  serial.on('data', serialEvent);     // callback for when new data arrives
  serial.on('error', serialError);    // callback for errors
  serial.on('close', portClose);      // callback for the port closing

  serial.list();                      // list the serial ports
  serial.open(portName);              // open a serial port

  img = loadImage("assets/interface.jpg");   // Load the image
  gif = loadGif("assets/animation3.gif");    //load animation

  userCam = createCapture(VIDEO);            // creating a webcam capture
  userCam.size(480,360);                     //the dimensions of the webcam capture
  userCam.position(windowWidth/2-userCam.width/2,windowHeight/2-userCam.height/2); //the position of the webcam

  button = createButton('OK');               //creating a button that holds the word "ok"
  button.position(windowWidth/2+410,windowHeight/2+45);  //position of the button
  button.mousePressed(takesnap);             //operates the function takesnap when the button is pressed
  button.hide();                             //hides button
}

function takesnap (){
  // Take A Still From The Camera, hide the capture stream and the button
  stillImage = userCam.get();                // get the image from the webcam

  //stillImage.save(); // Save To Local      // this will create a html page with image created from code and not jpg file
  userCam.hide();                            // hides webcam
  button.hide();                             // hides button

  // Post Photo To Facebook
  var data = stillImage.canvas.toDataURL('image/png');  //TRYING to post image to facebook > failure?
  callIFTTT({'value1': data});
}

function draw() {
  if (threshold >= thresholdLevel && triggered === false) { //2 conditions for the if to be valid
    triggered = true;                        // the variale chnages to true to help the shift between triggered and not triggered easier
    doTriggerAction();                       // do operate this function
  }
  else if (threshold < thresholdLevel) {     // meaning: if the user hasn't completed a full work session (pomodoro) yet
    background(color('#d4011f'));            // change canvas background to this color

    userCam.hide();                          // hides camera
    button.hide();                           // hides button

    image(gif,windowWidth/2-gif.width/2,windowHeight/2-gif.height/2);  // position of the animated gif for the loader
    // we are controlling the gif through the variable threshold so we need to pause the animation
    gif.pause();
    var frame = int(map(threshold, 0, 5, 0, gif.totalFrames())); // assigning the valu 'frame'  by connecting it to the threshold
    gif.frame(frame);                  // controlling which frame shows
    triggered = false;
  }

  if (triggered) {
    image(img, windowWidth/2-img.width/2,windowHeight/2-img.height/2); //place the webcam in a certain position on canvas

    if (stillImage) {
      image(stillImage,windowWidth/2-userCam.width/2,windowHeight/2-userCam.height/2); // to show a preview of snap
    }

  } else {
    graphData(threshold); // just to visualize the increasing time the user has been working
  }

}

function doTriggerAction() {
  console.log("triggered");       // to make sure the trigger happened
  background(color('#dd201e'));   // background of this page is slighty different so it changes.
  userCam.show();                 // the webcam opens
  button.show();                  // the ok or snap button appears
}

function callIFTTT(data) {
  if (iftttEnabled != true)
  return; // Exit the function immediately

  var sendUrl = baseUrl + iftttKey;
  //  console.log(sendUrl);
  if (data) {
  //  console.log('json:' + JSON.stringify(data));
  httpPost(sendUrl, 'json', data);
  } else {
    httpPost(sendUrl);
  }
}


// the below is to show a yellow progress bar that moves from the left to the right of the screen
function graphData(newData) {
  // map the range of the input to the window Width
  var rectWidth = map(newData, 0, 5, 0, windowWidth);
  // draw the line or rectangle
  fill('yellow');
  noStroke();
  rect(0, 0, rectWidth, 20);
}


function serverConnected() {
  console.log('connected to server.');
}

function portOpen() {
  console.log('the serial port opened.')
}

function serialEvent() {
  // read a string from the serial port:
  var inString = serial.readLine();

  // check to see that there's actually a string there:
  if (inString.length > 0 ) {
    var distanceStart = inString.indexOf(":") + 2;
    var distanceEnd = inString.indexOf(",", distanceStart);
    var distanceString = inString.substring(distanceStart, distanceEnd);
    distance = Number(distanceString);

    var thresholdStart = inString.indexOf(":", distanceEnd) + 2;
    var thresholdString = inString.substring(thresholdStart);
    threshold = Number(thresholdString);

  }
}

function serialError(err) {
  console.log('Something went wrong with the serial port. ' + err);
}

function portClose() {
  console.log('The serial port closed.');
}
