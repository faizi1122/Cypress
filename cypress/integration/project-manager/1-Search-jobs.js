/// <reference types="Cypress" />
import { getUniqueName } from "../../support/commands.js"

const commonLocators = require("../../Locators/commonLocators.json")
const ManagerJobsPageLocators = require("../../Locators/ManagerJobsPageLocators.json")

describe("Search Manager Job.", () => {
    before(() => {
        // Add more to before all operation.
        cy.visit("/project-manager-jobs")
        cy.get(commonLocators.pageHeading).should("have.text", "How to Become a Project Manager")
    })

    beforeEach(() => {
    })

    it("Search for a job to Compare.", () => {
        cy.fixture("Manager-jobs_data").then(data => {
            cy.get(ManagerJobsPageLocators.searchJob.projectManagerDemographicsSection)
                .contains(data.searchJob.projectManagerDemographicsSection)
                .scrollIntoView()
                .should('be.visible')

            cy.get(ManagerJobsPageLocators.searchJob.compareJobsDropdownBtn).click()
            cy.get(ManagerJobsPageLocators.searchJob.searchJob).type(data.searchJob.searchJob)

            cy.get(ManagerJobsPageLocators.searchJob.hightlightedText).each((element, index, list) => {
                cy.wrap(element).should("have.text", data.searchJob.searchJob)
                cy.wrap(element).should("have.css", "color", "rgb(50, 116, 238)")
            })
            cy.get(ManagerJobsPageLocators.searchJob.searchedResults).contains(data.searchJob.job).click()

            cy.get(ManagerJobsPageLocators.searchJob.selectedJobDropdownValue).should("have.text", data.searchJob.job)
            cy.get(ManagerJobsPageLocators.searchJob.selectedJobDropdownValue).should("have.css", "background-color", "rgb(49, 116, 238)")
        })
    })

    it("Compare selected job with Project Manager.", () => {
        cy.fixture("Manager-jobs_data").then(data => {
            for (let index in data.searchJob.progressBar) {
                cy.get(ManagerJobsPageLocators.searchJob.progressBar).eq(index).should("have.css", "background-color", "rgb(38, 166, 154)")
                cy.get(ManagerJobsPageLocators.searchJob.progressBar).eq(index).should("have.attr", "style").then(style => {
                    expect(style).includes(data.searchJob.progressBar[index])
                })
                cy.get(ManagerJobsPageLocators.searchJob.progressValue).eq(index).should("contain", data.searchJob.progressValue[index])
                cy.get(ManagerJobsPageLocators.searchJob.compareProgressValue).eq(index).should("contain", data.searchJob.compareProgressValue[index])
            }
        })
    })



})