import { parse } from "https://deno.land/std/flags/mod.ts";

const params = parse(Deno.args);

const { org, repo, token } = params;
const headers = {
	contentType: 'application/json',
	authorization: `bearer ${token}`
};

async function getIssuesPage(page: number = 1, maxPages: number = Infinity): Promise<any[]> {
	const url = `https://api.github.com/repos/${org}/${repo}/issues?state=all&per_page=100&page=${page}`;
	const result = await (await fetch(url, { headers})).json();
	if (result.length === 100 && page < maxPages) return result.concat(await getIssuesPage(page+1, maxPages));
	return result;
}

if (!org || !repo || !token){
	console.error('param cannot be empty\nuse:\n--org org-name --repo repo-name --token bearer-token');
} else {
	const result = await (getIssuesPage());
	const issues = result.filter((issue: any) => !issue.pull_request);
	await Promise.all(issues.map(async (issue) => {
    var cmd = [`gh`, 'issue', 'delete', '--repo', 'spence-database', issue.number];
		const p = Deno.run({
			cmd: cmd,
			stdin: 'piped',
			stdout: 'piped',
			stderr: 'piped',
		});
		if (!p.stdin) throw Error();
		await p.stdin.write(new TextEncoder().encode(issue.number));
		p.stdin.close();
  }));
	Deno.writeTextFileSync('issues.json', JSON.stringify(issues, null, 2));
	console.log({issueCount: issues.length});
}
