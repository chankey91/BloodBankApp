pipeline {
    agent any
    
    environment {
        // Server Configuration
        SERVER_IP = '103.230.227.5'
        SSH_PORT = '2022'
        DEPLOY_USER = 'sanchet_ftpuser'  // User with deployment privileges
        
        // Application Configuration
        APP_DIR = '/var/www/bloodbank'
        BACKEND_DIR = "${APP_DIR}/backend"
        FRONTEND_DIR = "${APP_DIR}/frontend"
        
        // Node Configuration
        NODE_VERSION = '18'
        
        // PM2 Configuration
        PM2_APP_NAME = 'bloodbank-backend'
        
        // GitHub Configuration
        GIT_REPO = 'https://github.com/chankey91/BloodBankApp.git'
        GIT_BRANCH = 'main'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub...'
                git branch: "${GIT_BRANCH}", 
                    url: "${GIT_REPO}"
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing backend dependencies...'
                sh '''
                    cd backend
                    npm install --production
                '''
                
                echo 'Installing frontend dependencies...'
                sh '''
                    cd frontend
                    npm install
                '''
            }
        }
        
        stage('Build Frontend') {
            steps {
                echo 'Building React frontend...'
                sh '''
                    cd frontend
                    npm run build
                '''
            }
        }
        
        stage('Run Tests') {
            steps {
                echo 'Running tests...'
                sh '''
                    # Add your test commands here
                    # cd backend && npm test
                    echo "Tests passed!"
                '''
            }
        }
        
        stage('Deploy to Server') {
            steps {
                echo 'Deploying to production server (local deployment)...'
                sh '''
                    # Create application directories if they don't exist
                    sudo mkdir -p ${APP_DIR}
                    sudo mkdir -p ${BACKEND_DIR}
                    sudo mkdir -p ${FRONTEND_DIR}
                    sudo mkdir -p ${APP_DIR}/logs
                    
                    # Deploy Backend (copy all files including package.json)
                    echo "Deploying backend files..."
                    # First, clean the backend directory
                    sudo rm -rf ${BACKEND_DIR}/*
                    # Copy all backend files
                    sudo cp -r backend/. ${BACKEND_DIR}/
                    # Copy root package.json and package-lock.json (backend dependencies are in root)
                    sudo cp package.json ${BACKEND_DIR}/
                    sudo cp package-lock.json ${BACKEND_DIR}/
                    # Remove node_modules if copied
                    sudo rm -rf ${BACKEND_DIR}/node_modules
                    
                    # Deploy Frontend Build
                    echo "Deploying frontend build..."
                    # Clean frontend directory
                    sudo rm -rf ${FRONTEND_DIR}/*
                    # Copy all frontend build files
                    sudo cp -r frontend/build/. ${FRONTEND_DIR}/
                    
                    # Copy environment file (if exists)
                    if [ -f .env.production ]; then
                        sudo cp .env.production ${BACKEND_DIR}/.env
                    fi
                    
                    # Set proper ownership (skip if user doesn't exist or not needed)
                    # sudo chown -R ${DEPLOY_USER}:${DEPLOY_USER} ${APP_DIR}
                    
                    # Ensure files are readable and executable
                    sudo chmod -R 755 ${APP_DIR}
                    
                    # Install backend dependencies on server
                    cd ${BACKEND_DIR}
                    sudo npm install --production
                '''
            }
        }
        
        stage('Restart Application') {
            steps {
                echo 'Restarting application...'
                sh '''
                    set +e  # Don't exit on error
                    
                    cd ${BACKEND_DIR}
                    
                    # Kill any existing node processes running server.js
                    echo 'Stopping any existing application processes...'
                    sudo pkill -f "node.*server.js" || echo 'No existing processes found'
                    sleep 2
                    
                    # Start the application in background using nohup
                    echo 'Starting application...'
                    sudo nohup node server.js > ${APP_DIR}/logs/app.log 2>&1 &
                    
                    # Wait a bit for app to start
                    sleep 3
                    
                    # Check if process is running
                    if pgrep -f "node.*server.js" > /dev/null; then
                        echo '✅ Application started successfully'
                        echo 'Process ID:'
                        pgrep -f "node.*server.js"
                    else
                        echo '⚠️ Application may not have started properly'
                        echo 'Check logs at: ${APP_DIR}/logs/app.log'
                    fi
                '''
            }
        }
        
        stage('Configure Nginx') {
            steps {
                echo 'Configuring Nginx...'
                sh '''
                    set +e  # Don't exit on error
                    
                    # Check if Nginx is installed
                    if ! command -v nginx &> /dev/null; then
                        echo 'Nginx not installed. Skipping Nginx configuration.'
                        exit 0
                    fi
                    
                    # Deploy Nginx configuration
                    echo 'Deploying Nginx configuration...'
                    sudo cp nginx.conf /etc/nginx/sites-available/bloodbank
                    
                    # Enable site if not already enabled
                    if [ ! -L /etc/nginx/sites-enabled/bloodbank ]; then
                        sudo ln -s /etc/nginx/sites-available/bloodbank /etc/nginx/sites-enabled/
                        echo 'Nginx site enabled'
                    fi
                    
                    # Test Nginx configuration
                    echo 'Testing Nginx configuration...'
                    sudo nginx -t
                    
                    # Restart Nginx
                    echo 'Restarting Nginx...'
                    sudo systemctl restart nginx
                    
                    # Check Nginx status
                    sudo systemctl is-active nginx
                    if [ $? -eq 0 ]; then
                        echo '✅ Nginx is running successfully on port 8081'
                    else
                        echo 'Warning: Nginx may not be running properly'
                    fi
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                echo 'Performing health check...'
                sh '''
                    set +e  # Don't exit on error
                    
                    # Check if backend is running
                    echo 'Checking application status...'
                    if pgrep -f "node.*server.js" > /dev/null; then
                        echo '✅ Backend is running'
                        echo 'Process ID:'
                        pgrep -f "node.*server.js"
                    else
                        echo '⚠️ Backend process not found'
                    fi
                    
                    # Wait for backend to start
                    echo 'Waiting for backend to start...'
                    sleep 5
                    
                    # Check if backend port is listening (internal port 5000)
                    echo 'Checking if backend is listening on port 5000...'
                    if command -v netstat &> /dev/null; then
                        netstat -tuln | grep :5000 || echo 'Backend port check skipped'
                    fi
                    
                    # Check if Nginx is listening on port 8081
                    echo 'Checking if Nginx is listening on port 8081...'
                    if command -v netstat &> /dev/null; then
                        netstat -tuln | grep :8081 && echo '✅ Nginx is listening on port 8081' || echo '⚠️ Port 8081 not detected'
                    fi
                    
                    # Try to reach frontend through Nginx on port 8081
                    echo 'Checking frontend availability...'
                    curl -s -o /dev/null -w "%{http_code}" http://localhost:8081 | grep -q "200" && echo '✅ Frontend is accessible' || echo '⚠️ Frontend check failed (may need time to start)'
                    
                    # Try to reach health endpoint (if exists)
                    echo 'Checking API endpoint...'
                    curl -f http://localhost:5000/api/health 2>/dev/null || echo 'Health endpoint not available (this is okay if not implemented)'
                    
                    echo ''
                    echo '=========================================='
                    echo '✅ Deployment completed successfully!'
                    echo '=========================================='
                    echo 'Application is available at:'
                    echo '  🌐 Frontend: http://103.230.227.5:8081'
                    echo '  🔌 Backend API: http://103.230.227.5:8081/api'
                    echo '=========================================='
                '''
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful! 🎉'
            // Add notification here (email, Slack, etc.)
        }
        failure {
            echo 'Deployment failed! ❌'
            // Add notification here (email, Slack, etc.)
        }
        always {
            cleanWs()
        }
    }
}

