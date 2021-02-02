# README #

The MonkRuls business rules engine.

A powerful, but lightweight business rules engine.

# Features #

* Runs on fundamentals - rules, data, input object and output object definition.
* Tree and flow based.
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
monkruls.bat 
```


### Contribution guidelines ###

* Clean coding please
* Remember node.js MUST be asynchronous - no "sync" methods, ever!
