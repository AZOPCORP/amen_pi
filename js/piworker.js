onmessage = function(e) {
  console.log('Message received from main script');


var NumOfDigits = parseInt(e.data[0]);
if(isNaN(NumOfDigits)){
	NumOfDigits =0;
}

console.log('NumOfDigits = '+ NumOfDigits);

var ans,t1,t2;


var mess="";

var Base=Math.pow(10,11);


var cellSize=Math.floor(Math.log(Base)/Math.LN10);



var a=Number.MAX_VALUE;

var MaxDiv=Math.floor(Math.sqrt(a));

calcPI(NumOfDigits);

function makeArray (n, aX, Integer) {

var i=0;

for (i=1; i<n; i++)

aX[i] = null;

aX[0] = Integer;

}

function isEmpty (aX) {

var empty=true

for (i=0; i<aX.length; i++)

if (aX[i])

{

empty= false;

break;

}

return empty;

}



function Add (n, aX,aY) {

carry=0

for (i=n-1; i>=0; i--) {

aX[i] += Number(aY[i])+Number(carry);

if (aX[i]<Base)

carry = 0;

else {

carry = 1;

aX[i] =Number(aX[i])- Number(Base);

}

}

}


function Sub (n, aX,aY) {

for (i=n-1; i>=0; i--) {

aX[i] -= aY[i];

if (aX[i]<0) {

if (i>0) {

aX[i] += Base;

aX[i-1]--;

}

}

}

}



function Mul (n, aX, iMult) {

carry=0;

for (i=n-1; i>=0; i--) {

prod = (aX[i])*iMult;

prod += carry;

if (prod>=Base) {

carry = Math.floor(prod/Base);

prod -= (carry*Base);

}

else

carry = 0;

aX[i] = prod;

}

}



function Div (n, aX, iDiv,aY) {

carry=0;

for (i=0; i<n; i++) {



currVal = Number(aX[i])+Number(carry*Base);



theDiv =Math.floor(currVal/iDiv);


carry = currVal-theDiv*iDiv;


aY[i] = theDiv;

}

}



function arctan (iAng, n, aX) {

iAng_squared=iAng*iAng;

k=3; 

sign=0;

makeArray (n, aX, 0); 

makeArray (n, aAngle, 1);

Div (n, aAngle, iAng, aAngle); 

Add (n, aX, aAngle); 

while (!isEmpty(aAngle)) {

Div (n, aAngle, iAng_squared, aAngle); 



Div (n, aAngle, k, aDivK); 

if (sign)

Add (n, aX, aDivK); 

else Sub (n, aX, aDivK); 

k+=2;

sign = 1-sign;

}

mess+=aArctan;

}



function calcPI (numDec) {

 ans="";

t1=new Date();
console.log(t1);



iAng=[10];

coeff=[10];

arrayLength=Math.ceil(1+numDec/cellSize);

aPI = [arrayLength];

aArctan = [arrayLength];

aAngle=[arrayLength];

aDivK=[arrayLength];



coeff[0] = 4;

coeff[1] = -1;

coeff[2] = 0;



iAng[0] = 5;

iAng[1] = 239;

iAng[2] = 0;

makeArray (arrayLength, aPI, 0);



makeArray(arrayLength,aAngle,0);

makeArray(arrayLength,aDivK,0);

for (var i=0; coeff[i]!=0; i++) {

arctan(iAng[i], arrayLength, aArctan);



Mul (arrayLength, aArctan, Math.abs(coeff[i]));



if (coeff[i]>0)

Add (arrayLength, aPI, aArctan);

else

Sub (arrayLength, aPI, aArctan);



}



Mul (arrayLength, aPI, 4);



sPI="";

tempPI="";



for (i=0;i<aPI.length;i++)

{

aPI[i]=String(aPI[i]);



if (aPI[i].length<cellSize&&i!=0)

{

while (aPI[i].length<cellSize)

aPI[i]="0"+aPI[i];

}

tempPI+=aPI[i];

}



for (i=0;i<=numDec;i++)

{



if (i==0)

sPI+=tempPI.charAt(i);

else

{


if ((i)%50==0&&i!=0)

sPI+=tempPI.charAt(i);

else

if (i%5==0)

sPI+=tempPI.charAt(i);

else

sPI+=tempPI.charAt(i);

}

}



ans+=sPI;



t2=new Date();
console.log(t2);
console.log(t2-t1);

//var timediv = $("#time");

//var myDiv=$("#Pi_Pattern");

//myDiv.text(ans);
//timediv.html('The script took '+(t2-t1)+' milliseconds to compute your Pi_sequence.');

}







































var t3 = (t2-t1);
  var workerResult = [];

  workerResult[0]=ans;
  workerResult[1]=t3;
  //workerResult[1]=t3;
  console.log('Posting message back to main script');
  postMessage(workerResult);
}
