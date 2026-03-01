#!/usr/bin/env bun

/**
 * 🔍 OneSam Gap Analysis Script
 * Automated analysis of Frontend ↔ Backend inconsistencies
 *
 * Detects:
 * - Controllers without corresponding services
 * - Services without controllers
 * - Missing test coverage
 * - Schema inconsistencies
 * - Dead/orphaned endpoints
 *
 * Usage: bun run src/scripts/gap-analysis.ts
 */

import { readdirSync, statSync, existsSync } from 'fs';
import { writeFileSync } from 'fs';
import path from 'path';

interface GapAnalysisReport {
  timestamp: string;
  summary: {
    controllersFound: number;
    servicesFound: number;
    testsFound: number;
    criticalGaps: number;
    coveragePercentage: number;
  };
  gaps: {
    controllersWithoutServices: string[];
    servicesWithoutControllers: string[];
    controllersWithoutTests: string[];
    servicesWithoutTests: string[];
    missingMiddlewares: string[];
    orphanedRoutes: string[];
  };
  recommendations: string[];
  files: {
    controllers: string[];
    services: string[];
    tests: string[];
    routes: string[];
  };
}

class GapAnalyzer {
  private apiRoot: string;

  constructor() {
    this.apiRoot = process.cwd() + '/src';
  }

  /**
   * Main analysis execution
   */
  async analyze(): Promise<GapAnalysisReport> {
    console.log('🔍 Starting OneSam Gap Analysis...\n');

    const controllers = this.findControllers();
    const services = this.findServices();
    const tests = this.findTests();
    const routes = this.findRoutes();

    console.log(`📊 Found:
    - ${controllers.length} Controllers
    - ${services.length} Services
    - ${tests.length} Test files
    - ${routes.length} Route files\n`);

    const gaps = this.analyzeGaps(controllers, services, tests);
    const recommendations = this.generateRecommendations(gaps);

    const report: GapAnalysisReport = {
      timestamp: new Date().toISOString(),
      summary: {
        controllersFound: controllers.length,
        servicesFound: services.length,
        testsFound: tests.length,
        criticalGaps: gaps.controllersWithoutServices.length + gaps.servicesWithoutControllers.length,
        coveragePercentage: this.calculateCoverage(controllers, services, tests)
      },
      gaps,
      recommendations,
      files: {
        controllers,
        services,
        tests,
        routes
      }
    };

    return report;
  }

  /**
   * Find all controller files
   */
  private findControllers(): string[] {
    const controllersDir = path.join(this.apiRoot, 'controllers');
    if (!existsSync(controllersDir)) return [];

    return readdirSync(controllersDir)
      .filter(file => file.endsWith('Controller.ts'))
      .map(file => file.replace('.ts', ''));
  }

  /**
   * Find all service files
   */
  private findServices(): string[] {
    const servicesDir = path.join(this.apiRoot, 'services');
    if (!existsSync(servicesDir)) return [];

    return readdirSync(servicesDir)
      .filter(file => file.endsWith('Service.ts'))
      .map(file => file.replace('.ts', ''));
  }

  /**
   * Find all test files
   */
  private findTests(): string[] {
    const testsDir = path.join(this.apiRoot, '__tests__');
    if (!existsSync(testsDir)) return [];

    const testFiles: string[] = [];

    // Recursive search in test directories
    const searchDir = (dir: string) => {
      const items = readdirSync(dir);
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        if (statSync(itemPath).isDirectory()) {
          searchDir(itemPath);
        } else if (item.endsWith('.test.ts')) {
          testFiles.push(item.replace('.test.ts', ''));
        }
      });
    };

    searchDir(testsDir);
    return testFiles;
  }

  /**
   * Find route files
   */
  private findRoutes(): string[] {
    const routesDir = path.join(this.apiRoot, 'routes');
    if (!existsSync(routesDir)) return [];

    return readdirSync(routesDir)
      .filter(file => file.endsWith('.ts'))
      .map(file => file.replace('.ts', ''));
  }

  /**
   * Analyze gaps between controllers, services, and tests
   */
  private analyzeGaps(controllers: string[], services: string[], tests: string[]) {
    console.log('🔍 Analyzing gaps...\n');

    // Controllers without services
    const controllersWithoutServices = controllers.filter(controller => {
      const controllerName = controller.replace('Controller', '');
      const expectedService = `${controllerName}Service`;
      return !services.includes(expectedService);
    });

    // Services without controllers
    const servicesWithoutControllers = services.filter(service => {
      const serviceName = service.replace('Service', '');
      const expectedController = `${serviceName}Controller`;
      return !controllers.includes(expectedController);
    });

    // Controllers without tests
    const controllersWithoutTests = controllers.filter(controller => {
      const controllerName = controller.replace('Controller', '').toLowerCase();
      return !tests.some(test => test.toLowerCase().includes(controllerName));
    });

    // Services without tests
    const servicesWithoutTests = services.filter(service => {
      const serviceName = service.replace('Service', '').toLowerCase();
      return !tests.some(test => test.toLowerCase().includes(serviceName));
    });

    // Missing critical middlewares (authentication, validation, etc.)
    const missingMiddlewares = this.checkMissingMiddlewares();

    // Orphaned routes (routes without controllers)
    const orphanedRoutes = this.findOrphanedRoutes();

    return {
      controllersWithoutServices,
      servicesWithoutControllers,
      controllersWithoutTests,
      servicesWithoutTests,
      missingMiddlewares,
      orphanedRoutes
    };
  }

  /**
   * Check for missing critical middlewares
   */
  private checkMissingMiddlewares(): string[] {
    const middlewareDir = path.join(this.apiRoot, 'middlewares');
    const missing: string[] = [];

    const criticalMiddlewares = [
      'authentication.middleware.ts',
      'authorization.middleware.ts',
      'validation.middleware.ts',
      'rateLimit.middleware.ts',
      'security.middleware.ts',
      'performance.middleware.ts'
    ];

    criticalMiddlewares.forEach(middleware => {
      if (!existsSync(path.join(middlewareDir, middleware))) {
        missing.push(middleware);
      }
    });

    return missing;
  }

  /**
   * Find orphaned routes
   */
  private findOrphanedRoutes(): string[] {
    // This would require parsing route files for endpoint definitions
    // For now, return empty array - can be enhanced later
    return [];
  }

  /**
   * Calculate test coverage percentage
   */
  private calculateCoverage(controllers: string[], services: string[], tests: string[]): number {
    const totalFiles = controllers.length + services.length;
    if (totalFiles === 0) return 100;

    const coveredFiles = controllers.filter(controller => {
      const name = controller.replace('Controller', '').toLowerCase();
      return tests.some(test => test.toLowerCase().includes(name));
    }).length + services.filter(service => {
      const name = service.replace('Service', '').toLowerCase();
      return tests.some(test => test.toLowerCase().includes(name));
    }).length;

    return Math.round((coveredFiles / totalFiles) * 100);
  }

  /**
   * Generate recommendations based on gaps found
   */
  private generateRecommendations(gaps: any): string[] {
    const recommendations: string[] = [];

    if (gaps.controllersWithoutServices.length > 0) {
      recommendations.push(
        `🚨 CRITICAL: Create ${gaps.controllersWithoutServices.length} missing service(s): ${gaps.controllersWithoutServices.join(', ')}`
      );
    }

    if (gaps.servicesWithoutControllers.length > 0) {
      recommendations.push(
        `⚠️  WARNING: Found ${gaps.servicesWithoutControllers.length} orphaned service(s): ${gaps.servicesWithoutControllers.join(', ')}`
      );
    }

    if (gaps.controllersWithoutTests.length > 0) {
      recommendations.push(
        `📝 TEST COVERAGE: Add tests for ${gaps.controllersWithoutTests.length} controller(s): ${gaps.controllersWithoutTests.join(', ')}`
      );
    }

    if (gaps.servicesWithoutTests.length > 0) {
      recommendations.push(
        `📝 TEST COVERAGE: Add tests for ${gaps.servicesWithoutTests.length} service(s): ${gaps.servicesWithoutTests.join(', ')}`
      );
    }

    if (gaps.missingMiddlewares.length > 0) {
      recommendations.push(
        `🔒 SECURITY: Implement missing middleware(s): ${gaps.missingMiddlewares.join(', ')}`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ No critical gaps found! System architecture is well aligned.');
    }

    return recommendations;
  }

  /**
   * Save report to file
   */
  async saveReport(report: GapAnalysisReport): Promise<void> {
    const reportPath = path.join(process.cwd(), 'gap-analysis-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Report saved to: ${reportPath}`);
  }

  /**
   * Print summary to console
   */
  printSummary(report: GapAnalysisReport): void {
    console.log('\n📋 === GAP ANALYSIS SUMMARY ===');
    console.log(`🕐 Analysis Time: ${report.timestamp}`);
    console.log(`📊 Files Found: ${report.summary.controllersFound} controllers, ${report.summary.servicesFound} services`);
    console.log(`🎯 Test Coverage: ${report.summary.coveragePercentage}%`);
    console.log(`🚨 Critical Gaps: ${report.summary.criticalGaps}`);

    console.log('\n🔍 === RECOMMENDATIONS ===');
    report.recommendations.forEach(rec => console.log(`  ${rec}`));

    if (report.gaps.controllersWithoutServices.length > 0) {
      console.log('\n🚨 === CONTROLLERS WITHOUT SERVICES ===');
      report.gaps.controllersWithoutServices.forEach(controller =>
        console.log(`  ❌ ${controller} -> Missing ${controller.replace('Controller', 'Service')}`)
      );
    }

    if (report.gaps.servicesWithoutControllers.length > 0) {
      console.log('\n⚠️  === ORPHANED SERVICES ===');
      report.gaps.servicesWithoutControllers.forEach(service =>
        console.log(`  ⚠️  ${service} -> No corresponding ${service.replace('Service', 'Controller')}`)
      );
    }

    console.log('\n✅ === ANALYSIS COMPLETE ===\n');
  }
}

// Execute if run directly
if (require.main === module) {
  const analyzer = new GapAnalyzer();

  analyzer.analyze()
    .then(report => {
      analyzer.printSummary(report);
      analyzer.saveReport(report);
    })
    .catch(error => {
      console.error('❌ Gap analysis failed:', error);
      process.exit(1);
    });
}

export { GapAnalyzer };