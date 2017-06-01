# MAPS UI

----
## What is MAPS UI

----
## Getting Started 
* Navigate to project directory
* You may need to `sudo npm install -g grunt-cli`
* You may need to `sudo npm install -g karma-cli`
* You may need to `sudo npm install -g karma-jasmine`
* You may need to `sudo npm install -g karma-chrome-launcher`
* You may need to `sudo npm install -g karma-phantomjs-launcher`
* You may need to `sudo npm install -g bower`
* `sudo gem install sass`
* `npm install` (npm will automatically discover and download dependancies)
* Below two steps are required to run the end to end tests
* `./node_modules/protractor/bin/webdriver-manager update`
* `./node_modules/grunt-protractor-runner/node_modules/protractor/bin/webdriver-manager update`

Inside the application folder run the following command. Before you do this step delete the bower_components folder.
* bower install 

----
## Additional
* `grunt` this will do a `dev-build` 
* `grunt dev-build` (the default grunt task) will perform a standard build (clean, jshint, browserify, test, offline)
* `grunt dev-serve` does a `dev-build` then serves up the site (use CTRL+C to exit)
* `grunt test-unit` does a unit test build
* `grunt test` does a e2e and unit test build make sure you kept grunt dev-serve running in another window
