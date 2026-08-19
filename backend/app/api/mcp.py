from fastapi import APIRouter, HTTPException, status

from app.core.deps import CurrentUserId
from app.schemas.mcp import (
    McpAuditResponse,
    McpCatalogResponse,
    McpInvokeRequest,
    McpInvokeResponse,
    McpRegisterRequest,
    McpRegisterResponse,
    McpToolListResponse,
)
from app.services.mcp_service import mcp_service

router = APIRouter()


@router.get("/servers", response_model=McpCatalogResponse)
async def list_mcp_servers(_user_id: CurrentUserId) -> McpCatalogResponse:
    result = await mcp_service.list_catalog()
    return McpCatalogResponse.model_validate(result)


@router.post("/register", response_model=McpRegisterResponse)
async def register_mcp_server(
    payload: McpRegisterRequest,
    _user_id: CurrentUserId,
) -> McpRegisterResponse:
    tools = None
    if payload.tools is not None:
        tools = [item.model_dump() for item in payload.tools]
    result = await mcp_service.register(
        connection_id=payload.connection_id,
        name=payload.name,
        tools=tools,
        credential_ref=payload.credential_ref,
    )
    return McpRegisterResponse.model_validate(result)


@router.get("/servers/{server_id}/tools", response_model=McpToolListResponse)
async def list_mcp_tools(server_id: str, _user_id: CurrentUserId) -> McpToolListResponse:
    catalog = await mcp_service.list_catalog()
    ids = {item.get("serverId") for item in catalog["servers"]}
    if server_id not in ids:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="MCP server not found")
    result = await mcp_service.list_tools(server_id)
    return McpToolListResponse.model_validate(result)


@router.post("/invoke", response_model=McpInvokeResponse)
async def invoke_mcp_tool(payload: McpInvokeRequest, _user_id: CurrentUserId) -> McpInvokeResponse:
    result = await mcp_service.invoke(payload.tool, payload.args, server_id=payload.server_id)
    return McpInvokeResponse.model_validate(result)


@router.get("/audit", response_model=McpAuditResponse)
async def list_mcp_audit(_user_id: CurrentUserId) -> McpAuditResponse:
    result = await mcp_service.list_audit()
    return McpAuditResponse.model_validate(result)
