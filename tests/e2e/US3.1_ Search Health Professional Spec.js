describe('US 3.1: Search Health Professional', function() {

    beforeAll(function (done) {
        return browser.get('http://localhost:8088/#/index')
            .then(done);
    });

    var searchPractitioner,
        searchInput,
        searchButton;
    beforeEach(function() {
        searchPractitioner = element(by.id('searchPractitioner'));
        searchInput = element(by.model('searchHP'));
        searchButton = element(by.id('search'));
    });

    afterEach(function () {
        searchInput.clear();
    });

    it("should login", function () {
        var userInput = element(by.id("username")),
            loginButton = element(by.css('[ng-click="login(credentials)"]'));
        userInput.sendKeys("Jayne");
        loginButton.click();
    });

    it('AC3.1-1: The text "Type HPs unique ID" must pre-populate the HP search bar in soft colour and italics', function () {
        expect(searchPractitioner.isPresent()).toBe(true);
        expect(searchPractitioner.getAttribute('placeholder')).toBe('Type HP unique ID');
        expect(searchPractitioner.getAttribute('class')).toBe('search-box ng-pristine ng-untouched ng-invalid ng-invalid-required ng-valid-maxlength');
    });

    it('AC3.1-3: A MAPS UI user must be able to use the HP search bar to search for a specific health professional using the HPs unique identifier (DWP staff number)', function () {
       expect(searchInput.isPresent()).toBe(true);
    });

    it('AC3.1-6: MAPS UI must limit the HP Search bar to a maximum of eight numeric characters.', function () {
        searchInput.sendKeys('1234567890');
        expect(searchPractitioner.getAttribute('value')).toBe('12345678');
    });

    it('AC3.1-7: A successful search for a health professional populates the HPs current allocations table with the health professionals staff number (unique identifier).', function () {
        searchInput.sendKeys('12345678');
        searchButton.click().then(function () {
            var hpStaffNumber = element(by.id('hpStaffNumberText')).getText();
            expect(hpStaffNumber).toBe('HP Staff Number: 12345678');
        })
    });

    it('AC3.1-8: A successful search must populate the HPs current allocations table with all assessments that are currently allocated to the health professional.', function () {
        searchInput.sendKeys('12345678');
        searchButton.click().then(function () {
            var numberOfRows = element.all(by.repeater('allocation in allocations')).count();
            expect(numberOfRows).toEqual(4);
        });
    });

    it('AC3.1-9: If the successful search finds that the HP does not currently have any allocated assessments to display, a message must display below the HP Current Allocations Table.', function () {
        expect(element(by.id('noAllocations')).isDisplayed()).toBeFalsy();
        searchInput.sendKeys('12341234');
        searchButton.click().then(function () {
            expect(element(by.id('noAllocations')).isDisplayed()).toBeTruthy();
        });
        searchInput.clear();
        searchInput.sendKeys('12345678');
        searchButton.click().then(function () {
            expect(element(by.id('noAllocations')).isDisplayed()).toBeFalsy();
        });
    });

    it('AC3.1-10: At the end of each row of the Health Professionals Current Allocations table, there must be a Select button.', function () {
        searchInput.sendKeys('12341234');
        searchButton.click().then(function () {
            expect(element.all(by.id('btn')).count()).toBe(0);
        });
        searchInput.clear();
        searchInput.sendKeys('12345678');
        searchButton.click().then(function () {
            expect(element.all(by.id('btn')).count()).toBe(4);
        });
    });

    it('AC3.1-11: The user must have the option to Select all. This must display as a button located above the first results row, in the same column as the Select button.', function () {
        searchInput.sendKeys('12341234');
        searchButton.click().then(function () {
            expect(element.all(by.id('selectAll')).count()).toBe(1);
            expect(element.all(by.id('selectAll')).isEnabled()).toMatch('false');
        });
        searchInput.clear();
        searchInput.sendKeys('12345678');
        searchButton.click().then(function () {
            expect(element.all(by.id('selectAll')).isEnabled()).toMatch('true');
        });
    });

    it('AC3.1-14: When the user types a new unique ID into the HP search bar and conducts a new successful search, the HP current allocations table must replace all data fields with the new data results from the new search.', function () {
        searchInput.sendKeys('12341234');
        searchButton.click().then(function () {
            var numberOfRows = element.all(by.repeater('allocation in allocations')).count();
            expect(numberOfRows).toEqual(0);
        });
        searchInput.clear();
        searchInput.sendKeys('12345678');
        searchButton.click().then(function () {
            var numberOfRows = element.all(by.repeater('allocation in allocations')).count();
            expect(numberOfRows).toEqual(4);
        });
    });
});
