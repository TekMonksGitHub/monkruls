# README #

The MonkRuls business rules engine.

A powerful, but lightweight business rules engine.

<p align="center"><img src="https://github.com/TekMonksGitHub/raw/raw/master/monkruls/logo.png" width="349px" height="254px"></p>

# Features #

* Runs on fundamentals - rules, data, input object and output object definition.
* Decision tables, Tree and flow based.
* Ability to provide reasoning for decisions.
* Supports JSON, and CSV formats for all artifacts, for real world ease of use.
* No programming language needed, ever! Objects can be defined via CSVs.
* Functional support for set theory, eases creation of real world rules and scenarios.
* Very fast, iteration based rules engine, not recursive. 
* Built in API and embedded deployment models. 
* A modern rules engine built for the modern API based businesses. 

### What is this repository for? ###

* MonkRuls Code Repository

### How do I get set up? ###

* Clone the repo

* Install Node.js 64 or 32 bit depending on your OS. Minimum version Node.js 8.11.1 or above. Old versions have race condition bug in DNS resolver.

* Install PapaParse for CSV parsing.  This must be a local install. Don't use --global on Windows.
```
npm install papaparse
```

* Install Mustache.  This must be a local install. Don't use --global on Windows.
```
npm install mustache
```

* Run from command line using this command. This runs the tool in a one worker cluster. Don't add more workers. 
```
[windows] monkruls.bat 
[linux] monkruls.sh
```

### Using from a web browser
Use the following instructions

* Change configuration options as you prefer. Then build the browserified bundle using this command
```
[windows] buildBrowserBundle.bat 
[linux] buildBrowserBundle.sh
```

* Place `[monkruls]/lib/monkrulsBrowserified.min.js` in the web application path. Let's assume this is `[path]`.

* Import the rules engine using this command `<script src="[path]/monkrulsBrowserified.min.js"></script>`

* Run the engine by calling it as 
```
const webRuls = require("webRuls");
const {results} = webRuls.runRules([input spec as JSON]);
```

* Samples folders contain various input specs.

### Contribution guidelines ###

* Clean coding please
* Remember node.js MUST be asynchronous - no "sync" methods, ever!
