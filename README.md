<br />
<p align="center">
  <a href="https://www.milliontoken.org/">
    <img src="https://assets.coingecko.com/coins/images/16825/large/logo200x200.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Million Token Discord Bot</h3>

  <p align="center">
    Our official discord server bot
    <br />
    <a href="https://github.com/Million-Token-Community/million-discord-bot/blob/main/README.md"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://www.milliontoken.org/">Visit our website</a>
    ·
    <a href="https://github.com/Million-Token-Community/million-discord-bot/issues/new">Report Bug</a>
    ·
    <a href="https://github.com/Million-Token-Community/million-discord-bot/issues/new">Request Feature</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#environment-variables">Environment Variables</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributing">Contributing</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->

## About The Project

This is our [official discord server](https://discord.com/invite/million) bot.
The current public commands are:
* /price
* /volume
* /cap
* /holders
* /gas
* /liquidity
* /lambo


<!-- GETTING STARTED -->

## Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/en/) and [npm](https://nodejs.org/en/)

### Installation
1. Clone the repo
   ```shell
   git clone https://github.com/Million-Token-Community/million-discord-bot.git
   ```
2. Install the dependencies
   ```shell
   npm install
   ```

<!-- USAGE EXAMPLES -->

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file.


| Discord        | Description               |
|----------------|---------------------------|
| TOKEN          | The bot token     |
| GUILD_ID       | The bot server id |
| APPLICATION_ID | The bot application id    |
| PUBLIC_KEY     | The bot public key        |

* `TOKEN` and `GUILD_ID` are required.

| Million Token    | Description                         |
|------------------|-------------------------------------|
| NOMICS_API_TOKEN | Your token of the [nomics API](https://nomics.com/)        |
| COVALENT_API_KEY | Your token of the [covalent API](https://nomics.com/)       |
| ETH_GAS_KEY      | Your token of the [etherscan gas API](https://etherscan.io/gastracker)        |

* `COVALENT_API_KEY` is required for the **/holders** command.
* `ETH_GAS_KEY` is required for the **/gas** command.

| Services Tokens | Description                         |
|---------------------|-------------------------------------|
| TWITTER_KEY      | Your [Twitter API](https://developer.twitter.com/en/docs/twitter-api) key         |
| AIRTABLE_API_KEY | Your [Airtable API](https://airtable.com/api) key   |
| REDDIT_CLIENT_ID | Your [Reddit](https://www.reddit.com/dev/api/) client id     |
| REDDIT_SECRET    | Your [Reddit](https://www.reddit.com/dev/api/) secret  |
| REDDIT_USERNAME  | Your [Reddit](https://www.reddit.com/dev/api/) username |
| REDDIT_PASSWORD  | Your [Reddit](https://www.reddit.com/dev/api/) password  |

* All these environment variables are required for their services.

## Usage

Now you are done! You can start our project and run it using

```shell
npm run start:dev
```

## Contributing

See [CONTRIBUTING.md](https://github.com/Million-Token-Community/million-discord-bot/blob/main/CONTRIBUTING.md) for ways to get started.
