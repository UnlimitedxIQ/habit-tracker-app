"""Tests for /habits/{id}/toggle and /completions/weekly endpoints."""
from datetime import date, timedelta

import pytest


# ---------------------------------------------------------------------------
# Toggle helpers
# ---------------------------------------------------------------------------

async def _create(client, name="Test habit"):
    resp = await client.post("/habits", json={"name": name})
    assert resp.status_code == 201
    return resp.json()["id"]


# ---------------------------------------------------------------------------
# Toggle tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_toggle_completes_today(client):
    habit_id = await _create(client)
    resp = await client.post(f"/habits/{habit_id}/toggle")
    assert resp.status_code == 200
    body = resp.json()
    assert body["completed"] is True
    assert body["habit_id"] == habit_id
    assert body["date"] == date.today().isoformat()


@pytest.mark.asyncio
async def test_toggle_uncompletes_today(client):
    habit_id = await _create(client)
    # First toggle → complete
    await client.post(f"/habits/{habit_id}/toggle")
    # Second toggle → uncomplete
    resp = await client.post(f"/habits/{habit_id}/toggle")
    assert resp.status_code == 200
    assert resp.json()["completed"] is False


@pytest.mark.asyncio
async def test_toggle_specific_date(client):
    habit_id = await _create(client)
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    resp = await client.post(
        f"/habits/{habit_id}/toggle", json={"date": yesterday}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["date"] == yesterday
    assert body["completed"] is True


@pytest.mark.asyncio
async def test_toggle_not_found(client):
    resp = await client.post("/habits/9999/toggle")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_toggle_returns_streak(client):
    """Streak should increment after completing today."""
    habit_id = await _create(client)
    resp = await client.post(f"/habits/{habit_id}/toggle")
    assert resp.json()["current_streak"] == 1

    # Un-toggle — streak drops back to 0
    resp = await client.post(f"/habits/{habit_id}/toggle")
    assert resp.json()["current_streak"] == 0


# ---------------------------------------------------------------------------
# Habit completed_today reflected in GET /habits/
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_completed_today_reflected_in_list(client):
    habit_id = await _create(client, name="Mirror test")
    await client.post(f"/habits/{habit_id}/toggle")

    resp = await client.get("/habits")
    habits = {h["id"]: h for h in resp.json()}
    assert habits[habit_id]["completed_today"] is True


# ---------------------------------------------------------------------------
# Weekly endpoint
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_weekly_returns_structure(client):
    await _create(client, name="Weekly habit")
    resp = await client.get("/completions/weekly")
    assert resp.status_code == 200
    body = resp.json()
    assert "week_start" in body
    assert "week_end" in body
    assert isinstance(body["habits"], list)


@pytest.mark.asyncio
async def test_weekly_week_bounds(client):
    """week_start must be Monday, week_end must be Sunday, 6 days apart."""
    resp = await client.get("/completions/weekly")
    body = resp.json()
    start = date.fromisoformat(body["week_start"])
    end = date.fromisoformat(body["week_end"])
    assert start.weekday() == 0  # Monday
    assert end.weekday() == 6    # Sunday
    assert (end - start).days == 6


@pytest.mark.asyncio
async def test_weekly_completion_appears(client):
    """Toggling today marks the correct date as True in the weekly response."""
    habit_id = await _create(client, name="Weekly complete")
    await client.post(f"/habits/{habit_id}/toggle")

    resp = await client.get("/completions/weekly")
    body = resp.json()
    today_str = date.today().isoformat()

    habits_map = {h["habit_id"]: h for h in body["habits"]}
    habit_data = habits_map.get(habit_id)
    assert habit_data is not None
    assert habit_data["completions"].get(today_str) is True


@pytest.mark.asyncio
async def test_weekly_seven_days_per_habit(client):
    """Each habit entry must have exactly 7 date keys."""
    await _create(client, name="Seven days")
    resp = await client.get("/completions/weekly")
    for habit in resp.json()["habits"]:
        assert len(habit["completions"]) == 7
