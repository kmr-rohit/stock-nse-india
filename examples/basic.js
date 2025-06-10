// import { NseIndia } from 'stock-nse-india'

const {
    NseIndia
} = require('../build/index')

const nse = new NseIndia()

nse.getAllStockSymbols().then(symbols => {
    console.log(symbols);
})

nse.getEquityDetails('NIFTYBEES').then(details => {
    console.log(details);
}
).catch(err => {
    console.error('Error fetching equity details:', err);
});

