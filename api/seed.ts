import db from './db.js';

// Clear existing data
db.exec('DELETE FROM companies');
db.exec('DELETE FROM facts');
db.exec('DELETE FROM timeline_events');
db.exec('DELETE FROM contract_terms');

console.log('Database cleared and initialized successfully.');
