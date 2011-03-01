function diff(a, b, min_match) {

  var index = {};

  var init = function () {
    min_match = min_match || 3;

    // Initialize reversed index of all the characters in `b`
    for(var i = 0; i < b.length; i++) {
      if(!(b[i] in index)) {
        index[b[i]] = [];
      }
      index[b[i]].push(i);
    }
  }


  var longest_common_substring = function (alo, ahi, blo, bhi) {
    var matches = {}, mxi = 0, mxj = 0, mxsz = 0, new_matches = {};
    for(var i = alo; i < ahi; i++) {
      var lookup = index[a[i]];
      for(var j_ in index[a[i]]) {
        var j = lookup[j_];
        if(blo <= j && j < bhi) {
          var k = new_matches[j] = (matches[j - 1] || 0) + 1;;
          if(k >= min_match && k > mxsz) {
            mxi = i, mxj = j, mxsz = k;
          }
        }
      }
      matches = new_matches, new_matches = {};
    }
    return [mxi - mxsz + 1, mxj - mxsz + 1, mxsz];
  }


  // Find the largest chunks of matching blocks between the two strings
  var find_matches = function () {
    var matches = [[0, 0, 0], [a.length, b.length, 0]];
    var queue = [[0, a.length, 0, b.length]];
    while(queue.length > 0) {
      var e = queue.pop();
      var s = longest_common_substring.apply(this, e);
      var i = s[0], j = s[1], k = s[2];
      if(k >= min_match) {
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
  }


  // Generate op codes from the list of matches
  var compare = function () {
    var ops = [], matches = find_matches();
    for(var x = 0; x < matches.length - 1; x++) {
      var m = matches[x], n = matches[x + 1];
      var equ_len = m[0] + m[2],
          del_len = n[0] - m[0] - m[2],
          add_len = n[1] - m[1] - m[2];
      if(equ_len > 0) {
        ops.push({op: ' ', text: a.substring(m[0], m[0] + m[2])});
      }
      if(del_len > 0) {
        ops.push({op: '-', text: a.substring(m[0] + m[2], n[0])});
      }
      if(add_len > 0) {
        ops.push({op: '+', text: b.substring(m[1] + m[2], n[1])});
      }
    }
    return ops;
  }

  init();
  return compare();
}

function html_diff(a, b) {
  var ops = diff(a, b);
  var out = '';
  for(var i in ops) {
    if(ops[i].op == ' ') {
      out += ops[i].text;
    } else if(ops[i].op == '-') {
      out += '<del>' + ops[i].text + '</del>';
    } else if(ops[i].op == '+') {
      out += '<ins>' + ops[i].text + '</ins>';
    }
  }
  return out;
}
