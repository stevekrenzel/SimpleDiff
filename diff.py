from collections import defaultdict
from difflib import ndiff
from random import randint
from time import time
from sys import argv

# I suspect that scanning through once and then catching the max at each
# position would speed up things, even though we'd need to filter out and/or
# recalculate invalid/out-of-bounds areas

class SimpleDiff():

  def __init__(self, a, b, min_match=2):
    self.a = a
    self.b = b
    self.min_match = min_match

    # Initialize the index for quick lookups into `b`
    self.index = defaultdict(list)
    for i, c in enumerate(b):
      self.index[c].append(i)

  def longest_common_substring(self, alo, ahi, blo, bhi):
    matches, mxi, mxj, mxsz = defaultdict(int), 0, 0, 0
    new_matches = defaultdict(int)
    for i in xrange(alo, ahi):
      for j in self.index[self.a[i]]:
        if blo <= j < bhi:
          k = new_matches[j] = matches[j - 1] + 1
          if k >= self.min_match and k > mxsz:
            mxi, mxj, mxsz = i, j, k
      matches = new_matches
      new_matches = defaultdict(int)
    return mxi - mxsz + 1, mxj - mxsz + 1, mxsz

  def find_matches(self):
    queue, matches = [(0, len(self.a), 0, len(self.b))], []
    while queue:
      alo, ahi, blo, bhi = queue.pop()
      if alo == ahi or blo == bhi:
        continue
      i, j, k = self.longest_common_substring(alo, ahi, blo, bhi)
      if k == 0:
        continue
      matches.append((i, j, k))
      queue.append((alo, i, blo, j))
      queue.append((i + k, ahi, j + k, bhi))
    matches.sort()
    return matches

  def compare(self):
    a, b = self.a, self.b
    matches = self.find_matches()
    matches = [(0, 0, 0)] + matches + [(len(a), len(b), 0)]
    ops = []
    for x in xrange(len(matches) - 1):
      m = matches[x]
      n = matches[x + 1]
      a_start, b_start = m[0] + m[2], m[1] + m[2]
      ops.append((' ', a[m[0] : a_start]))
      ops.append(('-', a[a_start : n[0]]))
      ops.append(('+', b[b_start : n[1]]))
    return filter(lambda x: len(x[1]) > 0, ops)

  def ndiff(self):
    for op, s in self.compare():
      for c in s:
        yield op + ' ' + c

  def __str__(self):
    return str(self.compare())

l = 10
n = 100
m = 8
tests = [('Hello world.', 'Hello good world.'),
         ('Hello world.', 'world.'),
         ('Hello world.', 'Hello'),
         ('', 'Hello good world.'),
         ('', ''),
         ('Hello world.', ''),
         ('Hello one world.', 'Hello two world.'),
         ('Hello one world.', 'Hello good two bad world.'),
         ('AAAAA', 'AAAAA')]

t = time()
for a, b in tests:
  print a, b
  s = SimpleDiff(a, b, 3)
  print s.find_matches()
  print s.compare()
  print


#t = time()
#d = SimpleDiff(a, b)
#for i in range(n):
#  d.compare()
#t = time() - t
#print n, t, len(a), len(b), n / t
