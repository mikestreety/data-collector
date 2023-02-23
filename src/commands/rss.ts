import { Args, Command, Flags } from '@oclif/core';
import * as inquirer from 'inquirer'

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

		if(flags.domain && !flags.feed) {
			let feeds = await fetch(`https://feedsearch.dev/api/v1/search?url=${flags.domain}`)
				.then(data => data.json())
			;

			if(feeds.length > 1) {
				flags.feed = await this.selectFeed(feeds, flags);
			} else if(feeds.length == 1) {
				flags.feed = feeds[0].url;
			} else {
				// no feeds
				return;
			}


		}

		console.log(flags)

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

	async selectFeed(feeds: any, options: any) {
		this.log(`There were ${feeds.length} feeds found, please choose one to gather`);

		let responses: any = await inquirer.prompt([{
			name: 'feed',
			message: 'Choose a feed',
			type: 'list',
			choices: feeds.map((f: any) => {
				return {
					name: `${f.title} [${f.url}]`,
					value: f.url
				}
			}),
		}]);

		return responses.feed;
	}
}
