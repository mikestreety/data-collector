# Data Collector

Built with https://oclif.io/

- [Data Collector](#data-collector)
	- [Installation](#installation)
		- [Global](#global)
	- [Services](#services)
		- [Webmentions](#webmentions)
		- [RSS](#rss)
		- [Letterboxd](#letterboxd)
	- [Roadmap](#roadmap)

## Installation

```
npm i @mikestreety/data-collector
```

You can then access it with the following:

```
./node_modules/.bin/dc
```

In your `package.json`, you can add specific commands or a shortcut to the main command

```json
"scripts": {
  "dc": "dc"
},
```

With this set, you can pass in your commands to a slightly shorter (and more memorable) command:

```bash
npm run dc -- letterboxd letterboxd.json -u mikestreety
```

### Global

You can install it globally if you wish

```
npm i -g @mikestreety/data-collector
```

Which would allow you to run `dc` in your terminal

## Services

### Webmentions


- `-d`, `--domain` - the domain to get the webmentions from
- `-t`, `--token` - your webmentions token from https://webmention.io/settings

```
./bin/dev webmentions webmentions.json --domain www.mikestreety.co.uk --token 123456
```

Code adapted from [Max Böck](https://mxb.dev/)'s [11ty Webmentions repo](https://github.com/maxboeck/eleventy-webmentions)

### RSS

Any RSS feed provided (or searches for RSS) of a given domain

- `-f`, `--feed` - the RSS feed
- `-d`, `--domain` - the domain to search for the RSS feeds

```
./bin/dev letterboxd rss.json -f https://www.mikestreety.co.uk/rss-notes.xml
```

or

```
./bin/dev letterboxd rss.json -d www.mikestreety.co.uk
```

### Letterboxd

Get the films for a user from letterboxd

- `-u`, `--username` - the Letterboxd username

```
./bin/dev letterboxd letterboxd.json -u mikestreety
```

## Roadmap

- Allow `.env` files
- Create oAuth workflow
- Add Strava
