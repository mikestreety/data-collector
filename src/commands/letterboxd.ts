import { Args, Command, Flags } from '@oclif/core';
import * as u from '../utils';

export default class Letterboxd extends Command {

	static description = 'Download your Letterboxd reviews'

	static examples = [
		'<%= config.bin %> <%= command.id %> letterboxd.json',
	]

	static flags = {
		username: Flags.string({
			char: 'u',
			description: 'The letterboxd username'
		})
	}

	static args = {
		file: Args.string({
			description: 'Where to output the RSS',
			default: 'letterboxd.json'
		}),
	}

	public async run(): Promise<void> {
		const { args, flags } = await this.parse(Letterboxd);


		// If the file exists, load it
		let cache = u.JsonFileRead(args.file, {
			lastFetched: false,
			items: []
		});

		// Get all the webmentions required
		flags.feed = `https://letterboxd.com/${flags.username}/rss/`
		const feed = await u.fetchRssFeed(
			flags,
			{
				customFields: {
					item: [
						'letterboxd:filmTitle',
						'letterboxd:watchedDate',
						'letterboxd:filmYear',
						'letterboxd:memberRating',
						'letterboxd:rewatch',
					],
				}
			}
		);

		feed
			// Filter out lists
			.filter(item => item.guid?.includes('letterboxd-watch'))
			.map(item => {
				for(const key in item) {
					let keyParts = key.split(':');
					if (keyParts.length == 2) {
						item[keyParts[1]] = item[key];
						delete item[key];
					}
				}
				return item;
			});

		// If we have them save them
		if (feed) {
			const rssItems = {
				lastFetched: new Date().toISOString(),
				items: u.MergeItemsByKey('guid', cache.items, feed)
			}

			u.JsonFileWrite(args.file, rssItems);
		}
	}
}
