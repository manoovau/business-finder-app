# Business finder App

Project: Business finder App using YELP API.

## Restrictions:

- open at filter only supports 2 days after or before the current day.
- maximum number of business results retruns by YELP API is 50.
- sort by filter: rating sort is not strictly sorted by the rating value, but by an adjusted rating value that takes into account the number of ratings, similar to a Bayesian average. This is to prevent skewing results to businesses with a single review.

## Download project.

Clone business-finder-app folder. It includes all dependencies.

## yelp API Authentication.

- request yelp API Key. See: https://www.yelp.com/developers/documentation/v3/authentication
- create "yelp-credentials.ts" file inside "src/hooks/yelp-api" folder.
- Paste information below inside "yelp-credentials.ts" file and save changes:

const API_KEY = "<insert yelp API_KEY>"

export const BEARER = `Bearer ${API_KEY}`;

## Get Cookies to make API work.

Go to https://cors-anywhere.herokuapp.com/corsdemo and click the button.

## Install package(s).

run `npm install` from the command line.

## Open project.

run script `npm start` in the command line.

## Run test.

run script `npm test` in the command line.
