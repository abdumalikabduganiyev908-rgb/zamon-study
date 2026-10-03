import {randomBytes} from 'node:crypto';
console.log('Add this line to .env.local and your hosting environment variables. Keep it private.');
console.log('OWNER_ACCESS_CODE='+randomBytes(32).toString('base64url'));
console.log('Owner opens from Teacher → Enter code, with no name or password prompt. Existing data remains in Zamon.');
