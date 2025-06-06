exports.up = (pgm) => { 
  pgm.createTable('replies', { 
    id: { 
      type: 'VARCHAR(50)', 
      primaryKey: true, 
    }, 
    content: { 
      type: 'TEXT', 
      notNull: true, 
    }, 
    date: { 
      type: 'TIMESTAMP', 
      notNull: true, 
      default: pgm.func('current_timestamp'), 
    }, 
    comment: { 
      type: 'VARCHAR(50)', 
      notNull: true, 
      references: 'comments', 
    }, 
    owner: { 
      type: 'VARCHAR(50)', 
      notNull: true, 
      references: 'users', 
    }, 
    deleted_at: { 
      type: 'TIMESTAMP', 
      notNull: false, 
    }, 
  }); 
}; 
 
exports.down = (pgm) => { 
  pgm.dropTable('replies'); 
}; 
