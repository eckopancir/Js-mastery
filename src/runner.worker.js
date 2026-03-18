self.onmessage = async function (e) {
    const { code, tests, testTemplate } = e.data;
    const results = [];
    let allPassed = true;

    try {
        // 1. Prepare the function from user code
        // We target the function name extracted from the template
        const funcNameMatch = testTemplate.match(/return (\w+)\(/);
        const funcName = funcNameMatch ? funcNameMatch[1] : null;

        if (!funcName) {
            throw new Error("Could not find function name in template.");
        }

        // Wrap the user code and execution logic
        // We use a constructor that allows async execution
        const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;

        // The wrapper executes the user code then returns the target function
        const wrapper = new AsyncFunction(`
      ${code}
      if (typeof ${funcName} === 'undefined') {
        throw new Error("Function '${funcName}' is not defined.");
      }
      return ${funcName};
    `);

        const userFunc = await wrapper();

        // 2. Run Tests
        for (const test of tests) {
            try {
                // Deep clone to avoid side effects
                const params = JSON.parse(JSON.stringify(test.params));

                // Execute (handles both sync and async functions)
                const actual = await userFunc(...params);

                // Validation with serialization for safety
                const actualStr = JSON.stringify(actual, (key, value) =>
                    typeof value === 'bigint' ? value.toString() : value
                );
                const expectedStr = JSON.stringify(test.expected);
                const passed = actualStr === expectedStr;

                results.push({
                    params: test.params,
                    expected: test.expected,
                    actual: actual, // Raw actual for UI (if serializable)
                    passed
                });

                if (!passed) allPassed = false;
            } catch (err) {
                allPassed = false;
                results.push({
                    params: test.params,
                    expected: test.expected,
                    error: err.message || "Execution Error",
                    passed: false
                });
            }
        }

        self.postMessage({ type: 'RESULTS', allPassed, testResults: results });
    } catch (err) {
        self.postMessage({ type: 'ERROR', message: err.message });
    }
};
