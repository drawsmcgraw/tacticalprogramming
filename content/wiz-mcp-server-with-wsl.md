Title: Running the Wiz MCP Server in WSL2
Date: 2025-06-04
Category: howto

# Problem

We want to take advantage of the [Wiz MCP Server](https://www.wiz.io/blog/introducing-mcp-server-for-wiz) on our Windows workstation running WSL2.


# Solution

The long-term solution to this is to just host the MCP server in a central location and put something like the [OpenWebUI OpenAI Proxy](https://docs.openwebui.com/openapi-servers/mcp/) in front of it. But this is a fast-moving area so we'll scope this article to our local workstation.

Here's our tech stack:

* [Cline](https://cline.bot/) VSCode plugin for our human interface (we will configure Cline to talk to our LLM and our MPC server)
* WSL for our runtime. How we configure Cline in this situation matters.
* [optional], if you're running your own local LLM, you'll want something like [Ollama](https://ollama.com/) to manage the models or you can use the same Ollama that comes with [OpenWebUI](https://docs.openwebui.com/) if you already have that running.

At a high level:

* Find access to an LLM (either hosted, like OpenAI, Gemini, etc or your own model via Ollama as mentioned above).
* Install Cline
* Configure your LLM
* Configure the MCP server section in Cline
* Profit

In detail.

## Install Cline VSCode Extension

[Easy enough](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev). Choose your favorite method.

## Configure the LLM for Cline to Use

[The docs](https://docs.cline.bot/mcp/configuring-mcp-servers) are going to be a more long-lasting resource here. For completeness, I'll post mine looks like for my local Ollama install. Please know, however, that I'm currently using Gemini as my LLM service since I'm still looking for a model I can host myself for this exercise.


<img src="{static}images/wiz-mcp-01-cline-mcp-server-ollama.png" style="max-width:100%; height:auto;" alt="Ollama Config">


Cline will even query Ollama for the available models for you! 

## Configure the MCP Server for Cline

This is the challenging part. Because Cline (currently) does not honor the default terminal in VSCode, it will always use the Windows command environment for running commands. The trick is to fake it out with a direct `wsl.exe` command (gross, I know).

Here is my config that currently works:

```json
{
  "mcpServers": {
    "Wiz MCP Server": {
      "disabled": false,
      "timeout": 60,
      "command": "wsl.exe",
      "args": [
        "bash",
        "-c",
        "WIZ_DOTENV_PATH=/home/drew/workspaces/wiz-mcp/wiz-mcp/.env   /home/drew/.local/bin/uv --directory /home/drew/workspaces/wiz-mcp/wiz-mcp run --with mcp[cli] mcp run src/wiz_mcp_server/server.py"
      ],
      "transportType": "stdio"
    }
  }
}
```

And here is what a successful entry looks like in the Cline config.

<img src="{static}images/wiz-mcp-02-cline-mcp-server-wiz.png" style="max-width:100%; height:auto;" alt="MCP Config">


## Profit

We can now interact with our Wiz environment through the MCP server!

<img src="{static}images/wiz-mcp-03-profit.png" style="max-width:100%; height:auto;" alt="Successful Wiz MCP Server interaction">

## Notes

I tried running this with `gemma3:12b` quantized on my own hardware and it never thought to incant the MCP server so (obviously) the LLM you use is going to have a big difference on how successful your interactions will be. 

# Conclusion

This is only a start! You can (and should!) host the MCP server in a central location for your whole team to use. You can (and should!) investigate hosting your own LLM (although the hardware costs, care & feeding, etc may make that prohibitive). Also, this entire field is moving ultra fast. Stay tuned. 

The more distance you can put between the carbon-based user and the machine, the more you can automate. And the more you can automate, the faster you can move (and the more time you free up). Enjoy!