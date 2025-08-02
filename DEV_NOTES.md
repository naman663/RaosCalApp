# DEV_NOTES.md

## 📱 Calorie Tracking App – Developer Notes

> Mobile nutrition logging app built with **React Native + Expo**, intended for private distribution to friends and family. Designed for usability, speed, and offline-first logging of foods, meals, and fast food items. Long-term vision includes advanced features like smart food scale integration and full nutrition automation.

---

## ✅ CURRENTLY IMPLEMENTED

### 1. **Food Logging**
- Manual entry of new foods and ingredients.
- Selection and reuse of existing logged foods.
- Daily calorie/macro tracking with basic persistence.

### 2. **Barcode Scanner**
- Using `expo-camera` to scan food packages.
- Parsed results autofill logging forms for fast tracking.

### 3. **Meal Creation**
- Users can create a meal by combining foods via a dedicated modal.
- Foods can be added to a pending meal list separately from the regular calorie log.
- Data stored via `AsyncStorage`.

### 4. **USDA Food Search**
- Allows searching the USDA food database by name.
- Returns results which can be selected and logged.

### 5. **Persistent Database**
- Foods and meals saved locally using AsyncStorage.
- Foods unused for 6+ months planned for purge (future).

---

## 🔄 Reacquaint Yourself With the Codebase

> 🚨 **High Priority:** Before building more features or polishing UI, take time to **thoroughly revisit the code** related to your core app functionality:
- Logging flows (new/existing foods & meals)
- Barcode scanning
- USDA search integration
- AsyncStorage persistence logic
- Modal visibility and state transitions

This will help you **quickly get up to speed**, regain confidence in your architecture, and make it easier to refactor or extend features going forward. You’ll feel reinvigorated once you're fully reconnected with how everything fits together.

---

## 🧩 FEATURES TO FINALIZE (Beginner App Release Goals)

> These are the essential features to implement before sharing the app privately with friends and family.

### 1. 🔘 Button Functionality – Finalize All Logging Routes
- [ ] Fully working logic for:
  - Logging new foods
  - Logging existing foods
  - Logging new meals
  - Logging existing meals

### 2. 🔍 Search Food UI + Accuracy Improvements
- [ ] Improve performance and filtering of USDA food search.
- [ ] Fix issue with many food entries returning invalid/incomplete results.
- [ ] Consider integrating another food database/API (e.g., Open Food Facts, Edamam).
- [ ] Explore UI fixes (like debounce, default sorting, smart ranking of results).

### 3. 📷 Barcode Scanner – Robustness & Coverage
- [ ] Confirm it works consistently for most commercial food products.
- [ ] Improve error handling for unrecognized barcodes.

### 4. 🍔 Fast Food & Restaurant Logging
- [ ] New modal or route for fast food/restaurant logging.
- [ ] User types name of restaurant (e.g., “Chipotle”).
  - [ ] If available: display menu or fetch menu from their website.
  - [ ] If not available: notify user and fallback to manual entry.
- [ ] Plan: integrate external APIs or scrape nutrition data (or link to site view inside modal).

### 5. 🎨 UI/UX Polish
- [ ] Improve app appearance using better styling and third-party UI libraries (e.g., React Native Paper, NativeBase).
- [ ] Add spacing, typography, and layout polish for iOS/Android consistency.

### 6. 📝 Intro + Feedback
- [ ] Add **app intro/tutorial** for first-time users.
- [ ] Add a **feedback form** inside settings or at end of first week of use.

### 7. 📦 GitHub Integration
- [x] Start using Git with private repo (in progress).
- [ ] Keep developer notes and versioned updates.
- [ ] Write a clear and concise `README.md` before launching beginner version.
- [ ] Prep for future collaborator-friendly structure.

---

## 🚀 FUTURE ROADMAP (Advanced Version Ideas)

> These features are not required for the initial release, but serve as a long-term vision for a powerful, automated tracking experience.

### 1. ⚖️ Food Scale Integration (Camera-Based)
- [ ] Add feature where the barcode scanner can also scan the **weight from a digital food scale** (via OCR or screen scraping).
- [ ] Log food amount based on scanned number and auto-adjust macros accordingly.

### 2. 🔗 Smart Scale (Bluetooth Integration)
- [ ] Allow app to connect with **smart Bluetooth scales**.
- [ ] Automatically log food based on real-time scale measurements, no camera required.
- [ ] Explore integration options with commercial smart food scales (e.g., Renpho, Etekcity).

### 3. 🐛 Ongoing Bug Fixes + Feedback Loop
- [ ] Use feedback form responses to prioritize future improvements.
- [ ] Track bugs from beginner version and ship bugfix updates.

### 4. 🧠 Fitness Tabs (Future Expansion)
- [ ] Add optional new tabs for:
  - Workout tracking
  - Goal setting (e.g., weight loss/gain)
  - Progress visualizations
- [ ] Calorie tracking will remain the core focus until fully matured.

---

## 📅 Development Timeline Reference

- **May–July 2025**: Core features built (logging, barcode scan, search, meals)
- **July 2025**: Planning UI improvements, GitHub setup, and goal setting for beginner app version
- **Next Step**: Complete remaining feature items in the "Beginner App Release Goals" section

---

> ✅ Tip: Revisit this doc each week to update what's completed, what's in progress, and to re-clarify your priorities. Helps reduce burnout and maintain vision clarity.
