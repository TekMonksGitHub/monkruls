# README #

The Monkruls business rules engine.

### What is this repository for? ###

* Monkruls Code Repository

### How do I get set up? ###

* Pull the repo

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
monkruls.bat 
```


### Contribution guidelines ###

* Clean coding please
* Remember node.js MUST be asynchronous - no "sync" methods, ever!
