// ==UserScript==
// @name        Lattice Goal Percentage (ideal)
// @namespace   Violentmonkey Scripts
// @match       http://*.latticehq.com/goals/*
// @match       https://*.latticehq.com/goals/*
// @grant       none
// @version     1.1
// @author      pedro-mass
// @description Determines expected percentage based on Created on and Due dates
// @run-at      document-idle
// @require     http://code.jquery.com/jquery-3.5.0.min.js
// ==/UserScript==

waitUntilTrue(shouldRun, run)

function isPercentageBasedGoal() {
  // todo: make this actually check if there is a percentage based check?
  return true
}

function run() {
  console.log('Starting Lattice Goal Percentage calculations...')
  if (!isPercentageBasedGoal()) return

  const startDate = getDate(/^created\n\n/i)
  const endDate = getDate(/^due\n\n/i)
  const currentDate = Date.now()

  const currentPercentage = Number(
    getValue(/^current: /i, 'span').replace('%', '')
  )

  const idealPercentage = toWholePercent(
    getPercentage(startDate, endDate, currentDate)
  )

  return insertPercentage(idealPercentage, currentPercentage)
}

function getProgressIndicator(idealPercentage, currentPercentage) {
  if (!currentPercentage) return

  if (idealPercentage <= currentPercentage) {
    return '🎉'
  }

  return '😢'
}

function insertPercentage(idealPercentage, currentPercentage) {
  const progressIndicator = getProgressIndicator(
    idealPercentage,
    currentPercentage
  )
  const percentageElem = `<span class="css-1mddpa2">Ideally: <span>${idealPercentage}%</span> <span>${progressIndicator}</span></span>`
  const percentageContainer = contains('div', /^start:/i)

  return $(percentageContainer).find('span').first().after(percentageElem)
}

function shouldRun() {
  const pageCheck = contains('span', /^start:/i)
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

function getDate(regex, selector = 'div') {
  return new Date(getValue(regex, selector)).getTime()
}

function getValue(regex, selector) {
  return replaceString(getText(first(contains(selector, regex))), regex, '')
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

function waitUntilTrue(checkFn, cb = (x) => x, timeout = 250) {
  const intervalId = setInterval(checkInterval, timeout)
  function checkInterval() {
    if (checkFn()) {
      clearInterval(intervalId)
      cb()
    }
  }
}
