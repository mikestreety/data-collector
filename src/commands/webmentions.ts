import {Args, Command, Flags} from '@oclif/core'

import * as fs from 'fs';

export default class Webmentions extends Command {

	static description = 'Retrieve webmentions for a given URL'

	static examples = [
		'<%= config.bin %> <%= command.id %>',
	]

	static flags = {
		domain: Flags.string({
			char: 'd',
			description: 'The domain you want the webmentions for'
		}),
		token: Flags.string({
			char: 't',
			description: 'Your token from webmentions.io'
		}),
		perPage: Flags.string({
			description: 'How many per page',
			default: '500'
		}),
		sortBy: Flags.string({
			description: 'Your token from webmentions.io'
		}),
		sortDir: Flags.string({
			description: 'Your token from webmentions.io'
		}),
		property: Flags.string({
			description: 'Your token from webmentions.io'
		}),
		since: Flags.string({
			description: 'Your token from webmentions.io'
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
		let cache = this.loadExistingData(args.file)

		// If there isn't a "since" in the CLI
		if (!flags.since) {
			flags.since = cache.lastFetched
		}

		// Get all the webmentions required
		const feed = await this.fetchWebmentions(flags, '');

		// If we have them save them
		if (feed) {
			const webmentions = {
				lastFetched: new Date().toISOString(),
				children: this.mergeWebmentions(cache.children, feed)
			}

			this.writeData(args.file, webmentions);
		}
	}

	/**
	 * If there is already a file, load the existing data
	 *
	 * @returns Object
	 */
	loadExistingData(path: string) {
		if (fs.existsSync(path)) {
			const cacheFile = fs.readFileSync(path, 'utf-8')
			return JSON.parse(cacheFile)
		}

		return {
			lastFetched: false,
			children: []
		}
	}

	// save combined webmentions in cache file
	writeData(path: string, data: any) {
		const fileContent = JSON.stringify(data, null, 2)

		// write data to cache json file
		fs.writeFile(path, fileContent, err => {
			if (err) {
				throw err
			}

			console.log(`${data.children.length} webmentions cached to ${path}`)
		})
	}

	async fetchWebmentions(options: any, since: string) {
		const API_ORIGIN = 'https://webmention.io/api/mentions.jf2';
		let url = `${API_ORIGIN}?domain=${options.domain}&token=${options.token}&per-page=${options.perPage}`


		if (options.sortBy) {
			url += `&sort-by=${options.sortBy}`
		}

		if (options.sortDir) {
			url += `&sort-dir=${options.sortBy}`
		}

		if (options.property?.length) {
			url += `&wm-property[]=${options.property.join('&wm-property[]=')}`
		}

		if (options.since) {
			url += `&since=${since}`
		}

		return await this.getWebmentionPage(url, 0, options.perPage);
	}

	async getWebmentionPage(url: string, page: number, perPage: string) {
		const response = await fetch(url + `&page=${page}`);
		if (response.ok) {
			const feed = await response.json();

			let children = feed.children.length ? feed.children : [];

			// Get the next page if the number is equal to "perPage"
			if (children.length === perPage) {
				let data = await this.getWebmentionPage(url, ++page, perPage);
				// Add to the end of existing array
				children = children.concat(data);
			}

			return children;
		}

		return [];
	}

	// Merge fresh webmentions with cached entries, unique per id
	mergeWebmentions(a: any, b: any) {
		a = a.concat(b);

		return this.uniqBy(a, 'wm-id')
	}

	uniqBy(arr: any, iteratee: any) {
		if (typeof iteratee === 'string') {
			const prop = iteratee
			iteratee = (item: any)=> item[prop]
		}

		return arr.filter(
			(x: any, i: any, self: any) => i === self.findIndex((y: any)  => iteratee(x) === iteratee(y))
		)
	}
}
