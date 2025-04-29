# FlavorForge API Documentation

Αυτό το έγγραφο περιγράφει τα διαθέσιμα API endpoints για την εφαρμογή FlavorForge.

**BaseURL:** `/api` (Όλα τα παρακάτω routes ξεκινούν μετά το `/api`)

---

## Authentication (Users - `/users`)

### 1. Register User

* **Route:** `/users/register`
* **Method:** `POST`
* **Description:** Δημιουργεί ένα νέο λογαριασμό χρήστη.
* **Access:** Public
* **Request Body:**
    ```json
    {
        "name": "String (Required)",
        "email": "String (Required, Unique, Valid Email Format)",
        "password": "String (Required, Min Length: 6)"
    }
    ```
* **Success Response:**
    * **Code:** `201 Created`
    * **Content:**
        ```json
        {
            "_id": "ObjectId",
            "name": "String",
            "email": "String",
            "message": "User registered successfully"
            // Δεν επιστρέφεται token ή password
        }
        ```
* **Error Responses:**
    * **Code:** `400 Bad Request` (π.χ., λείπουν πεδία, email υπάρχει ήδη, validation error)
        ```json
        { "message": "Please add all fields" }
        // or
        { "message": "User already exists with this email" }
        // or
        { "message": "Validation Error", "errors": { ... } }
        ```
    * **Code:** `500 Internal Server Error`
        ```json
        { "message": "Server Error during registration" }
        ```

### 2. Login User

* **Route:** `/users/login`
* **Method:** `POST`
* **Description:** Συνδέει έναν υπάρχοντα χρήστη και επιστρέφει ένα JWT token.
* **Access:** Public
* **Request Body:**
    ```json
    {
        "email": "String (Required)",
        "password": "String (Required)"
    }
    ```
* **Success Response:**
    * **Code:** `200 OK`
    * **Content:**
        ```json
        {
            "_id": "ObjectId",
            "name": "String",
            "email": "String",
            "token": "String (JWT Token)"
        }
        ```
* **Error Responses:**
    * **Code:** `400 Bad Request` (π.χ., λείπουν πεδία)
        ```json
        { "message": "Please provide email and password" }
        ```
    * **Code:** `401 Unauthorized` (Λάθος email ή password)
        ```json
        { "message": "Invalid email or password" }
        ```
    * **Code:** `500 Internal Server Error`
        ```json
        { "message": "Server Error during login" }
        ```

### 3. Get User Profile

* **Route:** `/users/profile`
* **Method:** `GET`
* **Description:** Επιστρέφει τα στοιχεία του προφίλ του συνδεδεμένου χρήστη, **συμπεριλαμβανομένων των στατιστικών παιχνιδοποίησης (gamification).**
* **Access:** Private (Απαιτείται Bearer Token στο `Authorization` header)
* **Request Body:** None
* **Success Response:**
    * **Code:** `200 OK`
    * **Content:** (**ΕΝΗΜΕΡΩΜΕΝΟ ΠΑΡΑΔΕΙΓΜΑ**)
        ```json
        {
            "_id": "ObjectId",
            "name": "String",
            "email": "String",
            "points": 115,
            "badges": ["First Recipe", "First Review"],
            "level": 2,
            "levelName": "Apprentice Chef",
            "progress": {
                 "currentLevelBasePoints": 50,
                 "pointsForNextLevel": 150
            },
            "createdAt": "Date"
            // Δεν επιστρέφεται το password
        }
        ```
* **Error Responses:**
    * **Code:** `401 Unauthorized` (Λείπει/Λάθος token, χρήστης δεν βρέθηκε από token)
        ```json
        { "message": "Not authorized, no token" }
        // or
        { "message": "Not authorized, token failed" }
        ```
    * **Code:** `404 Not Found` (Ο χρήστης του token διαγράφηκε;)
        ```json
        { "message": "User not found" }
        ```
    * **Code:** `500 Internal Server Error`
        ```json
        { "message": "Server Error fetching profile" }
        ```

---

## Recipes (`/recipes`)

### 1. Get All Recipes (with Filters)

* **Route:** `/recipes`
* **Method:** `GET`
* **Description:** Επιστρέφει μια λίστα με όλες τις συνταγές. Δέχεται προαιρετικές παραμέτρους query για αναζήτηση τίτλου και φιλτράρισμα κατηγορίας.
* **Access:** Public
* **Query Parameters:**
    * `search` (String, Optional): Φιλτράρει βάσει τίτλου (case-insensitive, partial match).
    * `category` (String, Optional): Φιλτράρει βάσει συγκεκριμένης κατηγορίας.
* **Request Body:** None
* **Success Response:**
    * **Code:** `200 OK`
    * **Content:** `[Recipe]` (Ένας πίνακας με αντικείμενα Recipe - βλ. παρακάτω για τη δομή του Recipe)
* **Error Responses:**
    * **Code:** `500 Internal Server Error`
        ```json
        { "message": "Server Error: Could not fetch recipes" }
        ```

## Recipes (`/recipes`)

### 2. Create Recipe

* **Route:** `/recipes`
* **Method:** `POST`
* **Description:** Δημιουργεί μια νέα συνταγή. **Σημείωση:** Η ενέργεια αυτή απονέμει πόντους και πιθανά badges ("First Recipe", "Master Chef") στον χρήστη.
* **Access:** Private (Απαιτείται Bearer Token)
* **Request Body:**
    ```json
    {
        "title": "String (Required)",
        "description": "String",
        "ingredients": ["String"],
        "steps": ["String"],
        "category": "String (Required, one of predefined enum values)"
    }
    ```
* **Success Response:**
    * **Code:** `201 Created`
    * **Content:** `Recipe` (Το αντικείμενο της συνταγής που δημιουργήθηκε - βλ. παρακάτω)
* **Error Responses:**
    * **Code:** `400 Bad Request` (Validation Error, λείπουν πεδία)
    * **Code:** `401 Unauthorized` (Λείπει/Λάθος token)
    * **Code:** `500 Internal Server Error`

### 3. Get Single Recipe

* **Route:** `/recipes/:id`
* **Method:** `GET`
* **Description:** Επιστρέφει τις λεπτομέρειες μιας συγκεκριμένης συνταγής βάσει του ID της.
* **Access:** Public
* **URL Parameters:**
    * `id` (ObjectId, Required): Το ID της συνταγής.
* **Request Body:** None
* **Success Response:**
    * **Code:** `200 OK`
    * **Content:** `Recipe` (Το αντικείμενο της συνταγής - βλ. παρακάτω)
* **Error Responses:**
    * **Code:** `400 Bad Request` (Λάθος μορφή ID)
        ```json
        { "message": "Invalid Recipe ID format" }
        ```
    * **Code:** `404 Not Found` (Η συνταγή δεν βρέθηκε)
        ```json
        { "message": "Recipe not found" }
        ```
    * **Code:** `500 Internal Server Error`
        ```json
        { "message": "Server Error: Could not fetch recipe" }
        ```

### 4. Update Recipe

* **Route:** `/recipes/:id`
* **Method:** `PUT`
* **Description:** Ενημερώνει μια υπάρχουσα συνταγή.
* **Access:** Private (Απαιτείται Bearer Token, Μόνο ο ιδιοκτήτης)
* **URL Parameters:**
    * `id` (ObjectId, Required): Το ID της συνταγής προς ενημέρωση.
* **Request Body:** (Περιέχει τα πεδία προς ενημέρωση)
    ```json
    {
        "title": "String (Required)",
        "description": "String",
        "ingredients": ["String"],
        "steps": ["String"],
        "category": "String (Required, one of predefined enum values)"
    }
    ```
* **Success Response:**
    * **Code:** `200 OK`
    * **Content:** `Recipe` (Το αντικείμενο της ενημερωμένης συνταγής - βλ. παρακάτω)
* **Error Responses:**
    * **Code:** `400 Bad Request` (Validation Error, Λάθος μορφή ID)
    * **Code:** `401 Unauthorized` (Λείπει/Λάθος token, Δεν είναι ο ιδιοκτήτης)
    * **Code:** `404 Not Found` (Η συνταγή δεν βρέθηκε)
    * **Code:** `500 Internal Server Error`
        ```json
        { "message": "Server Error: Could not update recipe" }
        ```

### 5. Delete Recipe

* **Route:** `/recipes/:id`
* **Method:** `DELETE`
* **Description:** Διαγράφει μια συνταγή.
* **Access:** Private (Απαιτείται Bearer Token, Μόνο ο ιδιοκτήτης)
* **URL Parameters:**
    * `id` (ObjectId, Required): Το ID της συνταγής προς διαγραφή.
* **Request Body:** None
* **Success Response:**
    * **Code:** `200 OK`
    * **Content:**
        ```json
        { "message": "Recipe removed successfully" }
        ```
* **Error Responses:**
    * **Code:** `400 Bad Request` (Λάθος μορφή ID)
    * **Code:** `401 Unauthorized` (Λείπει/Λάθος token, Δεν είναι ο ιδιοκτήτης)
    * **Code:** `404 Not Found` (Η συνταγή δεν βρέθηκε)
    * **Code:** `500 Internal Server Error`
        ```json
        { "message": "Server Error: Could not delete recipe" }
        ```

### 6. Add Recipe Review

* **Route:** `/recipes/:id/reviews`
* **Method:** `POST`
* **Description:** Προσθέτει μια νέα αξιολόγηση/σχόλιο σε μια συνταγή. **Σημείωση:** Η ενέργεια αυτή απονέμει πόντους και πιθανά badges ("First Review", Level Up) στον χρήστη που κάνει την αξιολόγηση. Επίσης, μπορεί να απονείμει πόντους/badges ("Popular Plate") στον ιδιοκτήτη της συνταγής αν πληρούνται συγκεκριμένα κριτήρια.
* **Access:** Private (Απαιτείται Bearer Token)
* **URL Parameters:**
    * `id` (ObjectId, Required): Το ID της συνταγής που αξιολογείται.
* **Request Body:**
    ```json
    {
        "rating": "Number (Required, 1-5)",
        "comment": "String (Required)"
    }
    ```
* **Success Response:**
    * **Code:** `201 Created`
    * **Content:**
        ```json
        { "message": "Review added successfully" }
        ```
      **Σημείωση:** Δεν επιστρέφεται το πλήρες αντικείμενο της συνταγής μετά την προσθήκη αξιολόγησης.
* **Error Responses:**
    * **Code:** `400 Bad Request` (Validation Error, User already reviewed, etc.)
    * **Code:** `401 Unauthorized` (Λείπει/Λάθος token)
    * **Code:** `404 Not Found` (Η συνταγή δεν βρέθηκε)
    * **Code:** `500 Internal Server Error`

---

## Recipe Object Structure

Ένα τυπικό αντικείμενο `Recipe` που επιστρέφεται από το API έχει την παρακάτω μορφή:

```json
{
    "_id": "ObjectId",
    "title": "String",
    "description": "String",
    "ingredients": ["String"],
    "steps": ["String"],
    "category": "String",
    "user": "ObjectId" or { "_id": "ObjectId", "name": "String" }, // Ανάλογα αν γίνεται populate
    "reviews": [
        {
            "_id": "ObjectId",
            "name": "String",
            "rating": Number,
            "comment": "String",
            "user": "ObjectId", // ή object αν γίνεται populate
            "createdAt": "Date",
            "updatedAt": "Date"
        }
    ],
    "rating": Number, // Μέση βαθμολογία
    "numReviews": Number, // Πλήθος αξιολογήσεων
    "createdAt": "Date",
    "updatedAt": "Date",
    "__v": Number
}
