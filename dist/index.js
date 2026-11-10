#!/usr/bin/env node
import { createCliApp } from "./cli/dispatcher.js";
import { createDefaultContext } from "./cli/context.js";
const app = createCliApp(createDefaultContext());
app.parse(process.argv);
//# sourceMappingURL=index.js.map