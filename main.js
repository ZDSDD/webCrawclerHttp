const {argv} = require('node:process');
const {crawlPage} = require("./crawl");

async function main() {
// print process.argv
    argv.forEach((val, index) => {
        console.log(`${index}: ${val}`);
    });
    if(argv.length !== 3){
        throw "bad arguments amount"
    }
    const url = argv.at(2)
    console.log(url);
    const pages = await crawlPage(url,url,{"url" : 0})
    console.log(pages)
}

main()