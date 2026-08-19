FROM node:22-bookworm-slim

WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends socat \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g @deepseek-ai/dsh

# dsh refuses --host 0.0.0.0 (RCE surface). Bind loopback, then proxy for Compose DNS.
ENV PORT=3080
EXPOSE 3080

CMD ["sh", "-c", "dsh web --host 127.0.0.1 --port 3079 & exec socat TCP-LISTEN:3080,bind=0.0.0.0,fork,reuseaddr TCP:127.0.0.1:3079"]
