# FlavorForge 🍳

## Περιγραφή

FlavorForge: Μια διαδικτυακή πλατφόρμα για δημιουργία, αναζήτηση, κοινοποίηση και αξιολόγηση συνταγών μαγερικής, με στοιχεία gamification.
Αναπτύχθηκε ως ατομική εργασία εξαμήνου για το μάθημα "Ανάπτυξη Εφαρμογών Ιστού & Βάσεων Δεδομένων" του τμήματος Πληροφορικής & Τηλεπικοινωνιών, Πανεπιστήμιο Ιωαννίνων (2025).

## Βασικές Λειτουργίες

* [x] Δημιουργία συνταγών με βήματα και υλικά
* [x] Εμφάνιση λίστας συνταγών
* [x] Εμφάνιση λεπτομερειών συνταγής
* [x] Επεξεργασία συνταγής (από τον ιδιοκτήτη)
* [x] Διαγραφή συνταγής (από τον ιδιοκτήτη)
* [x] Αναζήτηση συνταγών (βάσει τίτλου)
* [x] Σύστημα αξιολόγησης και σχολίων (Υποβολή & Εμφάνιση)
* [x] Βασική διαχείριση χρηστών (Εγγραφή, Σύνδεση, Authentication/Authorization)
* [ ] Κατηγοριοποίηση συνταγών
* [ ] Προσαρμογή μερίδων και μονάδων μέτρησης
* [ ] Δημιουργία εβδομαδιαίου πλάνου γευμάτων
* [ ] Ενσωμάτωση τουλάχιστον 2 στοιχείων παιχνιδοποίησης
* [ ] Βελτιώσεις UI/UX (MUI Forms, Responsive Design, Styling)
* [ ] Τελική Τεκμηρίωση (API docs, DB Schema refinement)

## Τεχνολογίες

* **Frontend:** React (με Vite), React Router DOM, Material UI (MUI), Emotion
* **Backend:** Node.js, Express.js
* **Βάση Δεδομένων:** MongoDB (με Mongoose)
* **Authentication:** bcryptjs (Hashing), JSON Web Token (JWT)
* **Διαχείριση Περιβάλλοντος:** dotenv
* **Άλλα Εργαλεία:** nodemon, Postman (για testing)

## Εγκατάσταση & Εκτέλεση

Ακολούθησε τα παρακάτω βήματα για να τρέξεις το project τοπικά:

1. **Κλωνοποίηση του Repository:**

   ```bash
   git clone [https://github.com/tsolakidisrafail/FlavorForge.git](https://github.com/tsolakidisrafail/FlavorForge.git)
   cd FlavorForge
   ```

2. **Εγκατάσταση Dependencies του Backend:**

   ```bash
   cd backend
   npm install
   ```

3. **Εγκατάσταση Dependencies του Frontend:**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Ρύθμιση Μεταβλητών Περιβάλλοντος (Backend):**
   * Πήγαινε στον φάκελο `backend`.
   * Δημιούργησε ένα νέο αρχείο με όνομα `.env`.
   * Άνοιξε το `.env` και πρόσθεσε το Connection String σου από το MongoDB Atlas:

      ```bash
      MONGO_URI=mongodb+srv://<username>:<password>@<your-cluster-url>/<database-name>?retryWrites=true&w=majority
      JWT_SECRET=your_very_secure_and_random_secret_key # Άλλαξε το!
      JWT_EXPIRE=30d # Διάρκεια token
      ```

      *(Αντικατέστησε τα `<...>` με τα δικά σου στοιχεία).*
   * **Σημαντικό:** Βεβαιώσου ότι το αρχείο `.env` έχει προστεθεί στο `.gitignore` για να μην ανέβει στο GitHub.

5. **Εκκίνηση Backend Server:**
   * Από τον φάκελο `backend`, τρέξε:

    ```bash
    npm run dev
    ```

   * Ο server θα πρέπει να τρέχει στο `http://localhost:3001`.

6. **Εκκίνηση Frontend Development Server:**
   * Άνοιξε ένα **νέο terminal**.
   * Πήγαινε στον φάκελο `frontend`.
   * Τρέξε:

    ```bash
    npm run dev
    ```

   * Η εφαρμογή θα πρέπει να είναι προσβάσιμη στο `http://localhost:5173` (ή όποιο port σου δώσει το Vite).

## Χρήση

Αφού ξεκινήσεις και τους δύο servers, άνοιξε το `http://localhost:5173` στον browser σου για να δεις την εφαρμογή.

## API Endpoints

* **Recipes:**
* `GET /api/recipes?search=...`: Λίστα συνταγών (με φίλτρο αναζήτησης τίτλου)
* `POST /api/recipes`: Δημιουργία νέας συνταγής (Protected)
* `GET /api/recipes/:id`: Λεπτομέρειες μίας συνταγής
* `PUT /api/recipes/:id`: Ενημέρωση συνταγής (Protected, Owner only)
* `DELETE /api/recipes/:id`: Διαγραφή συνταγής (Protected, Owner only)
* `POST /api/recipes/:id/reviews`: Προσθήκη αξιολόγησης (Protected)
* **Users:**
* `POST /api/users/register`: Εγγραφή νέου χρήστη
* `POST /api/users/login`: Σύνδεση χρήστη (επιστρέφει token)
* `GET /api/users/profile`: Λήψη προφίλ συνδεδεμένου χρήστη (Protected)

## Σχήμα Βάσης Δεδομένων (MongoDB Collections)

* **`users`:**
* `name`: String (Required)
* `email`: String (Required, Unique)
* `password`: String (Required, Hashed, Minlength 6, Not selected by default)
* `createdAt`: Date (Default: Date.now)
* **`recipes`:**
* `title`: String (Required)
* `description`: String
* `ingredients`: [String]
* `steps`: [String]
* `user`: ObjectId (Ref: 'User', Required)
* `reviews`: [Subdocument]
* `name`: String (Required)
* `rating`: Number (Required)
* `comment`: String (Required)
* `user`: ObjectId (Ref: 'User', Required)
* `createdAt`, `updatedAt`: Timestamps
* `rating`: Number (Default: 0) - Μέση Βαθμολογία
* `numReviews`: Number (Default: 0) - Πλήθος Αξιολογήσεων
* `createdAt`, `updatedAt`: Timestamps

## Άδεια Χρήσης

Αυτό το project χρησιμοποιεί την άδεια MIT License.

## Συντελεστής

* **Όνομα:** Ραφαήλ Τσολακίδης (tsolakidisrafail)
* **Μάθημα:** Ανάπτυξη Εφαρμογών Ιστού & Βάσεων Δεδομένων
* **Ίδρυμα:** Πανεπιστήμιο Ιωαννίνων, Τμήμα Πληροφορικής & Τηλεπικοινωνιών

---
