@echo off

REM Browserify doesn't support dynamic path requires
xcopy /E/H/Y/Q "%~dp0\lib" "%~dp0\libForBuild\"
type "%~dp0\lib\monkruls.js" | sed -e "s/\${CONSTANTS.LIBDIR}/./g" | sed -e "s/\${CONSTANTS.CONFDIR}/..\/conf/g" > "%~dp0\libForBuild\monkruls.js"
type "%~dp0\lib\rulsCoreFunctions.js" | sed -e "s/\${CONSTANTS.LIBDIR}/./g" | sed -e "s/\${CONSTANTS.CONFDIR}/..\/conf/g" > "%~dp0\libForBuild\rulsCoreFunctions.js"
type "%~dp0\lib\webWrapper.js" | sed -e "s/\${CONSTANTS.LIBDIR}/./g" | sed -e "s/\${CONSTANTS.CONFDIR}/..\/conf/g" > "%~dp0\libForBuild\webWrapper.js"

REM Build now
npx browserify -r "%~dp0\libForBuild\webWrapper.js":webRuls | npx uglifyjs > "%~dp0\lib\monkrulsBrowserified.min.js"

REM Cleanup
rmdir /S /Q "%~dp0\libForBuild"

echo Done.