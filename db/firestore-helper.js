/**
 * Firebase Database Helper
 * 
 * This script provides utility functions for interacting with Firebase Firestore
 * and simplifies common database operations.
 */

// Check if Firebase services are initialized
if (!window.firebaseServices) {
  console.error('Firebase services are not initialized. Please make sure firebase-config.js is loaded first.');
}

// Firebase database helper class - only define if not already defined
if (!window.FirestoreHelper) {
  class FirestoreHelper {
    /**
     * Initialize the FirestoreHelper with Firestore database
     */
    constructor() {
      this.db = window.firebaseServices.db;
    }

  /**
   * Get all documents from a collection
   * @param {string} collectionName - Name of the collection
   * @returns {Promise} - Promise resolving to array of documents
   */
  async getAll(collectionName) {
    try {
      // Thêm timeout timeout cho request
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Database request took too long')), 30000)
      );
      
      // Promise.race để bắt lỗi timeout
      const snapshot = await Promise.race([
        this.db.collection(collectionName).get(),
        timeoutPromise
      ]);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Add document to a collection
   * @param {string} collectionName - Name of the collection
   * @param {Object} data - Document data
   * @returns {Promise} - Promise resolving to document reference
   */
  async add(collectionName, data) {
    try {
      return await this.db.collection(collectionName).add({
        ...data,
        createdAt: window.firebaseServices.firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get a document by id
   * @param {string} collectionName - Name of the collection
   * @param {string} id - Document id
   * @returns {Promise} - Promise resolving to document data
   */
  async getById(collectionName, id) {
    try {
      const doc = await this.db.collection(collectionName).doc(id).get();
      if (!doc.exists) {
        throw new Error(`Document not found in ${collectionName} with id: ${id}`);
      }
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Update a document
   * @param {string} collectionName - Name of the collection
   * @param {string} id - Document id
   * @param {Object} data - Updated data
   * @returns {Promise} - Promise resolving to update result
   */
  async update(collectionName, id, data) {
    try {
      return await this.db.collection(collectionName).doc(id).update({
        ...data,
        updatedAt: window.firebaseServices.firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   * @param {string} collectionName - Name of the collection
   * @param {string} id - Document id
   * @returns {Promise} - Promise resolving to delete result
   */
  async delete(collectionName, id) {
    try {
      return await this.db.collection(collectionName).doc(id).delete();
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Query documents with filters
   * @param {string} collectionName - Name of the collection
   * @param {Array} filters - Array of filter conditions, each being [field, operator, value]
   * @param {Object} options - Query options (orderBy, limit)
   * @returns {Promise} - Promise resolving to filtered documents
   */
  async query(collectionName, filters = [], options = {}) {
    try {
      let query = this.db.collection(collectionName);
      
      // Apply filters
      filters.forEach(([field, operator, value]) => {
        query = query.where(field, operator, value);
      });
      
      // Apply ordering if provided
      if (options.orderBy) {
        const [field, direction = 'asc'] = Array.isArray(options.orderBy) 
          ? options.orderBy 
          : [options.orderBy];
        query = query.orderBy(field, direction);
      }
      
      // Apply limit if provided
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error querying documents from ${collectionName}:`, error);
      throw error;
    }
  }
}

// Export the helper class only if not already defined
window.firestoreHelper = window.firestoreHelper || new FirestoreHelper();
}
