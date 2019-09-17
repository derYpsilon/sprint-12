module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "extends": "airbnb-base",
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "rules": {
    "semi": ["error", "never"],
    "prefer-rest-params": 0,
    "no-plusplus": 0,
    "no-console": 0,
    "no-underscore-dangle": 0
  }
};