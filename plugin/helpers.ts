'use strict';

/**
 * Execute a query and handle the result with a callback
 * @param {any} context - The TablePlus plugin context
 * @param {string} sql - The SQL query to execute
 * @param {Function} callback - The callback function to handle the result
 */
export function executeQuery(context: any, sql: string, callback: (result: any[] | Error) => void): void {
    try {
        console.log(`Executing SQL: ${sql}`);
        
        context.execute(sql, (result: any) => {
            try {
                console.log("Raw result:", result);
                
                if (!result) {
                    console.log("Result is null or undefined");
                    callback(new Error("Query returned no result"));
                    return;
                }
                
                if (result.message && result.message.length > 0) {
                    // Special case for "EXPLAIN" error which might not be a real error
                    if (result.message === "EXPLAIN") {
                        console.log("Got 'EXPLAIN' message, checking if we have actual results");
                        
                        // Check if we have actual results despite the "EXPLAIN" message
                        if (result.columns && result.rows && result.rows.length > 0) {
                            console.log("We have results, ignoring the 'EXPLAIN' message");
                        } else {
                            console.log(`Query error: ${result.message}`);
                            callback(new Error(result.message));
                            return;
                        }
                    } else {
                        console.log(`Query error: ${result.message}`);
                        callback(new Error(result.message));
                        return;
                    }
                }
                
                if (!result.columns || !result.rows) {
                    console.log("Result missing columns or rows");
                    callback(new Error("Invalid query result format"));
                    return;
                }
                
                const columns = Object.getOwnPropertyNames(result.columns);
                console.log("Columns:", columns);
                
                try {
                    const rows = result.rows.map((row: any) => {
                        try {
                            return Object.fromEntries(columns.map((column: string) => {
                                try {
                                    const value = row.raw(column);
                                    return [column, value];
                                } catch (rawError) {
                                    console.log(`Error getting raw value for column ${column}:`, rawError);
                                    return [column, null];
                                }
                            }));
                        } catch (rowError) {
                            console.log("Error processing row:", rowError);
                            return {};
                        }
                    });
                    
                    console.log(`Processed ${rows.length} rows`);
                    callback(rows);
                } catch (error) {
                    const mapError = error as Error;
                    console.log("Error mapping rows:", mapError);
                    callback(new Error(`Error processing query results: ${mapError.message}`));
                }
            } catch (error) {
                const resultError = error as Error;
                console.log("Error processing result:", resultError);
                callback(new Error(`Error processing query results: ${resultError.message}`));
            }
        });
    } catch (error) {
        const executeError = error as Error;
        console.log("Error executing query:", executeError);
        callback(new Error(`Error executing query: ${executeError.message}`));
    }
}

// Add TablePlus Application type declaration
declare global {
    const Application: {
        pluginRootPath(): string;
    };
    
    // Add global onRun function
    interface Window {
        onRun: (context: any) => void;
    }
    
    var onRun: (context: any) => void;
}
