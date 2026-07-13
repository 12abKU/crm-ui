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
                    bat '''
                        icacls "%SSH_KEY%" /inheritance:r /grant SYSTEM:F
                        tar -cf ui-dist.tar -C dist .
                        scp -i "%SSH_KEY%" -o StrictHostKeyChecking=no ui-dist.tar ubuntu@13.201.233.203:/home/ubuntu/
                        ssh -i "%SSH_KEY%" -o StrictHostKeyChecking=no ubuntu@13.201.233.203 "rm -rf /home/ubuntu/crm-app/* && tar -xf /home/ubuntu/ui-dist.tar -C /home/ubuntu/crm-app/ && rm /home/ubuntu/ui-dist.tar"
                    '''
                }
            }
        }
    }
}
