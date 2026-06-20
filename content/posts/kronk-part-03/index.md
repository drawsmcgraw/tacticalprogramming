---
title: "Kronk Part 04"
date: 2026-06-20T09:10:27-04:00
categories: []
draft: true
---

## Problem

We have an agentic workflow that can perform useful tasks like weather lookup & research but it's constrained to a web UI. Useful systems have multiple entry points. We want to introduce voice control to our system.

NOTE: This is Part 3 in my Kronk AI server series. For part 2, see [here]({{< relref "posts/kronk-part-02/index.md" >}}).


## Solution

Add a voice input device as a client to the system.

### Background

When we built Kronk, we deliberately built the chat UI to be just another client. That used to be a `/messages` entrypoint and, under simple conditions, we could just use that entrypoint. However, for reasons we'll get into, we needed to provide an Ollama-compatible shim to support an entrypoint into the pipeline. That meant putting a thin later in front of the pipeline, so the entrypoint for _all_ clients is now [`_run_pipeline](https://github.com/drawsmcgraw/kronk/blob/d2569a8919c5763cdce5614d6c39235d65a5f1ac/orchestrator/main.py#L224). Let's get into why we made these choices.

### Hardware

It turns out that building a hardware device, writing the firmware, and training it to recognize wake words is a lot of work. Fortunately, the Home Assistant community has been hard at work on this and you can easily purchase a [Home Assistant Voice Preveiw Edition](https://www.home-assistant.io/voice-pe/). This does, mean, howeever, that we need to bring Voice Assistant into the tech stack. Not hard. This is why we put Kronk on our Framework desktop with lots of memory, so we could easily run these supporting services. 

### Software

[One docker-compose file](https://github.com/drawsmcgraw/kronk/blob/d2569a8919c5763cdce5614d6c39235d65a5f1ac/docker-compose.ha.yml), configure `restart: unless-stopped`, and Home Assistant (HA) starts on boot and is always ready. Now, for the voice part.

The voice support for HA is meant for HA - it's meant for tasks like `Okay Nabu, turn off the kitchen lights` or `Okay Nabu, I'm home`. Things like `Okay Nabu, what was my average heart rate last month` take a little more work. Instead of recreating perfectly good docs, I'll refer you to [Home Assistant's page in the docs on how to run a fully local, self-hosted LLM powered, voice assistant](https://www.home-assistant.io/voice_control/voice_remote_local_assistant/). However, there's a snag with the voice-to-text part.

### Voice to Text

The HA docs tell you to browse the app marketplace and install the Whisper addon for voice-to-text. But that's only available in HAOS, and you don't get that when you're running HA in a container. So we're going to have to run it ourselves. Thanks to a very clever Cla
