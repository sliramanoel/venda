from fastapi import APIRouter, Request, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import Optional, List
import os
import hashlib
import json

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

def get_db():
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    return client[os.environ.get('DB_NAME')]

# Models
class PageViewEvent(BaseModel):
    page: str
    referrer: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_term: Optional[str] = None
    utm_content: Optional[str] = None

class ActionEvent(BaseModel):
    action: str  # click_cta, start_checkout, complete_purchase, etc.
    page: str
    metadata: Optional[dict] = None

class AnalyticsFilter(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    period: Optional[str] = "7d"  # today, yesterday, 7d, 30d, this_month, last_month, custom

def get_visitor_id(request: Request) -> str:
    """Generate a unique visitor ID based on IP and User-Agent"""
    ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    raw = f"{ip}:{user_agent}"
    return hashlib.md5(raw.encode()).hexdigest()[:16]

def get_device_info(user_agent: str) -> dict:
    """Extract device info from user agent"""
    ua_lower = user_agent.lower()
    
    # Device type
    if any(x in ua_lower for x in ['mobile', 'android', 'iphone', 'ipad']):
        device_type = 'mobile' if 'ipad' not in ua_lower else 'tablet'
    else:
        device_type = 'desktop'
    
    # Browser
    if 'chrome' in ua_lower and 'edg' not in ua_lower:
        browser = 'Chrome'
    elif 'firefox' in ua_lower:
        browser = 'Firefox'
    elif 'safari' in ua_lower and 'chrome' not in ua_lower:
        browser = 'Safari'
    elif 'edg' in ua_lower:
        browser = 'Edge'
    else:
        browser = 'Other'
    
    # OS
    if 'windows' in ua_lower:
        os_name = 'Windows'
    elif 'mac' in ua_lower or 'iphone' in ua_lower or 'ipad' in ua_lower:
        os_name = 'iOS/macOS'
    elif 'android' in ua_lower:
        os_name = 'Android'
    elif 'linux' in ua_lower:
        os_name = 'Linux'
    else:
        os_name = 'Other'
    
    return {
        "device_type": device_type,
        "browser": browser,
        "os": os_name
    }

def get_date_range(period: str, start_date: str = None, end_date: str = None):
    """Get date range based on period"""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    if period == "today":
        return today_start, now
    elif period == "yesterday":
        yesterday = today_start - timedelta(days=1)
        return yesterday, today_start
    elif period == "7d":
        return today_start - timedelta(days=7), now
    elif period == "30d":
        return today_start - timedelta(days=30), now
    elif period == "this_month":
        month_start = today_start.replace(day=1)
        return month_start, now
    elif period == "last_month":
        this_month = today_start.replace(day=1)
        last_month = (this_month - timedelta(days=1)).replace(day=1)
        return last_month, this_month
    elif period == "custom" and start_date and end_date:
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        return start, end
    else:
        return today_start - timedelta(days=7), now

@router.post("/track/pageview")
async def track_pageview(event: PageViewEvent, request: Request):
    """Track a page view"""
    db = get_db()
    
    visitor_id = get_visitor_id(request)
    user_agent = request.headers.get("user-agent", "")
    device_info = get_device_info(user_agent)
    
    # Get location from IP (simplified - in production use a geo-IP service)
    ip = request.client.host if request.client else "unknown"
    
    pageview = {
        "visitor_id": visitor_id,
        "page": event.page,
        "referrer": event.referrer,
        "utm_source": event.utm_source,
        "utm_medium": event.utm_medium,
        "utm_campaign": event.utm_campaign,
        "utm_term": event.utm_term,
        "utm_content": event.utm_content,
        "device_type": device_info["device_type"],
        "browser": device_info["browser"],
        "os": device_info["os"],
        "ip": ip,
        "user_agent": user_agent[:500],  # Limit size
        "timestamp": datetime.now(timezone.utc)
    }
    
    await db.pageviews.insert_one(pageview)
    
    # Update/create session
    session_timeout = datetime.now(timezone.utc) - timedelta(minutes=30)
    existing_session = await db.sessions.find_one({
        "visitor_id": visitor_id,
        "last_activity": {"$gte": session_timeout}
    })
    
    if existing_session:
        await db.sessions.update_one(
            {"_id": existing_session["_id"]},
            {
                "$set": {"last_activity": datetime.now(timezone.utc)},
                "$push": {"pages": event.page},
                "$inc": {"pageviews": 1}
            }
        )
    else:
        new_session = {
            "visitor_id": visitor_id,
            "started_at": datetime.now(timezone.utc),
            "last_activity": datetime.now(timezone.utc),
            "pages": [event.page],
            "pageviews": 1,
            "device_type": device_info["device_type"],
            "browser": device_info["browser"],
            "os": device_info["os"],
            "utm_source": event.utm_source,
            "utm_campaign": event.utm_campaign
        }
        await db.sessions.insert_one(new_session)
    
    return {"status": "tracked"}

@router.post("/track/action")
async def track_action(event: ActionEvent, request: Request):
    """Track a user action (click, checkout, etc.)"""
    db = get_db()
    
    visitor_id = get_visitor_id(request)
    
    action = {
        "visitor_id": visitor_id,
        "action": event.action,
        "page": event.page,
        "metadata": event.metadata or {},
        "timestamp": datetime.now(timezone.utc)
    }
    
    await db.actions.insert_one(action)
    
    return {"status": "tracked"}

@router.get("/stats/overview")
async def get_overview_stats(period: str = "7d", start_date: str = None, end_date: str = None):
    """Get overview statistics"""
    db = get_db()
    
    start, end = get_date_range(period, start_date, end_date)
    
    # Total pageviews
    total_pageviews = await db.pageviews.count_documents({
        "timestamp": {"$gte": start, "$lte": end}
    })
    
    # Unique visitors
    unique_visitors = len(await db.pageviews.distinct("visitor_id", {
        "timestamp": {"$gte": start, "$lte": end}
    }))
    
    # Sessions
    total_sessions = await db.sessions.count_documents({
        "started_at": {"$gte": start, "$lte": end}
    })
    
    # Online now (active in last 5 minutes)
    five_minutes_ago = datetime.now(timezone.utc) - timedelta(minutes=5)
    online_now = await db.sessions.count_documents({
        "last_activity": {"$gte": five_minutes_ago}
    })
    
    # Actions count
    actions_pipeline = [
        {"$match": {"timestamp": {"$gte": start, "$lte": end}}},
        {"$group": {"_id": "$action", "count": {"$sum": 1}}}
    ]
    actions_result = await db.actions.aggregate(actions_pipeline).to_list(100)
    actions_by_type = {item["_id"]: item["count"] for item in actions_result}
    
    return {
        "total_pageviews": total_pageviews,
        "unique_visitors": unique_visitors,
        "total_sessions": total_sessions,
        "online_now": online_now,
        "actions": actions_by_type,
        "period": {
            "start": start.isoformat(),
            "end": end.isoformat()
        }
    }

@router.get("/stats/pageviews")
async def get_pageview_stats(period: str = "7d", start_date: str = None, end_date: str = None):
    """Get pageview statistics by page"""
    db = get_db()
    
    start, end = get_date_range(period, start_date, end_date)
    
    pipeline = [
        {"$match": {"timestamp": {"$gte": start, "$lte": end}}},
        {"$group": {
            "_id": "$page",
            "views": {"$sum": 1},
            "unique_visitors": {"$addToSet": "$visitor_id"}
        }},
        {"$project": {
            "page": "$_id",
            "views": 1,
            "unique_visitors": {"$size": "$unique_visitors"}
        }},
        {"$sort": {"views": -1}}
    ]
    
    result = await db.pageviews.aggregate(pipeline).to_list(100)
    return {"pages": result}

@router.get("/stats/timeline")
async def get_timeline_stats(period: str = "7d", start_date: str = None, end_date: str = None, granularity: str = "day"):
    """Get pageviews over time"""
    db = get_db()
    
    start, end = get_date_range(period, start_date, end_date)
    
    # Determine date format based on granularity
    if granularity == "hour":
        date_format = "%Y-%m-%d %H:00"
        group_id = {
            "year": {"$year": "$timestamp"},
            "month": {"$month": "$timestamp"},
            "day": {"$dayOfMonth": "$timestamp"},
            "hour": {"$hour": "$timestamp"}
        }
    else:  # day
        date_format = "%Y-%m-%d"
        group_id = {
            "year": {"$year": "$timestamp"},
            "month": {"$month": "$timestamp"},
            "day": {"$dayOfMonth": "$timestamp"}
        }
    
    pipeline = [
        {"$match": {"timestamp": {"$gte": start, "$lte": end}}},
        {"$group": {
            "_id": group_id,
            "pageviews": {"$sum": 1},
            "unique_visitors": {"$addToSet": "$visitor_id"}
        }},
        {"$project": {
            "date": {
                "$dateFromParts": {
                    "year": "$_id.year",
                    "month": "$_id.month",
                    "day": "$_id.day",
                    "hour": {"$ifNull": ["$_id.hour", 0]}
                }
            },
            "pageviews": 1,
            "unique_visitors": {"$size": "$unique_visitors"}
        }},
        {"$sort": {"date": 1}}
    ]
    
    result = await db.pageviews.aggregate(pipeline).to_list(1000)
    
    # Format dates
    for item in result:
        if isinstance(item.get("date"), datetime):
            item["date"] = item["date"].strftime(date_format)
    
    return {"timeline": result}

@router.get("/stats/devices")
async def get_device_stats(period: str = "7d", start_date: str = None, end_date: str = None):
    """Get device statistics"""
    db = get_db()
    
    start, end = get_date_range(period, start_date, end_date)
    
    # Device types
    device_pipeline = [
        {"$match": {"timestamp": {"$gte": start, "$lte": end}}},
        {"$group": {"_id": "$device_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    
    # Browsers
    browser_pipeline = [
        {"$match": {"timestamp": {"$gte": start, "$lte": end}}},
        {"$group": {"_id": "$browser", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    
    # OS
    os_pipeline = [
        {"$match": {"timestamp": {"$gte": start, "$lte": end}}},
        {"$group": {"_id": "$os", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    
    devices = await db.pageviews.aggregate(device_pipeline).to_list(10)
    browsers = await db.pageviews.aggregate(browser_pipeline).to_list(10)
    operating_systems = await db.pageviews.aggregate(os_pipeline).to_list(10)
    
    return {
        "devices": [{"name": d["_id"], "count": d["count"]} for d in devices if d["_id"]],
        "browsers": [{"name": b["_id"], "count": b["count"]} for b in browsers if b["_id"]],
        "operating_systems": [{"name": o["_id"], "count": o["count"]} for o in operating_systems if o["_id"]]
    }

@router.get("/stats/traffic-sources")
async def get_traffic_sources(period: str = "7d", start_date: str = None, end_date: str = None):
    """Get traffic source statistics"""
    db = get_db()
    
    start, end = get_date_range(period, start_date, end_date)
    
    # UTM Sources
    source_pipeline = [
        {"$match": {"timestamp": {"$gte": start, "$lte": end}, "utm_source": {"$ne": None}}},
        {"$group": {"_id": "$utm_source", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    
    # UTM Campaigns
    campaign_pipeline = [
        {"$match": {"timestamp": {"$gte": start, "$lte": end}, "utm_campaign": {"$ne": None}}},
        {"$group": {"_id": "$utm_campaign", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    
    # Referrers
    referrer_pipeline = [
        {"$match": {"timestamp": {"$gte": start, "$lte": end}, "referrer": {"$nin": [None, ""]}}},
        {"$group": {"_id": "$referrer", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    
    sources = await db.pageviews.aggregate(source_pipeline).to_list(10)
    campaigns = await db.pageviews.aggregate(campaign_pipeline).to_list(10)
    referrers = await db.pageviews.aggregate(referrer_pipeline).to_list(10)
    
    return {
        "sources": [{"name": s["_id"], "count": s["count"]} for s in sources],
        "campaigns": [{"name": c["_id"], "count": c["count"]} for c in campaigns],
        "referrers": [{"name": r["_id"], "count": r["count"]} for r in referrers]
    }

@router.get("/stats/realtime")
async def get_realtime_stats():
    """Get real-time statistics"""
    db = get_db()
    
    now = datetime.now(timezone.utc)
    five_minutes_ago = now - timedelta(minutes=5)
    fifteen_minutes_ago = now - timedelta(minutes=15)
    one_hour_ago = now - timedelta(hours=1)
    
    # Online now (last 5 minutes)
    online_sessions = await db.sessions.find(
        {"last_activity": {"$gte": five_minutes_ago}},
        {"_id": 0, "visitor_id": 1, "pages": 1, "device_type": 1, "last_activity": 1}
    ).to_list(100)
    
    # Recent pageviews (last 15 minutes)
    recent_pageviews = await db.pageviews.find(
        {"timestamp": {"$gte": fifteen_minutes_ago}},
        {"_id": 0, "page": 1, "timestamp": 1, "device_type": 1}
    ).sort("timestamp", -1).to_list(50)
    
    # Pageviews per minute (last hour)
    minute_pipeline = [
        {"$match": {"timestamp": {"$gte": one_hour_ago}}},
        {"$group": {
            "_id": {
                "hour": {"$hour": "$timestamp"},
                "minute": {"$minute": "$timestamp"}
            },
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id.hour": 1, "_id.minute": 1}}
    ]
    
    pageviews_per_minute = await db.pageviews.aggregate(minute_pipeline).to_list(60)
    
    # Format timestamps
    for pv in recent_pageviews:
        if isinstance(pv.get("timestamp"), datetime):
            pv["timestamp"] = pv["timestamp"].isoformat()
    
    for session in online_sessions:
        if isinstance(session.get("last_activity"), datetime):
            session["last_activity"] = session["last_activity"].isoformat()
    
    return {
        "online_now": len(online_sessions),
        "online_sessions": online_sessions,
        "recent_pageviews": recent_pageviews,
        "pageviews_per_minute": [
            {"minute": f"{item['_id']['hour']:02d}:{item['_id']['minute']:02d}", "count": item["count"]}
            for item in pageviews_per_minute
        ]
    }

@router.get("/stats/actions")
async def get_action_stats(period: str = "7d", start_date: str = None, end_date: str = None):
    """Get action statistics"""
    db = get_db()
    
    start, end = get_date_range(period, start_date, end_date)
    
    pipeline = [
        {"$match": {"timestamp": {"$gte": start, "$lte": end}}},
        {"$group": {
            "_id": "$action",
            "count": {"$sum": 1},
            "unique_users": {"$addToSet": "$visitor_id"}
        }},
        {"$project": {
            "action": "$_id",
            "count": 1,
            "unique_users": {"$size": "$unique_users"}
        }},
        {"$sort": {"count": -1}}
    ]
    
    result = await db.actions.aggregate(pipeline).to_list(50)
    return {"actions": result}
