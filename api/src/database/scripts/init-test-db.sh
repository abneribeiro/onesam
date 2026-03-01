#!/bin/bash
# Database initialization script for OneSAM test environment

set -e

echo "Setting up OneSAM test database..."

# Create additional test schemas if needed
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "citext";

    -- Create test-specific schemas
    CREATE SCHEMA IF NOT EXISTS test_data;
    CREATE SCHEMA IF NOT EXISTS audit_test;

    -- Grant permissions
    GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON SCHEMA public TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON SCHEMA test_data TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON SCHEMA audit_test TO $POSTGRES_USER;

    -- Create test user with limited permissions for security testing
    CREATE USER test_limited WITH PASSWORD 'limited123';
    GRANT CONNECT ON DATABASE $POSTGRES_DB TO test_limited;
    GRANT USAGE ON SCHEMA public TO test_limited;

    -- Test data cleanup function
    CREATE OR REPLACE FUNCTION clean_test_data()
    RETURNS void AS \$\$
    BEGIN
        -- This function will be called to clean up test data
        DELETE FROM test_data.temp_data WHERE created_at < NOW() - INTERVAL '1 hour';
    END;
    \$\$ LANGUAGE plpgsql;

EOSQL

echo "Test database setup completed successfully!"