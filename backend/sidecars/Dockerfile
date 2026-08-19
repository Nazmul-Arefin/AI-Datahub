FROM python:3.12-alpine

WORKDIR /sidecar
COPY mock_health.py mock_memory.py mcp_gateway.py /sidecar/

ENV SIDECAR_NAME=sidecar
ENV PORT=8080

EXPOSE 8080

CMD ["python", "/sidecar/mock_health.py"]
