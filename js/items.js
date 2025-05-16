// DOM Elements - Items related
const dataInput = document.getElementById('data-input');
const addDataBtn = document.getElementById('add-data-btn');
const dataList = document.getElementById('data-list');

// Get firebase services without redeclaring
const itemsAuth = window.firebaseServices.auth;
const itemsDB = window.firebaseServices.db;
const itemsFirebase = window.firebaseServices.firebase;

// Firestore - Add item
addDataBtn.addEventListener('click', () => {
    const text = dataInput.value.trim();
    if (!text) return;

    const user = itemsAuth.currentUser;
    if (!user) {
        alert('You must be logged in to add items.');
        return;
    }

    itemsDB.collection('items').add({
        text: text,
        userId: user.uid,
        createdAt: itemsFirebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        dataInput.value = '';
        console.log('Item added successfully!');
    })
    .catch((error) => {
        console.error('Error adding item:', error);
        alert(`Failed to add item: ${error.message}`);
    });
});

// Firestore - Load items
function loadItems(userId) {
    itemsDB.collection('items')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            dataList.innerHTML = '';
            snapshot.forEach((doc) => {
                const item = doc.data();
                displayItem(item, doc.id);
            });
        });
}

// Display a single item
function displayItem(item, itemId) {
    const li = document.createElement('li');
    li.innerHTML = `
        <span>${item.text}</span>
        <button class="delete-btn" data-id="${itemId}">Delete</button>
    `;
    dataList.appendChild(li);

    // Add delete event listener
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        deleteItem(itemId);
    });
}

// Firestore - Delete item
function deleteItem(id) {
    itemsDB.collection('items').doc(id).delete()
        .then(() => {
            console.log('Item deleted successfully!');
        })
        .catch((error) => {
            console.error('Error deleting item:', error);
            alert(`Failed to delete item: ${error.message}`);
        });
}

// Export functions
window.dataLoader = window.dataLoader || {};
window.dataLoader.loadItems = loadItems;
