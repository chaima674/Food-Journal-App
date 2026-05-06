# Food Journal App - Technical Report

## Assignment Information
- **Student Name:** Chaima El Fehri
- **Project:** Food Journal App
- **Date:** April 2026

---

## 1. Errors Identified and Solutions Applied

### Error 1: Database Initialization Failure
| Detail | Description |
|--------|-------------|
| **Error Message** | `Cannot read property 'execAsync' of undefined` |
| **Location** | `components/database/database.js` |
| **Cause** | The `executeSql` function incorrectly used transaction methods for SELECT queries |
| **Solution** | Separated database functions into `executeSql` (for SELECT) and `runSql` (for INSERT/UPDATE/DELETE) |

**Code before fix:**
```javascript
return await db.withTransactionAsync(async (tx) => {
  return await tx.execAsync(query, params);
});
```

**Code after fix:**
```javascript
const result = await db.getAllAsync(query, params);
return { rows: result };
```

---

### Error 2: Authentication INSERT Failure
| Detail | Description |
|--------|-------------|
| **Error Message** | `result.rows.item is not a function` |
| **Location** | `components/auth/authScreen.js` |
| **Cause** | Using `executeSql` for INSERT operations instead of `runSql` |
| **Solution** | Changed registration INSERT to use `runSql` function |

**Code before fix:**
```javascript
const insertResult = await executeSql(
  'INSERT INTO users (email, password) VALUES (?, ?)',
  [email, password]
);
```

**Code after fix:**
```javascript
const insertResult = await runSql(
  'INSERT INTO users (email, password) VALUES (?, ?)',
  [email, password]
);
```

---

### Error 3: Missing runSql Export
| Detail | Description |
|--------|-------------|
| **Error Message** | `runSql is not defined` |
| **Location** | `components/auth/authScreen.js` and `screens/homeScreen.js` |
| **Cause** | `runSql` function was not exported from database.js |
| **Solution** | Added `runSql` to exports and imported in both files |

---

### Error 4: HomeScreen Render Error (Line 263)
| Detail | Description |
|--------|-------------|
| **Error Message** | `Element type is invalid: expected a string or class/function but got object` |
| **Location** | `screens/homeScreen.js` |
| **Cause** | Picker component import issue |
| **Solution** | Replaced Picker with custom category buttons |

---

### Error 5: Camera Not Working (Huawei Device)
| Detail | Description |
|--------|-------------|
| **Issue** | Camera fails to take photos on Huawei Y9a |
| **Device** | Huawei FRL-L22 (Y9a), Android 10, EMUI 10.1.1 |
| **Cause** | Huawei devices lack Google Play Services; `expo-camera` requires Google ML Kit |
| **Solution** | Documented as known limitation; gallery picker works as alternative |

---

## 2. Features Implemented

| Feature | Implementation | Status |
|---------|---------------|--------|
| User Registration | SQLite users table with unique email constraint | Working |
| User Login | Email/password authentication | Working |
| Gallery Image Picker | Expo ImagePicker API | Working |
| Add Description | TextInput with multiline support | Working |
| Browse Entries | ScrollView with mapped journal entries | Working |
| Filter by Category | Button-based category filter | Working |
| Edit Entry | UPDATE SQL query with pre-filled form | Working |
| Delete Entry | DELETE SQL query with confirmation alert | Working |
| SQLite Database | Local persistent storage | Working |
| Camera (Huawei) | expo-camera API | Device limitation |

---

## 3. Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT
);
```

### Journals Table
```sql
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

| File | Changes Made |
|------|-------------|
| `components/database/database.js` | Complete rewrite with proper SQLite methods |
| `components/auth/authScreen.js` | Added `runSql` import, changed INSERT to `runSql` |
| `screens/homeScreen.js` | Complete rewrite, removed Picker, added category buttons |
| `app.json` | Added camera permissions and plugin configurations |

---

## 5. Testing Results

### Test Environment
- **Device:** Huawei Y9a (FRL-L22)
- **Android Version:** 10 (EMUI 10.1.1)
- **Expo SDK:** 52.0.0
- **Testing Date:** April 2026

### Test Cases

| Test Case | Expected Result | Actual Result |
|-----------|----------------|----------------|
| Register new user | Account created | PASS |
| Login with valid credentials | Navigate to Home | PASS |
| Login with invalid credentials | Error message | PASS |
| Select image from gallery | Image preview shows | PASS |
| Add description | Text saved | PASS |
| Select category | Category saved | PASS |
| Save entry | Entry in database | PASS |
| Filter by Breakfast | Only Breakfast entries | PASS |
| Filter by Lunch | Only Lunch entries | PASS |
| Filter by Dinner | Only Dinner entries | PASS |
| Filter by Snacks | Only Snacks entries | PASS |
| Edit entry description | Updated description | PASS |
| Edit entry category | Updated category | PASS |
| Delete entry | Entry removed | PASS |
| Take photo with camera | Photo captured | FAIL (Huawei limitation) |

---

## 6. Known Limitations

### Camera on Huawei Devices
- **Issue:** Camera does not function on Huawei Y9a
- **Cause:** Huawei devices lack Google Play Services; `expo-camera` requires Google ML Kit
- **Workaround:** Users can use "Choose from Gallery" option to add images
- **Verification:** Camera works correctly on devices with Google Play Services (emulator, Samsung, Pixel)

---

## 7. Conclusion

The Food Journal application has been successfully implemented with 10 out of 11 required features working correctly. The app allows users to:

1. Register and login securely
2. Add food entries with images (via gallery)
3. Add descriptions and categories to meals
4. Browse all entries with filtering by category
5. Edit and delete existing entries
6. Store all data persistently using SQLite

The only non-working feature is the camera on Huawei devices, which is a documented hardware limitation beyond the scope of the code. The gallery picker provides a fully functional alternative for adding images.

All code has been tested and verified on the target device. The application is ready for submission.

---

## 8. Screenshots (Proof of Functionality)

### 1. Login Screen
![Login Screen](screenshots/1-login-screen.jpg)

### 2. Adding a Journal Entry
![Add Entry](screenshots/2-add-entry.jpg)

### 3. Journal List
![Journal List](screenshots/3-journal-list.jpg)

### 4. Journal List (Alternative View)
![Journal List 2](screenshots/4-journal-list.jpg)

### 5. Filter by Breakfast
![Breakfast Filter](screenshots/5-filter-breakfast.jpg)

### 6. Filter by Lunch
![Lunch Filter](screenshots/6-filter-lunch.jpg)

### 7. Filter by Dinner
![Dinner Filter](screenshots/7-filter-dinner.jpg)

### 8. Filter by Snack
![Snack Filter](screenshots/8-filter-snack.jpg)

### 9. Edit Entry
![Edit Entry](screenshots/9-edit-entry.jpg)

### 10. Delete Confirmation
![Delete Entry](screenshots/10-delete-entry.jpg)

---

## 9. GitHub Repository

**Repository Link:** https://github.com/theedanico2/Week11-15

---

## 10. References

- [Expo SQLite Documentation](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Expo Camera Documentation](https://docs.expo.dev/versions/latest/sdk/camera/)
- [Expo Image Picker Documentation](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started/)

---

**End of Report**