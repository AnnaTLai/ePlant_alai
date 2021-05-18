/*function Node (data, priority) {
this.data = data;
this.priority = priority;
}
Node.prototype.toString = function(){return this.priority}

// takes an array of objects with {data, priority}
function PriorityQueue (arr) {
this.heap = [null];
if (arr) for (i=0; i< arr.length; i++)
this.push(arr[i].data, arr[i].priority);
}

PriorityQueue.prototype = {
push: function(data, priority) {
var node = new Node(data, priority);
this.bubble(this.heap.push(node) -1);
},

// removes and returns the data of highest priority
pop: function() {
var topVal = this.heap[1].data;
this.heap[1] = this.heap.pop();
this.sink(1); return topVal;
},

// bubbles node i up the binary tree based on
// priority until heap conditions are restored
bubble: function(i) {
while (i > 1) {
var parentIndex = i >> 1; // <=> floor(i/2)

// if equal, no bubble (maintains insertion order)
if (!this.isHigherPriority(i, parentIndex)) break;

this.swap(i, parentIndex);
i = parentIndex;
}   },

// does the opposite of the bubble() function
sink: function(i) {
while (i*2 < this.heap.length) {
// if equal, left bubbles (maintains insertion order)
var leftHigher = !this.isHigherPriority(i*2 +1, i*2);
var childIndex = leftHigher? i*2 : i*2 +1;

// if equal, sink happens (maintains insertion order)
if (this.isHigherPriority(i,childIndex)) break;

this.swap(i, childIndex);
i = childIndex;
}   },

// swaps the addresses of 2 nodes
swap: function(i,j) {
var temp = this.heap[i];
this.heap[i] = this.heap[j];
this.heap[j] = temp;
},

// returns true if node i is higher priority than j
isHigherPriority: function(i,j) {
return this.heap[i].priority < this.heap[j].priority;
}
}

Eplant.queue = {
_timer: null,
//_queue: [],
_queue: new PriorityQueue(),
add: function(fn, context, time, id, priority) {
if(!priority)priority = 0;
var setTimer = function(time) {
Eplant.queue._timer = setTimeout(function() {
time = Eplant.queue.add();
if (Eplant.queue._queue.heap.length) {
setTimer(time);
}
}, time || 2);
}

if (fn) {
Eplant.queue._queue.push([fn, context, time, id],priority);
if (Eplant.queue._queue.heap.length == 2) {
setTimer(time);
}
return;
}

//var next = Eplant.queue._queue.shift();
var next = Eplant.queue._queue.pop();
if (!next) {
return 0;
}
next[0].call(next[1] || window);
return next[2];
},
clear: function() {
clearTimeout(Eplant.queue._timer);
Eplant.queue._queue.heap = [];
},
clearWithId:function(id){
Eplant.queue._queue = Eplant.queue._queue.heap
.filter(function (el) {
return !el[3] || el[3] !== id;
}
);
}
};

*/

Eplant.queue = {
  _timer: null,
  _queue: [],
  _queueInProcess: {
  },
  add: function(fn, context, time, id, priority) {
    if(priority== null )priority = 10;
    var setTimer = function(time) {
      Eplant.queue._timer = setTimeout(function() {
        time = Eplant.queue.add();
        if (Eplant.queue._queue.length) {
          setTimer(time);
        }
      }, 2);
    }

    if (fn) {
      for (var i = 0; i < Eplant.queue._queue.length; i++) {
        // if our new priority is greater, then insert it here
        if (priority > Eplant.queue._queue[i].priority) {
          Eplant.queue._queue.splice(i, 0, {func:[fn, context, time, id],priority:priority});
          return;
        }
      }
      if(!id||id.indexOf('Loading')===-1||Eplant.queue._queueInProcess[id]){
        Eplant.queue._queue.push({func:[fn, context, time, id],priority:priority});

      }
      /*else{
        var idParts = id.split('_');
        if(!idParts.length>1||id[1]!=='Loading'||!Eplant.activeSpecies.getGeneticElementByIdentifier(idParts[0])){
        Eplant.queue._queue.push({func:[fn, context, time, id],priority:priority});
      }
    }*/


    //Eplant.queue._queue.push([fn, context, time, id]);
    if (Eplant.queue._queue.length == 1) {
      setTimer(time);
    }
    return;
  }

  var next = Eplant.queue._queue.shift();
  if (!next) {
    return 0;
  }
  next = next.func;
  next[0].call(next[1] || window);
  return next[2];
},
clear: function() {
  clearTimeout(Eplant.queue._timer);
  Eplant.queue._queue = [];
},
clearWithId:function(id){
  Eplant.queue._queue = Eplant.queue._queue
  .filter(function (el) {
    return !el.func[3] || el.func[3] !== id;
  });
  Eplant.queue._queueInProcess[id]=null;
}
};
