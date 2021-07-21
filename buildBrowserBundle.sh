#!/bin/sh
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"

npx browserify -r "$SCRIPTPATH/lib/webWrapper.js":webRuls | npx uglifyjs > "$SCRIPTPATH/lib/monkrulsBrowserified.min.js"
echo Done.