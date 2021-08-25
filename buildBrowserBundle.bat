@echo on

REM Browserify doesn't support dynamic path requires, make everything static
xcopy /E/H/Y/Q "%~dp0\lib" "%~dp0\libForBuild\"
type "%~dp0\lib\monkruls.js" | sed -e "s/\${CONSTANTS.LIBDIR}/./g" | sed -e "s/\${CONSTANTS.CONFDIR}/..\/conf/g" > "%~dp0\libForBuild\monkruls.js"
type "%~dp0\lib\rulsCoreFunctions.js" | sed -e "s/\${CONSTANTS.LIBDIR}/./g" | sed -e "s/\${CONSTANTS.CONFDIR}/..\/conf/g" > "%~dp0\libForBuild\rulsCoreFunctions.js"
type "%~dp0\lib\webWrapper.js" | sed -e "s/\${CONSTANTS.LIBDIR}/./g" | sed -e "s/\${CONSTANTS.CONFDIR}/..\/conf/g" > "%~dp0\libForBuild\webWrapper.js"
copy "%~dp0\conf\functions.json" "%~dp0\conf\functions.json.saved" 
node "%~dp0\tools\inlineConf.js" "%~dp0\conf\functions.json" "%~dp0\conf\functions.json" 

REM Build now
npx browserify -r "%~dp0\libForBuild\webWrapper.js":webRuls | npx uglifyjs > "%~dp0\lib\monkrulsBrowserified.min.js"

REM Cleanup
rmdir /S /Q "%~dp0\libForBuild"
move /Y "%~dp0\conf\functions.json.saved" "%~dp0\conf\functions.json" 

echo Done.