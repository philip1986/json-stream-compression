module.exports = {
  "extends": "google",
  "env": {
    "node": true,
    "mocha": true
  },
  "rules": {
    "no-return-assign": ["off"],
    "require-jsdoc": ["off"],
    "semi": [2, "never"],
    "no-multiple-empty-lines": [0],
    "new-cap": [2],
    "max-len": [2, 120, 4],
    "no-var": [2],
    "generator-star-spacing": [2, {"before": true, "after": false}],
    "quotes": [2, "single"],
    "strict": ["error", "global"]
  },
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "script"
  }
};
