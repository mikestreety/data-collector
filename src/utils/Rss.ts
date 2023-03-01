import * as Parser from 'rss-parser';

export async function fetchRssFeed(options: any, config: any = []) {
	const parser = new Parser(config ?? {});
	const feed = await parser.parseURL(options.feed);
	return feed.items;
}
