
/* Makes the child class inherit from the parent class */
var inheritClass = function(parent, child) {
  function protoCreator() {
    this.constructor = child.prototype.constructor;
  }
  protoCreator.prototype = parent.prototype;
  child.prototype = new protoCreator();
};
var log = function(number, base) {
  return Math.log(number) / Math.log(base);
};
var makeColorString = function(red, green, blue) {
  if (red.red !== undefined && red.green !== undefined && red.blue !== undefined) {
    var color = red;
    red = color.red;
    green = color.green;
    blue = color.blue;
  }
  var _red = red.toString(16);
  if (_red.length == 1) _red = "0" + _red;
  var _green = green.toString(16);
  if (_green.length == 1) _green = "0" + _green;
  var _blue = blue.toString(16);
  if (_blue.length == 1) _blue = "0" + _blue;
  return "#" + _red + _green + _blue;
};
var getColorComponents = function(color) {
  var _color = color.substring(0);
  if (_color[0] == "#") {
    _color = color.substring(1);
  }
  var red = parseInt(_color.substring(0, 2), 16);
  var green = parseInt(_color.substring(2, 4), 16);
  var blue = parseInt(_color.substring(4, 6), 16);
  if (isNaN(red) || isNaN(green) || isNaN(blue)) {
    return null;
  }
  else {
    return {
      red: red,
      green: green,
      blue: blue
    };
  }
};
/* Calculates the mean of an array of numbers */
var mean = function(numbers) {
  var sum = 0;
  for (var n = 0; n < numbers.length; n++) {
    sum += numbers[n];
  }
  return sum / numbers.length;
};

/* Calculates the standard deviation of an array of numbers */
var stdev = function(numbers) {
  if (numbers.length < 2) return Number.NaN;
  var meannum = mean(numbers);
  var sqsum = 0;
  for (var n = 0; n < numbers.length; n++) {
    sqsum += Math.pow(meannum - numbers[n], 2);
  }
  return Math.sqrt(sqsum / (numbers.length - 1));
};

/* Calculates the standard error of an array of numbers */
var sterror = function(numbers) {
  if (numbers.length < 2) return Number.NaN;
  return stdev(numbers) / Math.sqrt(numbers.length);
};