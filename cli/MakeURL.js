#!/usr/bin/env node

/**Command line util to process string(s) and return formatted URL with option params
* Enter options var; or 
* Copy/paste saved data text. 
* Press Enter for new var 
* Ctrl C when done will output URL string.
 */

// set target host
var hosturl = 'https://vie74050.github.io/ecgpacerapp/?';
var readline = require('readline');
var input = [];
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Hide BP (y): ', (answer1) => {
    if (answer1==='y') input.push('bpgraph=0');

    rl.question('Hide Pacer (y): ', (answer2) => {
        if (answer2==='y') input.push('pacer=0');

        rl.question('Hide Settings (y): ', (answer3) => {
            if (answer3==='y') input.push('settings=0');

            console.log("Enter variables. Comma-separated or new line. Press enter and ctrl-c to exit complete.\n");

            rl.prompt();
            rl.on('line', function (cmd) {
                input.push(cmd.replace(/,/g,'&'));
            });
            
        });
    });
});

rl.on('close', function (cmd) {
    
    let str = input.join('&');
    console.log('\n\nURL: \n\n', hosturl+str.replace(/:/g,'=').replace(/[" ,\{\}]/g,'').replace(/&&/g,"&"));
    process.exit(0);
});