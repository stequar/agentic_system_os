// Auto-synthesized JIT MCP Tool: tool_dyn_domain_invariant_and_drift_checker
const INPUT_SCHEMA = {"$schema":"http://json-schema.org/draft-07/schema#","type":"object","properties":{"boundedContext":{"type":"string"},"targetFile":{"type":"string"}},"required":["boundedContext"],"additionalProperties":false};

function validateInputAgainstSchema(input) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Invalid input payload: expected a non-null JSON object");
  }
  const props = INPUT_SCHEMA.properties || {};
  const required = Array.isArray(INPUT_SCHEMA.required) ? INPUT_SCHEMA.required : [];

  for (const reqKey of required) {
    if (!(reqKey in input) || input[reqKey] === undefined || input[reqKey] === null) {
      throw new Error(`Missing required input field: '${reqKey}'`);
    }
  }

  for (const [key, propSchema] of Object.entries(props)) {
    if (key in input && input[key] !== undefined && input[key] !== null) {
      const val = input[key];
      const expectedType = propSchema.type;
      if (expectedType === "array") {
        if (!Array.isArray(val)) {
          throw new Error(`Invalid type for field '${key}': expected array`);
        }
      } else if (expectedType === "object") {
        if (typeof val !== "object" || Array.isArray(val)) {
          throw new Error(`Invalid type for field '${key}': expected object`);
        }
      } else if (expectedType && typeof val !== expectedType) {
        throw new Error(`Invalid type for field '${key}': expected ${expectedType}, got ${typeof val}`);
      }
    }
  }
}

export async function handleDynamicTool(input = {}, context = {}) {
  validateInputAgainstSchema(input);
  return {
    ok: true,
    toolId: "tool_dyn_domain_invariant_and_drift_checker",
    toolName: "domain_invariant_and_drift_checker",
    processedInput: input,
    synthesizedFor: "domain_invariant_and_drift_checker",
  };
}

export async function execute(input = {}, context = {}) {
  return handleDynamicTool(input, context);
}

export default handleDynamicTool;
