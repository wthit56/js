/*
console.group("group");
console.log("in group 1");
console.group("group 2");
console.log("in group 2");
console.groupEnd();
console.log("group 1 again");
console.groupEnd();
console.log("after groups");
*/


//console.log(new Dictionary(["zzz", "abc"]).findMostSimilar("bcd")); // abc

//console.log(new Dictionary(['cherry', 'pineapple', 'melon', 'strawberry', 'raspberry']).findMostSimilar('strawbery')); // strawberry

/*
function TestDictionary(spec) {
  var matcher = new Dictionary(spec.words);
  spec.expectations.forEach(function (e) {
    Test.expect(
      matcher.findMostSimilar(e.query) == e.nearest
    , 'expected findMostSimilar("' + e.query + '") == "' + e.nearest + '"'
    );
  });
}

TestDictionary({
  words: ['cherry', 'pineapple', 'melon', 'strawberry', 'raspberry'],
  expectations: [
    { query:   'strawbery',
      nearest: 'strawberry'
    },
    { query:   'berry',
      nearest: 'cherry'
    }
  ],
});

TestDictionary({
  words: Test.randomize(['javascript', 'java', 'ruby', 'php', 'python', 'coffeescript']),
  expectations: [
    { query:   'heaven',
      nearest: 'java'
    },
    { query:   'javascript',
      nearest: 'javascript'
    }
  ],
});
*/

