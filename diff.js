function SimpleDiff(a, b, min_match) {
  this.index = {};

  this.min_match = min_match || 2;

  // Initialize reversed index of all the characters in `b`
  for(var i = 0; i < b.length; i++) {
    if(!(b[i] in this.index)) {
      this.index[b[i]] = [];
    }
    this.index[b[i]].push(i);
  }
}

SimpleDiff.prototype = {
  longest_common_substring : function (alo, ahi, blo, bhi) {
    var matches = {}, mxi = 0, mxj = 0, mxsz = 0, new_matches = {};
    for(var i = alo; i < ahi; i++) {
      var lookup = this.index[a[i]];
      for(var j_ in this.index[a[i]]) {
        var j = lookup[j_];
        if(blo <= j && j < bhi) {
          var k = new_matches[j] = (matches[j - 1] || 0) + 1;;
          if(k >= this.min_match && k > mxsz) {
            mxi = i, mxj = j, mxsz = k;
          }
        }
      }
      matches = new_matches, new_matches = {};
    }
    return [mxi - mxsz + 1, mxj - mxsz + 1, mxsz];
  },


  find_matches : function () {
    // Find the largest chunks of matching blocks between the two strings
    var matches = [[0, 0, 0], [a.length, b.length, 0]];
    var queue = [[0, a.length, 0, b.length]];
    while(queue.length > 0) {
      var e = queue.pop();
      var s = this.longest_common_substring.apply(this, e);
      var i = s[0], j = s[1], k = s[2];
      if(k >= this.min_match) {
        matches.push(s);
        queue.push([e[0], i, e[2], j]);
        queue.push([i + k, e[1], j + k, e[3]]);
      }
    }

    matches.sort(function(a, b) {
      for(var i in [0,1,2]) {
        if(a[i] < b[i]) return -1;
        if(a[i] > b[i]) return 1;
      }
      return 0;
    });

    return matches;
  },


  compare : function () {
    // Generate op codes from the list of matches
    var ops = [], matches = this.find_matches();
    for(var x = 0; x < matches.length - 1; x++) {
      var m = matches[x], n = matches[x + 1];
      var equ_len = m[0] + m[2],
          del_len = n[0] - m[0] - m[2],
          add_len = n[1] - m[1] - m[2];
      if(equ_len > 0) {
        ops.push([' ', a.substring(m[0], m[0] + m[2])]);
      }
      if(del_len > 0) {
        ops.push(['-', a.substring(m[0] + m[2], n[0])]);
      }
      if(add_len > 0) {
        ops.push(['+', b.substring(m[1] + m[2], n[1])]);
      }
    }
    return ops;
  },


  ndiff : function () {
    var out = [];
    var cmp = this.compare();
    for(var x in cmp) {
      var op = cmp[x][0], s = cmp[x][1];
      for(var c in s) {
        out.push(op + ' ' + c);
      }
    }
    return out;
  },


  toString : function () {
    var cmp = this.compare(), out = [];
    for(var x in cmp) {
      out.push('[\'' + cmp[x][0] + '\', \'' + cmp[x][1] + '\']');

    }
    return '[' + out.join(', ') + ']';
  }
}



function html_diff(a, b) {
  var ops = new SimpleDiff(a, b).compare(), out = '';
  for(var i in ops) {
    if(ops[i][0] == ' ') {
      out += ops[i][1];
    } else if(ops[i][0] == '-') {
      out += '<del>' + ops[i][1] + '</del>';
    } else if(ops[i][0] == '+') {
      out += '<ins>' + ops[i][1] + '</ins>';
    }
  }
  return out;
}


var tests = [['Hello world.', 'Hello good world.'],
             ['Hello world.', 'world.'],
             ['Hello world.', 'Hello'],
             ['', 'Hello good world.'],
             ['', ''],
             ['Hello world.', ''],
             ['Hello one world.', 'Hello two world.'],
             ['Hello one world.', 'Hello good two bad world.'],
             ['AAAAAAA', 'AAAAAAA'],
             ['AAAAAAA', 'AAABAAA'],
             ['The red brown fox jumped over the rolling log.',
              'The brown spotted fox leaped over the rolling log.']]


for(var x in tests) {
  var a = tests[x][0], b = tests[x][1];
  print(a + ' --- ' + b);
  print(new SimpleDiff(a, b));
  print(html_diff(a, b));
  print();
}
