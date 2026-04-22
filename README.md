# Food Journal App

A mobile app to track your daily meals with photos, descriptions, and categories.

## Features

- Register / Login / Logout
- Add food entries with photos (from gallery)
- Add descriptions to meals
- Browse all entries
- Filter by category (Breakfast, Lunch, Dinner, Snacks)
- Edit entries
- Delete entries

## How to Run

### 1. Install dependencies
```bash
npm install
```

### 2. Start the app
```bash
npx expo start --lan
```

### 3. Open on your phone
- Download **Expo Go** from Google Play or App Store
- Scan the QR code from your terminal

## How to Use

1. **Register** - Enter email and password (min 6 characters)
2. **Login** - Use same email and password
3. **Add entry** - Click "Gallery" to select a photo, add description, choose category, click "SAVE"
4. **Browse** - Scroll down to see all entries
5. **Filter** - Click a category to filter entries
6. **Edit** - Click "Edit" on any entry
7. **Delete** - Click "Delete" on any entry

## Technologies Used

- React Native / Expo
- SQLite for database
- Expo Image Picker for photos

## Notes

- Camera is not supported on Huawei devices. Use gallery picker instead.
- Minimum password length is 6 characters.

## Author

Chaima El Fehri