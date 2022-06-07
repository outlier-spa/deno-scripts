import {cron} from 'https://deno.land/x/deno_cron/cron.ts';

Deno.create('./cron.txt');

cron('1 * * * * *', () => {
	const file = Deno.openSync('./cron.txt', { write: true, append: true });
	file.writeSync(new TextEncoder().encode(`${new Date()}\n`));
	file.close();
});
