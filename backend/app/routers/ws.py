from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json

router = APIRouter()

# track active connections
active_connections: dict[str, WebSocket] = {}

@router.websocket("/metrics/{session_id}")
async def metrics_stream(websocket: WebSocket, session_id: str):
    """
    Stream live metrics for a session.
    Client connects after starting inference.
    """
    await websocket.accept()
    active_connections[session_id] = websocket
    
    try:
        # heartbeat + listen for close
        while True:
            # wait for messages from client (or timeout)
            try:
                msg = await asyncio.wait_for(websocket.receive_text(), timeout=1.0)
                # client can send metrics updates here if needed
            except asyncio.TimeoutError:
                # send heartbeat
                await websocket.send_json({"type": "ping"})
    except WebSocketDisconnect:
        # clean up
        if session_id in active_connections:
            del active_connections[session_id]

async def broadcast_metrics(session_id: str, metrics: dict):
    """
    Send metrics to connected client.
    Called from inference endpoint.
    """
    if session_id in active_connections:
        ws = active_connections[session_id]
        try:
            await ws.send_json({
                "type": "metrics",
                "data": metrics
            })
        except:
            # connection dead, clean up
            del active_connections[session_id]
