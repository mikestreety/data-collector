import * as Parser from 'rss-parser';

export async function fetchRssFeed(options: any) {
	const parser = new Parser();
	const feed = await parser.parseURL(options.feed);
	return feed.items;
}
