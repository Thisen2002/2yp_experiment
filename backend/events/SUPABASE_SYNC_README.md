# 🔄 Supabase Sync System for Heatmap Data

This system provides bidirectional synchronization between your local PostgreSQL database and Supabase, with special handling for database recreation scenarios.

## 🚀 Features

- **Bidirectional Sync**: Changes in local DB automatically sync to Supabase and vice versa
- **Database Recovery**: Automatically detects when local DB is empty/recreated and restores from Supabase
- **Manual Controls**: API endpoints for manual sync operations
- **Conflict Prevention**: Smart logic to prevent infinite sync loops
- **Status Monitoring**: Check sync health and database status

## 📋 Setup Instructions

### 1. Get Your Supabase Credentials

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create a new project or select your existing project
3. Navigate to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon public key** 
   - **service_role secret key** ⚠️ Keep this secure!

### 2. Create the Supabase Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the SQL script from `sql/supabase_buildings_table.sql`
3. This creates a `buildings` table that matches your local structure

### 3. Configure Environment Variables

Add these to your `.env` file:

```bash
# Supabase Sync Configuration
SUPABASE_SYNC_URL=https://your-project-id.supabase.co
SUPABASE_SYNC_ANON_KEY=your-anon-key-here
SUPABASE_SYNC_SERVICE_KEY=your-service-role-key-here
```

### 4. Restart Your Server

```bash
npm start
```

## 🔧 How It Works

### Automatic Behavior

1. **First Request**: System checks if local database is empty
2. **If Empty**: Automatically attempts to restore data from Supabase
3. **Normal Operation**: Any updates to local data automatically sync to Supabase
4. **Real-time**: Changes sync immediately when `/map-data` endpoint processes new data

### Database Recovery Scenarios

The system automatically handles these situations:

- ✅ **Local DB recreated/reset**: Restores all data from Supabase
- ✅ **New installation**: Pulls existing data from Supabase if available
- ✅ **Partial data loss**: Fills in missing records from Supabase backup

## 🛠 API Endpoints

### Get Heatmap Data (with auto-sync)
```
GET /api/heatmap/map-data
```
- Returns current heatmap data
- Automatically syncs any new data to Supabase
- Handles database restoration if needed

### Manual Restore from Supabase
```
POST /api/heatmap/restore-from-supabase
```
Force restore all data from Supabase to local database.

**Example Response:**
```json
{
  "success": true,
  "message": "Data successfully restored from Supabase",
  "source": "Supabase Restore"
}
```

### Manual Sync to Supabase
```
POST /api/heatmap/sync-to-supabase
```
Force sync all local data to Supabase.

**Example Response:**
```json
{
  "success": true,
  "message": "Successfully synced 34 buildings to Supabase",
  "count": 34,
  "source": "Manual Sync"
}
```

### Check Sync Status
```
GET /api/heatmap/sync-status
```
Get detailed information about sync system health.

**Example Response:**
```json
{
  "success": true,
  "local": {
    "isEmpty": false,
    "buildings": 34,
    "currentStatus": 34
  },
  "supabase": {
    "configured": true,
    "buildings": 34,
    "error": null
  },
  "recommendations": [
    "Database has data",
    "Sync system is ready"
  ]
}
```

## 🔍 Monitoring and Troubleshooting

### Check System Status
```bash
curl http://localhost:3000/api/heatmap/sync-status
```

### Manual Recovery
If your local database gets corrupted or recreated:
```bash
curl -X POST http://localhost:3000/api/heatmap/restore-from-supabase
```

### Force Backup to Supabase
```bash
curl -X POST http://localhost:3000/api/heatmap/sync-to-supabase
```

## 🔐 Security Considerations

1. **Service Role Key**: Keep your `SUPABASE_SYNC_SERVICE_KEY` secure - it has admin access
2. **Row Level Security**: The table is created with RLS enabled - customize policies as needed
3. **Environment Variables**: Never commit `.env` files to version control
4. **Network Security**: Consider IP restrictions in Supabase if needed

## 🚨 Important Notes

- **First Setup**: The system will attempt to restore from Supabase on first run if local DB is empty
- **Sync Direction**: Local changes → Supabase (automatic), Supabase → Local (on startup/manual)
- **Conflict Resolution**: Latest timestamp wins (Supabase data preferred during restore)
- **Performance**: Syncing happens asynchronously and doesn't block API responses

## 📊 Database Schema Comparison

### Local PostgreSQL Tables
```sql
-- buildings table
building_id VARCHAR(10) PRIMARY KEY
building_name VARCHAR(100) NOT NULL
building_capacity INT NOT NULL

-- current_status table  
building_id VARCHAR(10) PRIMARY KEY
current_crowd INT NOT NULL
color VARCHAR(20)
status_timestamp VARCHAR(50)
```

### Supabase Table
```sql
-- buildings table (combines both local tables)
building_id text PRIMARY KEY
building_name text NOT NULL
building_capacity integer NOT NULL
current_count integer DEFAULT 0
color text DEFAULT '#cccccc'
last_updated timestamptz DEFAULT now()
```

## 🔄 Sync Flow Diagram

```
Local DB Update → heatmap.js → Supabase
     ↑              ↓
Empty DB? ← Check on startup
     ↓              ↑
Restore ← ← ← ← Supabase
```

## 💡 Usage Examples

### React/Frontend Integration
```javascript
// Check if sync is working
const checkSync = async () => {
  const response = await fetch('/api/heatmap/sync-status');
  const status = await response.json();
  
  if (status.local.isEmpty) {
    // Trigger restore
    await fetch('/api/heatmap/restore-from-supabase', { method: 'POST' });
  }
};

// Get heatmap data (with auto-sync)
const getHeatmapData = async () => {
  const response = await fetch('/api/heatmap/map-data');
  const data = await response.json();
  return data;
};
```

This system ensures your heatmap data is always backed up and synchronized, providing resilience against database issues and enabling seamless data recovery! 🎯