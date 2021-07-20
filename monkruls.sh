#!/bin/bash
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
node --preserve-symlinks --preserve-symlinks-main $SCRIPTPATH/lib/cmdlineWrapper.js $*