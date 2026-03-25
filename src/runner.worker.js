self.onmessage = async function (e) {
    const { code, tests, mode, testTemplate } = e.data;
    const results = [];
    const logs = [];
    let allPassed = true;

    // Tactical Intercept: console.log
    const originalLog = console.log;
    console.log = (...args) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    };

    try {
        if (mode === 'QUICK_RUN') {
            const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
            const evalFunc = new AsyncFunction(`${code}`);
            await evalFunc();
            self.postMessage({ type: 'QUICK_RESULTS', logs, message: "Execution Finished Successfully" });
            return;
        }

        // 1. Prepare Function for Formal Testing
        const funcNameMatch = testTemplate.match(/return (\w+)\(/);
        const funcName = funcNameMatch ? funcNameMatch[1] : null;

        if (!funcName) throw new Error("Could not find function name in template.");

        const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
        const wrapper = new AsyncFunction(`
            ${code}
            if (typeof ${funcName} === 'undefined') {
                throw new Error("Function '${funcName}' is not defined.");
            }
            return ${funcName};
        `);

        const startTime = performance.now();
        const userFunc = await wrapper();

        // 2. Run Tests
        for (const test of tests) {
            try {
                const params = JSON.parse(JSON.stringify(test.params));
                const resStartTime = performance.now();
                const actual = await userFunc(...params);
                const resEndTime = performance.now();

                const actualStr = JSON.stringify(actual, (key, value) =>
                    typeof value === 'bigint' ? value.toString() : value
                );
                const expectedStr = JSON.stringify(test.expected);
                const passed = actualStr === expectedStr;

                results.push({
                    params: test.params,
                    expected: test.expected,
                    actual: actual,
                    passed,
                    duration: (resEndTime - resStartTime).toFixed(3),
                    logs: [...logs]
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
        const totalDuration = (performance.now() - startTime).toFixed(2);
        const runtime = parseFloat(totalDuration) <= 0.01 ? (Math.random() * 0.04 + 0.01).toFixed(2) : totalDuration;
        const estimatedMemory = (JSON.stringify(code).length / 1024 + 4.1).toFixed(1);

        self.postMessage({
            type: 'RESULTS',
            allPassed,
            testResults: results,
            logs,
            runtime: runtime,
            memory: estimatedMemory
        });
    } catch (err) {
        self.postMessage({ type: 'ERROR', message: err.message });
    } finally {
        console.log = originalLog;
    }
};
