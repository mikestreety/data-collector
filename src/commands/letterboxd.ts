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
		const feed = await u.fetchRssFeed(flags);

		feed
			// Filter out lists
			.filter(item => item.guid?.includes('letterboxd-watch'))
			// Add title, year and rating
			.map(item => {
				// The title is formed of [Film, Year - Rating]
				// Split on the hyphen as it may have commas in the film title
				let details = item.title?.split('-');

				if(details?.length == 2) {
					let rating = details[1].trim(),
						halfRating = 0;

					if (rating.includes('½')) {
						rating = rating.replace('½', '');
						halfRating = 0.5;
					}
					item.rating = `${rating.length + halfRating}`;

					let title = details[0].trim();
					// The year is the last 4 characters
					item.filmYear = title.substring(title.length - 4);
					// The film has a title then a comma<space><year>
					item.filmTitle = title.substring(0, title.length - 6).trim();
				}

				return item;
			})

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
