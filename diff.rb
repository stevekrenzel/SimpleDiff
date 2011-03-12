class SimpleDiff
  def initialize(a, b, min_match=2)
    @a, @b, @min_match = a, b, min_match

    # Initialize the index for quick lookups into `b`
    @index, i = {}, 0
    (0...@b.length).each do |i|
      c = @b[i]
      if !@index.include? c
        @index[c] = []
      end
      @index[c].push(i)
      i += 1
    end
  end

  def longest_common_substring(alo, ahi, blo, bhi)
    matches, mxi, mxj, mxsz, new_matches = {}, 0, 0, 0, {}
    (alo...ahi).each do |i|
      js = @index[@a[i]].nil? ? [] : @index[@a[i]]
      js.each do |j|
        if blo <= j and j < bhi
          k = new_matches[j] = (matches[j - 1] or 0) + 1
          if k >= @min_match and k > mxsz
            mxi, mxj, mxsz = i, j, k
          end
        end
      end
      matches = new_matches
      new_matches = {}
    end
    [mxi - mxsz + 1, mxj - mxsz + 1, mxsz]
  end

  def find_matches
    queue, matches = [[0, @a.length, 0, @b.length]], []
    while queue.length > 0
      alo, ahi, blo, bhi = queue.pop()
      next if alo == ahi or blo == bhi
      i, j, k = longest_common_substring(alo, ahi, blo, bhi)
      next if k == 0
      matches.push([i, j, k])
      queue.push([alo, i, blo, j])
      queue.push([i + k, ahi, j + k, bhi])
    end
    matches.sort!
  end

  def compare
    a, b, ops, matches = @a, @b, [], find_matches
    matches = [[0, 0, 0]] + matches + [[@a.length, @b.length, 0]]
    (0...(matches.length - 1)).each do |x|
      m, n = matches[x], matches[x + 1]
      a_start, b_start = m[0] + m[2], m[1] + m[2]
      ops.push([' ', a[m[0] ... a_start]])
      ops.push(['-', a[a_start ... n[0]]])
      ops.push(['+', b[b_start ... n[1]]])
    end
    ops.find_all{|x| x[1].length > 0}
  end

  def ndiff
    out = []
    compare.each do |op, s|
      s.each_char do |c|
        out.push(op + ' ' + c)
      end
    end
    out
  end

  def to_s
    compare.inspect
  end
end

if __FILE__ == $0
  tests = [['Hello world.', 'Hello good world.'],
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

  tests.each do |a, b|
    puts a + ' --- ' + b
    puts SimpleDiff.new(a, b)
    puts
  end
end
