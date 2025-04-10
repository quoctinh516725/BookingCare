package com.dailycodework.beautifulcare.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.jdbc.datasource.init.ScriptException;
import org.springframework.jdbc.support.rowset.SqlRowSet;

import javax.sql.DataSource;
import jakarta.annotation.PostConstruct;
import java.io.IOException;

/**
 * Configuration class to fix database schema issues at startup
 * This class is disabled in favor of DirectDatabaseFixer.
 */
// @Configuration - Disabled in favor of DirectDatabaseFixer
public class DatabaseFixConfig {
    private static final Logger log = LoggerFactory.getLogger(DatabaseFixConfig.class);
    
    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;
    
    @Autowired
    public DatabaseFixConfig(DataSource dataSource, JdbcTemplate jdbcTemplate) {
        this.dataSource = dataSource;
        this.jdbcTemplate = jdbcTemplate;
    }
    
    /**
     * Executes SQL diagnostics and fix script after bean construction but before Hibernate initializes
     */
    @PostConstruct
    public void fixDatabaseSchema() {
        log.info("Starting database schema diagnosis and fix...");
        
        // Run the diagnostic script first
        try {
            log.info("Running database schema diagnosis...");
            runDiagnostics();
            log.info("Diagnosis complete, proceeding with schema fix");
        } catch (Exception e) {
            log.error("Error running database diagnostics: {}", e.getMessage());
            log.debug("Diagnostic error details:", e);
            // Continue with fix even if diagnostics fail
        }
        
        // Run the fix script
        try {
            log.info("Attempting to fix database schema...");
            ResourceDatabasePopulator resourceDatabasePopulator = new ResourceDatabasePopulator();
            resourceDatabasePopulator.addScript(new ClassPathResource("schema-fix.sql"));
            resourceDatabasePopulator.execute(dataSource);
            log.info("Database schema fix script executed successfully");
            
            // Run diagnostics again to verify changes
            log.info("Running post-fix diagnosis to verify changes...");
            runDiagnostics();
        } catch (ScriptException e) {
            log.error("Error executing database fix script: {}", e.getMessage());
            log.debug("Script execution error details:", e);
        } catch (Exception e) {
            log.error("Unexpected error during database schema fix: {}", e.getMessage());
            log.debug("Error details:", e);
        }
    }
    
    /**
     * Runs the diagnostic script and logs the results
     */
    private void runDiagnostics() {
        try {
            ResourceDatabasePopulator diagnosticPopulator = new ResourceDatabasePopulator();
            diagnosticPopulator.addScript(new ClassPathResource("schema-diag.sql"));
            diagnosticPopulator.execute(dataSource);
            
            // Execute a simple query to check table columns directly
            String query = "SELECT column_name, is_nullable FROM information_schema.columns " +
                         "WHERE table_schema = database() AND table_name = 'permission_group_permissions'";
            
            SqlRowSet rs = jdbcTemplate.queryForRowSet(query);
            log.info("Permission group permissions table structure:");
            while (rs.next()) {
                log.info("  Column: {}, Nullable: {}", rs.getString("column_name"), rs.getString("is_nullable"));
            }
        } catch (Exception e) {
            log.error("Error running diagnostics: {}", e.getMessage());
            throw e;
        }
    }
} 