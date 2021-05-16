var config = {}

config.companies = {}

// Add a Company in here! 
config.companies.morgan_stanley = {
    entryURL: 'https://www.morganstanley.com/careers/career-opportunities-search',
    pageScraper: require('./controllers/morgan_stanley')

}

Object.seal(config);


module.exports = config