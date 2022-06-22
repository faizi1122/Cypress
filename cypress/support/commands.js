/// <reference types="Cypress" />

import 'cypress-mailosaur'

const commonLocators = require("../Locators/commonLocators.json")
const SignInLocators = require("../Locators/SignInLocators.json")

let LOCAL_STORAGE_MEMORY = {};

const modifierKey = Cypress.platform === "darwin" ? "meta" : "ctrl";

// Below github uuid is unique during execution globally and use it for all user, team, templates, checklist, inventory etc operations.
window.uniqueId = generateUUID()

export function generateUUID() {
    const uuid = require("uuid")
    const id = uuid.v4()
    return id.split("-")[4]
}

export function generateFullUUID() {
    const uuid = require("uuid")
    const id = uuid.v4()
    return id
}

function numToWords(num) {
    var a = ["", "one ", "two ", "three ", "four ", "five ", "six ", "seven ", "eight ", "nine ", "ten ", "eleven ", "twelve ", "thirteen ", "fourteen ", "fifteen ", "sixteen ", "seventeen ", "eighteen ", "nineteen "];
    var b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

    if ((num = num.toString()).length > 9) return "overflow"
    let n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/)
    if (!n) return; var str = ""
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "crore " : ""
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "lakh " : ""
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "thousand " : ""
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "hundred " : ""
    str += (n[5] != 0) ? ((str != "") ? "and " : "") + (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) : ""
    return str.trim()
}

export function getUniqueName(previousName) {   // theqa13119+User1
    let firstHalf = previousName.split("_")[0]
    let newName = firstHalf + "_" + window.uniqueId    // theqa13119 + '+' + asdj23j 
    return newName
}

export function getUniqueEmail(previousEmail) { // theqa13119+User1@gmail.com
    let firstHalf = previousEmail.split("+")[0]                   // theqa13119
    let secondHalf = previousEmail.split("@")[1]                      // gmail.com
    let newEmail = firstHalf + "+" + window.uniqueId + "@" + secondHalf    // theqa13119 + '+' + 23jkq3jkbf + '@' + gmail.com
    return newEmail
}

export function getAfterValue(selector, pseudo, property) {
    cy.get(selector)
        .parent().then($els => {
            // get Window reference from element
            const win = $els[0].ownerDocument.defaultView
            // use getComputedStyle to read the pseudo selector
            const after = win.getComputedStyle($els[0], pseudo)
            // read the value of the `content` CSS property
            const contentValue = after.getPropertyValue(property)
            // the returned value will have double quotes around it, but this is correct
            return contentValue
            // expect(contentValue).to.eq("rgb(229, 57, 53)")
        })
}

Cypress.Commands.add("enterUniqueName", (locator, value) => {
    cy.get(locator).clear()
    cy.get(locator).type(getUniqueName(value))
})

Cypress.Commands.add("enterUniqueEmail", (locator, value) => {
    cy.get(locator).clear()
    cy.get(locator).type(getUniqueEmail(value))
})

Cypress.Commands.add("readUniqueName", (locator, value) => {
    cy.get(locator).invoke("text").then(copy => {
        expect(copy).to.equal(getUniqueName(value))
    })
})

Cypress.Commands.add("readUniqueEmail", (locator, value) => {
    cy.get(locator).invoke("text").then(copy => {
        expect(copy).to.equal(getUniqueEmail(value))
    })
})

Cypress.Commands.add("saveLocalStorage", () => {
    Object.keys(localStorage).forEach(key => {
        LOCAL_STORAGE_MEMORY[key] = localStorage[key]
    })
})

Cypress.Commands.add("restoreLocalStorage", () => {
    Object.keys(LOCAL_STORAGE_MEMORY).forEach(key => {
        localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
    });
});

Cypress.Commands.add("loginWithApi", (username, password) => {

    cy.request({
        method: "POST",
        url: "/api/auth/login",
        headers: {
            "Host": Cypress.config().baseUrl.split("//")[1],
            "Connection": "keep-alive",
            "Accept": "application/json, text/plain, */*",
            // "Authorization": "Bearer undefined",
            "Origin": "/",
            "Referer": "/login",
        },
        followRedirect: true,
        form: false,
        body: {
            "email": username,
            "password": password,
            "localeId": "en"
        }
    }).then((response) => {
        expect(response.status).equal(200)
        // Storing user Data in Cache
        cy.window().then((window) => {
            window.localStorage.setItem(" ", JSON.stringify(response.body))
            window.localStorage.setItem(" ", "en")
            cy.log("The user logged in successfully")
            cy.visit("/")
        })
    })
})

Cypress.Commands.add("loginWithUI", (username, password) => {
    cy.visit("/login")
    // Check if the user is on the login page. 
    cy.get(SignInLocators.emailField).should("be.visible")

    // Enter credentials and log in.
    cy.get(SignInLocators.emailField).type(username)
    cy.get(SignInLocators.passwordField).type(password)
    cy.get(SignInLocators.rememberCheckBox).click()

    cy.get(SignInLocators.submitButton).click()
})

Cypress.Commands.add("performOperation", (operation, fieldsType) => {
    let locators = getLocators(fieldsType)
    let Locs = locators[operation]
    cy.fixture(fieldsType + "_data").then(returnedData => {
        let data = returnedData[operation]
        for (let loc in Locs) {
            if (loc.includes("Check")) {
                cy.get(Locs[loc]).check().should("be.checked")

            } else if (loc.includes("TextButton")) {
                cy.get(Locs[loc]).contains(data[loc]).click({ force: true })

            } else if (loc.includes("ImageHolder")) {
                cy.get(Locs[loc]).attachFile(data[loc])

            } else if (loc.includes("Btn")) {
                if (loc.includes("Force")) {
                    cy.get(Locs[loc]).click({ force: true })
                } else {
                    cy.get(Locs[loc]).click()
                }

            } else if (loc.includes("Radio")) {
                cy.get(Locs[loc]).check(data[loc])

            } else if (loc.includes("ContainsText")) {
                cy.get(Locs[loc]).invoke("text").then(copy => {
                    expect(copy).to.equal(data[loc])
                })
            } else if (loc.includes("_Unique")) {
                cy.get(Locs[loc]).clear({ force: true })
                if (loc.includes("Name")) {
                    cy.get(Locs[loc]).type(getUniqueName(data[loc]))
                } else if (loc.includes("Phone")) {
                    cy.get(Locs[loc]).type(getUniquePhone(data[loc]))
                } else if (loc.includes("Plate")) {
                    cy.get(Locs[loc]).type(window.uniqueId)
                } else {
                    cy.get(Locs[loc]).type(getUniqueEmail(data[loc]))
                }
            } else if (loc.includes("@")) {
                cy.wait(loc).its('response.statusCode').should('eq', Locs[loc])

            } else if (loc.includes("Msg")) {
                cy.get(Locs[loc]).should("have.text", data[loc])

            } else if (loc.includes("NotInDOM")) {
                cy.get(Locs[loc]).should("not.exist")

            } else if (loc.includes("BeVisible")) {
                cy.get(Locs[loc]).should("be.visible")

            } else {
                cy.get(Locs[loc]).clear()
                cy.get(Locs[loc]).type(data[loc])
            }
        }
    })
})

Cypress.Commands.add("runRoutes", () => {

    // cy.intercept("POST", "/autocomplete/source/*").as("searchJobs")
})