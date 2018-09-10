'use strict';

// the argument index for the packaging script
const ARGV_PROCESS_PACKAGING_SCRIPT_NAME = 2;

function runBuildTest() {
    console.log('run build test');
}

function runBuildDefault() {
    console.log('run build default');
}

let scriptName = process.argv[ARGV_PROCESS_PACKAGING_SCRIPT_NAME] || 'default';
// make distribution package
switch (scriptName.toLowerCase()) {
    case 'test':
        runBuildTest();
        break;
    default:
        runBuildDefault();
}
