import { writeCSV } from "https://deno.land/x/csv/mod.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";

const params = parse(Deno.args);

const { org, token } = params;

if (!token || !org) {
	console.error(`param cannot be empty\nuse:\n--org org-name --token bearer-token`);
} else {
	const headers = {
		contentType: 'application/json',
		authorization: `bearer ${token}`
	};

	const repos = await (await fetch(`https://api.github.com/orgs/${org}/repos?per_page=100`, { headers })).json();

	if (!Array.isArray(repos)){
		console.error(`Token || organization is invalid.`)
	} else {
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
