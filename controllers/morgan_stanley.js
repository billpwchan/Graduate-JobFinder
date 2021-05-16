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


    const getPagination = async () => {
        return await page.evaluate(async () => {
            const elements = [...document.querySelectorAll('#pagination > span > a')];
            return await new Promise(resolve => {
                resolve(elements[elements.length - 1].innerHTML);
            })
        })
    }

    totalPages = await getPagination();
    console.log(totalPages)



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

    var vacancies = []

    jobCards.forEach(jobCard => {
        let vacancy = {}
        const root = parse(jobCard)
        vacancy.jobTitle = root.querySelector('div.cmp-jobcard__title').childNodes[0].rawText
        vacancy.jobType = root.querySelector('div.description_section').childNodes[1].rawText
        vacancy.jobLocation = root.querySelector('div.cmp-jobcard__location').childNodes[0].rawText
        vacancy.applyURL = root.querySelector('a.button--done')._attrs.href
        vacancy.deadline = root.querySelector('div.description_section').childNodes[0].rawText
        vacancy.remarks = ''

        vacancies.push(vacancy)
    })

    // console.log(vacancies)



}

module.exports = scrapeAll;