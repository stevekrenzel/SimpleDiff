function diff(a, b, min_match) {
  if(a === undefined || b === undefined) {
    throw "Diff requires two arguments.";
  }
  min_match = min_match || 3;

  // Create a reversed index of all the characters in `b`
  var index = {};
  for(var i = 0; i < b.length; i++) {
    if(!(b[i] in index)) {
      index[b[i]] = [];
    }
    index[b[i]].push(i);
  }

  var longest_common_substring = function (bounds) {
    var matches = {}, mxi = 0, mxj = 0, mxsz = 0, new_matches = {};
    for(var i = bounds.alo; i < bounds.ahi; i++) {
      var lookup = index[a[i]];
      for(var j_ in index[a[i]]) {
        var j = lookup[j_];
        if(bounds.blo <= j && j < bounds.bhi) {
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
  var matches = [[0, 0, 0], [a.length, b.length, 0]];
  var queue = [{alo: 0, ahi: a.length, blo: 0, bhi: b.length}];
  while(queue.length > 0) {
    var bounds = queue.pop();
    var s = longest_common_substring(bounds);
    var i = s[0], j = s[1], k = s[2];
    if(k >= min_match) {
      matches.push(s);
      queue.push({alo: bounds.alo, ahi: i, blo: bounds.blo, bhi: k});
      queue.push({alo: i + k, ahi: bounds.ahi, blo: j + k, bhi: bounds.bhi});
    }
  }

  matches.sort(function(a, b) {
    for(var i in [0,1,2]) {
      if(a[i] < b[i]) return -1;
      if(a[i] > b[i]) return 1;
    }
    return 0;
  });

  // Generate op codes from the list of matches
  var ops = [];
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

print(html_diff('The red brown fox jumped over the rolling log.',
                'The brown spotted fox leaped over the rolling log.'));
