package com.dailycodework.beautifulcare.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.UUID;

/**
 * Post-startup schema fixer to ensure any remaining schema issues are resolved
 * after the application has fully started.
 * This class is disabled in favor of DirectDatabaseFixer.
 */
// @Component - Disabled in favor of DirectDatabaseFixer
public class PostStartupSchemaFixer {
    private static final Logger log = LoggerFactory.getLogger(PostStartupSchemaFixer.class);
    
    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;
    
    @Autowired
    public PostStartupSchemaFixer(JdbcTemplate jdbcTemplate, DataSource dataSource) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
    }
    
    /**
     * Executes after the application is fully started
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void fixSchemaAfterStartup() {
        log.info("Applying post-startup schema fixes...");
        
        try {
            // Check if the permission_group_permissions table has both columns
            boolean hasBothColumns = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) = 2 FROM information_schema.columns " +
                "WHERE table_schema = database() " +
                "AND table_name = 'permission_group_permissions' " +
                "AND column_name IN ('group_id', 'permission_group_id')",
                Boolean.class);
            
            if (hasBothColumns) {
                log.info("Found both group_id and permission_group_id columns. Applying fix...");
                
                // Make permission_group_id nullable temporarily
                jdbcTemplate.execute("ALTER TABLE permission_group_permissions MODIFY permission_group_id BINARY(16) NULL");
                
                // Copy data from group_id to permission_group_id where null
                int updated = jdbcTemplate.update(
                    "UPDATE permission_group_permissions SET permission_group_id = group_id WHERE permission_group_id IS NULL");
                log.info("Updated {} rows with missing permission_group_id values", updated);
                
                // Make permission_group_id NOT NULL again
                jdbcTemplate.execute("ALTER TABLE permission_group_permissions MODIFY permission_group_id BINARY(16) NOT NULL");
                
                log.info("Post-startup schema fix applied successfully");
            } else {
                log.info("Did not find both columns - no additional fixes needed");
                
                // Ensure the permission_group_id column exists and is properly configured
                boolean hasPermissionGroupId = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) > 0 FROM information_schema.columns " +
                    "WHERE table_schema = database() " +
                    "AND table_name = 'permission_group_permissions' " +
                    "AND column_name = 'permission_group_id'",
                    Boolean.class);
                    
                if (hasPermissionGroupId) {
                    log.info("Ensuring permission_group_id column is properly configured");
                    jdbcTemplate.execute("ALTER TABLE permission_group_permissions MODIFY permission_group_id BINARY(16) NOT NULL");
                }
                
                // If only group_id exists but not permission_group_id, rename the column
                boolean hasOnlyGroupId = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) = 1 FROM information_schema.columns " +
                    "WHERE table_schema = database() " +
                    "AND table_name = 'permission_group_permissions' " +
                    "AND column_name = 'group_id' " +
                    "AND NOT EXISTS (" +
                    "    SELECT 1 FROM information_schema.columns " +
                    "    WHERE table_schema = database() " +
                    "    AND table_name = 'permission_group_permissions' " +
                    "    AND column_name = 'permission_group_id'" +
                    ")",
                    Boolean.class);
                    
                if (hasOnlyGroupId) {
                    log.info("Found only group_id column, renaming to permission_group_id");
                    jdbcTemplate.execute("ALTER TABLE permission_group_permissions CHANGE group_id permission_group_id BINARY(16) NOT NULL");
                }
            }
            
            // Verify the fix worked by checking if we can still hit the error
            verifyFixWorked();
            
        } catch (Exception e) {
            log.error("Error applying post-startup schema fixes: {}", e.getMessage());
            log.debug("Error details:", e);
            
            // If all else fails, use the nuclear option - recreate the table completely
            try {
                log.warn("Attempting last resort fix: recreating the join table from scratch");
                ResourceDatabasePopulator resourceDatabasePopulator = new ResourceDatabasePopulator();
                resourceDatabasePopulator.addScript(new ClassPathResource("schema-recreate.sql"));
                resourceDatabasePopulator.execute(dataSource);
                log.info("Table recreation completed successfully");
            } catch (Exception recreateEx) {
                log.error("Failed to recreate table: {}", recreateEx.getMessage());
                log.debug("Recreation error details:", recreateEx);
            }
        }
    }
    
    /**
     * Verify the fix worked by trying to insert a test record
     */
    private void verifyFixWorked() {
        try {
            // Get an existing permission group and permission
            UUID permissionGroupId = jdbcTemplate.queryForObject(
                "SELECT id FROM permission_groups LIMIT 1", UUID.class);
            UUID permissionId = jdbcTemplate.queryForObject(
                "SELECT id FROM permissions LIMIT 1", UUID.class);
                
            if (permissionGroupId != null && permissionId != null) {
                // Try to insert and then immediately delete a test record
                log.info("Testing fix with temporary record insertion...");
                jdbcTemplate.update(
                    "INSERT IGNORE INTO permission_group_permissions (permission_group_id, permission_id) VALUES (?, ?)",
                    permissionGroupId, permissionId);
                
                // Delete the test entry
                jdbcTemplate.update(
                    "DELETE FROM permission_group_permissions WHERE permission_group_id = ? AND permission_id = ?",
                    permissionGroupId, permissionId);
                    
                log.info("Test insertion successful, fix appears to be working");
            }
        } catch (Exception e) {
            log.error("Verification failed, fix may not be complete: {}", e.getMessage());
            throw e; // Rethrow to trigger the last resort fix
        }
    }
} 