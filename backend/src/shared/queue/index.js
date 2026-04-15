const { Queue } = require('bullmq');
const dotenv = require('dotenv');

dotenv.config();

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

const ingestionQueue = new Queue('ingestion-queue', { connection });
const conflictQueue = new Queue('conflict-queue', { connection });
const briefQueue = new Queue('brief-queue', { connection });

module.exports = {
  ingestionQueue,
  conflictQueue,
  briefQueue,
  connection,
};
