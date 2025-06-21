#!/usr/bin/env node
import { program } from 'commander';
import { BusinessKnowledgeExtractor } from './code-analyzer';
import * as path from 'path';

program
    .name('extract-knowledge')
    .description('Extract business knowledge from source code')
    .version('1.0.0')
    .option('-d, --dir <directory>', 'Source code directory', './src')
    .option('-o, --output <directory>', 'Output directory', './docs/business-knowledge-base')
    .option('--include <patterns>', 'Include file patterns (comma separated)', '**/*.{ts,tsx}')
    .option('--exclude <patterns>', 'Exclude file patterns (comma separated)', 'node_modules/**,**/*.test.{ts,tsx}')
    .action(async (options) => {
        try {
            console.log('Starting business knowledge extraction...');
            
            const sourceDir = path.resolve(process.cwd(), options.dir);
            const outputDir = path.resolve(process.cwd(), options.output);
            
            console.log(`Source directory: ${sourceDir}`);
            console.log(`Output directory: ${outputDir}`);
            
            const extractor = new BusinessKnowledgeExtractor(sourceDir);
            await extractor.analyzeProject();
            
            console.log('Business knowledge extraction completed successfully!');
            console.log(`Documentation generated in: ${outputDir}`);
        } catch (error) {
            console.error('Error during knowledge extraction:', error);
            process.exit(1);
        }
    });

program.parse(); 