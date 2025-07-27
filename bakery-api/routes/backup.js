const fs = require('fs');
const { exec } = require('child_process');
const { pool } = require('./config/database');
const path = require('path');
const moment = require('moment');

const BACKUP_DIR = path.join(__dirname, 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

// Database backup function
async function backupDatabase() {
  const date = moment().format('YYYY-MM-DD_HH-mm-ss');
  const filename = `bakery_db_${date}.sql`;
  const filepath = path.join(BACKUP_DIR, filename);
  
  const command = `mysqldump -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} > ${filepath}`;
  
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Backup failed:', stderr);
        reject(error);
      } else {
        console.log('Backup created:', filename);
        resolve(filepath);
      }
    });
  });
}

// Export data to JSON
async function exportData() {
  const date = moment().format('YYYY-MM-DD');
  const filename = `bakery_export_${date}.json`;
  const filepath = path.join(BACKUP_DIR, filename);
  
  try {
    // Get all tables data
    const [tables] = await pool.query('SHOW TABLES');
    
    const data = {};
    for (const table of tables) {
      const tableName = table[`Tables_in_${process.env.DB_NAME}`];
      const [rows] = await pool.query(`SELECT * FROM ${tableName}`);
      data[tableName] = rows;
    }
    
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log('Data exported:', filename);
    return filepath;
  } catch (err) {
    console.error('Export failed:', err);
    throw err;
  }
}

// Restore from backup
async function restoreDatabase(backupFile) {
  const command = `mysql -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} < ${backupFile}`;
  
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Restore failed:', stderr);
        reject(error);
      } else {
        console.log('Database restored from:', backupFile);
        resolve();
      }
    });
  });
}

module.exports = {
  backupDatabase,
  exportData,
  restoreDatabase
};