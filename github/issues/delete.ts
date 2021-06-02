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
	const issues = result.filter((issue: any) => !issue.pull_request)
	console.log({issueCount: issues.length});
}
