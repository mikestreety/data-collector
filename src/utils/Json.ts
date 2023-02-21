import * as fs from 'fs';

/**
 * Load a JSON file - if the file doesn't exist then return the fallback
 *
 * @param path
 * @param fallback
 * @returns Object
 */
export function JsonFileRead(path: string, fallback: any) {
	if (fs.existsSync(path)) {
		return JSON.parse(fs.readFileSync(path, 'utf-8'))
	}

	return fallback || false;
}

/**
 * Write a JSON file
 *
 * @param path The path to the JSON file
 * @param data The data object
 */
export function JsonFileWrite(path: string, data: any) {
	const fileContent = JSON.stringify(data, null, 2)

	// write data to cache json file
	fs.writeFile(path, fileContent, err => {
		if (err) {
			throw err
		}
	});
}
