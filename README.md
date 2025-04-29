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
* [x] Κατηγοριοποίηση συνταγών
* [ ] Προσαρμογή μερίδων και μονάδων μέτρησης
* [ ] Δημιουργία εβδομαδιαίου πλάνου γευμάτων
* [x] Ενσωμάτωση τουλάχιστον 2 στοιχείων παιχνιδοποίησης
* [x] Βελτιώσεις UI/UX (MUI Forms, Responsive Design, Styling)
* [x] Τελική Τεκμηρίωση (API docs, DB Schema refinement)

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

**Recipes:**

* `GET /api/recipes?search=...&category=...`: Λίστα συνταγών (με φίλτρα αναζήτησης τίτλου και κατηγορίας)
* `POST /api/recipes`: Δημιουργία νέας συνταγής (Protected)
* `GET /api/recipes/:id`: Λεπτομέρειες μίας συνταγής
* `PUT /api/recipes/:id`: Ενημέρωση συνταγής (Protected, Owner only)
* `DELETE /api/recipes/:id`: Διαγραφή συνταγής (Protected, Owner only)
* `POST /api/recipes/:id/reviews`: Προσθήκη αξιολόγησης (Protected)

**Users:**

* `POST /api/users/register`: Εγγραφή νέου χρήστη
* `POST /api/users/login`: Σύνδεση χρήστη (επιστρέφει token)
* `GET /api/users/profile`: Λήψη προφίλ συνδεδεμένου χρήστη (Protected)

## Άδεια Χρήσης

Αυτό το project χρησιμοποιεί την άδεια MIT License.

## Συντελεστής

* **Όνομα:** Ραφαήλ Τσολακίδης (tsolakidisrafail)
* **Μάθημα:** Ανάπτυξη Εφαρμογών Ιστού & Βάσεων Δεδομένων
* **Ίδρυμα:** Πανεπιστήμιο Ιωαννίνων, Τμήμα Πληροφορικής & Τηλεπικοινωνιών

---

## Σχήμα Βάσης Δεδομένων (MongoDB)

Η βάση δεδομένων MongoDB αποτελείται από τα παρακάτω κύρια collections:

### 1. `users` Collection

Αποθηκεύει τις πληροφορίες των εγγεγραμμένων χρηστών.

| Πεδίο      | Τύπος    | Περιγραφή / Περιορισμοί                                      |
| :--------- | :------- | :----------------------------------------------------------- |
| `_id`      | ObjectId | Μοναδικό ID που δίνεται αυτόματα από τη MongoDB.             |
| `name`     | String   | Όνομα χρήστη (Required).                                     |
| `email`    | String   | Email χρήστη (Required, Unique, Έλεγχος μορφής).             |
| `password` | String   | Κρυπτογραφημένος (hashed) κωδικός (Required, Minlength: 6, Δεν επιστρέφεται από default - `select: false`). |
| `points`   | Number   | Πόντοι από gamification (Default: 0).                        |
| `badges`   | [String] | Πίνακας με τα ονόματα των badges που έχει ο χρήστης (Default: []). |
| `level`    | Number   | Επίπεδο χρήστη βάσει πόντων (Default: 1). |
| `createdAt`| Date     | Ημερομηνία/ώρα δημιουργίας (Αυτόματο, Default: Date.now).    |
| `updatedAt`| Date     | Ημερομηνία/ώρα τελευταίας ενημέρωσης (Αυτόματο, από timestamps). |

* **Σχέσεις:** Δεν έχει άμεσες αναφορές *προς* άλλα collections.

### 2. `recipes` Collection

Αποθηκεύει τις πληροφορίες για κάθε συνταγή.

| Πεδίο        | Τύπος             | Περιγραφή / Περιορισμοί                                      |
| :----------- | :---------------- | :----------------------------------------------------------- |
| `_id`        | ObjectId          | Μοναδικό ID που δίνεται αυτόματα από τη MongoDB.             |
| `title`      | String            | Τίτλος συνταγής (Required).                                  |
| `description`| String            | Περιγραφή συνταγής (Optional).                               |
| `ingredients`| [String]          | Πίνακας με τα συστατικά (Optional).                          |
| `steps`      | [String]          | Πίνακας με τα βήματα εκτέλεσης (Optional).                   |
| `category`   | String            | Κατηγορία συνταγής (Required, Enum: ['Ορεκτικό', 'Κυρίως Πιάτο', 'Σαλάτα', 'Σούπα', 'Γλυκό', 'Ρόφημα', 'Άλλο']). |
| `user`       | ObjectId          | Το ID του χρήστη που δημιούργησε τη συνταγή (Required, `ref: 'User'`). |
| `reviews`    | [Review SubDoc] | Πίνακας με τις αξιολογήσεις/σχόλια (βλ. παρακάτω).             |
| `rating`     | Number            | Μέση βαθμολογία από τα reviews (Default: 0).                 |
| `numReviews` | Number            | Πλήθος αξιολογήσεων (Default: 0).                            |
| `createdAt`  | Date              | Ημερομηνία/ώρα δημιουργίας (Αυτόματο, Default: Date.now).    |
| `updatedAt`  | Date              | Ημερομηνία/ώρα τελευταίας ενημέρωσης (Αυτόματο, από timestamps). |

* **Σχέσεις:** Το πεδίο `user` συνδέεται με το `_id` του `users` collection.

#### Ενσωματωμένο Σχήμα: `reviews` Subdocument

Κάθε στοιχείο μέσα στον πίνακα `reviews` του `recipes` collection έχει την παρακάτω δομή:

| Πεδίο      | Τύπος    | Περιγραφή / Περιορισμοί                               |
| :--------- | :------- | :---------------------------------------------------- |
| `_id`      | ObjectId | Μοναδικό ID για το review (δίνεται αυτόματα).         |
| `name`     | String   | Όνομα χρήστη που έκανε το review (Required).          |
| `rating`   | Number   | Βαθμολογία (Required, 1-5).                           |
| `comment`  | String   | Το κείμενο του σχολίου (Required).                    |
| `user`     | ObjectId | Το ID του χρήστη που έκανε το review (Required, `ref: 'User'`). |
| `createdAt`| Date     | Ημερομηνία/ώρα δημιουργίας του review (Αυτόματο).     |
| `updatedAt`| Date     | Ημερομηνία/ώρα τελευταίας ενημέρωσης του review (Αυτόματο). |

* **Σχέσεις:** Το πεδίο `user` μέσα στο review συνδέεται με το `_id` του `users` collection.

---
