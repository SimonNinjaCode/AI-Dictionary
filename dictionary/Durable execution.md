---
description: Execution that persists progress so a long-running workflow can resume after interruption without starting over.
category: runtime-and-protocols
tracks:
  - agent-systems
term_status: established
level: advanced
---

Execution that persists progress so a long-running [workflow](./Workflow.md) can resume after a crash, restart, timeout, or deliberate pause without starting over. The runtime records authoritative state at defined boundaries and uses it to continue safely.

Saving a conversation transcript is not enough. A durable system must know which steps completed, which external effects occurred, what is waiting for approval, and which operation may be retried. Otherwise recovery can repeat an email, payment, deployment, or file change that already happened.

Durable execution often works with a [state graph](./State%20graph.md). After a node completes, the runtime commits the new state and the next permitted transition. If the process stops, it reloads that checkpoint. Some runtimes replay deterministic code from an event history instead. Both approaches separate recoverable workflow state from the temporary [context](./Context.md) assembled for a model request.

Model calls and tools are not necessarily deterministic or idempotent. A resumed run may receive different output from the same prompt, and calling an external API twice may create two effects. Durable designs assign operation identifiers, record results, and make side-effecting tools safe to retry or able to detect prior completion.

The machinery is worthwhile for tasks that run long enough to cross process lifetimes, wait on people, or produce consequential external effects. A short coding turn that can be rerun cheaply does not need a workflow engine merely because it uses an agent.

_Avoid:_ calling any saved session durable execution. Persistence stores data; durability defines how execution resumes without corrupting state or duplicating effects.

_Usage:_

"The approval arrived after the worker restarted, so the agent began the deployment again."

"Persist the approval and deployment operation ID. Resume from the committed state, and make the deployment tool reject a duplicate operation."
