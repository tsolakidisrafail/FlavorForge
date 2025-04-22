# FlavorForge 🍳

## Περιγραφή

FlavorForge: Μια διαδικτυακή πλατφόρμα για δημιουργία, αναζήτηση, κοινοποίηση και αξιολόγηση συνταγών μαγερικής, με στοιχεία gamification.
Αναπτύχθηκε ως ατομική εργασία εξαμήνου για το μάθημα "Ανάπτυξη Εφαρμογών Ιστού & Βάσεων Δεδομένων" του τμήματος Πληροφορικής & Τηλεπικοινωνιών, Πανεπιστήμιο Ιωαννίνων [2025](cite: 1).

## Βασικές Λειτουργίες

* [x] Δημιουργία συνταγών με βήματα και υλικά ([πηγή: 5])
* [x] Εμφάνιση λίστας συνταγών
* [x] Εμφάνιση λεπτομερειών συνταγής
* [ ] Κατηγοριοποίηση και αναζήτηση συνταγών ([πηγή: 5])
* [ ] Σύστημα αξιολόγησης και σχολίων ([πηγή: 5])
* [ ] Βασική διαχείριση χρηστών ([πηγή: 7])
* [ ] Προσαρμογή μερίδων και μονάδων μέτρησης ([πηγή: 5])
* [ ] Δημιουργία εβδομαδιαίου πλάνου γευμάτων ([πηγή: 5])
* [ ] Ενσωμάτωση τουλάχιστον 2 στοιχείων παιχνιδοποίησης ([πηγή: 12])

## Τεχνολογίες

* **Frontend:** React (με Vite), React Router
* **Backend:** Node.js, Express.js
* **Βάση Δεδομένων:** MongoDB (με Mongoose)
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
      ```

      *(Αντικατέστησε τα `<...>` με τα δικά σου στοιχεία).*
   * **Σημαντικό:** Βεβαιώσου ότι το αρχείο `.env` έχει προστεθεί στο `.gitignore` για να μην ανέβει στο GitHub.

5. **Εκκίνηση Backend Server:**
   * Από τον φάκελο `backend`, τρέξε:

    ```bash
    npm run dev
    ```

   * Ο server θα πρέπει να τρέχει στο `http://localhost:5173` (ή όποιο port σου δώσει το Vite).

## Χρήση

Αφού ξεκινήσεις και τους δύο servers, άνοιξε το `http://localhost:5173` στον browser σου για να δεις την εφαρμογή.

## API Endpoints

* `GET /api/recipes`: Επιστρέφει όλες τις συνταγές.
* `POST /api/recipes`: Δημιουργεί μια νέα συνταγή.
* `GET /api/recipes/:id`: Επιστρέφει τις λεπτομέρειες μιας συγκεκριμένης συνταγής.

## Σχήμα Βάσης Δεδομένων (MongoDB Collections)

* **`recipes`:**
* `title`: String (Required)
* `description`: String
* `ingredients`: [String]
* `steps`: [String]
* `createdAt`: Date (Default: Date.now)
* `user`: ObjectId (Ref: 'User', Optional for now)

## Άδεια Χρήσης

Αυτό το project χρησιμοποιεί την άδεια MIT License.

## Συντελεστής

* **Όνομα:** Ραφαήλ Τσολακίδης (tsolakidisrafail)
* **Μάθημα:** Ανάπτυξη Εφαρμογών Ιστού & Βάσεων Δεδομένων
* **Ίδρυμα:** Πανεπιστήμιο Ιωαννίνων, Τμήμα Πληροφορικής & Τηλεπικοινωνιών

---
