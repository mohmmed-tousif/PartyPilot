# Google Maps Integration Setup Guide

## Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the following APIs:
   - Maps JavaScript API
   - Geolocation API
   - Geocoding API

4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key
6. (Optional) Restrict the API key:
   - Application restrictions: HTTP referrers
   - Add your website URLs: `http://localhost:3000/*` and your production domain
   - API restrictions: Select "Maps JavaScript API", "Geolocation API"

## Step 2: Add API Key to Frontend

### Partner Dashboard
Replace `YOUR_GOOGLE_MAPS_API_KEY` in:
- `frontend/partner/dashboard.html` (or dashboard-new.html)

```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&callback=initMap"></script>
```

### Customer Dashboard
Add to `frontend/customer/dashboard.html`:

```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&callback=initCustomerMap"></script>
```

### Admin Dashboard
Add to `frontend/admin/dashboard.html`:

```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&callback=initAdminMap"></script>
```

## Step 3: Update Backend Routes

Add to `backend/routes/partnerRoutes.js`:

```javascript
router.put('/location', updateLocation);
```

Add to `backend/controllers/partnerController.js`:

```javascript
exports.updateLocation = async (req, res) => {
  const { latitude, longitude } = req.body;
  
  if (!latitude || !longitude) {
    return res.status(400).json({ message: 'Latitude and longitude required' });
  }

  try {
    const Partner = require('../models/Partner');
    const partner = await Partner.findById(req.user.id);
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    partner.location = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      lastUpdated: new Date()
    };

    await partner.save();

    // Broadcast location to admin and relevant customers
    req.io.to('adminRoom').emit('partnerLocationUpdate', {
      partnerId: partner._id,
      companyName: partner.companyName,
      location: partner.location
    });

    res.json({ message: 'Location updated', location: partner.location });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

## Step 4: Features Implemented

### Partner Dashboard
✅ Real-time location sharing toggle
✅ Google Maps with partner marker
✅ Automatic location updates every 30 seconds
✅ Location status indicator
✅ Modern elegant UI with stats cards
✅ Active and available orders display

### Customer View (To Implement)
- See assigned partner's live location on map
- Track delivery status
- Estimated arrival time
- Direct navigation to event location

### Admin View (To Implement)
- View all partners on map
- See all active deliveries
- Partner availability status
- Customer locations
- Heat map of service areas

## Step 5: Testing

1. Enable location services in browser
2. Grant location permissions when prompted
3. Click "Enable Location Sharing" button
4. Verify marker appears on map
5. Check browser console for updates
6. Monitor location updates in database

## Security Notes

⚠️ **Important:**
- Never commit API keys to version control
- Use environment variables for production
- Restrict API key to specific domains
- Set up billing alerts in Google Cloud
- Monitor API usage regularly

## Cost Estimation

Google Maps offers $200 free credit per month:
- Dynamic Maps: $7 per 1000 loads
- Geolocation API: $5 per 1000 requests
- Typical small app usage: Well within free tier

---

**Your partner dashboard is now ready with Google Maps integration!** 🗺️
