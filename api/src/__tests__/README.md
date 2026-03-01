# OneSAM Test Configuration

## Test Environment Setup

This directory contains comprehensive test suites for the OneSAM API using Bun's native test framework.

### Test Structure

```
__tests__/
├── setup.ts                 # Test utilities and database setup
├── security/
│   └── security.test.ts     # Security-focused tests (SQL injection, XSS, auth)
├── services/
│   └── services.test.ts     # Business logic and service layer tests
└── integration/
    └── api.test.ts          # API endpoint integration tests
```

### Test Categories

#### 1. Security Tests (`test:security`)
- **SQL Injection Prevention**: Tests malicious SQL payloads against search and filter functions
- **XSS Protection**: Validates input sanitization and HTML content filtering
- **Authentication Security**: Tests session management and user validation
- **Authorization (RBAC)**: Validates role-based access control enforcement
- **File Upload Security**: Tests MIME type validation and malicious file handling

#### 2. Service Tests (`test:services`)
- **Business Logic**: Core service functionality and validation rules
- **Data Integrity**: Entity relationships and constraint enforcement
- **Performance**: Query performance and bulk operation efficiency
- **Error Handling**: Exception handling and error propagation

#### 3. Integration Tests (`test:integration`)
- **API Endpoints**: Full request/response cycle testing
- **Authentication Flow**: Login, registration, and session management
- **CRUD Operations**: Complete entity lifecycle testing
- **Error Responses**: HTTP status codes and error formatting

### Available Test Commands

```bash
# Run all tests
bun test

# Run specific test categories
bun run test:security      # Security-focused tests
bun run test:services      # Service layer tests
bun run test:integration   # API integration tests

# Development testing
bun run test:watch         # Watch mode for development
bun run test:coverage      # Generate coverage reports

# CI/CD testing
bun run test:ci           # CI-friendly output with JUnit reports
```

### Test Database Configuration

Tests use an isolated test database to prevent data corruption:

```bash
# Set test database URL
export TEST_DATABASE_URL="postgresql://test:test@localhost:5432/onesam_test"

# Or use Docker for test database
docker run --name onesam-test-db \
  -e POSTGRES_DB=onesam_test \
  -e POSTGRES_USER=test \
  -e POSTGRES_PASSWORD=test \
  -p 5433:5432 -d postgres:15
```

### Test Utilities

The `TestUtils` class provides helper functions for:
- **Database Management**: Clean setup and teardown
- **Test Data Creation**: Generate test users, courses, enrollments
- **Security Payload Generation**: SQL injection and XSS test cases
- **Authentication Mocking**: Session and user context simulation

### Security Testing Features

#### SQL Injection Test Payloads
Tests include comprehensive SQL injection attempts:
- DROP TABLE statements
- UNION SELECT attacks
- Boolean-based blind injection
- Time-based blind injection

#### XSS Prevention Testing
Validates protection against:
- Script tag injection
- Event handler injection
- JavaScript protocol attacks
- SVG-based XSS

#### Authorization Testing
Ensures proper RBAC enforcement:
- Admin-only endpoint protection
- Role-based feature access
- Session validation
- Account status checking

### Performance Testing

Service tests include performance benchmarks:
- **Query Performance**: < 500ms for complex queries
- **Bulk Operations**: < 1000ms for batch processing
- **Search Operations**: < 800ms for full-text search

### Best Practices

1. **Test Isolation**: Each test runs with clean database state
2. **Security First**: All input validation and sanitization tested
3. **Realistic Data**: Tests use realistic test data and edge cases
4. **Error Testing**: Negative test cases for error handling
5. **Performance Monitoring**: Benchmark critical operations

### Coverage Goals

- **Security Tests**: 100% coverage of input validation and auth flows
- **Service Tests**: >90% coverage of business logic
- **Integration Tests**: >85% coverage of API endpoints
- **Overall Coverage**: >80% across the codebase

### Continuous Integration

The test suite is designed for CI/CD integration:
- **Fast Execution**: Parallel test execution with Bun
- **Isolated Environment**: Database isolation prevents test conflicts
- **Structured Reporting**: JUnit XML output for CI systems
- **Security Validation**: Automated security testing in pipeline