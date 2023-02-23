import { Args, Command, Flags, ux } from '@oclif/core';

import * as u from '../utils';

export default class Webmentions extends Command {

	static description = 'Retrieve webmentions for a given URL'

	static examples = [
		'<%= config.bin %> <%= command.id %> webmentions.json -d www.mikestreety.co.uk -t 123456',
	]

	static flags = {
		verbose: Flags.boolean({
			char: 'v',
			description: 'Increase verbosity of output'
		}),
		domain: Flags.string({
			char: 'd',
			required: true,
			description: 'The domain you want the webmentions for'
		}),
		token: Flags.string({
			char: 't',
			required: true,
			description: 'Your token from webmentions.io'
		}),
		perPage: Flags.string({
			default: '500',
			description: 'How many per page'
		}),
		sortBy: Flags.string({
			description: 'Sorting mechanism',
			default: 'created',
			options: ['created', 'updated', 'published', 'rsvp']
		}),
		sortDir: Flags.string({
			description: 'Ordering direction',
			default: 'down',
			options: ['down', 'up']
		}),
		property: Flags.string({
			description: 'Limit returned webmentions with specific properties',
			options: ['in-reply-to', 'like-of', 'repost-of', 'bookmark-of', 'mention-of', 'rsvp'],
			multiple: true
		}),
		since: Flags.string({
			description: 'Specify date to find new mentions retrieved by the service since.'
		}),
		sinceId: Flags.string({
			description: 'Specify ID to find new mentions retrieved by the service since.'
		}),
	}

	static args = {
		file: Args.string({
			description: 'Where to output the webmentions',
			default: 'webmentions.json'
		}),
	}

	public async run(): Promise<void> {
		const {args, flags} = await this.parse(Webmentions);

		// If the file exists, load it
		let cache = u.JsonFileRead(args.file, {
			lastFetched: false,
			children: []
		});

		// If there isn't a "since" in the CLI
		if (!flags.since) {
			flags.since = cache.lastFetched
		}

		// Get all the webmentions required
		ux.action.start('Fetching webmentions')
		const feed = await this.fetchWebmentions(flags);
		ux.action.stop(`Found ${feed.length}`);

		// If we have them save them
		if (feed) {
			const webmentions = {
				lastFetched: new Date().toISOString(),
				children: u.MergeItemsByKey('wm-id', cache.children, feed)
			}

			u.JsonFileWrite(args.file, webmentions);
		}
	}

	// save combined webmentions in cache file


	async fetchWebmentions(options: any) {

		let URL = u.BuildGETURL(
			'https://webmention.io/api/mentions.jf2',
			{
				'domain': options.domain,
				'token': options.token,
				'per-page': options.perPage,
				'sort-by': options.sortBy,
				'sort-dir': options.sortDir,
				'wm-property[]': options.property,
				'since_id': {
					value: options.sinceId,
					replaces: 'since'
				},
				'since': options.since,
			}
		);

		return await this.getWebmentionPage(options, URL, 0);
	}

	async getWebmentionPage(options: any, url: string, page: number) {
		url = url + `&page=${page}`;

		if(options.verbose) {
			console.log(url);
		}
		const response = await fetch(url);
		if (response.ok) {
			const feed = await response.json();

			let children = feed.children.length ? feed.children : [];

			// Get the next page if the number is equal to "options.perPage"
			if (children.length === options.perPage) {
				let data = await this.getWebmentionPage(options, url, ++page);
				// Add to the end of existing array
				children = children.concat(data);
			}

			return children;
		}

		return [];
	}
}
