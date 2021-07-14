import { writeCSV } from "https://deno.land/x/csv/mod.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";

const params = parse(Deno.args);

const { org, token } = params;const headers = {
	contentType: 'application/json',
	authorization: `bearer ${token}`
};

async function getReposPage(page: number = 1, maxPages: number = Infinity): Promise<any> {
	const url = `https://api.github.com/orgs/${org}/repos?per_page=100&page=${page}`;
	const result = await (await fetch(url, { headers })).json();
	if (result.length === 100 && page < maxPages) return result.concat(await getReposPage(page+1, maxPages));
	return result;
}

if (!token || !org) {
	console.error(`param cannot be empty\nuse:\n--org org-name --token bearer-token`);
} else {


	const repos = await (await fetch(`https://api.github.com/orgs/${org}/repos?per_page=100`, { headers })).json();

	if (!Array.isArray(repos)){
		console.error(`Token || organization is invalid.`)
	} else {
		const repos = await getReposPage();
		const file = await Deno.open("./repositories.csv", { write: true, create: true, truncate: true });
		let rows = [['name', 'fullname']];
		repos.forEach((repo: any) => {
			rows.push([repo.name, repo.full_name]);
		});
		await writeCSV(file, rows);
		file.close();
		console.log(`🦕 - Saved in repositories.csv`);
	}
}
