var canvas;
var gl;

var program ;

var near = -100;
var far = 100;


var left = -6.0;
var right = 6.0;
var ytop = 6.0;
var bottom = -6.0;


var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0 );
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 30.0;

var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix, modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0 ;
var RY = 0 ;
var RZ = 0 ;

var MS = [] ; // The modeling matrix stack
var TIME = 0.0 ; // Realtime
var prevTime = 0.0 ;
var resetTimerFlag = true ;
var animFlag = false ;
//var controller ;

function setColor(c)
{
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv( gl.getUniformLocation(program,
                                         "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program,
                                        "shininess"),materialShininess );
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    setColor(materialDiffuse) ;

    Cube.init(program);
    Cylinder.init(9,program);
    Cone.init(9,program) ;
    Sphere.init(36,program) ;


    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );


    gl.uniform4fv( gl.getUniformLocation(program,
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program,
       "shininess"),materialShininess );

    animFlag = true;
    resetTimerFlag = true;
    window.requestAnimFrame(render);

    render();
}

function setMV() {
    modelViewMatrix = mult(viewMatrix,modelMatrix) ;
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    normalMatrix = inverseTranspose(modelViewMatrix) ;
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setMV() ;

}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
function drawCube() {
    setMV() ;
    Cube.draw() ;
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawSphere() {
    setMV() ;
    Sphere.draw() ;
}
// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
function drawCylinder() {
    setMV() ;
    Cylinder.draw() ;
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawCone() {
    setMV() ;
    Cone.draw() ;
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modeling matrix with the result
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z])) ;
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modeling matrix with the result
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z])) ;
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modeling matrix with the result
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz)) ;
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop() ;
}

// pushes the current modelViewMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix) ;
}

//draws seaweed with coordinates x and y, and theta as rotation
function drawSeaWeed(x, y, theta)
{
  gPush();
  {
    gTranslate(x, y, 0);

    gPush();
    {
      //draw 10 beeds of seaweed
      for(var i = 0; i < 10; i++)
      {
          gTranslate(0, 0.6, 0);

          if(i > 0 && i < 9)
          {
            //rotate around base of each beed
            gRotate(theta * Math.sin(TIME + i), 0, 0, 1);
          }

          gPush();
          {
            gScale(0.15, 0.3, 0.15);
            setColor(vec4(0.1, 0.5, 0.1, 1.0));
            drawSphere();
          }
          gPop();
      }
    }
    gPop();
  }
  gPop();
}

//x: x-coord of fish
function drawPupil(x)
{
  gPush();
  {
    gTranslate(x, 0, 0);
    gScale(0.05, 0.05, 0.05);
    setColor(vec4(0, 0, 0, 1));
    drawSphere();
  }
  gPop();
}

function draweye(pupilX, z) {
    gPush();
    {
        gTranslate(0, 0.2, z);
        gPush();
        {
            drawPupil(pupilX);
        }
        gPop();

        gScale(0.1, 0.1, 0.1);
        setColor(vec4(1, 1, 1, 1));
        drawSphere();
    }
    gPop();
}

function drawBubble(i)
{
    //timer for 12 seconds on a bubble
    if ((TIME - timeDrawn[i] > 15)) {
        isVisible[i] = false;
    }

    gPush();
    {
        //bubble height
        bubbleY[i] += 0.004;

        gTranslate(bubbleX[i], bubbleY[i] + 0.5, 1.5);
        //gScale(0.15, 0.1, 0.1);
        gScale(0.025 * Math.abs(Math.cos(TIME + bubbleOffset[i])) + 0.1, 0.025 * Math.abs(Math.cos(TIME + 30 + bubbleOffset[i])) + 0.1, 0.025 * Math.abs(Math.cos(TIME + 15 + bubbleOffset[i])) + 0.1);
        setColor(vec4(1, 1, 1, 1));
        drawSphere();
    }
    gPop();

    //remove the bubble
    if (!isVisible[i])
    {
        isVisible.splice(i, 1);
        timeDrawn.splice(i, 1);
        bubbleX.splice(i, 1);
        bubbleY.splice(i, 1);
        bubbleOffset.splice(i, 1);
    }
}

function drawLeg(x, y, z, offset)
{
    gPush();
    {
        gTranslate(x, y, z);

        //rotation for leg
        gRotate(15 * Math.sin(2 * TIME + offset) + 45, 1, 0, 0);

        //upper leg
        gPush();
        {

            gScale(0.2, 1.0, 0.2);
            setColor(vec4(0.5, 0, 0.5, 1));
            drawCube();
        }
        gPop();

        //lower leg and foot
        gPush();
        {
            gTranslate(0, -1.4, -0.5);
            gRotate(45, 1, 0, 0);
            gRotate(5 * Math.sin(2 * TIME), 1, 0, 0);

            //the leg
            gPush();
            {
                gScale(0.2, 0.8, 0.2);
                setColor(vec4(0.5, 0, 0.5, 1));
                drawCube();
            }
            gPop();

            //the foot
            gPush();
            {
                gTranslate(0, -1.1, 0);
                gScale(0.3, 0.1, 0.5);
                drawCube();
            } gPop();
        }
        gPop();
    }
    gPop();
}




var x;
var y;

var timeDrawn = [];
var isVisible = [];

var bubbleX = [];
var bubbleY = [];

var bubbleOffset = [];

var numBubbles = 0;

var numBubbles = 0;
//timer between individual bubbles
var bubbleTimer = 0;
//number of bubbles that will come out, 4-5
var randBubbleNum;
if (Math.random() > 0.5) { randBubbleNum = 4; }
else { randBubbleNum = 5; }

//bubble timer between bursts of blowing bubbles
var bubbleBlowTimer = 0;



function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(0, 0, 10);
    MS = [] ; // Initialize modeling matrix stack

	// initialize the modeling matrix to identity
    modelMatrix = mat4() ;

    // set the camera matrix
    viewMatrix = lookAt(eye, at , up);

    // set the projection matrix
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    // Rotations from the sliders
    gRotate(RZ, 0, 0, 1) ;
    gRotate(RY, 0, 1, 0) ;
    gRotate(RX, 1, 0, 0) ;


    // set all the matrices
    setAllMatrices() ;

    var curTime ;
    if( animFlag )
    {
        curTime = (new Date()).getTime() /1000 ;
        if( resetTimerFlag ) {
            prevTime = curTime ;
            resetTimerFlag = false ;
        }
        TIME = TIME + curTime - prevTime ;
        prevTime = curTime ;
    }

    gTranslate(-4,0,0) ;

    //rock
    gPush() ;
    {
      gTranslate(4, -2.75, 0);
      gScale(0.75, 0.75, 0.75);
      setColor(vec4(0.3, 0.3, 0.3, 1.0));
      drawSphere();
    }
    gPop() ;
    //rock
    gPush();
    {
        gTranslate(2.8, -3.1, 0);
        gScale(0.4, 0.4, 0.4);
        setColor(vec4(0.3, 0.3, 0.3, 1.0));
        drawSphere();
    }
    gPop();

    //ground box
    gPush();
    {
      gTranslate(4, -5, 0);
      gScale(100, 1.5, 100);
      setColor(vec4(0.0, 0.3, 0.0, 0));
      drawCube();
    }
    gPop();

    gPush() ;
    {
      drawSeaWeed(3.3, -2.8, 10);
      drawSeaWeed(4, -2.3, 10);
      drawSeaWeed(4.7, -2.8, 10);
    }
    gPop() ;

    //fish
    gPush();
    {
        gTranslate(4 + 3 * - Math.sin(0.5 * TIME), 0.5 * Math.cos(TIME) - 2, 3 * Math.cos(0.5 * TIME));
        gRotate(-0.5 * TIME * 180 / 3.14159, 0, 1, 0);

        //head
        gPush(); {
            gRotate(-90, 0, 1, 0);
            gScale(0.5, 0.5, 0.5);
            setColor(vec4(0.5, 0.5, 0.5, 1.0));
            drawCone();
        }
        gPop();

        gPush();
        {
            draweye(-0.07, -0.2);
            draweye(-0.07, 0.2);
        }
        gPop();
        //body
        gPush();
        {
            gTranslate(1.25, 0, 0);
            gRotate(90, 0, 1, 0);
            gScale(0.5, 0.5, 2);
            setColor(vec4(1, 0, 0, 1));
            drawCone();
        }
        gPop();


        //tail
        gPush();
        {
            gTranslate(2.6, 0.5, 0);
            gRotate(20 * Math.cos(5 * TIME), 0, 1, 0);
            //top
            gPush();
            {
                gRotate(90, 1, 0, 0);
                gRotate(140, 0, 1, 0);
                gScale(0.2, 0.2, 1.2);
                setColor(vec4(1, 0, 0, 1));
                drawCone();
            }
            gPop();

            //tail bottom
            gPush();
            {
                gTranslate(-0.01, -0.7, 0);
                gRotate(90, 1, 0, 0);
                gRotate(60, 0, 1, 0);
                gScale(0.2, 0.2, 0.7);
                setColor(vec4(1, 0, 0, 1));
                drawCone();
            }
            gPop();
        }
        gPop();
    }
    gPop(); 

    //bubbles
    gPush() ;
    {
      //x and y for person
      x = 7.75 + 0.25 * Math.cos(0.75 * TIME);
      y = 2.25 + 0.5 * Math.cos(0.75 * TIME);

      //bubbles every 4 seconds
      if ((TIME - bubbleBlowTimer) > 4 && numBubbles == randBubbleNum)
      {
          //generating random # of bubbles (4 or 5)
          if (Math.random() > 0.5)
          {
            randBubbleNum = 4;
          }
          else
          {
            randBubbleNum = 5;
          }

          bubbleBlowTimer = TIME;
          numBubbles = 0;
      }

      if (TIME - bubbleTimer > 0.5 && numBubbles < randBubbleNum)
      {
            //add a new bubble
            isVisible.push(true);
            timeDrawn.push(TIME);
            bubbleX.push(x);
            bubbleY.push(y);
            bubbleOffset.push(Math.random() * 45);
            //now bubbleTimer to time
            bubbleTimer = TIME;
            numBubbles++;
      }

      for(var i = 0; i < isVisible.length; i++)
      {
        drawBubble(i);
      }
    }
    gPop() ;

    //person
    gPush();
    {
        gTranslate(8 + 0.25 * Math.cos(0.75 * TIME), 1 + 0.5 * Math.cos(0.75 * TIME), 1);
        gRotate(30, 0, -1, 0);

        //head
        gPush();
        {
            gTranslate(0, 2, 0);
            gPush();
            {
                gScale(0.5, 0.5, 0.5);
                setColor(vec4(0.5, 0, 0.5, 1));
                drawSphere();
            }
            gPop();

        }
        gPop();

        gPush();
        {
            //body
            gScale(0.8, 1.5, 0.5);
            setColor(vec4(0.5, 0, 0.5, 1));
            drawCube();
        }
        gPop();


        //drawing leg
        drawLeg(-0.5, -1.8, -0.5, 0);
        drawLeg(0.5, -1.4, -0.5, 30);
    }
    gPop();


    if( animFlag )
        window.requestAnimFrame(render);
}
