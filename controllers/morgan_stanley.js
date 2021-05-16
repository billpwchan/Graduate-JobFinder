const {
    Page
} = require("puppeteer");

const {
    parse
} = require('node-html-parser')

/**
 * @param {Page} page - The page instance
 */
async function scrapeAll(page) {

    await page.evaluate(() => {
        document.querySelector('a.button--internStudents').click();
    });

    await page.waitForSelector('button.all--sg--link');

    await page.evaluate(() => {
        document.querySelector('button.all--sg--link').click();
    })

    await page.evaluate(() => {
        const elements = [...document.querySelectorAll('div.jobcard')];

    })


    jobCards = [];
    const getJobCard = async () => {
        return await page.evaluate(async () => {
            const elements = [...document.querySelectorAll('div.jobcard')].map(i => i.innerHTML);
            return await new Promise(resolve => {
                resolve(elements);

            })
        })
    }

    jobCards = await getJobCard();

    jobCards.forEach(jobCard => {
        const root = parse(jobCard)
        console.log(root.querySelector('div.cmp-jobcard__title').childNodes[0].rawText)
    })



}

module.exports = scrapeAll;