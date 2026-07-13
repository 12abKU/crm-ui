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
                sshagent(['ec2-ssh-key']) {
                    bat 'scp -o StrictHostKeyChecking=no -r dist\\* ubuntu@13.201.233.203:/home/ubuntu/crm-app/'
                }
            }
        }
    }
}
