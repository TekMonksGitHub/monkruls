@echo off

REM Browserify doesn't support dynamic path requires
xcopy /E/H "%~dp0\lib" "%~dp0\libForBuild"
sed -i -e "s/\${CONSTANTS.LIBDIR}/./g" | sed -e "s/\${CONSTANTS.CONFDIR}/..\/conf/g" "%~dp0\libForBuild\monkruls.js"
sed -i -e "s/\${CONSTANTS.LIBDIR}/./g" | sed -e "s/\${CONSTANTS.CONFDIR}/..\/conf/g" "%~dp0\libForBuild\rulsCoreFunctions.js"
sed -i -e "s/\${CONSTANTS.LIBDIR}/./g" | sed -e "s/\${CONSTANTS.CONFDIR}/..\/conf/g" "%~dp0\libForBuild\webWrapper.js"

REM Build now
npx browserify -r "%~dp0\libForBuild\webWrapper.js":webRuls | npx uglifyjs > "%~dp0\lib\monkrulsBrowserified.min.js"

REM Cleanup
rmdir /s "%~dp0\libForBuild"

echo Done.