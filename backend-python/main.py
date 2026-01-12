import os
from pathlib import Path
from typing import Dict, List, Set
from uuid import UUID, uuid4
from urllib.parse import urlencode
import base64
import hashlib
import secrets

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure .env is loaded relative to this file, even if CWD differs
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

app = FastAPI(title="Python Rewards API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TWITCH_CLIENT_ID = os.environ.get("TWITCH_CLIENT_ID")
TWITCH_CLIENT_SECRET = os.environ.get("TWITCH_CLIENT_SECRET")
TWITCH_REDIRECT_URI = os.environ.get("TWITCH_REDIRECT_URI")
ENABLE_TWITCH = False
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:8001")
KICK_CLIENT_ID = os.environ.get("KICK_CLIENT_ID")
KICK_CLIENT_SECRET = os.environ.get("KICK_CLIENT_SECRET")
KICK_REDIRECT_URI = os.environ.get("KICK_REDIRECT_URI")
KICK_AUTH_URL = os.environ.get("KICK_AUTH_URL")
KICK_TOKEN_URL = os.environ.get("KICK_TOKEN_URL")
KICK_USER_URL = os.environ.get("KICK_USER_URL")
KICK_SCOPE = os.environ.get("KICK_SCOPE", "user:read")

states: Set[str] = set()
pkce_verifiers: Dict[str, str] = {}


class RewardCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    token: str = Field(default="USDC", max_length=10)
    amount: float = Field(..., gt=0)


class Reward(RewardCreate):
    id: UUID


class SteamLinkRequest(BaseModel):
    steamTradeLink: str | None = None


rewards: List[Reward] = [
    Reward(
        id=uuid4(),
        title="Welcome Airdrop",
        description="First time viewer bonus",
        token="USDC",
        amount=5,
    )
]
steam_link: str | None = None

def ensure_twitch_config() -> None:
    if not ENABLE_TWITCH:
        raise HTTPException(status_code=410, detail="Twitch OAuth is disabled in this build.")
    if not (TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET and TWITCH_REDIRECT_URI):
        raise HTTPException(
            status_code=500,
            detail="Twitch OAuth is not configured. Set TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_REDIRECT_URI.",
        )


def ensure_kick_config() -> None:
    if not (
        KICK_CLIENT_ID
        and KICK_CLIENT_SECRET
        and KICK_REDIRECT_URI
        and KICK_AUTH_URL
        and KICK_TOKEN_URL
        and KICK_USER_URL
    ):
        raise HTTPException(
            status_code=500,
            detail="Kick OAuth is not configured. Set KICK_CLIENT_ID, KICK_CLIENT_SECRET, KICK_REDIRECT_URI, KICK_AUTH_URL, KICK_TOKEN_URL, KICK_USER_URL.",
        )


async def exchange_code_for_token(code: str) -> Dict:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            "https://id.twitch.tv/oauth2/token",
            data={
                "client_id": TWITCH_CLIENT_ID,
                "client_secret": TWITCH_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": TWITCH_REDIRECT_URI,
            },
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange code for token")
        return resp.json()

def generate_pkce() -> tuple[str, str]:
    verifier = secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
    return verifier, challenge


async def fetch_twitch_user(access_token: str) -> Dict:
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Client-Id": TWITCH_CLIENT_ID or "",
    }
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get("https://api.twitch.tv/helix/users", headers=headers)
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch user from Twitch")
        payload = resp.json()
        data = payload.get("data") or []
        if not data:
            raise HTTPException(status_code=400, detail="No user info returned from Twitch")
        user = data[0]
        return {
            "id": user.get("id"),
            "login": user.get("login"),
            "display_name": user.get("display_name"),
            "avatar": user.get("profile_image_url"),
        }


async def exchange_code_for_token_kick(code: str, verifier: str | None) -> Dict:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            KICK_TOKEN_URL or "",
            data={
                "client_id": KICK_CLIENT_ID,
                "client_secret": KICK_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": KICK_REDIRECT_URI,
                "code_verifier": verifier or "",
            },
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange code for token (Kick)")
        return resp.json()


async def fetch_kick_user(access_token: str) -> Dict:
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Client-Id": KICK_CLIENT_ID or "",
    }
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(KICK_USER_URL or "", headers=headers)
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch user from Kick")
        data = resp.json()
        return data


@app.get("/health")
def health():
    return {"ok": True, "service": "python-api"}


@app.get("/steam/link")
def get_steam_link():
    return {"steamTradeLink": steam_link}


@app.post("/steam/link")
def set_steam_link(payload: SteamLinkRequest):
    global steam_link
    steam_link = payload.steamTradeLink
    return {"steamTradeLink": steam_link}


@app.get("/auth/twitch/start")
async def auth_twitch_start():
    ensure_twitch_config()
    state = uuid4().hex
    states.add(state)
    params = urlencode(
        {
            "client_id": TWITCH_CLIENT_ID,
            "redirect_uri": TWITCH_REDIRECT_URI,
            "response_type": "code",
            "scope": "user:read:email",
            "state": state,
        }
    )
    url = f"https://id.twitch.tv/oauth2/authorize?{params}"
    return RedirectResponse(url)


@app.get("/auth/twitch/callback")
async def auth_twitch_callback(code: str | None = None, state: str | None = None):
    ensure_twitch_config()
    if not code or not state:
        raise HTTPException(status_code=400, detail="Code or state is missing")
    if state not in states:
        raise HTTPException(status_code=400, detail="Invalid state")
    states.discard(state)

    token_data = await exchange_code_for_token(code)
    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="No access token in Twitch response")
    user = await fetch_twitch_user(access_token)
    return {
        "access_token": access_token,
        "refresh_token": token_data.get("refresh_token"),
        "expires_in": token_data.get("expires_in"),
        "token_type": token_data.get("token_type"),
        "user": user,
        "redirect_to": FRONTEND_URL,
    }


@app.get("/auth/kick/start")
async def auth_kick_start():
    ensure_kick_config()
    state = uuid4().hex
    states.add(state)
    verifier, challenge = generate_pkce()
    pkce_verifiers[state] = verifier
    params = urlencode(
        {
            "client_id": KICK_CLIENT_ID,
            "redirect_uri": KICK_REDIRECT_URI,
            "response_type": "code",
            "scope": KICK_SCOPE,
            "state": state,
            "code_challenge": challenge,
            "code_challenge_method": "S256",
        }
    )
    url = f"{KICK_AUTH_URL}?{params}"
    return RedirectResponse(url)


@app.get("/auth/kick/callback")
async def auth_kick_callback(code: str | None = None, state: str | None = None):
    ensure_kick_config()
    if not code or not state:
        raise HTTPException(status_code=400, detail="Code or state is missing")
    if state not in states:
        raise HTTPException(status_code=400, detail="Invalid state")
    states.discard(state)
    verifier = pkce_verifiers.pop(state, None)

    token_data = await exchange_code_for_token_kick(code, verifier)
    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="No access token in Kick response")
    user = await fetch_kick_user(access_token)
    user_data = None
    if isinstance(user, dict):
        if isinstance(user.get("data"), list) and user["data"]:
            user_data = user["data"][0]
    redirect_params = {
        "kick_user": (user_data or {}).get("name") or "",
        "kick_email": (user_data or {}).get("email") or "",
        "kick_id": (user_data or {}).get("user_id") or "",
    }
    target = FRONTEND_URL
    if target:
        url = f"{target}?{urlencode(redirect_params)}"
        return RedirectResponse(url)
    return {
        "access_token": access_token,
        "refresh_token": token_data.get("refresh_token"),
        "expires_in": token_data.get("expires_in"),
        "token_type": token_data.get("token_type"),
        "user": user,
        "redirect_to": FRONTEND_URL,
    }


@app.get("/rewards", response_model=List[Reward])
def list_rewards():
    return rewards


@app.post("/rewards", response_model=Reward, status_code=201)
def create_reward(payload: RewardCreate):
    reward = Reward(id=uuid4(), **payload.model_dump())
    rewards.append(reward)
    return reward


@app.get("/rewards/{reward_id}", response_model=Reward)
def get_reward(reward_id: UUID):
    for reward in rewards:
        if reward.id == reward_id:
            return reward
    raise HTTPException(status_code=404, detail="Reward not found")


@app.delete("/rewards/{reward_id}", status_code=204)
def delete_reward(reward_id: UUID):
    global rewards
    before = len(rewards)
    rewards = [r for r in rewards if r.id != reward_id]
    if len(rewards) == before:
        raise HTTPException(status_code=404, detail="Reward not found")
