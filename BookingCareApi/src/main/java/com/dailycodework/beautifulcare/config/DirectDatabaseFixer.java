package com.dailycodework.beautifulcare.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * Direct database fixer that uses simple SQL statements to fix the
 * permission_group_permissions join table.
 */
@Component
public class DirectDatabaseFixer {
    private static final Logger log = LoggerFactory.getLogger(DirectDatabaseFixer.class);
    
    private final JdbcTemplate jdbcTemplate;
    
    @Autowired
    public DirectDatabaseFixer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    
    /**
     * Execute after application startup
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void fixDatabase() {
        log.info("Starting direct database structure fix...");
        
        try {
            // First, diagnose the table structure
            diagnoseTable();
            
            // Recreate the table completely (most reliable approach)
            recreateTable();
            
            log.info("Direct database fix completed successfully!");
        } catch (Exception e) {
            log.error("Error during direct database fix: {}", e.getMessage());
            log.debug("Error details:", e);
        }
    }
    
    /**
     * Print diagnostic information about the table structure
     */
    private void diagnoseTable() {
        try {
            log.info("Running database diagnosis...");
            
            // Check if table exists
            Boolean tableExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) > 0 FROM information_schema.tables " +
                "WHERE table_schema = DATABASE() AND table_name = 'permission_group_permissions'", 
                Boolean.class);
                
            if (tableExists != null && tableExists) {
                log.info("Table permission_group_permissions exists");
                
                // Get table columns
                List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                    "SELECT column_name, column_type, is_nullable " +
                    "FROM information_schema.columns " +
                    "WHERE table_schema = DATABASE() " +
                    "AND table_name = 'permission_group_permissions'"
                );
                
                log.info("Table columns:");
                for (Map<String, Object> column : columns) {
                    log.info("  Column: {}, Type: {}, Nullable: {}", 
                            column.get("column_name"), 
                            column.get("column_type"),
                            column.get("is_nullable"));
                }
                
                // Count rows
                Integer rowCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM permission_group_permissions", 
                    Integer.class);
                    
                log.info("Table contains {} rows", rowCount != null ? rowCount : 0);
            } else {
                log.info("Table permission_group_permissions does not exist");
            }
        } catch (Exception e) {
            log.warn("Error during diagnosis: {}", e.getMessage());
            // Continue with fix even if diagnosis fails
        }
    }
    
    /**
     * Recreate the table with the correct structure
     */
    private void recreateTable() {
        try {
            log.info("Creating backup table and preserving data...");
            
            // Create a backup table first (if the main table exists)
            jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS permission_group_permissions_backup LIKE permission_group_permissions"
            );
            
            // Insert data into backup (if any)
            try {
                jdbcTemplate.update(
                    "INSERT IGNORE INTO permission_group_permissions_backup SELECT * FROM permission_group_permissions"
                );
                log.info("Backup data created successfully");
            } catch (DataAccessException e) {
                log.warn("Could not backup data: {}", e.getMessage());
                // Continue with table recreation
            }
            
            log.info("Dropping and recreating permission_group_permissions table...");
            
            // Drop and recreate the table with correct structure
            jdbcTemplate.execute("DROP TABLE IF EXISTS permission_group_permissions");
            
            // Create with correct structure
            jdbcTemplate.execute(
                "CREATE TABLE permission_group_permissions (" +
                "  permission_group_id BINARY(16) NOT NULL," +
                "  permission_id BINARY(16) NOT NULL," +
                "  PRIMARY KEY (permission_group_id, permission_id)," +
                "  CONSTRAINT fk_pgp_permission_group_id FOREIGN KEY (permission_group_id) " +
                "    REFERENCES permission_groups(id) ON DELETE CASCADE," +
                "  CONSTRAINT fk_pgp_permission_id FOREIGN KEY (permission_id) " +
                "    REFERENCES permissions(id) ON DELETE CASCADE" +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci"
            );
            
            log.info("Table recreated successfully with correct structure");
            
            // Try to restore data from backup
            try {
                jdbcTemplate.update(
                    "INSERT IGNORE INTO permission_group_permissions " +
                    "SELECT * FROM permission_group_permissions_backup"
                );
                log.info("Data restored from backup");
            } catch (DataAccessException e) {
                log.warn("Could not restore data from backup: {}", e.getMessage());
                // Continue anyway
            }
            
            // Drop backup table
            try {
                jdbcTemplate.execute("DROP TABLE IF EXISTS permission_group_permissions_backup");
            } catch (DataAccessException e) {
                log.warn("Could not drop backup table: {}", e.getMessage());
                // Not critical, continue
            }
        } catch (Exception e) {
            log.error("Error recreating table: {}", e.getMessage());
            throw e;
        }
    }
} 