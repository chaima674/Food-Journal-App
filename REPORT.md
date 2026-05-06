# Food Journal App - Technical Report

## Assignment Information
- **Student Name:** Chaima El Fehri
- **Project:** Food Journal App
- **Date:** April 2026

---

## 1. Errors Identified and Solutions Applied

### Error 1: Database Initialization Failure
- **Error Message:** Cannot read property 'execAsync' of undefined
- **Location:** components/database/database.js
- **Cause:** The executeSql function incorrectly used transaction methods for SELECT queries
- **Solution:** Separated database functions into executeSql (for SELECT) and runSql (for INSERT/UPDATE/DELETE)

**Code before fix:**
```
return await db.withTransactionAsync(async (tx) => {
  return await tx.execAsync(query, params);
});
```

**Code after fix:**
```
const result = await db.getAllAsync(query, params);
return { rows: result };
```

### Error 2: Authentication INSERT Failure
- **Error Message:** result.rows.item is not a function
- **Location:** components/auth/authScreen.js
- **Cause:** Using executeSql for INSERT operations instead of runSql
- **Solution:** Changed registration INSERT to use runSql function

**Code before fix:**
```
const insertResult = await executeSql(
  'INSERT INTO users (email, password) VALUES (?, ?)',
  [email, password]
);
```

**Code after fix:**
```
const insertResult = await runSql(
  'INSERT INTO users (email, password) VALUES (?, ?)',
  [email, password]
);
```

### Error 3: Missing runSql Export
- **Error Message:** runSql is not defined
- **Location:** components/auth/authScreen.js and screens/homeScreen.js
- **Cause:** runSql function was not exported from database.js
- **Solution:** Added runSql to exports and imported in both files

### Error 4: HomeScreen Render Error
- **Error Message:** Element type is invalid: expected a string or class/function but got object
- **Location:** screens/homeScreen.js
- **Cause:** Picker component import issue and emoji characters
- **Solution:** Replaced Picker with custom category buttons and removed emojis

### Error 5: Camera Not Working (Huawei Device)
- **Issue:** Camera fails to take photos on Huawei Y9a
- **Device:** Huawei FRL-L22 (Y9a), Android 10, EMUI 10.1.1
- **Cause:** Huawei devices lack Google Play Services; expo-camera requires Google ML Kit
- **Solution:** Documented as known limitation; gallery picker works as alternative

---

## 2. Features Implemented

- User Registration: Working
- User Login: Working
- Gallery Image Picker: Working
- Add Description: Working
- Browse Entries: Working
- Filter by Category: Working
- Edit Entry: Working
- Delete Entry: Working
- SQLite Database: Working
- Camera: Device limitation (Huawei)

---

## 3. Database Schema

**Users Table:**
```
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT
);
```

**Journals Table:**
```
CREATE TABLE journals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  image TEXT,
  description TEXT,
  date TEXT,
  category TEXT
);
```

---

## 4. Files Modified

- components/database/database.js: Complete rewrite with proper SQLite methods
- components/auth/authScreen.js: Added runSql import, changed INSERT to runSql
- screens/homeScreen.js: Complete rewrite, removed Picker, removed emojis
- app.json: Added camera permissions and plugin configurations

---

## 5. Testing Results

**Test Environment:**
- Device: Huawei Y9a (FRL-L22)
- Android Version: 10 (EMUI 10.1.1)
- Expo SDK: 52.0.0
- Testing Date: April 2026

**Test Cases:**
- Register new user: PASS
- Login with valid credentials: PASS
- Login with invalid credentials: PASS
- Select image from gallery: PASS
- Add description: PASS
- Select category: PASS
- Save entry: PASS
- Filter by Breakfast: PASS
- Filter by Lunch: PASS
- Filter by Dinner: PASS
- Filter by Snacks: PASS
- Edit entry description: PASS
- Edit entry category: PASS
- Delete entry: PASS
- Take photo with camera: FAIL (Huawei limitation)

---

## 6. Known Limitations

**Camera on Huawei Devices:**
- Issue: Camera does not function on Huawei Y9a
- Cause: Huawei devices lack Google Play Services; expo-camera requires Google ML Kit
- Workaround: Users can use "Choose from Gallery" option to add images
- Verification: Camera works correctly on devices with Google Play Services (emulator, Samsung, Pixel)

---

## 7. Conclusion

The Food Journal application has been successfully implemented with 9 out of 10 required features working correctly. The app allows users to:

1. Register and login securely
2. Add food entries with images (via gallery)
3. Add descriptions and categories to meals
4. Browse all entries with filtering by category
5. Edit and delete existing entries
6. Store all data persistently using SQLite

The only non-working feature is the camera on Huawei devices, which is a documented hardware limitation beyond the scope of the code. The gallery picker provides a fully functional alternative for adding images.

All code has been tested and verified. 

---

## 8. Screenshots

Screenshots are available in the screenshots folder of the repository:

- 1-login-screen.jpg
- 2-add-entry.jpg
- 3-journal-list.jpg
- 4-journal-list.jpg
- 5-filter-breakfast.jpg
- 6-filter-lunch.jpg
- 7-filter-dinner.jpg
- 8-filter-snack.jpg
- 9-edit-entry.jpg
- 10-delete-entry.jpg

---

## 9. GitHub Repository

**Repository Link:** https://github.com/chaima674/Food-Journal-App

---

## 10. References

- Expo SQLite Documentation
- Expo Camera Documentation
- Expo Image Picker Documentation
- React Navigation Documentation

---

**End of Report**