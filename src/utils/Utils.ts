function uniqueBy(arr: any, iteratee: any) {
	if (typeof iteratee === 'string') {
		const prop = iteratee
		iteratee = (item: any)=> item[prop]
	}

	return arr.filter(
		(x: any, i: any, self: any) => i === self.findIndex((y: any)  => iteratee(x) === iteratee(y))
	)
}

// Merge fresh webmentions with cached entries, unique per id
export function MergeItemsByKey(key: string, a: any, b: any) {
	a = a.concat(b);

	return uniqueBy(a, key)
}
