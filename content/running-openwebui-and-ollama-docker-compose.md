Title: Running OpenWebUI and Ollama in Docker Compose with GPU Support
Date: 2025-06-05
Category: howto

# Problem

We want to run OpenWebUI so we have an easy way to interact with, and test out, LLMs. We also want the convenience of Ollama for managing/running our models for us. We also want to make use of the GPU in our system.

# Solution

Go the ~lazy~ simple route of running both inside containers. We'll coordinate the tech with docker-compose.

## The file

Below is one successful `docker-compose.yaml` file for standing up both containers, getting them talking to each other, and also exposing both ports on the host network for easy access over your home network. This is highly insecure but isn't everything in your house like that?

Note the `volumes` for storing data across restarts. Also the `deploy` and `runtime` keys that configure access to our Nvidia GPU.

Also note that this is only one way to do it. There are certainly more/better methods for running this stack.

```yaml
services:
  ollama:
    image: ollama/ollama
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu]
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
    networks:
      - ollama_net

  openwebui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: openwebui
    ports:
      - "3000:8080"  # WebUI exposed on port 3000
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434  # Connect to Ollama by container name
    depends_on:
      - ollama
    networks:
      - ollama_net
    volumes:
      - ./openwebui:/app/backend/data

volumes:
  ollama_data:

networks:
  ollama_net:
    driver: bridge
```

Was this made with an LLM? Absolutely. 

A quick `docker-compose up` and you're off to the races. Now go find a useful LLM and impress your friends & family.

