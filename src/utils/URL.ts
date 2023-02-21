const querystring = require('node:querystring');

/**
 * Build a URL with GET params
 * @param base The base URL (e.g. https://www.mikestreety.co.uk)
 * @param options An object of key: value GET params. If it is an object,
 * 	it needs the values of "replaces" and "value" to allow a "if this exists replace the other one"
 * @returns
 */
export function BuildGETURL(base: string, options: any) {
	// Format the params
	for (const key in options) {
		// Get the value
		let value = options[key];

		// Is it an object?
		if (
			(!!value) &&
			(value.constructor === Object) &&
			value.replaces
		) {
			options[key] = value.value;
			if (value.value) {
				delete options[value.replaces];
			}
		}

		// Remove any values which don't exist
		// (use the options object in case it has changed above)
		if (!options[key]) {
			delete options[key];
		}
	}

	return `${base}?${querystring.stringify(options) }`;
}
