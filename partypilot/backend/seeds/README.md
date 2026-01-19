# Package Seeder

This script seeds the database with 36 colorful packages for PartyPilot.

Usage:

1. Create a .env file in the backend folder with a valid MONGO_URI variable.

2. Run the seeder from the backend folder:

```powershell
# From backend folder
npm run seed:packages
```

This will erase existing Package documents and insert the seeded packages.
