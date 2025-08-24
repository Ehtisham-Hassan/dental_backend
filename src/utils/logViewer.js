import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');

export const viewLogs = (logType = 'general', lines = 50, filter = null) => {
  const logFile = path.join(logsDir, `${logType}.log`);
  
  if (!fs.existsSync(logFile)) {
    console.log(`Log file ${logType}.log does not exist.`);
    return;
  }
  
  try {
    const content = fs.readFileSync(logFile, 'utf8');
    const logLines = content.trim().split('\n').filter(line => line.length > 0);
    
    let filteredLines = logLines;
    
    // Apply filter if provided
    if (filter) {
      filteredLines = logLines.filter(line => {
        try {
          const logEntry = JSON.parse(line);
          return logEntry.message.toLowerCase().includes(filter.toLowerCase()) ||
                 logEntry.level.toLowerCase().includes(filter.toLowerCase());
        } catch {
          return line.toLowerCase().includes(filter.toLowerCase());
        }
      });
    }
    
    // Get last N lines
    const lastLines = filteredLines.slice(-lines);
    
    console.log(`\n=== ${logType.toUpperCase()} LOGS (Last ${lastLines.length} entries) ===\n`);
    
    lastLines.forEach(line => {
      try {
        const logEntry = JSON.parse(line);
        const timestamp = new Date(logEntry.timestamp).toLocaleString();
        console.log(`[${timestamp}] ${logEntry.level}: ${logEntry.message}`);
        
        if (logEntry.data) {
          console.log(`  Data: ${JSON.stringify(logEntry.data, null, 2)}`);
        }
      } catch {
        console.log(line);
      }
    });
    
    console.log(`\n=== End of ${logType} logs ===\n`);
    
  } catch (error) {
    console.error('Error reading log file:', error.message);
  }
};

export const getLogStats = () => {
  const logFiles = ['requests', 'errors', 'general'];
  const stats = {};
  
  logFiles.forEach(logType => {
    const logFile = path.join(logsDir, `${logType}.log`);
    if (fs.existsSync(logFile)) {
      const content = fs.readFileSync(logFile, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.length > 0);
      stats[logType] = lines.length;
    } else {
      stats[logType] = 0;
    }
  });
  
  return stats;
};

// CLI usage
if (process.argv[1].endsWith('logViewer.js')) {
  const args = process.argv.slice(2);
  const logType = args[0] || 'general';
  const lines = parseInt(args[1]) || 50;
  const filter = args[2] || null;
  
  if (args[0] === 'stats') {
    const stats = getLogStats();
    console.log('\n=== LOG STATISTICS ===');
    Object.entries(stats).forEach(([type, count]) => {
      console.log(`${type}: ${count} entries`);
    });
  } else {
    viewLogs(logType, lines, filter);
  }
}
