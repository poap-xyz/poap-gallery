# Intro
POAP Gallery is an explorer for POAP tokens that searches by event and token address.
A great tool that lets you view live stats on current public POAP drops.

# POAP gallery
[![gitpoap badge](https://public-api.gitpoap.io/v1/repo/poap-xyz/poap-gallery/badge)](https://www.gitpoap.io/gh/poap-xyz/poap-gallery)

* https://www.reddit.com/r/ethdev/comments/icfzhn/poap_proof_of_attendance_protocol_is_interested/g22d6ly/
* https://etherscan.io/token/0x22c1f6050e56d2876009903609a2cc3fef83b415
* https://opensea.io/assets/poap-v2
* https://etherscan.io/token/0x22c1f6050e56d2876009903609a2cc3fef83b415?a=0xf6b6f07862a02c85628b3a9688beae07fea9c863#inventory

* https://api.poap.tech/token/16815/image

## Mainnet

deploy contract: 0x22C1f6050E56d2876009903609a2cC3fEf83B415
* https://etherscan.io/token/0x22c1f6050e56d2876009903609a2cc3fef83b415

## Ropsten Testnet

deploy contract: 0x50C5CA3e7f5566dA3Aa64eC687D283fdBEC2A2F2


## How to setup

```
git clone https://github.com/poap-xyz/poap-gallery.git
cd
yarn
cp .env.template .env // Add your own REACT_APP_RPC_PROVIDER_URL
yarn start
```

## How to run with functions locally
### Link to configuration of Netlify
* https://docs.netlify.com/cli/get-started/#get-started-with-netlify-dev


### Files to change before to start running locally 
#### netlify.toml
From this
```
[[redirects]]
  from = "/event/*"
  to = "https://gallery-prerender.netlify.app/.netlify/functions/render/:route"
  status = 200
  force = true
```
To this
```
[[redirects]]
  from = "/event/*"
  to = "/.netlify/functions/render/:route"
  status = 200
  force = true
```

#### render.js
From this
```
const eventId = req?.baseUrl?.split('/')[2];
```
To this
```
const eventId = req?.baseUrl?.split('/')[4]
```
### Commands to run
```
npm install netlify-cli -g
netlify init
netlify dev
```
