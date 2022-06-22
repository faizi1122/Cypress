// Import commands.js using ES2015 syntax:
import './commands'
const commonLocators = require("../Locators/commonLocators.json")

// Alternatively you can use CommonJS syntax:
// require('./commands')

before(() => {
    // Login in to app.
    cy.log("This is outer before call")

})

after(() => {
    cy.clearLocalStorage()
})

beforeEach(() => {
    cy.restoreLocalStorage()
    cy.runRoutes()
})

afterEach(() => {
    cy.saveLocalStorage()
})