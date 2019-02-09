const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('DID YOU RUN `release` NOT `publish`??? (Y/N): ', answer => {
    if (answer === 'Y' || answer === 'y') {
        console.log('Very good, continuing');
        //process.exit();
    } else {
        console.log('No can do amigo');
        throw new Error(
            'Use `yarn run release`, not `npm publish` or `yarn publish`',
        );
    }
});
