# Data Collector

Built with https://oclif.io/

- [Data Collector](#data-collector)
	- [Services](#services)
		- [Webmentions](#webmentions)
		- [RSS](#rss)
		- [Letterboxd](#letterboxd)
	- [Roadmap](#roadmap)

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
./bin/dev letterboxd rss.json -f [https://www.mikestreety.co.uk/rss-notes.xml
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
