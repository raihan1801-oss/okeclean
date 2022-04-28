import { handler } from '../build/handler.js';
import http from '0http';

const port = 3000;
const host = '0.0.0.0';
const { router, server } = http();

// router.use('/', handler);
router.use('/', handler);

server.listen(port, host, () => {
	console.log(`Listening on ${host}:${port}`);
});
