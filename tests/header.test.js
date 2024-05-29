const puppeteer = require('puppeteer');
const sessionFactory = require('./factories/sessionFactory');
const userFactory = require('./factories/userFactory');
const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    // browser = await puppeteer.launch({
    //     headless: false
    // });
    // page = await browser.newPage();
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
})

// test('Add two numbers', () => {
//     const sum = 1+2;
//     expect(sum).toEqual(3);
// });

test('the header has a correct text', async () => {
    // const text = await page.$eval('a.brand-logo', el => el.innerHTML);
    const text = await page.getContentsOf('a.brand-logo');

    expect(text).toEqual('Blogster');
});

test('clicking login starts oauth flow', async () => {
    await page.click('.right a');

    const url = await page.url();
    // console.log(url);
    expect(url).toMatch(/accounts\.google\.com/);
})

test('when signed in, shows logout button', async () => {
    // const id = "66507a2ac9b3a144180fbf82";
    await page.login();

    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);

    expect(text).toEqual('Logout');
});