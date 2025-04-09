'use strict';

import { executeQuery } from './helpers';

interface ExplainResult {
    'QUERY PLAN'?: any;
    version?: string;
    [key: string]: any;
}

function handleResults(context: any, sql: string, resExplainJson: ExplainResult[] | Error | null, resVersion: ExplainResult[] | Error | null): void {
    // Check for null values
    if (resExplainJson === null || resVersion === null) {
        context.alert('Error', 'Missing query results');
        return;
    }

    // Check for error instances
    if (resExplainJson instanceof Error) {
        context.alert('Error', `Explain error: ${resExplainJson.message}`);
        return;
    }

    if (resVersion instanceof Error) {
        context.alert('Error', `Version error: ${resVersion.message}`);
        return;
    }

    const explainJson = resExplainJson as ExplainResult[];
    const versionResult = resVersion as ExplainResult[];

    // PostgreSQL EXPLAIN (FORMAT JSON) returns JSON data in the QUERY PLAN field
    // The format can vary depending on the PostgreSQL version
    let plan = null;
    try {
        const queryPlan = explainJson[0]?.['QUERY PLAN'];
        
        // If it's a string, try to parse it as JSON
        if (typeof queryPlan === 'string') {
            try {
                plan = JSON.parse(queryPlan);
            } catch (parseError) {
                context.alert('Warning', `Failed to parse JSON: ${(parseError as Error).message}`);
            }
        } 
        // If it's already an object, use it directly
        else if (typeof queryPlan === 'object') {
            plan = queryPlan;
        }
        
        // If we still don't have a plan, try using the entire result
        if (!plan && Array.isArray(explainJson) && explainJson.length > 0) {
            plan = explainJson;
        }
    } catch (error) {
        context.alert('Error', `Failed to parse explain plan: ${(error as Error).message}`);
        return;
    }

    const data = {
        query: sql,
        version: versionResult[0]?.version,
        plan: plan
    };
    
    // Try to load the UI HTML file directly
    try {
        const pluginPath = `${Application.pluginRootPath()}/com.pgvisualexplain.tableplusplugin`;
        
        // Load the UI HTML file
        const ui = context.loadFile(`${pluginPath}/dist/ui.html`, null);
        
        // Check if UI was loaded
        if (!ui) {
            context.alert('Error', 'Failed to load UI HTML file');
            return;
        }
        
        // Evaluate the displayPlan function
        ui.evaluate(`
            displayPlan(${JSON.stringify(data, (_, value) => typeof value === 'undefined' ? null : value)});
        `);
    } catch (evalError) {
        context.alert('Error', `Failed to display plan: ${(evalError as Error).message}`);
    }
}

global.onRun = function(context: any): void {
    if (!['PostgreSQL'].includes(context.driver())) {
        context.alert('Error', `Only PostgreSQL databases are supported (${context.driver()} used).`);
        return;
    }

    const queryEditor = context.currentQueryEditor();
    if (queryEditor === null) {
        context.alert('Error', 'You have to select a query in the SQL Query editor.');
        return;
    }

    const sql = queryEditor.currentSelectedString();

    let resExplainJson: ExplainResult[] | Error | null = null;
    let resVersion: ExplainResult[] | Error | null = null;
    
    executeQuery(context, 'SELECT version() as version', (res: ExplainResult[] | Error) => {
        if (res instanceof Error) {
            // If we can't get the version, use a default value
            resVersion = [{ version: "Unknown PostgreSQL version" }];
        } else {
            resVersion = res;
        }
    });
    
    // Execute the EXPLAIN query
    executeQuery(context, `EXPLAIN (FORMAT JSON) ${sql}`, (res: ExplainResult[] | Error) => {
        // Check if we got an error
        if (res instanceof Error) {
            // If the error is just "EXPLAIN", it might be a TablePlus API quirk
            if (res.message === "EXPLAIN") {
                // Try with a different format
                executeQuery(context, `EXPLAIN (FORMAT JSON, ANALYZE) ${sql}`, (analyzeRes: ExplainResult[] | Error) => {
                    if (analyzeRes instanceof Error) {
                        // Try one more approach with plain EXPLAIN
                        executeQuery(context, `EXPLAIN ${sql}`, (plainRes: ExplainResult[] | Error) => {
                            if (plainRes instanceof Error) {
                                // If all approaches fail, show a detailed error
                                context.alert('Error', `Failed to run EXPLAIN command. This might be due to:\n\n1. Your PostgreSQL version doesn't support EXPLAIN (FORMAT JSON)\n2. The query is invalid\n3. You don't have permission to run EXPLAIN\n\nPlease check the query logs to see if PostgreSQL is returning any errors.`);
                            } else {
                                // If plain EXPLAIN works, show a warning about FORMAT JSON
                                context.alert('Warning', 'Your PostgreSQL version may not support EXPLAIN (FORMAT JSON). The plugin requires this format to visualize the plan. Please check your PostgreSQL version (9.6+).');
                            }
                            return;
                        });
                    } else {
                        // ANALYZE approach worked
                        resExplainJson = analyzeRes;
                        handleResults(context, sql, resExplainJson, resVersion);
                    }
                });
            } else {
                // For other errors, show the error message
                context.alert('Error', `Failed to run EXPLAIN command: ${res.message}`);
            }
        } else {
            // No error, proceed with the results
            resExplainJson = res;
            handleResults(context, sql, resExplainJson, resVersion);
        }
    });
};
