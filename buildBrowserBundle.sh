#!/bin/sh
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"

# Browserify doesn't support dynamic path requires
cp -dpr "$SCRIPTPATH/lib" "$SCRIPTPATH/libForBuild"
cat "$SCRIPTPATH/lib/monkruls.js" | sed -e 's/\${CONSTANTS.LIBDIR}/./g' | sed -e 's/\${CONSTANTS.CONFDIR}/..\/conf/g' > "$SCRIPTPATH/libForBuild/monkruls.js"
cat "$SCRIPTPATH/lib/rulsCoreFunctions.js" | sed -e 's/\${CONSTANTS.LIBDIR}/./g' | sed -e 's/\${CONSTANTS.CONFDIR}/..\/conf/g' > "$SCRIPTPATH/libForBuild/rulsCoreFunctions.js"
cat "$SCRIPTPATH/lib/webWrapper.js" | sed -e 's/\${CONSTANTS.LIBDIR}/./g' | sed -e 's/\${CONSTANTS.CONFDIR}/..\/conf/g' > "$SCRIPTPATH/libForBuild/webWrapper.js"

# Build now
npx browserify -r "$SCRIPTPATH/lib/webWrapper.js":webRuls | npx uglifyjs > "$SCRIPTPATH/lib/monkrulsBrowserified.min.js"

# Cleanup
rm -rf "$SCRIPTPATH/libForBuild"

echo Done.