// ==UserScript==
// @name        Lattice Goal Percentage (expected)
// @namespace   Violentmonkey Scripts
// @match       https://ifit.latticehq.com/goals/*
// @grant       none
// @version     1.0
// @author      pedro-mass
// @description Determines expected percentage based on Created on and Due dates
// @run-at      document-idle
// ==/UserScript==

waitUntilTrue(shouldRun, run)

function isPercentageBasedGoal() {
  // todo: make this actually check if there is a percentage based check?
  return true
}

function run() {
  console.log('Starting Lattice Goal Percentage calculations...')
  if (!isPercentageBasedGoal()) return

  // check if goal is percentage based?
  // get start date
  const startDate = getDate(/^created\n\n/i)
  const endDate = getDate(/^due\n\n/i)
  const currentDate = Date.now()

  const percentage = toWholePercent(
    getPercentage(startDate, endDate, currentDate)
  )

  const percentageElem = `<span class="css-1mddpa2">Expected: <span>${percentage}%</span></span>`
  const percentageContainer = contains('div', /^start:/i)
  // todo: insert new element into container

  console.log({
    fn: 'run()',
    startDate,
    endDate,
    currentDate,
    percentage,
    percentageElem,
    percentageContainer,
  })
}

function shouldRun() {
  const pageCheck = contains('p', /^key results$/i)
  return pageCheck != null && pageCheck.length > 0
}

function toWholePercent(percentage) {
  return Math.round(percentage * 100)
}

function getPercentage(startDate, endDate, currentDate) {
  const offset = startDate
  endDate = endDate - offset
  currentDate = currentDate - offset
  return currentDate / endDate
}

function getDate(regex, dateElem = 'div') {
  return new Date(
    replaceString(getText(first(contains(dateElem, regex))), regex, '')
  ).getTime()
}

function replaceString(string, searchString, newString) {
  if (!string) {
    console.warn('Received bad params', { string, searchString, newString })
    return string
  }

  return string.replace(searchString, newString)
}

function contains(selector, text) {
  var elements = document.querySelectorAll(selector)
  return Array.prototype.filter.call(elements, function (element) {
    return RegExp(text).test(getText(element))
  })
}

function getText(element) {
  return element.innerText
}

function first(arr) {
  return arr[0]
}

function waitUntilTrue(checkFn, cb = (x) => x, timeout = 100) {
  const intervalId = setInterval(checkInterval, timeout)
  function checkInterval() {
    if (checkFn()) {
      clearInterval(intervalId)
      cb()
    }
  }
}
