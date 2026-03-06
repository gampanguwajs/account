class QueryOptimizer {
  async analyzeQuery(query) {
    const explain = await database.query(`EXPLAIN ANALYZE ${query}`);
    
    return {
      executionTime: explain['Execution Time'],
      planningTime: explain['Planning Time'],
      rows: explain['Plan']['Plan Rows'],
      cost: {
        startup: explain['Plan']['Startup Cost'],
        total: explain['Plan']['Total Cost']
      },
      suggestions: this.getSuggestions(explain)
    };
  }

  getSuggestions(explain) {
    const suggestions = [];
    
    if (explain['Plan']['Node Type'] === 'Seq Scan') {
      suggestions.push('Consider adding an index for this query');
    }
    
    if (explain['Execution Time'] > 100) {
      suggestions.push('Query exceeds 100ms threshold - optimize further');
    }
    
    return suggestions;
  }
}