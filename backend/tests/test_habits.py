"""Tests for /habits CRUD endpoints."""
import pytest


@pytest.mark.asyncio
async def test_list_habits_empty(client):
    resp = await client.get("/habits/")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_create_habit(client):
    resp = await client.post("/habits/", json={"name": "Read", "emoji": "📚"})
    assert resp.status_code == 201
    body = resp.json()
    assert body["name"] == "Read"
    assert body["emoji"] == "📚"
    assert body["current_streak"] == 0
    assert body["completed_today"] is False
    assert "id" in body


@pytest.mark.asyncio
async def test_create_habit_default_emoji(client):
    resp = await client.post("/habits/", json={"name": "Meditate"})
    assert resp.status_code == 201
    assert resp.json()["emoji"] == "⭐"


@pytest.mark.asyncio
async def test_create_habit_blank_name_rejected(client):
    resp = await client.post("/habits/", json={"name": "   "})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_create_habit_empty_name_rejected(client):
    resp = await client.post("/habits/", json={"name": ""})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_list_habits_returns_created(client):
    await client.post("/habits/", json={"name": "Exercise"})
    await client.post("/habits/", json={"name": "Sleep 8h"})
    resp = await client.get("/habits/")
    assert resp.status_code == 200
    names = [h["name"] for h in resp.json()]
    assert "Exercise" in names
    assert "Sleep 8h" in names


@pytest.mark.asyncio
async def test_update_habit_name(client):
    create = await client.post("/habits/", json={"name": "Jog"})
    habit_id = create.json()["id"]

    resp = await client.put(f"/habits/{habit_id}", json={"name": "Run 5k"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "Run 5k"
    assert resp.json()["emoji"] == "⭐"  # unchanged


@pytest.mark.asyncio
async def test_update_habit_emoji(client):
    create = await client.post("/habits/", json={"name": "Yoga"})
    habit_id = create.json()["id"]

    resp = await client.put(f"/habits/{habit_id}", json={"emoji": "🧘"})
    assert resp.status_code == 200
    assert resp.json()["emoji"] == "🧘"
    assert resp.json()["name"] == "Yoga"  # unchanged


@pytest.mark.asyncio
async def test_update_habit_no_op(client):
    create = await client.post("/habits/", json={"name": "Walk"})
    habit_id = create.json()["id"]

    resp = await client.put(f"/habits/{habit_id}", json={})
    assert resp.status_code == 200
    assert resp.json()["name"] == "Walk"


@pytest.mark.asyncio
async def test_update_habit_not_found(client):
    resp = await client.put("/habits/9999", json={"name": "Ghost"})
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_habit(client):
    create = await client.post("/habits/", json={"name": "Drink water"})
    habit_id = create.json()["id"]

    resp = await client.delete(f"/habits/{habit_id}")
    assert resp.status_code == 204

    # Verify it's gone
    get_resp = await client.get("/habits/")
    ids = [h["id"] for h in get_resp.json()]
    assert habit_id not in ids


@pytest.mark.asyncio
async def test_delete_habit_not_found(client):
    resp = await client.delete("/habits/9999")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_cascades_completions(client, db):
    """Deleting a habit must remove its completions (FK CASCADE)."""
    create = await client.post("/habits/", json={"name": "Cascade test"})
    habit_id = create.json()["id"]

    # Add a completion directly in the DB
    await db.execute(
        "INSERT INTO completions (habit_id, completed_date) VALUES (?, date('now'))",
        (habit_id,),
    )
    await db.commit()

    await client.delete(f"/habits/{habit_id}")

    rows = await db.execute_fetchall(
        "SELECT 1 FROM completions WHERE habit_id = ?", (habit_id,)
    )
    assert rows == []
