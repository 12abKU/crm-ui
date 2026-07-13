pipeline {
    agent any
    tools {
        nodejs 'node20'
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/12abKU/crm-ui.git',
                    credentialsId: 'github-token'
            }
        }
        stage('Install') {
            steps { bat 'npm ci' }
        }
        stage('Build') {
            steps { bat 'npm run build' }
        }
        stage('Deploy') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                    bat 'scp -i "%SSH_KEY%" -o StrictHostKeyChecking=no -r dist\\* ubuntu@13.201.233.203:/home/ubuntu/crm-app/'
                }
            }
        }
    }
}
