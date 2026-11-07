// Шифрование SMS по раскладке из letters.js.
(function () {
  "use strict";
  window.ENCODE_SMS = function (word) {
    var map = {};
    window.PHONE_KEYS.forEach(function (key) {
      key.letters.split("").forEach(function (letter) { map[letter] = key.digit; });
    });
    return String(word).toUpperCase().split("").map(function (letter) {
      if (/\s/.test(letter)) return " ";
      if (!map[letter]) throw new Error("Нет буквы на клавиатуре: " + letter);
      return map[letter];
    }).join("");
  };
})();
