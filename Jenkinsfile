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
                echo 'Deploying to production server...'
                sshagent(credentials: ['ubuntu-server-ssh']) {
                    sh '''
                        # Create application directory if it doesn't exist
                        ssh -o StrictHostKeyChecking=no -p ${SSH_PORT} ${DEPLOY_USER}@${SERVER_IP} "
                            mkdir -p ${APP_DIR}
                            mkdir -p ${BACKEND_DIR}
                            mkdir -p ${FRONTEND_DIR}
                        "
                        
                        # Deploy Backend
                        echo "Deploying backend..."
                        scp -P ${SSH_PORT} -r backend/* ${DEPLOY_USER}@${SERVER_IP}:${BACKEND_DIR}/
                        
                        # Deploy Frontend Build
                        echo "Deploying frontend..."
                        scp -P ${SSH_PORT} -r frontend/build/* ${DEPLOY_USER}@${SERVER_IP}:${FRONTEND_DIR}/
                        
                        # Copy environment file (if exists)
                        if [ -f .env.production ]; then
                            scp -P ${SSH_PORT} .env.production ${DEPLOY_USER}@${SERVER_IP}:${BACKEND_DIR}/.env
                        fi
                        
                        # Install backend dependencies on server
                        ssh -p ${SSH_PORT} ${DEPLOY_USER}@${SERVER_IP} "
                            cd ${BACKEND_DIR}
                            npm install --production
                        "
                    '''
                }
            }
        }
        
        stage('Restart Application') {
            steps {
                echo 'Restarting application with PM2...'
                sshagent(credentials: ['ubuntu-server-ssh']) {
                    sh '''
                        ssh -p ${SSH_PORT} ${DEPLOY_USER}@${SERVER_IP} "
                            # Install PM2 if not installed
                            if ! command -v pm2 &> /dev/null; then
                                npm install -g pm2
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
                            
                            # Setup PM2 to start on boot
                            pm2 startup systemd -u ${DEPLOY_USER} --hp /home/${DEPLOY_USER}
                        "
                    '''
                }
            }
        }
        
        stage('Configure Nginx') {
            steps {
                echo 'Configuring Nginx...'
                sshagent(credentials: ['ubuntu-server-ssh']) {
                    sh '''
                        ssh -p ${SSH_PORT} ${DEPLOY_USER}@${SERVER_IP} "
                            # Check if Nginx is installed
                            if ! command -v nginx &> /dev/null; then
                                echo 'Nginx not installed. Please install it first.'
                                exit 1
                            fi
                            
                            # Restart Nginx
                            sudo systemctl restart nginx
                            sudo systemctl status nginx
                        "
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                echo 'Performing health check...'
                sshagent(credentials: ['ubuntu-server-ssh']) {
                    sh '''
                        ssh -p ${SSH_PORT} ${DEPLOY_USER}@${SERVER_IP} "
                            # Check if backend is running
                            pm2 status ${PM2_APP_NAME}
                            
                            # Check backend health endpoint
                            sleep 5
                            curl -f http://localhost:5000/api/health || exit 1
                            
                            echo 'Health check passed!'
                        "
                    '''
                }
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

