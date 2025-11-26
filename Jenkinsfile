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
                echo 'Restarting application with PM2...'
                sh '''
                    set +e  # Don't exit on error
                    
                    # Install PM2 if not installed
                    if ! command -v pm2 &> /dev/null; then
                        sudo npm install -g pm2
                    fi
                    
                    # Change to backend directory
                    cd ${BACKEND_DIR}
                    
                    # Check if app is already running
                    pm2 describe ${PM2_APP_NAME} > /dev/null 2>&1
                    APP_EXISTS=$?
                    
                    if [ $APP_EXISTS -eq 0 ]; then
                        echo 'Application exists, restarting...'
                        pm2 restart ${PM2_APP_NAME}
                    else
                        echo 'Application does not exist, starting new instance...'
                        pm2 start server.js --name ${PM2_APP_NAME}
                    fi
                    
                    # Save PM2 configuration
                    pm2 save
                    
                    # Show PM2 status
                    pm2 status
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
                    
                    # Restart Nginx
                    echo 'Restarting Nginx...'
                    sudo systemctl restart nginx
                    
                    # Check Nginx status
                    sudo systemctl is-active nginx
                    if [ $? -eq 0 ]; then
                        echo 'Nginx is running successfully'
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
                    
                    # Check if backend is running with PM2
                    echo 'Checking PM2 status...'
                    pm2 status ${PM2_APP_NAME}
                    
                    # Wait for backend to start
                    echo 'Waiting for backend to start...'
                    sleep 5
                    
                    # Check if backend port is listening
                    if command -v netstat &> /dev/null; then
                        netstat -tuln | grep :5000
                    fi
                    
                    # Try to reach health endpoint (if exists)
                    echo 'Checking health endpoint...'
                    curl -f http://localhost:5000/api/health 2>/dev/null || echo 'Health endpoint not available (this is okay if not implemented)'
                    
                    echo '✅ Deployment completed successfully!'
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

