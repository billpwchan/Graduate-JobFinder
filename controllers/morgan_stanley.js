const {
    Page
} = require("puppeteer");
const {
    table
} = require('table');
const {
    parse
} = require('node-html-parser')
const fs = require('fs')


/**
 * @param {Page} page - The page instance
 */
async function scrapeAll(page) {


    var vacancies = []

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

    for (let index = 0; index < totalPages; index++) {
        // Get All Job Cards from the page
        jobCards = [];
        const getJobCard = async () => {
            return await page.evaluate(async () => {
                const elements = [...document.querySelectorAll('div.jobcard')].map(i => i.innerHTML);
                return await new Promise(resolve => {
                    resolve(elements);

                })
            })
        };
        jobCards = await getJobCard();

        // Iterate all scrapped contents and save to the vacancies array
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
        });

        // Go to next page (if available)
        await page.evaluate(() => {
            const elements = [...document.querySelectorAll('#pagination > span > a')];
            const activeElementIndex = document.querySelector('#pagination > span > a.active').innerHTML
            const nextElementIndex = Number(activeElementIndex) + 1;

            elements.some(function (element) {
                if (element.innerHTML === nextElementIndex.toString()) {
                    element.click();
                    return true;
                }
            });
        });
    }


    let data = []
    vacancies.forEach((vacancy) => {
        data.push(Object.values(vacancy));
    });

    var date = (new Date()).toLocaleDateString();

    const config = {
        columnDefault: {
            width: 10,
        },
        header: {
            alignment: 'center',
            content: `MORGAN STANLEY JOB VACANCIES - ${date}`,
        },
    }
    console.log(table(data, config))
    fs.writeFile('./documents/morgan_stanley.txt', table(data, config), err => {})

}

module.exports = scrapeAll;