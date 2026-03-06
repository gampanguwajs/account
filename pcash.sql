-- Find slow queries
SELECT 
  query,
  calls,
  total_time / calls as avg_time,
  rows / calls as avg_rows,
  total_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Check for missing indexes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE tablename = 'users'
AND correlation < 0.1
AND n_distinct > 100;

-- View current queries
SELECT 
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query,
  state
FROM pg_stat_activity
WHERE state = 'active'
AND query NOT LIKE '%pg_stat_activity%'
ORDER BY duration DESC;