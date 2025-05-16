// Firebase database utilities
class FirebaseDB {
    constructor() {
        this.db = window.firebaseServices.db;
        
        // Set up Firestore persistence to work offline
        this.setupPersistence();
    }
    
    /**
     * Setup Firestore persistence for offline capabilities
     */
    setupPersistence() {
        // Enable offline persistence
        this.db.enablePersistence({ synchronizeTabs: true })
            .then(() => {
                console.log('Firestore persistence enabled successfully');
            })
            .catch((err) => {
                if (err.code === 'failed-precondition') {
                    // Multiple tabs open, persistence can only be enabled in one tab
                    console.warn('Persistence failed: Multiple tabs open');
                    if (window.errorUtils && window.errorUtils.showError) {
                        window.errorUtils.showError('Không thể kích hoạt chế độ ngoại tuyến vì có nhiều tab đang mở');
                    }
                } else if (err.code === 'unimplemented') {
                    // The browser doesn't support persistence
                    console.warn('Persistence not supported by this browser');
                } else {
                    console.error('Persistence error:', err);
                }
            });
    }

    /**
     * Get a collection reference
     * @param {string} collectionName - The collection name
     * @returns {Object} Firestore collection reference
     */
    getCollection(collectionName) {
        return this.db.collection(collectionName);
    }

    /**
     * Add a document to a collection
     * @param {string} collectionName - The collection name
     * @param {Object} data - Document data
     * @returns {Promise} Promise with the document reference
     */
    addDocument(collectionName, data) {
        return this.db.collection(collectionName).add(data);
    }

    /**
     * Get a document by ID
     * @param {string} collectionName - The collection name
     * @param {string} documentId - The document ID
     * @returns {Promise} Promise with the document data
     */
    getDocument(collectionName, documentId) {
        return this.db.collection(collectionName).doc(documentId).get();
    }

    /**
     * Update a document
     * @param {string} collectionName - The collection name
     * @param {string} documentId - The document ID
     * @param {Object} data - Update data
     * @returns {Promise} Promise with the update result
     */
    updateDocument(collectionName, documentId, data) {
        return this.db.collection(collectionName).doc(documentId).update(data);
    }

    /**
     * Delete a document
     * @param {string} collectionName - The collection name
     * @param {string} documentId - The document ID
     * @returns {Promise} Promise with the delete result
     */
    deleteDocument(collectionName, documentId) {
        return this.db.collection(collectionName).doc(documentId).delete();
    }
}

// Export the class
window.FirebaseDB = FirebaseDB;
