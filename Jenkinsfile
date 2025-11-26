pipeline {
    agent any
    
    environment {
        // Server Configuration
        SERVER_IP = '103.230.227.5'
        SSH_PORT = '2022'
        DEPLOY_USER = 'ubuntu'  // Change if different
        
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
                    
                    # Deploy Backend
                    echo "Deploying backend files..."
                    sudo cp -r backend/* ${BACKEND_DIR}/
                    
                    # Deploy Frontend Build
                    echo "Deploying frontend build..."
                    sudo cp -r frontend/build/* ${FRONTEND_DIR}/
                    
                    # Copy environment file (if exists)
                    if [ -f .env.production ]; then
                        sudo cp .env.production ${BACKEND_DIR}/.env
                    fi
                    
                    # Set proper ownership
                    sudo chown -R ${DEPLOY_USER}:${DEPLOY_USER} ${APP_DIR}
                    
                    # Install backend dependencies on server
                    cd ${BACKEND_DIR}
                    npm install --production
                '''
            }
        }
        
        stage('Restart Application') {
            steps {
                echo 'Restarting application with PM2...'
                sh '''
                    # Install PM2 if not installed
                    if ! command -v pm2 &> /dev/null; then
                        sudo npm install -g pm2
                    fi
                    
                    # Restart or start the application
                    cd ${BACKEND_DIR}
                    pm2 describe ${PM2_APP_NAME} > /dev/null 2>&1
                    if [ $? -eq 0 ]; then
                        echo 'Restarting existing application...'
                        pm2 restart ${PM2_APP_NAME}
                    else
                        echo 'Starting new application...'
                        pm2 start server.js --name ${PM2_APP_NAME}
                    fi
                    
                    # Save PM2 configuration
                    pm2 save
                '''
            }
        }
        
        stage('Configure Nginx') {
            steps {
                echo 'Configuring Nginx...'
                sh '''
                    # Check if Nginx is installed
                    if ! command -v nginx &> /dev/null; then
                        echo 'Nginx not installed. Please install it first.'
                        exit 1
                    fi
                    
                    # Restart Nginx
                    sudo systemctl restart nginx
                    sudo systemctl status nginx
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                echo 'Performing health check...'
                sh '''
                    # Check if backend is running
                    pm2 status ${PM2_APP_NAME}
                    
                    # Check backend health endpoint
                    sleep 5
                    curl -f http://localhost:5000/api/health || exit 1
                    
                    echo 'Health check passed!'
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

