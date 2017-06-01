var SpecReporter = require('jasmine-spec-reporter');
//var reporters = require('jasmine-reporters');
//var JUnitXmlReporter = reporters.JUnitXmlReporter;

exports.config = {

    framework: 'jasmine2',
    directConnect: true,
    specs: [
        'tests/e2e/**/*Spec.js'
    ],

    capabilities: {
        browserName: 'chrome',
        chromeOptions: {'args': ['--disable-web-security']}

    },
    baseUrl: 'http://localhost:3000',
    allScriptsTimeout: 500000,
    restartBrowserBetweenTests: false,

    onPrepare: function () {
        
        var jasmine2HtmlReporter = require('protractor-jasmine2-html-reporter');
        jasmine.getEnv().addReporter(new jasmine2HtmlReporter({
            savePath: 'tests/e2e/output/',
            takeScreenshots: false,
            consolidate: true,
            consolidateAll: true
        }));
        var reporter = new SpecReporter({
            displayStacktrace: true,
            displaySpecDuration: true,
            displaySuiteNumber: true
        });
        jasmine.getEnv().addReporter(reporter);
        browser.driver.manage().window().setSize(1440, 1440);
        browser.driver.manage().window().maximize();
        browser.driver.manage().deleteAllCookies();
    },

    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 100000,
        print: function () {
        },
        isVerbose: true,
        includeStackTrace: true,
        showTiming: true,
        realtimeFailure: true
    }


};