const {
    Cluster
} = require('puppeteer-cluster')
const vanillaPuppeteer = require('puppeteer')
const {
    addExtra
} = require('puppeteer-extra')
const Stealth = require('puppeteer-extra-plugin-stealth')
const Recaptcha = require('puppeteer-extra-plugin-recaptcha');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
const AnonymizeUA = require('puppeteer-extra-plugin-anonymize-ua')

var config = require('./config');


async function main() {
    // Puppeteer-extra Plugins! Prevent Anti-Scrapping Mechanisms
    const puppeteer = addExtra(vanillaPuppeteer)
    puppeteer.use(Stealth())
    puppeteer.use(AdblockerPlugin({
        blockTrackers: true
    }))
    puppeteer.use(AnonymizeUA())

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 4,
        timeout: 300000,
        puppeteerOptions: {
            headless: false
        }
    });
    // Event handler to be called in case of problems
    cluster.on('taskerror', (err, data) => {
        console.log(`Exception in ${data}: ${err.message}`);
    });

    await cluster.task(async ({
        page,
        data: url
    }) => {
        await page.goto(url, {
            waitUntil: 'networkidle0',
        });
        await page.setViewport({
            width: 1920,
            height: 1080
        });


        await page.waitForTimeout(20000)
    });

    for (const company in config.companies) {
        cluster.queue(config.companies[company].entry_url)
    }

    await cluster.idle();
    await cluster.close();
}

main().catch(console.warn)

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}