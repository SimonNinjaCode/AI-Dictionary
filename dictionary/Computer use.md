---
description: An agent capability that operates graphical interfaces from screen images using mouse and keyboard actions.
aliases:
  - GUI agent
category: agents-and-tools
tracks:
  - coding
  - agent-systems
term_status: established
level: intermediate
---

An agent capability that operates graphical interfaces from screen images using mouse, keyboard, scrolling, and similar actions. Instead of calling an application-specific API, the [model](./Model.md) sees pixels or a derived screen representation and requests interactions through a [tool](./Tool.md).

Computer use gives an agent access to software that has no suitable API. It can inspect a local preview, use an admin portal, operate a design tool, or reproduce a browser bug. That breadth has a cost. Clicking by visual position is slower and less reliable than calling a typed function. Layout changes, loading states, pop-ups, focus, animation, and screen resolution can all change what an action does.

The [agent loop](./Agent%20loop.md) normally alternates between screenshots and actions. The agent inspects the current screen, chooses one small interaction, receives a new screen, and checks whether the expected state appeared. Long action sequences without observation are brittle because one missed click shifts every later step.

Use a purpose-built API, CLI, or semantic browser tool when one exists. These expose explicit operations and structured results, which are easier to validate. Computer use is the fallback for interfaces that only humans were expected to operate or for tasks where the visual rendering itself is the subject of the test.

Permissions still matter. A visible button can send a message, delete data, approve a payment, or deploy code. The fact that a human could click it does not make the action safe to automate.

_Avoid:_ treating computer use as equivalent to browser automation. It is a broader, perception-driven capability and usually has weaker guarantees.

_Usage:_

"The agent can call the deployment API. Should it use the cloud console instead?"

"Use the API for deployment. Reserve computer use for checking the rendered console state that the API does not expose."
