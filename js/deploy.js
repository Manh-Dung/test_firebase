// DOM Elements for deployment
const deployBtn = document.getElementById('deploy-btn');
const deployStatus = document.getElementById('deploy-status');
const deployLog = document.getElementById('deploy-log');

// Function to deploy to Firebase
async function deployToFirebase() {
    if (!deployBtn || !deployStatus || !deployLog) {
        console.error('Missing deploy DOM elements');
        return;
    }
    
    // Show loading state
    deployBtn.disabled = true;
    deployBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deploying...';
    deployStatus.className = 'deploy-status';
    deployStatus.textContent = 'Deployment in progress. This may take a few minutes...';
    deployStatus.style.display = 'block';
    deployLog.textContent = '';
    deployLog.style.display = 'block';
    
    try {
        // We'll use the Fetch API to call a hypothetical deploy endpoint
        // In a real application, you would need a server-side component or Cloud Function
        // to execute the deploy_hosting.sh script
        
        // For demonstration purposes, we'll simulate a successful deployment
        // with a timeout
        setTimeout(() => {
            deployLog.textContent += 'Starting deployment to Firebase Hosting...\n';
            
            setTimeout(() => {
                deployLog.textContent += 'Building project...\n';
                
                setTimeout(() => {
                    deployLog.textContent += 'Deploying to Firebase...\n';
                    
                    setTimeout(() => {
                        // Check if connected to network before showing success
                        if (navigator.onLine) {
                            deployLog.textContent += 'Deployment successful!\n';
                            deployLog.textContent += 'Site URL: https://your-firebase-app.web.app\n';
                            
                            // Show success message
                            deployStatus.className = 'deploy-status success';
                            deployStatus.innerHTML = '<i class="fas fa-check-circle"></i> Deployment successful! Your site is now live.';
                        } else {
                            // Network error
                            throw new Error('Network connection lost. Please check your internet connection and try again.');
                        }
                        
                        // Reset button
                        deployBtn.disabled = false;
                        deployBtn.innerHTML = '<i class="fas fa-rocket"></i> Deploy to Firebase';
                    }, 2000);
                }, 1500);
            }, 1000);
        }, 1000);
        
        /* In a real implementation, you would use something like this:
        
        const response = await fetch('/api/deploy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Deployment failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            deployStatus.className = 'deploy-status success';
            deployStatus.innerHTML = `<i class="fas fa-check-circle"></i> ${result.message}`;
            deployLog.textContent = result.log;
        } else {
            throw new Error(result.message);
        }
        */
        
    } catch (error) {
        console.error('Deployment error:', error);
        
        // Determine the type of error for a more helpful message
        let errorMessage = error.message;
        
        if (!navigator.onLine) {
            errorMessage = 'Network connection lost. Please check your internet connection and try again.';
        } else if (error.code === 'ECONNREFUSED' || error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            errorMessage = 'Connection refused. The server may be down or unreachable.';
        } else if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
            errorMessage = 'Connection timed out. The server took too long to respond.';
        }
        
        // Show error message
        deployStatus.className = 'deploy-status error';
        deployStatus.innerHTML = `<i class="fas fa-exclamation-circle"></i> Deployment failed: ${errorMessage}`;
        
        // Add troubleshooting steps
        deployLog.textContent += '\nTroubleshooting steps:\n';
        deployLog.textContent += '1. Check your internet connection\n';
        deployLog.textContent += '2. Verify that you have proper Firebase permissions\n';
        deployLog.textContent += '3. Ensure firebase-tools is installed (run: npm install -g firebase-tools)\n';
        deployLog.textContent += '4. Try logging out and back in to Firebase (run: firebase logout then firebase login)\n';
        
        // Reset button
        deployBtn.disabled = false;
        deployBtn.innerHTML = '<i class="fas fa-rocket"></i> Retry Deployment';
    }
}

// Add click event to deploy button
if (deployBtn) {
    deployBtn.addEventListener('click', deployToFirebase);
}

// Optional: Add a real implementation using WebSockets for real-time logs
// This would require a server component that can stream the output of the deploy_hosting.sh script
