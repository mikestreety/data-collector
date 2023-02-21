import {Args, Command, Flags} from '@oclif/core';

import * as Parser from 'rss-parser';

import * as u from '../utils';

export default class Rss extends Command {

	static description = 'Download RSS feed to JSON'

	static examples = [
		'<%= config.bin %> <%= command.id %> rss.json',
	]

	static flags = {
		domain: Flags.string({
			char: 'd',
			description: 'The domain you want to find RSS for'
		}),
		feed: Flags.string({
			char: 'f',
			description: 'The specific feed URL'
		}),
	}

	static args = {
		file: Args.string({
			description: 'Where to output the RSS',
			default: 'rss.json'
		}),
	}

	public async run(): Promise<void> {
		const {args, flags} = await this.parse(Rss);

		// if(flags.domain) {
		// https://feedsearch.dev/api/v1/search?url=mikestreety.co.uk
		// 	let feeds = await fetch(flags.domain)
		// 		.then(data => data.json)
		// 		.then(data => console.log(data));
		// 	console.log(feeds);
		// }

		// If the file exists, load it
		let cache = u.JsonFileRead(args.file, {
			lastFetched: false,
			items: []
		});

		// Get all the webmentions required
		const feed = await this.fetchFeed(flags);

		// If we have them save them
		if (feed) {
			const rssItems = {
				lastFetched: new Date().toISOString(),
				items: u.MergeItemsByKey('guid', cache.items, feed)
			}

			u.JsonFileWrite(args.file, rssItems);
		}
	}

	async fetchFeed(options: any) {
		const parser = new Parser();
		const feed = await parser.parseURL(options.feed);
		return feed.items;
	}
}
